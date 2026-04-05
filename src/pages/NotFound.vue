<template>
  <div class="d-flex flex-column align-center justify-center h-100 pa-8">
    <v-icon size="120" color="grey"> $alert </v-icon>

    <h1 class="text-h3 mt-4 mb-2">{{ $t('notFound.title') }}</h1>

    <p class="text-h6 text-center mb-6 text-grey">
      {{ $t('notFound.message') }}
    </p>

    <div class="d-flex ga-4">
      <v-btn color="primary" variant="elevated" @click="goHome">
        {{ $t('notFound.goHome') }}
      </v-btn>

      <v-btn variant="outlined" @click="goBack"> {{ $t('notFound.goBack') }} </v-btn>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'

const router = useRouter()
const accessToken = useStorage('accessToken', null)

function goHome() {
  // Redirect to appropriate home page based on token presence
  if (accessToken.value) {
    router.push('/notes')
  } else {
    router.push('/login')
  }
}

function goBack() {
  router.go(-1)
}
</script>
