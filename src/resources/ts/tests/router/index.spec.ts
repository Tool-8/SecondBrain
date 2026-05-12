import { describe, it, expect, vi } from 'vitest';
import router from '@/router/index';

vi.mock('@/pages/NotesArchivePage.vue', () => ({
    default: { testName: 'NotesArchivePage' }
}));

vi.mock('@/pages/NoteEditorPage.vue', () => ({
    default: { testName: 'NoteEditorPage' }
}));

describe('Router Configuration (Unit Tests)', () => {

    it('dovrebbe mappare "/" a NotesArchivePage', async () => {
        await router.push('/');
        await router.isReady();

        const matchedComponent = router.currentRoute.value.matched[0].components?.default;
        
        expect((matchedComponent as any).testName).toBe('NotesArchivePage');
    });

    it('dovrebbe mappare "/notes/new" a NoteEditorPage (modalità creazione)', async () => {
        await router.push('/notes/new');
        await router.isReady();

        const matchedComponent = router.currentRoute.value.matched[0].components?.default;
        
        expect((matchedComponent as any).testName).toBe('NoteEditorPage');
        expect(router.currentRoute.value.path).toBe('/notes/new');
    });

    it('dovrebbe mappare "/notes/:id" a NoteEditorPage (modalità modifica)', async () => {
        const noteId = 'abc-123';
        await router.push(`/notes/${noteId}`);
        await router.isReady();

        const matchedComponent = router.currentRoute.value.matched[0].components?.default;

        expect((matchedComponent as any).testName).toBe('NoteEditorPage');
        expect(router.currentRoute.value.params.id).toBe(noteId);
    });
});