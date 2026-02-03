// This file can be used for app-wide routes that don't belong to a specific feature
// For example: home page, about page, 404 page, etc.

const appRoutes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFound.vue'),
    meta: { requiresAuth: false, showSideBar: false },
  },
]

export default appRoutes
