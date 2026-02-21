import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock window.history for JSDOM environments
if (!window.history._history) {
  // Only add the _history property if it doesn't exist
  Object.defineProperty(window.history, '_history', {
    value: [],
    writable: true,
    configurable: true
  })
}

// Mock window.location for JSDOM environments
if (!window.location._location) {
  // Only add the _location property if it doesn't exist
  Object.defineProperty(window.location, '_location', {
    value: {},
    writable: true,
    configurable: true
  })
}

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
