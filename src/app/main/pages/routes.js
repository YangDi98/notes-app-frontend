const mainRoutes = [
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/app/main/pages/NotesPage.vue'),
  }
]

export default mainRoutes
