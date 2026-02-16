import { nextTick } from 'vue'
import EditNoteModal from '@/components/EditNoteModal.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect } from 'vitest';
import { merge } from 'lodash';
import { createTestingPinia } from '@pinia/testing'
import AxiosMockAdapter from 'axios-mock-adapter'
import { apiClient } from '@/api/api'
import { useAuthStore } from '@/stores/auth';
import { useNotesStore  } from '@/stores/notes';
import { createNote } from '@tests/factories/noteFactory.js'

// Create a mock Axios instance
const mockAxios = new AxiosMockAdapter(apiClient)

const mockNote = createNote()

describe('EditNoteModal.vue', () => {
  function createComponent(userOptions = {}) {
    const pinia = createTestingPinia({ stubActions: false });

    const authStore = useAuthStore();
    authStore.user = { id: mockNote.userId, name: 'Test User' } // Mock authenticated user
    const notesStore = useNotesStore();
    notesStore.notes = [
      mockNote
    ];

    const wrapper = mount(EditNoteModal, merge({
      global: {
        plugins: [pinia],
      },
      props: {
        note: {
          ...mockNote
        },
      },
    }, userOptions))
    return { wrapper, notesStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  });

  it('edits a note when save button is clicked', async () => {
    const updatedNote = { ...mockNote, title: 'Updated Title' }
    mockAxios.onPut(`/api/users/${mockNote.userId}/notes/${mockNote.id}`).reply(200,
      updatedNote,
    )
    const { wrapper, notesStore } = createComponent()

    // Simulate user input
    wrapper.vm.noteForm.title = 'Updated Title'
    await nextTick();

    // Simulate save button click
    await wrapper.vm.save();
    await flushPromises();

    // Check if the note was updated in the store
    expect(notesStore.notes[0].title).toBe('Updated Title')
  });
})
