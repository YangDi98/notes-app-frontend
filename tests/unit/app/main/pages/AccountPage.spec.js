import AccountPage from '@/app/main/pages/AccountPage.vue'
import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { apiClient } from '@/api/api'
import AxiosMockAdapter from 'axios-mock-adapter'
import { expect, it } from 'vitest'

const mockAxios = new AxiosMockAdapter(apiClient)

describe('AccountPage', () => {
  beforeEach(() => {
    mockAxios.reset()
  })

  afterEach(() => {
    mockAxios.reset()
  })

  function createComponent() {
    const pinia = createTestingPinia({ stubActions: false })

    const authStore = useAuthStore()
    authStore.user = { id: 1, name: 'Test User' } // Mock authenticated user
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
})
