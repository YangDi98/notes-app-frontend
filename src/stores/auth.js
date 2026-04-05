import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authAPI from '@/api/api.js'
import { useNotificationStore } from '@/stores/notification'
import { useStorage } from '@vueuse/core'
import { localeMapping } from '@/constants.js'
import i18n from '@/i18n'

const t = i18n.global.t

export const useAuthStore = defineStore('auth', () => {
  const notificationStore = useNotificationStore()

  const pending = ref({
    register: false,
    login: false,
    fetchCurrentUser: false,
    updatePassword: false,
    logout: false,
    updateProfile: false,
  })
  const user = ref(null)
  const accessToken = useStorage('accessToken', null)

  async function register({ firstName, lastName, email, password }) {
    try {
      pending.value.register = true
      await authAPI.register({ firstName, lastName, email, password })
      notificationStore.setAlertMessage({
        message: t('notifications.registrationSuccess'),
        type: 'success',
      })
      return user.value
    } catch (error) {
      notificationStore.setAlertMessage({
        message: error.response.data.message || t('notifications.registrationFailed'),
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

      notificationStore.setAlertMessage({
        message: t('notifications.loginSuccess'),
        type: 'success',
      })
      return user.value
    } catch (error) {
      notificationStore.setAlertMessage({
        message: error.response?.data?.message || t('notifications.loginFailed'),
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
      i18n.global.locale.value = localeMapping[user.value.preferredLanguage] || 'en'
      return user.value
    } catch (error) {
      console.log('Failed to fetch current user:', error)
      // If token is invalid, clear it
      if (error.response?.status === 401 && accessToken.value) {
        await logout()
      }
      throw error
    } finally {
      pending.value.fetchCurrentUser = false
    }
  }

  async function logout() {
    pending.value.logout = true

    // Also clear from localStorage to ensure consistency
    try {
      await authAPI.logout()

      accessToken.value = null

      user.value = null
    } catch (e) {
      console.log(e)
      notificationStore.setAlertMessage({
        message: t('notifications.logoutFailed'),
        type: 'failure',
      })
    } finally {
      pending.value.logout = false
    }
  }

  function isAuthenticated() {
    return !!accessToken.value && !!user.value
  }

  async function updatePassword({ currentPassword, newPassword }) {
    try {
      pending.value.updatePassword = true
      await authAPI.updatePassword({ currentPassword, newPassword })
      notificationStore.setAlertMessage({
        message: t('notifications.passwordUpdateSuccess'),
        type: 'success',
      })
    } catch (error) {
      if (error.response?.status === 401) {
        notificationStore.setAlertMessage({
          message: t('notifications.passwordIncorrect'),
          type: 'failure',
        })
        return
      }
      notificationStore.setAlertMessage({
        message: error.response?.data?.message || t('notifications.passwordUpdateFailed'),
        type: 'failure',
      })
      throw error
    } finally {
      pending.value.updatePassword = false
    }
  }

  async function updateProfile({ userId, firstName, lastName, preferredLanguage }) {
    try {
      pending.value.updateProfile = true
      const response = await authAPI.updateProfile({
        userId,
        firstName,
        lastName,
        preferredLanguage,
      })
      user.value = response.data
      i18n.global.locale.value = localeMapping[user.value.preferredLanguage] || 'en'
      notificationStore.setAlertMessage({
        message: t('notifications.profileUpdateSuccess'),
        type: 'success',
      })
    } catch (error) {
      notificationStore.setAlertMessage({
        message: error.response?.data?.message || t('notifications.profileUpdateFailed'),
        type: 'failure',
      })
      throw error
    } finally {
      pending.value.updateProfile = false
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
    updateProfile,
  }
})
