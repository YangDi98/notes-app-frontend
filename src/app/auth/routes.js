import { useAuthStore } from '@/stores/auth'
const authRoutes = [
  {
    path: '/register',
    name: 'register',
    component: () => import('@/app/auth/pages/RegisterPage.vue'),
    meta: { requiresAuth: false, showSideBar: false },
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/app/auth/pages/LoginPage.vue'),
    meta: { requiresAuth: false, showSideBar: false },
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      await authStore.logout()
      next({ name: 'login' })
    },
  },
]

export default authRoutes
