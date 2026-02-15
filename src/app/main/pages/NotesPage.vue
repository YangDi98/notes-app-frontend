<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { useNotificationStore } from '@/stores/notification'
import NoteCard from '@/components/NoteCard.vue'
const authStore = useAuthStore()
const notesStore = useNotesStore()
const notificationStore = useNotificationStore()

async function fetchNotes({ done } = { done: () => {} }) {
  if (!authStore.user) return
  try {
    done('loading') // Indicate loading state
    await notesStore.fetchNotes({ userId: authStore.user.id, next: notesStore.notesNextUrl })
    if (!notesStore.notesNextUrl) {
      done('empty') // No more data
    } else {
      done('ok') // More data loaded
    }
  } catch {
    notificationStore.setAlertMessage({
      message: 'Failed to load notes. Please try again later.',
      type: 'error',
    })
    done('error') // Indicate error state
  }
}

onMounted(() => {
  notesStore.clearNotes()
  fetchNotes()
})

onUnmounted(() => {
  notesStore.clearNotes()
})
</script>
<template>
  <div>
    <div class="pa-4">
      <h1>Welcome, {{ authStore.user?.firstName || 'User' }}!</h1>
      <p>This is your notes dashboard. Here you can manage all your notes.</p>
    </div>
    <v-infinite-scroll
      mode="manual"
      :items="notesStore.notes"
      @load="fetchNotes"
      class="overflow-hidden"
    >
      <v-row class="pa-4" dense>
        <v-col v-for="note in notesStore.notes" :key="note.id" cols="12" sm="6" md="4" lg="3">
          <NoteCard data-testid="note-card" :note="note" />
        </v-col>
      </v-row>
    </v-infinite-scroll>
  </div>
</template>
