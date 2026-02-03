import axios from 'axios'
import { decamelizeKeys, camelizeKeys } from 'humps'
import { useStorage } from '@vueuse/core'

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
  (error) => {
    // Also camelize error response data if it exists
    if (error.response?.data) {
      error.response.data = camelizeKeys(error.response.data)
    }

    // Handle authentication errors globally
    if (error.response?.status === 401) {
      // Clear stored token
      accessToken.value = null

      // Let the router guard handle the redirect logic
      import('../router/index.js').then((routerModule) => {
        routerModule.default.push('/login')
      })
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
