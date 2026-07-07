<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { mdiClose } from '@mdi/js'
import { useNotificationStore } from '@/stores/notification'

const { t } = useI18n()
const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const noteForm = ref({ title: '', content: '' })
const formValid = ref(false)

// Watch for prop changes and update local note
watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      noteForm.value = { ...newNote }
    }
  },
  { immediate: true },
)

const authStore = useAuthStore()
const notesStore = useNotesStore()
const notificationStore = useNotificationStore()

const rules = {
  title: [(value) => !!(value && value.trim()) || t('validation.titleRequired')],
  content: [(value) => !!(value && value.trim()) || t('validation.contentRequired')],
}

async function updateNote() {
  if (!authStore.user) return
  await notesStore.updateNote({
    userId: authStore.user.id,
    noteId: noteForm.value.id,
    title: noteForm.value.title,
    content: noteForm.value.content,
  })
}

async function save() {
  try {
    await updateNote()
    notificationStore.setAlertMessage({
      message: t('notifications.noteUpdatedSuccess'),
      type: 'success',
    })
  } catch {
    notificationStore.setAlertMessage({
      message: t('notifications.noteUpdateFailed'),
      type: 'error',
    })
  }
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    transition="dialog-bottom-transition"
    aria-labelledby="edit-note-modal-title"
    fullscreen
  >
    <v-card>
      <v-toolbar tag="div">
        <v-btn
          :icon="mdiClose"
          aria-label="Close"
          @click="$emit('update:modelValue', false)"
        ></v-btn>

        <v-toolbar-title id="edit-note-modal-title" tag="h2">{{ $t('notes.editNote') }}</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
            data-test="save-button"
            :text="$t('common.save')"
            variant="tonal"
            color="primary"
            :loading="notesStore.pending.updateNote"
            :disabled="!formValid || notesStore.pending.updateNote"
            @click="save"
          ></v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-form v-model="formValid" validate-on="input" @submit.prevent>
        <v-card-text>
          <v-text-field
            v-model="noteForm.title"
            :label="$t('notes.title')"
            :max-length="100"
            :counter="100"
            clearable
            required
            :rules="rules.title"
          />

          <v-textarea
            v-model="noteForm.content"
            :label="$t('notes.content')"
            clearable
            :rules="rules.content"
          />
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>
