import SideBar from '@/components/SideBar.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/api/api'
import AxiosMockAdapter from 'axios-mock-adapter'
import { vi } from 'vitest'

// Mock useStorage from VueUse
const mockAccessToken = vi.hoisted(() => ({ value: 'mock-token' }))
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual('@vueuse/core')
  return {
    ...actual,
    useStorage: vi.fn(() => mockAccessToken) // Return the reactive object directly
  }
})

const mockAxios = new AxiosMockAdapter(apiClient)

describe('SideBar.vue', () => {
  beforeEach(() => {
    // Reset the mock token value before each test
    mockAccessToken.value = 'mock-token'
    mockAxios.reset()
  })

  function createComponent() {
    // Create a wrapper component that provides v-app
    const AppWrapper = {
      components: { SideBar },
      template: '<v-app><SideBar /></v-app>',
    }

    const wrapper = mount(AppWrapper, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
      },
    })
    const authStore = useAuthStore();
    authStore.user = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' } // Mock authenticated user
    return { wrapper, authStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(SideBar).exists()).toBe(true)
  })

  it('calls logout action and redirects on logout', async () => {
    mockAxios.onPost('/api/auth/logout').reply(200)
    const { wrapper, authStore } = createComponent()
    const sideBarComponent = wrapper.findComponent(SideBar)
    const logoutButton = sideBarComponent.find('[data-test="logout-button"]')
    await logoutButton.trigger('click');
    await flushPromises()
    expect(authStore.logout).toHaveBeenCalled()
    expect(authStore.user).toBeNull()
    expect(mockAccessToken.value).toBeNull()
  })
})
