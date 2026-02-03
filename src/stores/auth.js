import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authAPI from '@/api/auth.js'
import { useNotificationStore } from '@/stores/notification'
import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore()

  const pending = ref({
    register: false,
    login: false,
    fetchCurrentUser: false,
  })
  const user = ref(null)
  const accessToken = useStorage('accessToken', null)

  async function register({ firstName, lastName, email, password }) {
    try {
      pending.value.register = true
      await authAPI.register({ firstName, lastName, email, password })
      notificationStore.setAlertMessage({ message: 'Registration successful.', type: 'success' })
      return user.value
    } catch (error) {
      notificationStore.setAlertMessage({
        message: error.response.data.message || 'Registration failed.',
        type: 'failure',
      })
      throw error
    } finally {
      pending.value.register = false
    }
  }

  async function login({ email, password }) {
    try {
      pending.value.login = true
      const response = await authAPI.login({ email, password })
      accessToken.value = response.data.accessToken

      await fetchCurrentUser()

      notificationStore.setAlertMessage({ message: 'Login successful.', type: 'success' })
      return user.value
    } catch (error) {
      notificationStore.setAlertMessage({
        message: error.response?.data?.message || 'Login failed.',
        type: 'failure',
      })
      console.log(error)
      throw error
    } finally {
      pending.value.login = false
    }
  }

  async function fetchCurrentUser() {
    console.log(accessToken.value)
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      pending.value.fetchCurrentUser = true
      const response = await authAPI.fetchCurrentUser()
      user.value = response.data;
      return user.value
    } catch (error) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        logout()
      }
      throw error
    } finally {
      pending.value.fetchCurrentUser = false
    }
  }

  function logout() {
    accessToken.value = null
    user.value = null
    // Also clear from localStorage to ensure consistency
    localStorage.removeItem('accessToken')
  }

  function isAuthenticated() {
    return !!accessToken.value && !!user.value
  }

  return {
    user,
    accessToken,
    pending,
    register,
    login,
    logout,
    fetchCurrentUser,
    isAuthenticated,
  }
})
