import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/api.js'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  const notesNextUrl = ref(null)
  const pending = ref({
    fetchNotes: false,
    createNote: false,
  })

  async function fetchNotes({ userId, title, startDate, endDate, limit, next }) {
    try {
      pending.value.fetchNotes = true
      const response = await api.fetchNotes({ userId, title, startDate, endDate, limit, next })
      notes.value = [...notes.value, ...response.data.data]
      notesNextUrl.value = response.data.next
    } finally {
      pending.value.fetchNotes = false
    }
  }

  async function clearNotes() {
    notes.value = []
    notesNextUrl.value = null
  }

  async function createNote({ userId, title, content, categoryId }) {
    try {
      pending.value.createNote = true
      const response = await api.createNote({ userId, title, content, categoryId })
      // Prepend the new note to the list
      notes.value = [response.data, ...notes.value]
    } finally {
      pending.value.createNote = false
    }
  }

  return {
    notes,
    pending,
    fetchNotes,
    notesNextUrl,
    clearNotes,
    createNote,
  }
})
