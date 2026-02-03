import SideBar from '@/components/SideBar.vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'

describe('SideBar.vue', () => {
  function createComponent() {
    const wrapper = mount({
      components: { SideBar },
      template: '<v-layout><SideBar /></v-layout>',
    }, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
      },
    })
    const authStore = useAuthStore()
    return { wrapper, authStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(SideBar).exists()).toBe(true)
  })
})
