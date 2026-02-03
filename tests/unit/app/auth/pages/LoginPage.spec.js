import LoginPage from '@/app/auth/pages/LoginPage.vue'
import { ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { apiClient } from '@/api/auth'
import AxiosMockAdapter from 'axios-mock-adapter'
import { camelizeKeys } from 'humps'

// Mock the router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    currentRoute: {
      value: {
        query: {
          redirect: null
        }
      }
    }
  }),
}))
const mockAccessToken = ref(null);
vi.doMock('@vueuse/core', () => {
  const actual = vi.importActual('@vueuse/core')
  return {
    ...actual,
  useStorage: vi.fn(() => mockAccessToken),
}
})

const mockAxios = new AxiosMockAdapter(apiClient)

describe('LoginPage', () => {
  beforeEach(() => {
    mockAxios.reset()
    mockPush.mockClear()
    mockAccessToken.value = null
  })

  afterEach(() => {
    mockAxios.reset()
  })

  function createComponent() {
    const pinia = createTestingPinia({ stubActions: false })
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [pinia],
      },
    })

    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    return { wrapper, authStore, notificationStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('logs in a user successfully', async () => {
    const { wrapper, authStore, notificationStore } = createComponent()

    // Mock the API response
    const mockResponse = {
      accessToken: 'mocked-access-token',
    }
    const mockUserResponse = {
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      active: true,
    }

    mockAxios.onPost('/api/auth/login').reply(200, mockResponse)
    mockAxios.onGet('/api/auth/who_am_i').reply(200, mockUserResponse)
    wrapper.vm.form = {
      email: 'test@example.com',
      password: 'testPassword@123',
    }

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(authStore.accessToken).toBe('mocked-access-token')
    expect(authStore.user).toEqual(camelizeKeys(mockUserResponse))
    expect(notificationStore.setAlertMessage).toHaveBeenCalledWith({
      message: 'Login successful.',
      type: 'success',
    })
    expect(mockPush).toHaveBeenCalledWith({ name: 'notes' })
  })
})
