import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authAPI from '@/api/api.js'
import { useNotificationStore } from '@/stores/notification'
import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore()

  const pending = ref({
    register: false,
    login: false,
    fetchCurrentUser: false,
    updatePassword: false,
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
      throw error
    } finally {
      pending.value.login = false
    }
  }

  async function refreshToken() {
    try {
      const response = await authAPI.refreshAccessToken()
      accessToken.value = response.data.accessToken
      return response.data.accessToken
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw error
    }
  }

  async function fetchCurrentUser() {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      pending.value.fetchCurrentUser = true
      const response = await authAPI.fetchCurrentUser()
      user.value = response.data
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

  async function updatePassword({ currentPassword, newPassword }) {
    try {
      pending.value.updatePassword = true
      await authAPI.updatePassword({ currentPassword, newPassword })
      notificationStore.setAlertMessage({
        message: 'Password updated successfully.',
        type: 'success',
      })
    } catch (error) {
      if (error.response?.status === 401) {
        notificationStore.setAlertMessage({
          message: 'Current password is incorrect.',
          type: 'failure',
        })
        return
      }
      notificationStore.setAlertMessage({
        message: error.response?.data?.message || 'Failed to update password.',
        type: 'failure',
      })
      throw error
    } finally {
      pending.value.updatePassword = false
    }
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
    refreshToken,
    updatePassword,
  }
})
