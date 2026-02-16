const mainRoutes = [
  {
    path: '/',
    redirect: '/notes',
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/app/main/pages/NotesPage.vue'),
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/app/main/pages/AccountPage.vue'),
  },
]

export default mainRoutes
