import NotesPage from '@/app/main/pages/NotesPage.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useNotesStore } from '@/stores/notes'
import { apiClient } from '@/api/api'
import AxiosMockAdapter from 'axios-mock-adapter'
import { createNotes } from '@tests/factories/noteFactory.js'
import { expect, it, vi } from 'vitest'

const mockAxios = new AxiosMockAdapter(apiClient)
const mockNotes = createNotes(2)

describe('NotesPage', () => {
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
    const notesStore = useNotesStore()
    const wrapper = mount(NotesPage, {
      global: {
        plugins: [pinia],
      },
    })

    return { wrapper, authStore, notificationStore, notesStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('fetches and displays notes on mount', async () => {
    mockAxios.onGet('/api/users/1/notes/').reply(200, {
      data:mockNotes,
      next: null,
    })
    const { wrapper } = createComponent()
    await flushPromises()

    const noteCards = wrapper.findAllComponents({ name: 'NoteCard' })
    expect(noteCards.length).toBe(2)
    expect(noteCards[0].props('note').title).toBe(mockNotes[0].title)
    expect(noteCards[1].props('note').title).toBe(mockNotes[1].title)
  });

  it.each([
    [200, '/users/1/notes/?cursor_created_at=2026-02-07+20:06:12.760315&cursor_id=2&limit=100', 'ok'],
    [200, null, 'empty'],
    [400, null, 'error'],
  ])('set done status correctly', async (code, next, status) => {
    mockAxios.onGet(/\/api\/users\/1\/notes\/.*/).reply(code, {
      data: mockNotes,
      next,
    })
    const { wrapper } = createComponent()
    await flushPromises();
    const mockDone = vi.fn()
    await wrapper.vm.fetchNotes({done: mockDone});
    expect(mockDone).toHaveBeenCalledTimes(2);
    expect(mockDone).toHaveBeenNthCalledWith(1, 'loading');
    expect(mockDone).toHaveBeenNthCalledWith(2, status);
  })
})

