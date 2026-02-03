<script setup>
  import { useAuthStore} from '@/stores/auth';
  const authStore = useAuthStore();
</script>
<template>
<div>
  <div class="pa-4">
    <h1>Welcome, {{ authStore.user?.name || 'User' }}!</h1>
    <p>This is your notes dashboard. Here you can manage all your notes.</p>
  </div>
</div>
  </template>
