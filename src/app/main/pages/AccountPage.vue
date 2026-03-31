<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { mdiEye, mdiEyeOff } from '@mdi/js'
import DisclaimerWarning from '@/components/DisclaimerWarning.vue'
import isEqual from 'lodash/isEqual';

const authStore = useAuthStore()

const languageOptions = [
  { title: 'English', value: 'en_CA'},
  { title: '中文', value: 'zh_CN'}
]

const settingsFormRef = ref(null)
const settingsForm = ref({
  preferredLanguage: authStore.user?.preferredLanguage,
  firstName: authStore.user?.firstName,
  lastName: authStore.user?.lastName,
})
const initialSettingsForm = ref({ ...settingsForm.value }) // Make it reactive
const settingsFormValid = ref(false)
const settingsFormError = ref('')

const settingsFormRules = {
  firstName: [(value) => !!value.trim() || 'First name is required'],
  lastName: [(value) => !!value.trim() || 'Last name is required'],
}

// Password update form
const passwordFormRef = ref(null)
const passwordFormValid = ref(false)
const passwordError = ref('')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Show/hide password toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation rules
const passwordRules = {
  current: [(value) => !!value || 'Current password is required'],
  new: [
    (value) => !!value || 'New password is required',
    (value) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#%])[A-Za-z\d@$#%]{9,}$/
      return (
        regex.test(value) ||
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)'
      )
    },
  ],
  confirm: [
    (value) => !!value || 'Please confirm your password',
    (value) => value === passwordForm.value.newPassword || 'Passwords do not match',
  ],
}

async function updatePassword() {
  passwordError.value = ''

  try {
    await authStore.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    passwordFormRef.value?.reset()
  } catch {
    passwordError.value = 'Failed to update password'
  } finally {
    passwordFormValid.value = false
  }
}

async function saveSettings() {
  settingsFormError.value = ''

  try {
    await authStore.updateProfile({
      userId: authStore.user.id,
      firstName: settingsForm.value.firstName,
      lastName: settingsForm.value.lastName,
      preferredLanguage: settingsForm.value.preferredLanguage,
    })
    initialSettingsForm.value = { ...settingsForm.value } // Update initial form state
  } catch {
    settingsFormError.value = 'Failed to update profile'
  }
}
</script>

<template>
  <div>
    <div class="pa-4">
      <DisclaimerWarning />
      <h1>My Account</h1>
      <p>This is the account page. You can view and edit your account details here.</p>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>Account Details</v-card-title>
        <v-card-text>
          <p>
            <strong>Name:</strong> {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
          </p>
          <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
        </v-card-text>
      </v-card>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>Settings</v-card-title>
        <v-card-text>
          <v-form ref="settingsFormRef" v-model="settingsFormValid" @submit.prevent="saveSettings">
            <v-text-field
              v-model="settingsForm.firstName"
              label="First Name"
              :rules="settingsFormRules.firstName"
              required
            />
            <v-text-field
              v-model="settingsForm.lastName"
              label="Last Name"
              :rules="settingsFormRules.lastName"
              required
            />
            <v-select
            :items="languageOptions"
            v-model="settingsForm.preferredLanguage"
            label="Preferred Language"
          />
          <v-btn data-test="settings-submit" class="mt-2" color="primary" type="submit" :disabled="!settingsFormValid || isEqual(settingsForm, initialSettingsForm) || authStore.pending.updateProfile"
          :loading="authStore.pending.updateProfile">
            Save
          </v-btn>
          </v-form>

        </v-card-text>
      </v-card>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>Update Password</v-card-title>
        <v-card-text>
          <v-form ref="passwordFormRef" v-model="passwordFormValid" @submit.prevent="updatePassword">
            <v-text-field
              v-model="passwordForm.currentPassword"
              label="Current Password"
              :type="showCurrentPassword ? 'text' : 'password'"
              :append-inner-icon="showCurrentPassword ? mdiEyeOff : mdiEye"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
              :rules="passwordRules.current"
              required
            />

            <v-text-field
              v-model="passwordForm.newPassword"
              label="New Password"
              :type="showNewPassword ? 'text' : 'password'"
              :append-inner-icon="showNewPassword ? mdiEyeOff : mdiEye"
              @click:append-inner="showNewPassword = !showNewPassword"
              :rules="passwordRules.new"
              required
            />

            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="showConfirmPassword ? mdiEyeOff : mdiEye"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              :rules="passwordRules.confirm"
              required
            />

            <v-alert v-if="passwordError" type="error" class="mb-4">
              {{ passwordError }}
            </v-alert>

            <v-btn
              data-test="password-submit"
              type="submit"
              color="primary"
              :loading="authStore.pending.updatePassword"
              :disabled="!passwordFormValid || authStore.pending.updatePassword"
            >
              Update Password
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
