<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { useNotificationStore } from '@/stores/notification'
import NoteCard from '@/components/NoteCard.vue'
const authStore = useAuthStore()
const notesStore = useNotesStore()
const notificationStore = useNotificationStore()

const newNote = ref({
  title: '',
  content: '',
})

const formValid = ref(false)

const rules = {
  title: [(value) => !!(value && value.trim()) || 'Title is required'],
  content: [(value) => !!(value && value.trim()) || 'Content is required'],
}

const form = ref()

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

async function createNote() {
  if (!authStore.user) return
  try {
    await notesStore.createNote({
      userId: authStore.user.id,
      title: newNote.value.title,
      content: newNote.value.content,
    })

    newNote.value.title = ''
    newNote.value.content = ''
    form.value?.reset()

    notificationStore.setAlertMessage({
      message: 'Note created successfully!',
      type: 'success',
    })
  } catch {
    notificationStore.setAlertMessage({
      message: 'Failed to create note. Please try again later.',
      type: 'error',
    })
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
    <div class="pa-4">
      <v-card class="pa-4" color="secondary" variant="outlined">
        <v-form ref="form" v-model="formValid" validate-on="input" @submit.prevent="createNote">
          <v-text-field
            class="my-text-input"
            v-model="newNote.title"
            label="New Note Title"
            :max-length="100"
            :counter="100"
            :rules="rules.title"
            clearable
            required
          />
          <v-textarea
            class="my-textarea"
            v-model="newNote.content"
            label="New Note Content"
            clearable
            :rules="rules.content"
            required
          />
          <div class="d-flex justify-end">
            <v-btn
              type="submit"
              color="primary"
              @click="createNote"
              :loading="notesStore.pending.createNote"
              :disabled="!formValid || notesStore.pending.createNote"
              >Add Note</v-btn
            >
          </div>
        </v-form>
      </v-card>
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

<style>
.my-text-input input {
  color: black !important;
}
.my-textarea textarea {
  color: black !important;
}
</style>
