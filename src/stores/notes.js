import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/api.js'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref([])
  const notesNextUrl = ref(null)
  const pending = ref({
    fetchNotes: false,
    createNote: false,
    deleteNote: false,
    updateNote: false,
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

  async function updateNote({ userId, noteId, title, content, categoryId }) {
    try {
      pending.value.updateNote = true
      const response = await api.updateNote({ userId, noteId, title, content, categoryId })
      // Update the note in the list
      const index = notes.value.findIndex((note) => note.id === noteId)
      if (index !== -1) {
        notes.value[index] = response.data
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    } finally {
      pending.value.updateNote = false
    }
  }

  async function deleteNote({ userId, noteId }) {
    try {
      pending.value.deleteNote = true
      await api.deleteNote({ userId, noteId })
      // Remove the note from the list
      notes.value = notes.value.filter((note) => note.id !== noteId)
    } catch (error) {
      console.error('Failed to delete note:', error)
    } finally {
      pending.value.deleteNote = false
    }
  }

  return {
    notes,
    pending,
    fetchNotes,
    notesNextUrl,
    clearNotes,
    createNote,
    updateNote,
    deleteNote,
  }
})
