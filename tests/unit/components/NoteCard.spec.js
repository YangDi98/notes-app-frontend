import NoteCard from '@/components/NoteCard.vue';
import { mount } from '@vue/test-utils'
import { describe } from 'vitest';
import { merge } from 'lodash';

describe('NoteCard.vue', () => {
  function createComponent(userOptions = {}) {
    const wrapper = mount(NoteCard, merge({
      props: {
        note: {
          id: 1,
          title: 'Test Note',
          content: 'This is a test note.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    }, userOptions))
    return { wrapper }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })
})
