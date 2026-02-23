<script setup>
import { watch, ref, computed } from 'vue'
import { mdiNoteMultiple, mdiAccountCircle, mdiLogout } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import AppLogo from '@/components/AppLogo.vue'
import { disclaimer } from '@/contants.js'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const selectedItem = ref(null)

const initials = computed(() => {
  if (!authStore.user) return ''
  const firstInitial = authStore.user.firstName
    ? authStore.user.firstName.charAt(0).toUpperCase()
    : ''
  const lastInitial = authStore.user.lastName ? authStore.user.lastName.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
})

function navigate(value) {
  console.log('Navigating to:', value)
  router.push({ name: value[0] })
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}

watch(
  () => route.name,
  (newRoute) => {
    selectedItem.value = [newRoute]
  },
  { immediate: true },
)
</script>
<template>
  <v-navigation-drawer
    app
    permanent
    :rail="$vuetify.display.mobile"
    :expand-on-hover="$vuetify.display.mobile"
  >
    <div class="d-flex flex-column fill-height justify-space-between">
      <div>
        <v-list>
          <v-list-item
            :subtitle="authStore.user?.email"
            :title="`${authStore.user?.firstName} ${authStore.user?.lastName}`"
          >
            <template v-slot:prepend>
              <v-avatar color="surface-variant">
                <span class="text-body-2 text-md-body-1">{{ initials }}</span>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav v-model:selected="selectedItem" @update:selected="navigate">
          <v-list-item
            :prepend-icon="mdiNoteMultiple"
            title="My Notes"
            value="notes"
            color="primary"
          />
          <v-list-item
            :prepend-icon="mdiAccountCircle"
            title="My Account"
            value="account"
            color="primary"
          />
        </v-list>
      </div>
      <div class="mb-4">
        <v-list>
          <v-list-item
            :prepend-icon="mdiLogout"
            :title="authStore.pending.logout ? 'Logging out...' : 'Logout'"
            base-color="primary"
            variant="tonal"
            :disabled="authStore.pending.logout"
            data-test="logout-button"
            @click="logout"
          />
        </v-list>
        <AppLogo class="mx-auto mb-2" />

        <!-- Disclaimer -->
        <v-card color="warning" variant="tonal" class="mx-3 mb-2">
          <v-card-text class="text-caption text-center">
            {{ disclaimer }}
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-navigation-drawer>
</template>
