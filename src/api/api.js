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

// Track if a refresh is already in progress
let refreshPromise = null

// Add request interceptor to convert camelCase to snake_case and add auth header
apiClient.interceptors.request.use(
  (config) => {
    if (config.data) {
      config.data = decamelizeKeys(config.data)
    }

    // Add authorization header if access token is available
    // Skip auth header for refresh requests
    if (accessToken.value && !config.skipAuth) {
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
      console.log('401 error detected, attempting token refresh for:', error.config.url)

      // Don't try to refresh if this was already a refresh request to avoid infinite loops
      if (error.config.url?.includes('/auth/refresh')) {
        console.log('Refresh request failed, clearing token and redirecting to login')
        // Clear stored token and redirect to login
        accessToken.value = null
        router.push('/login')
        return Promise.reject(error)
      }

      try {
        // If a refresh is already in progress, wait for it
        if (refreshPromise) {
          console.log('Waiting for existing refresh promise...')
          await refreshPromise
          console.log('Existing refresh completed, using updated token')
          // After waiting, the token should be updated, no need to do anything else
        } else {
          console.log('Starting new token refresh...')
          // Start a new refresh
          refreshPromise = refreshAccessToken()
          const refreshResponse = await refreshPromise
          console.log('Token refresh successful')

          // Update the stored access token
          accessToken.value = refreshResponse.data.accessToken
        }

        // Clear the refresh promise
        refreshPromise = null

        console.log('Retrying original request with refreshed token')
        // Retry the original request with the current (refreshed) token
        error.config.headers.Authorization = `Bearer ${accessToken.value}`
        return apiClient.request(error.config)
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError)
        // Refresh failed, clear stored token and redirect to login
        refreshPromise = null
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
  // Extract CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_refresh_token='))
    ?.split('=')[1]

  const headers = {}
  if (csrfToken) {
    headers['X-CSRF-TOKEN'] = csrfToken
  }

  return await apiClient.post(
    `${baseURL}/auth/refresh`,
    {},
    {
      skipAuth: true,
      headers,
    },
  )
}

export async function fetchNotes({ userId, title, startDate, endDate, limit, next }) {
  const url = `${baseURL}/users/${userId}/notes/`
  if (next) {
    return await apiClient.get(`${baseURL}${next}`)
  }
  return await apiClient.get(url, {
    params: {
      title,
      startDate,
      endDate,
      limit,
    },
  })
}

export async function createNote({ userId, title, content, categoryId }) {
  const url = `${baseURL}/users/${userId}/notes/`
  return await apiClient.post(url, {
    title,
    content,
    categoryId,
  })
}

export async function updateNote({ userId, noteId, title, content, categoryId }) {
  const url = `${baseURL}/users/${userId}/notes/${noteId}`
  return await apiClient.put(url, {
    title,
    content,
    categoryId,
  })
}

export async function deleteNote({ userId, noteId }) {
  const url = `${baseURL}/users/${userId}/notes/${noteId}`
  return await apiClient.delete(url)
}
