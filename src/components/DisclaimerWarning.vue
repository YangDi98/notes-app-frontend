<script setup>
import { disclaimer } from '@/constants'
import { mdiInformation } from '@mdi/js'
</script>
<template>
  <v-alert type="warning" variant="tonal" class="mb-4" :icon="mdiInformation">
    {{ disclaimer }}
  </v-alert>
</template>
