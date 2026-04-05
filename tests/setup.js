import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'

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

// Set locale to English for tests
i18n.global.locale.value = 'en'

// Configure global plugins for all test files
config.global.plugins = [vuetify, router, i18n]
