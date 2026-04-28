import { createRouter, createWebHistory } from 'vue-router';

import NotesArchivePage from '@/pages/NotesArchivePage.vue';
import NoteEditorPage from '@/pages/NoteEditorPage.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: NotesArchivePage,
        },
        {
            path: '/notes/new',
            component: NoteEditorPage,
        },
        {
            path: '/notes/:id',
            component: NoteEditorPage,
        },
    ],
});

export default router;