<script setup>
import { computed, watchEffect, watch, ref, nextTick } from 'vue'
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
const focusSentinelRef = ref(null)

// After every SPA route change, reset focus to the invisible sentinel that sits
// just before the skip link. This keeps the tab order: skip link → nav → main
// content, without making the skip link appear for non-keyboard users.
watch(
  () => route.path,
  async () => {
    await nextTick()
    focusSentinelRef.value?.focus({ preventScroll: true })
  },
)

// Keep document title in sync with current route and locale
watchEffect(() => {
  const pageTitle = route.meta.title
  document.title = pageTitle ? `${pageTitle} - ${t('app.name')}` : t('app.name')
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
    <span ref="focusSentinelRef" tabindex="-1" aria-hidden="true" class="focus-sentinel" />
    <a href="#main-content" class="skip-link">{{ $t('app.skipToMain') }}</a>
    <SideBar v-if="showSideBar && authStore.user" />
    <v-main id="main-content" tabindex="-1">
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

.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  padding: 8px 16px;
  background-color: #1a1a1a;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  transform: translateY(-100%);
  transition: transform 0.15s ease;
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.focus-sentinel {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  outline: none;
}
</style>
