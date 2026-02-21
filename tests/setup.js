import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'
import { vi } from 'vitest'

// Mock window.history for JSDOM environments
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: {},
    _history: [] // Mock the internal _history property that Vue Router accesses
  },
  writable: true,
})

// Mock ResizeObserver for tests
globalThis.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Create a minimal test router with catch-all route
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    // Catch-all route that handles any path
    { path: '/:pathMatch(.*)*', component: { template: '<div>Mock Route</div>' } },
  ],
})

// Create a global Vuetify instance for all tests
const vuetify = createVuetify({
  components,
  directives,
})

// Configure global plugins for all test files
config.global.plugins = [vuetify, router]
