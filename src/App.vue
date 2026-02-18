<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SideBar from '@/components/SideBar.vue'
import SnackBar from '@/components/SnackBar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showSideBar = computed(() => route.meta.showSideBar !== false)
const authStore = useAuthStore()
</script>

<template>
  <v-app>
    <SideBar v-if="showSideBar && authStore.user" />
    <v-main>
      <RouterView />
    </v-main>

    <SnackBar />
    <AlertDialog />
  </v-app>
</template>

<style scoped></style>
