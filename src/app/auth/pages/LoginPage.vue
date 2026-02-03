<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const form = ref({
  email: '',
  password: '',
})
const rules = {
  email: [(value) => !!value.trim() || 'Email is required'],
  password: [(value) => !!value || 'Password is required'],
}

async function login() {
  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    })

    // Check if there's a redirect parameter
    const redirectTo = router.currentRoute.value.query.redirect || {name: 'notes'}
    router.push(redirectTo)
  } catch(e) {
    // Error notifications already handled in auth store
    // Just stay on current page
    console.log(e)
  }
}
</script>
<template>
  <div class="d-flex flex-column ga-2 justify-center align-center h-100">
    <v-form class="w-75 w-sm-50 w-md-33" validate-on="blur" @submit.prevent="login">
      <v-text-field v-model="form.email" label="Email" type="email" :rules="rules.email" required>
      </v-text-field>

      <v-text-field
        label="Password"
        type="password"
        v-model="form.password"
        :rules="rules.password"
        required
      >
      </v-text-field>
      <div class="d-flex justify-center"><v-btn type="submit" color="primary" :loading="authStore.pending.login">Login</v-btn></div>
    </v-form>

    <div>Don't have an account? <router-link to="/register">Register</router-link></div>
  </div>
</template>
