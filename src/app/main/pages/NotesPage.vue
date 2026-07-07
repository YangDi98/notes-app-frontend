<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { useNotificationStore } from '@/stores/notification'
import NoteCard from '@/components/NoteCard.vue'
import EditNoteModal from '@/components/EditNoteModal.vue'
import DisclaimerWarning from '@/components/DisclaimerWarning.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const notesStore = useNotesStore()
const notificationStore = useNotificationStore()

const newNote = ref({
  title: '',
  content: '',
})

const formValid = ref(false)
const selectedNote = ref(null)
const showEditModal = ref(false)
const editTriggerEl = ref(null)

const rules = {
  title: [(value) => !!(value && value.trim()) || t('validation.titleRequired')],
  content: [(value) => !!(value && value.trim()) || t('validation.contentRequired')],
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
      message: t('notifications.noteLoadFailed'),
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
      message: t('notifications.noteCreatedSuccess'),
      type: 'success',
    })
  } catch {
    notificationStore.setAlertMessage({
      message: t('notifications.noteCreateFailed'),
      type: 'error',
    })
  }
}

function editNote(note) {
  editTriggerEl.value = document.activeElement
  selectedNote.value = note
  showEditModal.value = true
}

watch(showEditModal, (isOpen) => {
  if (!isOpen && editTriggerEl.value) {
    nextTick(() => {
      editTriggerEl.value?.focus()
      editTriggerEl.value = null
    })
  }
})

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
      <DisclaimerWarning />
      <h1>{{ $t('notes.welcome') }}, {{ authStore.user?.firstName || $t('common.user') }}!</h1>
      <p>{{ $t('notes.dashboardDescription') }}</p>
    </div>
    <div class="pa-4">
      <v-card class="pa-4" color="secondary" variant="outlined">
        <v-form ref="form" v-model="formValid" validate-on="input" @submit.prevent="createNote">
          <v-text-field
            class="my-text-input"
            v-model="newNote.title"
            :label="$t('notes.newNoteTitle')"
            :max-length="100"
            :counter="100"
            :rules="rules.title"
            clearable
            required
          />
          <v-textarea
            class="my-textarea"
            v-model="newNote.content"
            :label="$t('notes.newNoteContent')"
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
              >{{ $t('notes.addNote') }}</v-btn
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
          <NoteCard data-testid="note-card" :note="note" @edit="editNote" />
        </v-col>
      </v-row>
    </v-infinite-scroll>
    <EditNoteModal v-model="showEditModal" :note="selectedNote" />
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
