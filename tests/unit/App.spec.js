import { createTestingPinia } from '@pinia/testing'

import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  function createComponent() {
    const wrapper = mount(App, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
      },
    })
    return { wrapper }
  }
  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })
})
