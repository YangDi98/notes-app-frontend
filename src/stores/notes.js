import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/api.js'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  const notesNextUrl = ref(null)
  const pending = ref({
    fetchNotes: false,
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

  return {
    notes,
    pending,
    fetchNotes,
    notesNextUrl,
    clearNotes,
  }
})
