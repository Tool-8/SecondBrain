import { mount, VueWrapper } from '@vue/test-utils';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import useNotes from '@/composables/useNotes';
import { noteService } from '@/services/noteService';
import type { Note, NoteWithContent } from '@/types/note';
import { mock } from 'node:test';

// Mock backend
const mockNote: NoteWithContent = {
    id: '1',
    name: 'Note 1',
    content: 'Content 1',
    last_edit: '2026-01-01 12:00:00',
    creation: '2026-01-01 12:00:00',
};
vi.mock('@/services/noteService');

// Mock toast
const mockToast = {
    successToast: vi.fn(),
    infoToast: vi.fn(),
    warningToast: vi.fn(),
    errorToast: vi.fn(),
};
vi.mock('@/composables/useToast', () => ({
    useToast: () => mockToast,
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useNotes', () => {
    // ---------- TEST PER LA RINOMINAZIONE ----------

    it('rename: passes the new name to the noteService correctly', async () => {
        vi.mocked(noteService.rename).mockResolvedValue(mockNote as Note);

        const { renameNote } = useNotes();
        const newName = 'New Note Name';
        await renameNote(mockNote as Note, newName);
        expect(noteService.rename).toHaveBeenCalledWith(mockNote.id, newName);
    });

    it('rename: shows info toast when renaming with the same name', async () => {
        vi.mocked(noteService.rename).mockResolvedValue(mockNote as Note);

        const { renameNote } = useNotes();
        await renameNote(mockNote as Note, mockNote.name);
        expect(mockToast.infoToast).toHaveBeenCalledWith(
            'Il nome non ha subito modifiche',
            ''
        );
    });

    it('rename: shows success toast when renaming with a different name', async () => {
        vi.mocked(noteService.rename).mockResolvedValue(mockNote as Note);

        const { renameNote } = useNotes();
        const newName = 'New Note Name';
        await renameNote(mockNote as Note, newName);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota rinominata con successo',
            ''
        );
    });

    it('rename: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.rename).mockRejectedValue(
            new Error('Service Error')
        );

        const { renameNote } = useNotes();
        const newName = 'New Note Name';
        await renameNote(mockNote as Note, newName);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante la rinominazione della nota',
            'Service Error'
        );
    });

    // ---------- TEST PER IL RECUPERO ----------

    it('get: passes the note id to the noteService correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(
            mockNote as NoteWithContent
        );

        const { getNote } = useNotes();
        await getNote(String(mockNote.id));
        expect(noteService.get).toHaveBeenCalledWith(String(mockNote.id));
    });

    it('get: returns the note with content correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(
            mockNote as NoteWithContent
        );

        const { getNote } = useNotes();
        const note = await getNote(String(mockNote.id));
        expect(note).toEqual(mockNote);
    });

    it('get: returns null when getting a non-existent note', async () => {
        vi.mocked(noteService.get).mockRejectedValue(
            new Error('Service Error')
        );

        const { getNote } = useNotes();
        const note = await getNote('non-existent-id');
        expect(note).toBeNull();
    });

    it('get: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.get).mockRejectedValue(
            new Error('Service Error')
        );

        const { getNote } = useNotes();
        await getNote('non-existent-id');
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante il recupero della nota',
            'Service Error'
        );
    });

    // ---------- TEST PER IL RECUPERO DELL'ARCHIVIO ----------

    it('fetch: gets all notes from the noteService correctly', async () => {
        const archive = [mockNote, mockNote, mockNote];
        vi.mocked(noteService.getAll).mockResolvedValue(archive);

        const { fetchNotes, notes, loading, error } = useNotes();
        await fetchNotes();
        expect(notes.value).toEqual(archive);
        expect(loading.value).toBe(false);
        expect(error.value).toBeNull();
    });

    it('fetch: returns error when noteService throws an error', async () => {
        vi.mocked(noteService.getAll).mockRejectedValue(
            new Error('Service Error')
        );

        const { fetchNotes, notes, loading, error } = useNotes();
        await fetchNotes();
        expect(notes.value).toEqual([]);
        expect(loading.value).toBe(false);
        expect(error.value).toEqual('Errore nel recupero delle note.');
    });

    it('fetch: loading is true while fetching notes', async () => {
        let resolve!: (value: Note[]) => void;
        vi.mocked(noteService.getAll).mockImplementation(
            () =>
                new Promise((r) => {
                    resolve = r;
                })
        );

        const { fetchNotes, loading } = useNotes();
        const promise = fetchNotes();
        expect(loading.value).toBe(true);

        resolve([mockNote, mockNote, mockNote]);
        await promise;
        expect(loading.value).toBe(false);
    });

    // ---------- TEST PER L'AGGIORNAMENTO ----------


    it('refresh: passes the note id to the noteService correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(
            mockNote as NoteWithContent
        );

        const { refreshNote } = useNotes();
        await refreshNote(String(mockNote.id));
        expect(noteService.get).toHaveBeenCalledWith(String(mockNote.id));
    });

    it('refresh: returns the updated note correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(
            mockNote as NoteWithContent
        );

        const { refreshNote } = useNotes();
        const updatedNote = await refreshNote(String(mockNote.id));
        expect(updatedNote).toEqual(mockNote);
    })

    it('refresh: shows success toast when refreshing a note correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(mockNote as NoteWithContent);

        const { refreshNote } = useNotes();
        await refreshNote(String(mockNote.id));
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota aggiornata con successo',
            ''
        );
    });

    it('refresh: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.get).mockRejectedValue(
            new Error('Service Error')
        );

        const { refreshNote } = useNotes();
        await refreshNote(String(mockNote.id));
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante l\'aggiornamento della nota',
            'Service Error'
        );
    });
});
