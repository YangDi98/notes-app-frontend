

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
]

export default authRoutes
