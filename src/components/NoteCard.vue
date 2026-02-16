<script setup>
import { useNotesStore } from '@/stores/notes'
import { useAlertDialog } from '@/composables/useAlertDialog'
import { useNotificationStore } from '@/stores/notification'
const notesStore = useNotesStore()
const { showAlert } = useAlertDialog()
const notificationStore = useNotificationStore()
const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit'])

function deleteNote() {
  showAlert({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this note? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmColor: 'red-darken-4',
    onConfirm: () => {
      try {
        notesStore.deleteNote({ userId: props.note.userId, noteId: props.note.id })
        notificationStore.setAlertMessage({
          message: 'Note deleted successfully',
          type: 'success',
        })
      } catch {
        notificationStore.setAlertMessage({
          message: 'Failed to delete note. Please try again later.',
          type: 'error',
        })
      }
    },
  })
}
</script>

<template>
  <v-card
    height="12.5rem"
    :title="props.note.title"
    color="primary"
    variant="tonal"
    class="d-flex flex-column"
  >
    <v-card-text class="text-truncate-multiline flex-grow-1 overflow-hidden">
      {{ props.note.content }}
    </v-card-text>
    <v-card-actions class="flex-shrink-0 pb-2">
      <v-btn color="deep-purple-darken-4" text="Update" @click="emit('edit', props.note)"></v-btn>

      <v-btn
        data-test="delete-button"
        color="red-darken-4"
        text="Delete"
        :loading="notesStore.pending.deleteNote"
        :disabled="notesStore.pending.deleteNote"
        @click="deleteNote"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.text-truncate-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 5; /* Number of lines to show */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3em; /* Set consistent line height */
  max-height: 6.5em; /* 5 lines × 1.3em = 6.5em */
}
</style>
