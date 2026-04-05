<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { mdiEye, mdiEyeOff } from '@mdi/js'
import DisclaimerWarning from '@/components/DisclaimerWarning.vue'
import isEqual from 'lodash/isEqual'

const { t } = useI18n()
const authStore = useAuthStore()

const languageOptions = computed(() => [
  { title: t('common.english'), value: 'en_CA' },
  { title: t('common.chinese'), value: 'zh_CN' },
])

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
  firstName: [(value) => !!value.trim() || t('validation.firstNameRequired')],
  lastName: [(value) => !!value.trim() || t('validation.lastNameRequired')],
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
  current: [(value) => !!value || t('validation.currentPasswordRequired')],
  new: [
    (value) => !!value || t('validation.newPasswordRequired'),
    (value) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#%])[A-Za-z\d@$#%]{9,}$/
      return regex.test(value) || t('validation.passwordComplexity')
    },
  ],
  confirm: [
    (value) => !!value || t('validation.confirmPasswordRequired'),
    (value) => value === passwordForm.value.newPassword || t('validation.passwordsDoNotMatch'),
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
    passwordError.value = t('notifications.failedUpdatePassword')
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
    settingsFormError.value = t('notifications.failedUpdateProfile')
  }
}
</script>

<template>
  <div>
    <div class="pa-4">
      <DisclaimerWarning />
      <h1>{{ $t('account.myAccount') }}</h1>
      <p>{{ $t('account.accountDescription') }}</p>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>{{ $t('account.accountDetails') }}</v-card-title>
        <v-card-text>
          <p>
            <strong>{{ $t('account.name') }}</strong> {{ authStore.user?.firstName }}
            {{ authStore.user?.lastName }}
          </p>
          <p>
            <strong>{{ $t('account.emailLabel') }}</strong> {{ authStore.user?.email }}
          </p>
        </v-card-text>
      </v-card>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>{{ $t('account.settings') }}</v-card-title>
        <v-card-text>
          <v-form ref="settingsFormRef" v-model="settingsFormValid" @submit.prevent="saveSettings">
            <v-text-field
              v-model="settingsForm.firstName"
              :label="$t('common.firstName')"
              :rules="settingsFormRules.firstName"
              required
            />
            <v-text-field
              v-model="settingsForm.lastName"
              :label="$t('common.lastName')"
              :rules="settingsFormRules.lastName"
              required
            />
            <v-select
              :items="languageOptions"
              v-model="settingsForm.preferredLanguage"
              :label="$t('account.preferredLanguage')"
            />
            <v-btn
              data-test="settings-submit"
              class="mt-2"
              color="primary"
              type="submit"
              :disabled="
                !settingsFormValid ||
                isEqual(settingsForm, initialSettingsForm) ||
                authStore.pending.updateProfile
              "
              :loading="authStore.pending.updateProfile"
            >
              {{ $t('common.save') }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
    <div class="pa-4">
      <v-card>
        <v-card-title>{{ $t('account.updatePassword') }}</v-card-title>
        <v-card-text>
          <v-form
            ref="passwordFormRef"
            v-model="passwordFormValid"
            @submit.prevent="updatePassword"
          >
            <v-text-field
              v-model="passwordForm.currentPassword"
              :label="$t('account.currentPassword')"
              :type="showCurrentPassword ? 'text' : 'password'"
              :append-inner-icon="showCurrentPassword ? mdiEyeOff : mdiEye"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
              :rules="passwordRules.current"
              required
            />

            <v-text-field
              v-model="passwordForm.newPassword"
              :label="$t('account.newPassword')"
              :type="showNewPassword ? 'text' : 'password'"
              :append-inner-icon="showNewPassword ? mdiEyeOff : mdiEye"
              @click:append-inner="showNewPassword = !showNewPassword"
              :rules="passwordRules.new"
              required
            />

            <v-text-field
              v-model="passwordForm.confirmPassword"
              :label="$t('account.confirmNewPassword')"
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
              {{ $t('account.updatePassword') }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
