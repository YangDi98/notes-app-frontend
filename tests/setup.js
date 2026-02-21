import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createWebHistory } from 'vue-router'

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
  history: createWebHistory(),
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
