import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import * as authModule from '@/api/auth'

// Create mock objects that will be shared
const mockAccessToken = vi.hoisted(() => ({ value: null }))
const mockPush = vi.hoisted(() => vi.fn())

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key, defaultValue) => {
    if (key === 'accessToken') {
      return mockAccessToken
    }
    return { value: defaultValue }
  }),
}))

// Mock router
vi.mock('@/router/index.js', () => ({
  default: {
    push: mockPush,
  },
}))

// Dynamic import to ensure mocks are applied
let apiClient, register, login, fetchCurrentUser, refreshAccessToken

beforeAll(async () => {
  // const authModule = await import('@/api/auth')
  apiClient = authModule.apiClient
  register = authModule.register
  login = authModule.login
  fetchCurrentUser = authModule.fetchCurrentUser
  refreshAccessToken = authModule.refreshAccessToken
})

describe('Auth API', () => {
  let mock

  beforeEach(() => {
    mock = new MockAdapter(apiClient)
    mockAccessToken.value = null
    mockPush.mockClear()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('API Functions', () => {
    it('should register a user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      }

      const responseData = { id: 1, email: 'john@example.com' }

      mock.onPost('/api/auth/register').reply(200, responseData)

      const response = await register(userData)
      expect(response.data).toEqual(responseData)
    })

    it('should login a user', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'password123',
      }

      const responseData = { accessToken: 'token123', user: { id: 1, email: 'john@example.com' } }

      mock.onPost('/api/auth/login').reply(200, responseData)

      const response = await login(credentials)
      expect(response.data).toEqual(responseData)
    })

    it('should fetch current user', async () => {
      const responseData = { id: 1, email: 'john@example.com' }

      mock.onGet('/api/auth/who_am_i').reply(200, responseData)

      const response = await fetchCurrentUser()
      expect(response.data).toEqual(responseData)
    })

    it('should refresh access token', async () => {
      const responseData = { accessToken: 'newToken123' }

      mock.onPost('/api/auth/refresh').reply(200, responseData)

      const response = await refreshAccessToken()
      expect(response.data).toEqual(responseData)
    })
  })

  describe('Request Interceptor', () => {
    it('should add authorization header when token is present', async () => {
      mockAccessToken.value = 'test-token'
      mock.onGet('/test').reply((config) => {
        expect(config.headers.Authorization).toBe('Bearer test-token')
        return [200, {}]
      })

      await apiClient.get('/test')
    })

    it('should not add authorization header when token is null', async () => {
      mockAccessToken.value = null
      mock.onGet('/test').reply((config) => {
        expect(config.headers.Authorization).toBeUndefined()
        return [200, {}]
      })

      await apiClient.get('/test')
    })

    it('should convert camelCase data to snake_case', async () => {
      const testData = { firstName: 'John', lastName: 'Doe' }

      mock.onPost('/test').reply((config) => {
        expect(JSON.parse(config.data)).toEqual({ first_name: 'John', last_name: 'Doe' })
        return [200, {}]
      })

      await apiClient.post('/test', testData)
    })
  })

  describe('Response Interceptor', () => {
    it('should convert snake_case response to camelCase', async () => {
      const responseData = { first_name: 'John', last_name: 'Doe' }

      mock.onGet('/test').reply(200, responseData)

      const response = await apiClient.get('/test')
      expect(response.data).toEqual({ firstName: 'John', lastName: 'Doe' })
    })

    it('should convert snake_case error response to camelCase', async () => {
      const errorData = { error_message: 'Invalid credentials' }

      mock.onGet('/test').reply(400, errorData)

      const error = await apiClient.get('/test').catch(e => e)
      expect(error.response.data).toEqual({ errorMessage: 'Invalid credentials' })
    })
  })

  describe('401 Error Handling', () => {
    it('should redirect to login when 401 occurs on refresh endpoint', async () => {
      mockAccessToken.value = 'expired-token'

      mock.onPost('/api/auth/refresh').reply(401)

      await apiClient.post('/api/auth/refresh').catch(() => {})

      expect(mockAccessToken.value).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should attempt token refresh and retry request on 401 error', async () => {
      mockAccessToken.value = 'expired-token'

      // First request fails with 401
      mock.onGet('/test').replyOnce(401)

      // Refresh request succeeds
      mock.onPost('/api/auth/refresh').reply(200, { access_token: 'new-token' })

      // Retry request succeeds
      mock.onGet('/test').reply(200, { data: 'success' })

      const response = await apiClient.get('/test')

      expect(mockAccessToken.value).toBe('new-token')
      expect(response.data).toEqual({ data: 'success' })
    })

    it('should redirect to login when token refresh fails', async () => {
      mockAccessToken.value = 'expired-token'

      // First request fails with 401
      mock.onGet('/test').replyOnce(401)

      // Refresh request also fails
      mock.onPost('/api/auth/refresh').reply(401)

      await apiClient.get('/test').catch(() => {})

      expect(mockAccessToken.value).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should update authorization header on retry after successful refresh', async () => {
      mockAccessToken.value = 'expired-token'

      // First request fails with 401
      mock.onGet('/test').replyOnce(401)

      // Refresh request succeeds
      mock.onPost('/api/auth/refresh').reply(200, { access_token: 'new-token' })

      // Retry request - verify it has the new token
      mock.onGet('/test').reply((config) => {
        expect(config.headers.Authorization).toBe('Bearer new-token')
        return [200, { data: 'success' }]
      })

      await apiClient.get('/test')
    })

    it('should not attempt refresh for non-401 errors', async () => {
      mock.onGet('/test').reply(500, { message: 'Server error' })

      const error = await apiClient.get('/test').catch(e => e)

      expect(error.response.status).toBe(500)
      expect(mockPush).not.toHaveBeenCalled()
      expect(mockAccessToken.value).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mock.onGet('/test').networkError()

      const error = await apiClient.get('/test').catch(e => e)

      expect(error.message).toBe('Network Error')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
