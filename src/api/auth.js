import axios from 'axios'
import { decamelizeKeys, camelizeKeys } from 'humps'
import { useStorage } from '@vueuse/core'
import router from '../router/index.js'

// Use proxy in development, direct URL in production
const baseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_NOTES_BACKEND_URL

// Configure axios to throw errors for bad status codes
export const apiClient = axios.create({})

// Create reactive access token storage
const accessToken = useStorage('accessToken', null)

// Add request interceptor to convert camelCase to snake_case and add auth header
apiClient.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = decamelizeKeys(config.data)
    }

    // Add authorization header if access token is available
    if (accessToken.value) {
      config.headers.Authorization = `Bearer ${accessToken.value}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to convert snake_case to camelCase and handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = camelizeKeys(response.data)
    }
    return response
  },
  async (error) => {
    // Also camelize error response data if it exists
    if (error.response?.data) {
      error.response.data = camelizeKeys(error.response.data)
    }

    // Handle authentication errors globally
    if (error.response?.status === 401) {
      // Don't try to refresh if this was already a refresh request to avoid infinite loops
      if (error.config.url?.includes('/auth/refresh')) {
        // Clear stored token and redirect to login
        accessToken.value = null
        router.push('/login')
        return Promise.reject(error)
      }

      try {
        // Attempt to refresh the access token
        const refreshResponse = await refreshAccessToken()

        // Update the stored access token
        accessToken.value = refreshResponse.data.accessToken

        // Retry the original request with the new token
        error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`
        return apiClient.request(error.config)
      } catch {
        // Refresh failed, clear stored token and redirect to login
        accessToken.value = null
        router.push('/login')
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export async function register({ firstName, lastName, email, password }) {
  return await apiClient.post(`${baseURL}/auth/register`, {
    firstName,
    lastName,
    email,
    password,
  })
}

export async function login({ email, password }) {
  return await apiClient.post(`${baseURL}/auth/login`, {
    email,
    password,
  })
}

export async function fetchCurrentUser() {
  return await apiClient.get(`${baseURL}/auth/who_am_i`)
}

export async function refreshAccessToken() {
  return await apiClient.post(`${baseURL}/auth/refresh`)
}
