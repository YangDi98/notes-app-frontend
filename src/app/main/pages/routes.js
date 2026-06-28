const mainRoutes = [
  {
    path: '/',
    redirect: '/notes',
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/app/main/pages/NotesPage.vue'),
    meta: { title: 'Notes' },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/app/main/pages/AccountPage.vue'),
    meta: { title: 'Account' },
  },
]

export default mainRoutes
