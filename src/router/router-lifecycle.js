import { useStorage } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'


export function setupRouterGuards(router) {
  // Navigation guard to protect authenticated routes
  router.beforeEach(async (to, from, next) => {

    const authStore = useAuthStore()
    const accessToken = useStorage('accessToken', null)
    const requiresAuth = to.meta?.requiresAuth !== false // Default to true unless explicitly set to false

    // If user has no token and trying to access protected route, redirect to login IMMEDIATELY
    if (!accessToken.value && requiresAuth) {
      return next({
        name: 'login',
        query: { redirect: to.fullPath }, // Save the intended destination
      })
    }

    // If user has token but no user data, try to fetch it first
    if (accessToken.value && !authStore.user) {
      try {
        await authStore.fetchCurrentUser()
      } catch  {
        // If fetching fails, token is invalid - redirect to login
        return next({
          name: 'login',
          query: { redirect: to.fullPath },
        })
      }
    }

    // If user has token and trying to access auth route, redirect to notes
    if (accessToken.value && !requiresAuth) {
      // Check if there's a redirect parameter
      const redirectTo = to.query.redirect || { name: 'notes' }
      return next(redirectTo)
    }

    // If user has token, allow access to protected routes
    next()
  })
}
