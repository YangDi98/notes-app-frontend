<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { mdiEye, mdiEyeOff } from '@mdi/js'

const authStore = useAuthStore()
const router = useRouter()

async function register() {
  try {
    await authStore.register({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      password: form.value.password,
    })
    // Only navigate on success - notifications handled in auth store
    router.push('/login')
  } catch {
    // Error notifications already handled in auth store
    // Just stay on current page
  }
}

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const formValid = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const rules = {
  firstName: [(value) => !!value.trim() || 'First Name is required'],
  lastName: [(value) => !!value.trim() || 'Last Name is required'],
  email: [
    (value) => !!value.trim() || 'Email is required',
    (value) => {
      if (/^[a-z0-9.-]+@[a-z0-9.-]+\.[a-z]+$/i.test(value)) {
        return true
      } else {
        return 'Email must be valid'
      }
    },
  ],
  password: [
    (value) => !!value || 'Password is required',
    (value) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#%])[A-Za-z\d@$#%]{9,}$/
      return (
        regex.test(value) ||
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)'
      )
    },
  ],
  confirmPassword: [
    (value) => !!value || 'Please confirm your password',
    (value) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#%])[A-Za-z\d@$#%]{9,}$/
      return (
        regex.test(value) ||
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)'
      )
    },
    (value) => value === form.value.password || 'Passwords must match',
  ],
}
</script>

<template>
  <div class="d-flex flex-column justify-center align-center h-fit ga-2" style="min-height: 100%">
    <v-form
      v-model="formValid"
      class="w-75 w-sm-50 w-md-33"
      validate-on="input"
      @submit.prevent="register"
      data-testid="register-form"
    >
      <v-text-field
        v-model="form.firstName"
        label="First Name"
        type="text"
        :rules="rules.firstName"
        data-testid="firstName-field"
        required
      >
      </v-text-field>
      <v-text-field
        v-model="form.lastName"
        label="Last Name"
        type="text"
        :rules="rules.lastName"
        data-testid="lastName-field"
        required
      >
      </v-text-field>
      <v-text-field
        v-model="form.email"
        label="Email"
        type="email"
        :rules="rules.email"
        data-testid="email-field"
        required
      >
      </v-text-field>

      <v-text-field
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        v-model="form.password"
        :rules="rules.password"
        :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
        @click:append-inner="showPassword = !showPassword"
        data-testid="password-field"
        required
      >
      </v-text-field>

      <v-text-field
        label="Confirm Password"
        :type="showConfirmPassword ? 'text' : 'password'"
        v-model="form.confirmPassword"
        :rules="rules.confirmPassword"
        :append-inner-icon="showConfirmPassword ? mdiEyeOff : mdiEye"
        @click:append-inner="showConfirmPassword = !showConfirmPassword"
        data-testid="confirmPassword-field"
        required
      >
      </v-text-field>
      <div class="d-flex justify-center">
        <v-btn
          type="submit"
          color="primary"
          :loading="authStore.pending.register"
          :disabled="!formValid || authStore.pending.register"
          data-testid="register-button"
        >
          Register
        </v-btn>
      </div>
    </v-form>
    <div>Already have an account? <router-link to="/login">Sign in</router-link></div>
  </div>
</template>
