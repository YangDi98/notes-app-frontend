<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { mdiClose } from '@mdi/js'
import { useNotificationStore } from '@/stores/notification'
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
  title: [(value) => !!(value && value.trim()) || 'Title is required'],
  content: [(value) => !!(value && value.trim()) || 'Content is required'],
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
      message: 'Note updated successfully',
      type: 'success',
    })
  } catch {
    notificationStore.setAlertMessage({
      message: 'Failed to update note. Please try again later.',
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
    fullscreen
  >
    <v-card>
      <v-toolbar>
        <v-btn :icon="mdiClose" @click="$emit('update:modelValue', false)"></v-btn>

        <v-toolbar-title>Edit Note</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
            data-test="save-button"
            text="Save"
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
            label="Title"
            :max-length="100"
            :counter="100"
            clearable
            required
            :rules="rules.title"
          />

          <v-textarea v-model="noteForm.content" label="Content" clearable :rules="rules.content" />
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>
