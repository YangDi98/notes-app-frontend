<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SideBar from '@/components/SideBar.vue'
import SnackBar from '@/components/SnackBar.vue'
import { useRoute } from 'vue-router'
import { disclaimer } from '@/contants'

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
    <v-footer
      v-if="!showSideBar"
      class="footer text-center d-flex flex-column ga-2 py-4"
      color="surface-light"
    >
      <div>
        {{ disclaimer }}
      </div>
    </v-footer>

    <SnackBar />
    <AlertDialog />
  </v-app>
</template>

<style scoped>
footer {
  max-height: fit-content;
}
</style>
