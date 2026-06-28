<script setup>
import { computed, watchEffect, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SideBar from '@/components/SideBar.vue'
import SnackBar from '@/components/SnackBar.vue'
import AlertDialog from '@/components/AlertDialog.vue'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const route = useRoute()
const showSideBar = computed(() => route.meta.showSideBar !== false)
const authStore = useAuthStore()

// Keep document title in sync with locale
watchEffect(() => {
  document.title = t('app.name')
})

// Watch the locale ref and update the DOM element attribute
watch(
  locale,
  (newLocale) => {
    document.documentElement.lang = newLocale
  },
  { immediate: true },
)
</script>

<template>
  <v-app>
    <SideBar v-if="showSideBar && authStore.user" />
    <v-main>
      <RouterView />
    </v-main>
    <v-footer
      v-if="!showSideBar"
      app
      class="footer text-center d-flex flex-column ga-2 py-4"
      color="warning"
    >
      <div>
        {{ $t('app.disclaimer') }}
      </div>
    </v-footer>

    <SnackBar />
    <AlertDialog />
  </v-app>
</template>

<style scoped>
.footer {
  max-height: fit-content;
}
</style>
