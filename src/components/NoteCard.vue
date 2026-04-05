<script setup>
import { useI18n } from 'vue-i18n'
import { useNotesStore } from '@/stores/notes'
import { useAlertDialog } from '@/composables/useAlertDialog'
import { useNotificationStore } from '@/stores/notification'

const { t } = useI18n()
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
    title: t('dialog.confirmDeletion'),
    message: t('dialog.deleteNoteConfirm'),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    confirmColor: 'red-darken-4',
    onConfirm: () => {
      try {
        notesStore.deleteNote({ userId: props.note.userId, noteId: props.note.id })
        notificationStore.setAlertMessage({
          message: t('notifications.noteDeletedSuccess'),
          type: 'success',
        })
      } catch {
        notificationStore.setAlertMessage({
          message: t('notifications.noteDeleteFailed'),
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
      <v-btn
        color="deep-purple-darken-4"
        :text="$t('common.update')"
        @click="emit('edit', props.note)"
      ></v-btn>

      <v-btn
        data-test="delete-button"
        color="red-darken-4"
        :text="$t('common.delete')"
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
