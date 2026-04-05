import AccountPage from '@/app/main/pages/AccountPage.vue'
import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { apiClient } from '@/api/api'
import AxiosMockAdapter from 'axios-mock-adapter'
import { expect, it } from 'vitest'
import i18n from '@/i18n'

const mockAxios = new AxiosMockAdapter(apiClient)

describe('AccountPage', () => {
  beforeEach(() => {
    mockAxios.reset()
    i18n.global.locale.value = 'en'
  })

  afterEach(() => {
    mockAxios.reset()
  })

  function createComponent() {
    const pinia = createTestingPinia({ stubActions: false })

    const authStore = useAuthStore()
    authStore.user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      preferredLanguage: 'en_CA',
    }
    const notificationStore = useNotificationStore()
    const wrapper = mount(AccountPage, {
      global: {
        plugins: [pinia],
      },
    })

    return { wrapper, authStore, notificationStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('updates password successfully', async () => {
    mockAxios.onPost('/api/auth/update_password').reply(200)
    const { wrapper, notificationStore } = createComponent()

    // Simulate user input
    wrapper.vm.passwordForm.currentPassword = 'currentPassword'
    wrapper.vm.passwordForm.newPassword = 'newPassword#123'
    wrapper.vm.passwordForm.confirmNewPassword = 'newPassword#123'
    await nextTick()

    // Simulate save button click
    await wrapper.vm.updatePassword()
    await flushPromises()

    expect(notificationStore.setAlertMessage).toHaveBeenCalledWith({
      message: 'Password updated successfully.',
      type: 'success',
    })
  })

  it('handles password update failure', async () => {
    mockAxios.onPost('/api/auth/update_password').reply(401, {
      message: 'Current password is incorrect.',
    })
    const { wrapper, notificationStore } = createComponent()

    // Simulate user input
    wrapper.vm.passwordForm.currentPassword = 'wrongPassword'
    wrapper.vm.passwordForm.newPassword = 'newPassword#123'
    wrapper.vm.passwordForm.confirmNewPassword = 'newPassword#123'
    await nextTick()

    // Simulate save button click
    await wrapper.vm.updatePassword()
    await flushPromises()

    expect(notificationStore.setAlertMessage).toHaveBeenCalledWith({
      message: 'Current password is incorrect.',
      type: 'failure',
    })
  })

  // User Settings Tests
  it('updates user profile settings successfully', async () => {
    mockAxios.onPatch('/api/users/1').reply(200, {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      preferredLanguage: 'zh_CN',
    })

    const { wrapper, authStore } = createComponent()

    // Update form values
    wrapper.vm.settingsForm.firstName = 'Jane'
    wrapper.vm.settingsForm.lastName = 'Smith'
    wrapper.vm.settingsForm.preferredLanguage = 'zh_CN'
    await nextTick()

    // Submit the form
    await wrapper.vm.saveSettings()
    await flushPromises()

    // Verify updateProfile was called with correct data
    expect(authStore.updateProfile).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Smith',
      preferredLanguage: 'zh_CN',
      userId: 1,
    })
  })

  it('handles settings update failure', async () => {
    mockAxios.onPatch('/api/users/1').reply(500)

    const { wrapper } = createComponent()

    // Update form values
    wrapper.vm.settingsForm.firstName = 'Jane'
    wrapper.vm.settingsForm.lastName = 'Smith'
    await nextTick()

    // Submit the form
    await wrapper.vm.saveSettings()
    await flushPromises()

    // Check that error is set
    expect(wrapper.vm.settingsFormError).toBe('Failed to update profile')
  })

  it('validates required fields in settings form', async () => {
    const { wrapper } = createComponent()

    // Clear required fields
    wrapper.vm.settingsForm.firstName = ''
    wrapper.vm.settingsForm.lastName = ''
    await nextTick()

    // Check form validation
    const firstNameValidation = wrapper.vm.settingsFormRules.firstName[0]('')
    const lastNameValidation = wrapper.vm.settingsFormRules.lastName[0]('')

    expect(firstNameValidation).toBe('First name is required')
    expect(lastNameValidation).toBe('Last name is required')
  })

  it('disables save button when form has not changed', async () => {
    const { wrapper } = createComponent()

    // Wait for component to fully mount and reactive updates
    await nextTick()

    // Manually set form as valid since Vuetify validation doesn't run automatically in tests
    wrapper.vm.settingsFormValid = true
    await nextTick()

    // Get the specific save button (settings form)
    const saveButton = wrapper.find('[data-test="settings-submit"]')

    // Button should be disabled when form hasn't changed (due to isEqual check)
    expect(saveButton.element.disabled).toBe(true)
  })

  it('enables save button when form values change', async () => {
    const { wrapper } = createComponent()

    // Manually set form as valid since Vuetify validation doesn't run automatically in tests
    wrapper.vm.settingsFormValid = true
    await nextTick()

    // Change a form value
    wrapper.vm.settingsForm.firstName = 'Jane'
    await nextTick()

    // The save button should be enabled when form has changes
    const saveButton = wrapper.find('[data-test="settings-submit"]')
    expect(saveButton.element.disabled).toBe(false)
  })

  it('updates preferred language correctly', async () => {
    mockAxios.onPatch('/api/users/1').reply(200, {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      preferredLanguage: 'zh_CN',
    })

    const { wrapper, authStore } = createComponent()

    // Change preferred language
    wrapper.vm.settingsForm.preferredLanguage = 'zh_CN'
    await nextTick()

    // Submit the form
    await wrapper.vm.saveSettings()
    await flushPromises()

    // Verify updateProfile was called with the new language
    expect(authStore.updateProfile).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      preferredLanguage: 'zh_CN',
      userId: 1,
    })
  })

  it('displays user information correctly', () => {
    const { wrapper } = createComponent()

    // Check that user information is displayed
    const accountDetails = wrapper.find('.v-card-text')
    expect(accountDetails.text()).toContain('John Doe')
    expect(accountDetails.text()).toContain('john.doe@example.com')
  })
})
