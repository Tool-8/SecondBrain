import { createRouter, createWebHistory } from 'vue-router';

import NotesArchivePage from '@/pages/NotesArchivePage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: NotesArchivePage,
    },
  ],
});

export default router;