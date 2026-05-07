import { vi, describe, expect, it, beforeEach } from 'vitest';
import useNotes from '@/composables/useNotes';
import { noteService } from '@/services/noteService';
import type { Note, NoteWithContent } from '@/types/note';
import {NoteNotUpdatedError} from "@/errors/noteErrors";

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
    });

    it('refresh: shows success toast when refreshing a note correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(
            mockNote as NoteWithContent
        );

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
            "Errore durante l'aggiornamento della nota",
            'Service Error'
        );
    });

    // ---------- TEST PER IL SALVATAGGIO ----------

    it('save: passes the note id, name and content to the noteService correctly', async () => {
        const newName = 'New Note Name';
        const newContent = 'New Content';
        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.get).mockResolvedValue(mockNote);

        const { saveNote } = useNotes();
        await saveNote(mockNote, newContent, newName);
        expect(noteService.get).toHaveBeenCalledWith(String(mockNote.id));
        expect(noteService.update).toHaveBeenCalledWith(
            String(mockNote.id),
            newName,
            newContent
        );
    });

    it('save: returns the updated note correctly', async () => {
        const newName = 'New Note Name';
        const newContent = 'New Content';
        const savedNote = { ...mockNote, name: newName, content: newContent };
        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.update).mockResolvedValue(savedNote);

        const { saveNote } = useNotes();
        const note = await saveNote(mockNote, newContent, newName);
        expect(note).toEqual(savedNote);
    });

    it('save: shows info toast when saving with the same name and content', async () => {
        const { saveNote } = useNotes();
        await saveNote(mockNote, mockNote.content, mockNote.name);
        expect(mockToast.infoToast).toHaveBeenCalledWith(
            'La nota non ha subito modifiche',
            ''
        );
    });

    it('save: throws NoteNotUpdatedError when note.last_edit is outdated', async () => {
        const backedNote = { ...mockNote, last_edit: '2025-01-02 12:00:00' };
        const newName = 'New Note Name';
        vi.mocked(noteService.get).mockResolvedValue(backedNote);

        const { saveNote } = useNotes();
        expect(saveNote(mockNote, mockNote.content, newName)).rejects.toThrow(
            NoteNotUpdatedError
        );
    });

    it('save: shows success toast when saving with a different name or content', async () => {
        const newName = 'New Note Name';
        const newContent = 'New Content';
        const savedNote_1 = { ...mockNote, name: newName };
        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.update).mockResolvedValue(savedNote_1);

        const { saveNote } = useNotes();
        await saveNote(mockNote, mockNote.content, newName);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota salvata con successo',
            ''
        );

        const savedNote_2 = { ...mockNote, content: newContent };
        vi.mocked(noteService.update).mockResolvedValue(savedNote_2);

        await saveNote(mockNote, newContent, mockNote.name);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota salvata con successo',
            ''
        );
    });

    it('save: shows success toast when overwriting a note', async () => {
        const newName = 'New Note Name';
        const newLastEdit = '2026-01-02 12:00:00';
        const savedNote = { ...mockNote, last_edit: newLastEdit };
        const newNote = { ...mockNote, name: newName };
        vi.mocked(noteService.get).mockResolvedValue(savedNote);
        vi.mocked(noteService.update).mockResolvedValue(newNote);

        const { saveNote } = useNotes();
        await saveNote(mockNote, mockNote.content, newName, true);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota sovrascritta con successo',
            ''
        );
    });

    it('save: shows error toast when service throws an error', async () => {
        const newName = 'New Note Name';
        vi.mocked(noteService.get).mockRejectedValue(
            new Error('get Service Error')
        );

        const { saveNote } = useNotes();
        await saveNote(mockNote, mockNote.content, newName);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante il salvataggio della nota',
            'get Service Error'
        );

        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.update).mockRejectedValue(
            new Error('update Service Error')
        );

        await saveNote(mockNote, mockNote.content, newName);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante il salvataggio della nota',
            'update Service Error'
        );
    });

    // ---------- TEST PER LA RIMOZIONE ----------

    it('remove: passes the note id to the noteService correctly', async () => {
        vi.mocked(noteService.remove).mockResolvedValue();

        const { removeNote } = useNotes();
        await removeNote(mockNote.id);
        expect(noteService.remove).toHaveBeenCalledWith(mockNote.id);
    });

    it('remove: shows success toast when removing a note correctly', async () => {
        vi.mocked(noteService.remove).mockResolvedValue();

        const { removeNote } = useNotes();
        await removeNote(mockNote.id);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota eliminata con successo',
            ''
        );
    });

    it('remove: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.remove).mockRejectedValue(
            new Error('Service Error')
        );

        const { removeNote } = useNotes();
        await removeNote(mockNote.id);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante la cancellazione della nota',
            'Service Error'
        );
    });

    // ---------- TEST PER LA MEMORIZZAZIONE ----------

    it('store: passes the note name and the content to the noteService correctly', async () => {
        vi.mocked(noteService.store).mockResolvedValue(mockNote as Note);

        const { storeNote } = useNotes();
        await storeNote(mockNote.name, mockNote.content);
        expect(noteService.store).toHaveBeenCalledWith(
            mockNote.name,
            mockNote.content
        );
    });

    it('store: returns the stored note correctly', async () => {
        vi.mocked(noteService.store).mockResolvedValue(mockNote as Note);

        const { storeNote } = useNotes();
        const note = await storeNote(mockNote.name, mockNote.content);
        expect(note).toEqual(mockNote);
    });

    it('store: shows success toast when storing a note correctly', async () => {
        vi.mocked(noteService.store).mockResolvedValue(mockNote as Note);

        const { storeNote } = useNotes();
        await storeNote(mockNote.name, mockNote.content);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota salvata con successo',
            ''
        );
    });

    it('store: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.store).mockRejectedValue(
            new Error('Service Error')
        );

        const { storeNote } = useNotes();
        await storeNote(mockNote.name, mockNote.content);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante il salvataggio della nota',
            'Service Error'
        );
    });

    // ---------- TEST PER LA CLONAZIONE ----------

    it('clone: passes the note id, name and content to the noteService correctly', async () => {
        const newName = 'New Note Name';
        const clonedContent = 'Cloned Content';
        const clonedNote = { ...mockNote, content: clonedContent };
        vi.mocked(noteService.get).mockResolvedValue(clonedNote);
        vi.mocked(noteService.store).mockResolvedValue(mockNote);

        const { cloneNote } = useNotes();
        await cloneNote(mockNote.id, newName);
        expect(noteService.get).toHaveBeenCalledWith(mockNote.id);
        expect(noteService.store).toHaveBeenCalledWith(
            newName,
            clonedNote.content
        );
    });

    it('clone: shows success toast when cloning a note correctly', async () => {
        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.store).mockResolvedValue(mockNote);

        const { cloneNote } = useNotes();
        await cloneNote(mockNote.id, mockNote.name);
        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota clonata con successo',
            ''
        );
    });

    it('clone: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.get).mockRejectedValue(
            new Error('get Service Error')
        );

        const { cloneNote } = useNotes();
        await cloneNote(mockNote.id, mockNote.name);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante la clonazione della nota',
            'get Service Error'
        );

        vi.mocked(noteService.get).mockResolvedValue(mockNote);
        vi.mocked(noteService.store).mockRejectedValue(
            new Error('store Service Error')
        );

        await cloneNote(mockNote.id, mockNote.name);
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore durante la clonazione della nota',
            'store Service Error'
        );
    });

    // ---------- TEST PER L'ESPORTAZIONE ----------

    it('export: passes the note id and format to the noteService correctly', async () => {
        vi.mocked(noteService.export).mockResolvedValue();

        const { exportNote } = useNotes();
        await exportNote(mockNote.id, 'pdf');
        expect(noteService.export).toHaveBeenCalledWith(mockNote.id, 'pdf');
    });

    it('export: shows frontend error toast when format is not supported', async () => {
        const { exportNote } = useNotes();
        // @ts-ignore
        await exportNote(mockNote.id, 'invalid_format');
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Formato non supportato',
            ''
        );
    });

    it('export: shows success toast when exporting a note correctly', async () => {
        const formats = ['pdf', 'md', 'html'];
        vi.mocked(noteService.export).mockResolvedValue();

        const { exportNote } = useNotes();
        for (const format of formats) {
            // @ts-ignore
            await exportNote(mockNote.id, format);
            expect(mockToast.successToast).toHaveBeenCalledWith(
                'Nota esportata con successo',
                ''
            );
        }
    });

    it('export: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.export).mockRejectedValue(
            new Error('Service Error')
        );

        const { exportNote } = useNotes();
        await exportNote(mockNote.id, 'pdf');
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            "Errore durante l'esportazione della nota",
            'Service Error'
        );
    });

    // ---------- TEST PER L'ESPORTAZIONE DA CONTENUTO ----------

    it('exportRaw: passes the note name, content and format to the noteService correctly', async () => {
        vi.mocked(noteService.exportRaw).mockResolvedValue();

        const { exportNoteFromRaw } = useNotes();
        await exportNoteFromRaw(mockNote.name, mockNote.content, 'pdf');
        expect(noteService.exportRaw).toHaveBeenCalledWith(
            mockNote.name,
            mockNote.content,
            'pdf'
        );
    });

    it('exportRaw: shows frontend error toast when format is not supported', async () => {
        const { exportNoteFromRaw } = useNotes();
        // @ts-ignore
        await exportNoteFromRaw(mockNote.name, mockNote.content, 'invalid_format');
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Formato non supportato',
            ''
        );
    });

    it('exportRaw: shows warning toast when content is empty', async () => {
        const { exportNoteFromRaw } = useNotes();
        await exportNoteFromRaw(mockNote.name, '', 'pdf');
        expect(mockToast.warningToast).toHaveBeenCalledWith(
            'Nessun contenuto da esportare',
            ''
        );
    });

    it('exportRaw: shows success toast when exporting a note correctly', async () => {
        const formats = ['pdf', 'md', 'html'];
        vi.mocked(noteService.exportRaw).mockResolvedValue();

        const { exportNoteFromRaw } = useNotes();
        for (const format of formats) {
            // @ts-ignore
            await exportNoteFromRaw(mockNote.name, mockNote.content, format);
            expect(mockToast.successToast).toHaveBeenCalledWith(
                'Nota esportata con successo',
                ''
            );
        }
    });

    it('exportRaw: shows error toast when service throws an error', async () => {
        vi.mocked(noteService.exportRaw).mockRejectedValue(
            new Error('Service Error')
        );

        const { exportNoteFromRaw } = useNotes();
        await exportNoteFromRaw(mockNote.name, mockNote.content, 'pdf');
        expect(mockToast.errorToast).toHaveBeenCalledWith(
            "Errore durante l'esportazione della nota",
            'Service Error'
        );
    });

    // ---------- TEST PER L'IMPORTAZIONE ----------

    it('import: passes the note file to the noteService correctly', async () => {
        const file = new File([''], 'test.md', { type: 'text/markdown' });
        vi.mocked(noteService.import).mockResolvedValue(mockNote);

        const { importNote } = useNotes();
        await importNote(file);

        const calledWith = vi.mocked(noteService.import).mock.calls[0][0];
        expect(calledWith.get('file')).toBe(file);
    });

    it('import: shows frontend error toast when file format is not supported', async () => {
        const file = new File(['content'], 'note.pdf', {
            type: 'application/pdf',
        });

        const { importNote } = useNotes();
        await importNote(file);

        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Formato non supportato',
            ''
        );
    });

    it('import: shows success toast when importing a note correctly', async () => {
        const file = new File([''], 'test.md', { type: 'text/markdown' });
        vi.mocked(noteService.import).mockResolvedValue(mockNote);

        const { importNote } = useNotes();
        await importNote(file);

        expect(mockToast.successToast).toHaveBeenCalledWith(
            'Nota importata con successo',
            ''
        );
    });

    it('import: accepts file with .md extension regardless of type', async () => {
        const file = new File(['content'], 'note.md', { type: '' });
        vi.mocked(noteService.import).mockResolvedValue(mockNote);

        const { importNote } = useNotes();
        await importNote(file);

        expect(mockToast.successToast).toHaveBeenCalled();
    });

    it('import: shows error toast when service throws an error', async () => {
        const file = new File([''], 'test.md', { type: 'text/markdown' });
        vi.mocked(noteService.import).mockRejectedValue(
            new Error('Service Error')
        );

        const { importNote } = useNotes();
        await importNote(file);

        expect(mockToast.errorToast).toHaveBeenCalledWith(
            "Errore durante l'importazione della nota",
            'Service Error'
        );
    });
});
