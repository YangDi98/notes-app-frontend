<script setup>
import { ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const show = ref(false)

watch(
  () => notificationStore.alertMessage,
  (newMessage) => {
    if (newMessage) {
      show.value = true
    }
  },
)

watch(show, (newShow) => {
  if (!newShow) {
    notificationStore.clearMessage()
  }
})
</script>

<template>
  <v-snackbar v-model="show" timeout="3000" location="top" :color="notificationStore.alertType">
    {{ notificationStore.alertMessage }}
  </v-snackbar>
</template>
