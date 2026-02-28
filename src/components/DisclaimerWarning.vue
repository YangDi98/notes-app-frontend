<script setup>
import { disclaimer } from '@/constants'
</script>
<template>
  <v-alert type="warning" variant="tonal" class="mb-4">
    {{ disclaimer }}
  </v-alert>
</template>
