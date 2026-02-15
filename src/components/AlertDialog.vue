<script setup>
import { useAlertDialog } from '@/composables/useAlertDialog'

const { isOpen, dialogOptions, handleConfirm, handleCancel } = useAlertDialog()
</script>

<template>
  <v-dialog v-model="isOpen" max-width="400px" persistent>
    <v-card>
      <v-card-title class="text-h5">
        {{ dialogOptions.title }}
      </v-card-title>

      <v-card-text>
        {{ dialogOptions.message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleCancel">
          {{ dialogOptions.cancelText }}
        </v-btn>
        <v-btn :color="dialogOptions.confirmColor" variant="tonal" @click="handleConfirm">
          {{ dialogOptions.confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
