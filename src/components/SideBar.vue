<script setup>
import { watch, ref } from 'vue'
import { mdiNoteMultiple, mdiAccountCircle } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const selectedItem = ref(null)

function navigate(value) {
  console.log('Navigating to:', value)
  router.push({ name: value[0] })
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
    permanent
    :rail="$vuetify.display.mobile"
    :expand-on-hover="$vuetify.display.mobile"
  >
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        :subtitle="authStore.user?.email"
        :title="`${authStore.user?.firstName} ${authStore.user?.lastName}`"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav v-model:selected="selectedItem" @update:selected="navigate">
      <v-list-item
        :prepend-icon="mdiNoteMultiple"
        title="My Notes"
        value="notes"
        color="primary"
      ></v-list-item>
      <v-list-item
        :prepend-icon="mdiAccountCircle"
        title="My Account"
        value="account"
        color="primary"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
