<script setup>
import { mdiNoteMultiple, mdiAccountCircle } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
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

    <v-list density="compact" nav>
      <v-list-item :prepend-icon="mdiNoteMultiple" title="My Notes" value="mynotes"></v-list-item>
      <v-list-item
        :prepend-icon="mdiAccountCircle"
        title="My Account"
        value="myaccount"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
