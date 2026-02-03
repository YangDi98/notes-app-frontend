import { createPinia, setActivePinia } from 'pinia'
import { setupRouterGuards } from '@/router/router-lifecycle.js'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/api/auth'
import AxiosMockAdapter from 'axios-mock-adapter'

const mockAccessToken = vi.hoisted(() => ({value: null}));
const mockUseStorage = vi.hoisted(() => vi.fn(() => mockAccessToken));
vi.mock('@vueuse/core',  async () => {
  const actual = await vi.importActual('@vueuse/core')
  return {
    ...actual,
    useStorage: mockUseStorage,
  }
})

const mockAxios = new AxiosMockAdapter(apiClient)

describe('Router Lifecycle', () => {
  let router
  let mockNext
  let authStore

  beforeEach(() => {
    // Setup Pinia
    const pinia = createPinia()
    setActivePinia(pinia)

    // Get real auth store instance
    authStore = useAuthStore()

    // Reset mocks and mock state

    mockAxios.reset()
    mockAccessToken.value = null
    authStore.user = null

    // Mock router
    router = {
      beforeEach: vi.fn(),
    }

    // Mock next function
    mockNext = vi.fn()

    // Setup axios mock to return successful user data by default
    mockAxios.onGet('/api/auth/who_am_i').reply(200, {
      id: 1,
      email: 'user@example.com',
      name: 'Test User',
    })
  })

  afterEach(() => {
    mockAxios.reset()
    setActivePinia(null)
  })

  describe('setupRouterGuards', () => {
    it('should register a beforeEach guard', () => {
      setupRouterGuards(router)

      expect(router.beforeEach).toHaveBeenCalledTimes(1)
      expect(router.beforeEach).toHaveBeenCalledWith(expect.any(Function))
    })

    describe('navigation guard logic', () => {
      let navigationGuard

      beforeEach(() => {
        setupRouterGuards(router)
        navigationGuard = router.beforeEach.mock.calls[0][0]
      })

      describe('when user has no access token', () => {
        beforeEach(() => {
          mockAccessToken.value = null
        })

        it('should redirect to login for protected routes', async () => {
          const to = {
            name: 'notes',
            fullPath: '/notes',
            meta: {}, // requiresAuth defaults to true
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({
            name: 'login',
            query: { redirect: '/notes' },
          })
        })

        it('should allow access to routes with requiresAuth: false', async () => {
          const to = {
            name: 'login',
            meta: { requiresAuth: false },
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith()
        })

        it('should allow access to auth routes', async () => {
          const to = {
            name: 'register',
            meta: { requiresAuth: false },
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith()
        })
      })

      describe('when user has access token', () => {
        beforeEach(() => {
          mockAccessToken.value = 'valid-token'
          authStore.user = null
        })

        it('should allow access to protected routes', async () => {
          const to = {
            name: 'notes',
            meta: {}, // requiresAuth defaults to true
          }
          const from = { name: 'login' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith()
        })

        it('should redirect away from auth routes to /notes', async () => {
          const to = {
            name: 'login',
            meta: { requiresAuth: false },
            query: {},
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({name: 'notes'})
        })

        it('should redirect to saved redirect path when accessing auth routes', async () => {
          const to = {
            name: 'login',
            meta: { requiresAuth: false },
            query: { redirect: '/dashboard' },
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith('/dashboard')
        })

        it('should use /notes as default redirect when no redirect query param', async () => {
          const to = {
            name: 'register',
            meta: { requiresAuth: false },
            query: {},
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({name: 'notes'})
        })

        it('should fetch user data when token exists but no user data', async () => {
          // Ensure we start with no user data
          authStore.user = null

          const to = {
            name: 'notes',
            meta: {},
          }
          const from = { name: 'login' }

          await navigationGuard(to, from, mockNext)

          // Verify API call was made (AxiosMockAdapter automatically tracks this)
          expect(mockAxios.history.get).toHaveLength(1)
          expect(mockAxios.history.get[0].url).toBe('/api/auth/who_am_i')

          // Navigation should proceed normally
          expect(mockNext).toHaveBeenCalledWith()
        })

        it('should handle API errors gracefully', async () => {
          // Mock API to fail
          mockAxios.onGet('/api/auth/who_am_i').reply(401, { error: 'Unauthorized' })

          const to = {
            name: 'notes',
            meta: {},
            fullPath: '/notes'
          }
          const from = { name: 'login' }

          await navigationGuard(to, from, mockNext)

          // Should still allow navigation (error handling in interceptor)
          expect(mockNext).toHaveBeenCalledWith({
name: 'login',
query: {redirect: '/notes'}
          })
        })
      })
      describe('meta.requiresAuth handling', () => {
        beforeEach(() => {
          mockAccessToken.value = null
        })

        it('should default requiresAuth to true when meta is undefined', async () => {
          const to = {
            name: 'protected',
            fullPath: '/protected',
            // No meta property
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({
            name: 'login',
            query: { redirect: '/protected' },
          })
        })

        it('should default requiresAuth to true when meta.requiresAuth is undefined', async () => {
          const to = {
            name: 'protected',
            fullPath: '/protected',
            meta: {}, // requiresAuth not specified
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({
            name: 'login',
            query: { redirect: '/protected' },
          })
        })

        it('should respect explicitly set requiresAuth: true', async () => {
          const to = {
            name: 'protected',
            fullPath: '/protected',
            meta: { requiresAuth: true },
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith({
            name: 'login',
            query: { redirect: '/protected' },
          })
        })

        it('should respect explicitly set requiresAuth: false', async () => {
          const to = {
            name: 'public',
            meta: { requiresAuth: false },
          }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockNext).toHaveBeenCalledWith()
        })
      })

      describe('useStorage integration', () => {
        it('should call useStorage with correct parameters', async () => {
          const to = { name: 'notes', meta: {} }
          const from = { name: 'home' }

          await navigationGuard(to, from, mockNext)

          expect(mockUseStorage).toHaveBeenCalledWith('accessToken', null)
        })

        it('should use the current value from useStorage', async () => {
          // Create a fresh mock token with the test value
          mockAccessToken.value = 'test-token'

          const to = {
            name: 'login',
            meta: { requiresAuth: false },
            query: {},
          }
          const from = { name: 'notes' }

          await navigationGuard(to, from, mockNext)

          // Should redirect away from login since user has token
          expect(mockNext).toHaveBeenCalledWith(
            {name: 'notes'}
          )
        })
      })
    })
  })
})
