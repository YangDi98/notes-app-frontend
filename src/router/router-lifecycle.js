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
        // Add a small delay to ensure interceptors are ready
        // if (from.name === undefined) {
        //   // This is initial page load, give app time to initialize
        //   await new Promise(resolve => setTimeout(resolve, 100))
        // }
        console.log(
          'Fetching current user during navigation...',
          from.name,
          from.fullPath,
          '->',
          to.fullPath,
        )

        await authStore.fetchCurrentUser()
      } catch (error) {
        // If fetching fails, token might be invalid - redirect to login
        console.log('Failed to fetch current user during navigation:', error)
        return next({
          name: 'login',
          query: { redirect: to.fullPath },
        })
      }
    }

    // If user has token and trying to access auth route, redirect to notes
    if (accessToken.value && !requiresAuth) {
      // Check if there's a redirect parameter, but validate it for security
      let redirectTo = to.query.redirect

      // Comprehensive validation to prevent open redirect attacks
      if (redirectTo) {
        // Validate redirect parameter
        if (typeof redirectTo !== 'string') {
          redirectTo = null
        } else {
          try {
            if (router.resolve(redirectTo).matched.length === 0) {
              // Route doesn't exist (includes external URLs)
              redirectTo = null
            }
          } catch {
            // Malformed or unexpected redirect string; treat as invalid
            redirectTo = null
          }
        }
        if (
          redirectTo &&
          (redirectTo === '/logout' ||
            redirectTo === '/login' ||
            redirectTo === '/register' ||
            redirectTo.startsWith('/logout/') ||
            redirectTo.startsWith('/login/') ||
            redirectTo.startsWith('/register/'))
        ) {
          // Don't redirect to auth routes
          redirectTo = null
        }
      }

      return next(redirectTo || { name: 'notes' })
    }

    // If user has token, allow access to protected routes
    next()
  })
}
