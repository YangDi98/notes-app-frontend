import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', () => {
  const alertMessage = ref(null)
  const alertType = ref(null)

  function setAlertMessage({ message, type = 'success' }) {
    alertMessage.value = message
    alertType.value = type
  }

  function clearMessage() {
    alertMessage.value = null
    alertType.value = null
  }

  return { alertMessage, alertType, setAlertMessage, clearMessage }
})
