import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from '@/app/auth/routes.js'
import mainRoutes from '@/app/main/pages/routes'
import appRoutes from '@/app/routes.js'
import { setupRouterGuards } from './router-lifecycle.js'
// Import other route modules as you create them
// import notesRoutes from '@/app/notes/routes.js'
// import userRoutes from '@/app/user/routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...appRoutes,
    ...authRoutes,
    ...mainRoutes,
    // Spread other route arrays here
    // ...notesRoutes,
    // ...userRoutes,
  ],
})

// Setup router lifecycle hooks
setupRouterGuards(router)

export default router
