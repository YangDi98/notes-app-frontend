import NoteCard from '@/components/NoteCard.vue';
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect } from 'vitest';
import { merge } from 'lodash';
import { createTestingPinia } from '@pinia/testing'
import AxiosMockAdapter from 'axios-mock-adapter'
import { apiClient } from '@/api/api'
import { useNotesStore  } from '@/stores/notes';

// Create a mock Axios instance
const mockAxios = new AxiosMockAdapter(apiClient)

const mockShowAlert = vi.hoisted(() => vi.fn())
vi.mock('@/composables/useAlertDialog', () => ({
  useAlertDialog: () => ({
    showAlert: mockShowAlert
  }),
}))

describe('NoteCard.vue', () => {
  function createComponent(userOptions = {}) {
    const pinia = createTestingPinia({ stubActions: false });
    const notesStore = useNotesStore();
    notesStore.notes = [
      {
          id: 1,
          userId: 1, // Add userId for delete function
          title: 'Test Note',
          content: 'This is a test note.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
    ];

    const wrapper = mount(NoteCard, merge({
      global: {
        plugins: [pinia],
      },
      props: {
        note: {
          id: 1,
          userId: 1, // Add userId for delete function
          title: 'Test Note',
          content: 'This is a test note.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    }, userOptions))
    return { wrapper, notesStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  });

  it('deletes a note when delete button is clicked', async () => {
    mockAxios.onDelete('/api/users/1/notes/1').reply(204)
    const { wrapper, notesStore } = createComponent()
    const deleteButton = wrapper.find('[data-test="delete-button"]')
    await deleteButton.trigger('click')

    // Verify showAlert was called with correct options
    expect(mockShowAlert).toHaveBeenCalledWith({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'red-darken-4',
      onConfirm: expect.any(Function)
    })

    // Get the onConfirm function and simulate confirmation
    const showAlertCall = mockShowAlert.mock.calls[0][0]
    const onConfirm = showAlertCall.onConfirm

    // Mock the notes store method

    // Simulate user confirming the dialog
    await onConfirm()

    await flushPromises();
    expect(notesStore.notes).toEqual([]) // Verify the note was removed from the store
  })
})
