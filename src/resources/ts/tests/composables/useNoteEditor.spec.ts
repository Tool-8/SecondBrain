import { vi, describe, expect, it, beforeEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { provideNoteEditor, useNoteEditor } from '@/composables/useNoteEditor';
import type { Note, NoteWithContent } from '@/types/note';
import { useRoute } from 'vue-router';
import useNotes from '@/composables/useNotes';
import { NoteNotUpdatedError } from '@/errors/noteErrors';

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();
    return {
        ...actual,
        useRoute: vi.fn().mockReturnValue({
            params: { id: '1' },
        }),
        useRouter: vi.fn().mockReturnValue({
            replace: vi.fn(),
        }),
    };
});

const mockNote: NoteWithContent = {
    id: '1',
    name: 'Note 1',
    content: 'Content 1',
    last_edit: '2026-01-01 12:00:00',
    creation: '2026-01-01 12:00:00',
};
const mockUseNotes = vi.hoisted(() => ({
    getNote: vi.fn(),
    saveNote: vi.fn(),
    storeNote: vi.fn(),
    refreshNote: vi.fn(),
    exportNoteFromRaw: vi.fn(),
}));

const mockToast = vi.hoisted(() => ({
    successToast: vi.fn(),
    infoToast: vi.fn(),
    warningToast: vi.fn(),
    errorToast: vi.fn(),
}));

const mockRouter = vi.hoisted(() => ({
    replace: vi.fn(),
}));

const mockUseModals = vi.hoisted(() => ({
    SaveAsPromise: { start: vi.fn() },
    SavePromise: { start: vi.fn() },
}));

vi.mock('@/composables/useNotes', () => ({
    default: () => mockUseNotes,
}));
vi.mock('@/router', () => ({
    default: mockRouter
}));
vi.mock('@/composables/useModals', () => ({
    useModals: () => mockUseModals
}));
vi.mock('@/composables/useToast', () => ({
    useToast: () => mockToast,
}));

let state: ReturnType<typeof useNoteEditor>

const Parent = defineComponent({
    setup() {
        provideNoteEditor();
    },
    template: '<slot />'
});

const Child= defineComponent({
    setup() {
        state = useNoteEditor();
    },
    template: '<div />'
});


const mountEditor = () => {
    mount(Parent, {
        slots: { default: Child }
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    mountEditor();
});

describe('useNoteEditor', () => {
    // ---------- TEST PER IL CARICAMENTO DELLA NOTA ----------
    it('provides the state to the child component', () => {
        expect(state).toBeDefined();
    });

    it('throws error if used without provider', () => {
        expect(() => {
            mount(
                defineComponent({
                    setup() {
                        useNoteEditor();
                    },
                    template: '<div />',
                })
            );
        }).toThrow('useNoteEditor must be used within the NoteEditorPage.vue');
    });

    it('loadNote: loads the correct note if id is present', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);

        const { loadNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();

        expect(mockUseNotes.getNote).toHaveBeenCalledWith('1');
        expect(noteName.value).toBe('Note 1');
        expect(noteContent.value).toBe('Content 1');
        expect(isDirty.value).toBe(false);
    });

    it('loadNote: does not load the note if id is not present', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);

        const { loadNote } = provideNoteEditor();
        await loadNote();

        expect(mockUseNotes.getNote).not.toHaveBeenCalled();
    });

    it('loadNote: does not load the note if id is not present in the archive', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: 'non-existent-id' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(null);

        const { loadNote, noteName, noteContent } = provideNoteEditor();
        await loadNote();

        expect(noteName.value).toBe('');
        expect(noteContent.value).toBe('');
    });

    // ---------- TEST PER IL PRIMO SALVATAGGIO ----------

    it('saveTheNote (saveNew): calls storeNote correctly when id is not present', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);
        mockUseNotes.getNote.mockResolvedValue(null);
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteName.value = 'New Note';
        noteContent.value = 'New Content';
        await saveTheNote();

        expect(mockUseNotes.storeNote).toHaveBeenCalledWith(
            'New Note',
            'New Content'
        );
        expect(isDirty.value).toBe(false);
    });

    it('saveTheNote (saveNew): redirects after first save', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);
        mockUseNotes.getNote.mockResolvedValue(null);
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote();

        expect(mockRouter.replace).toHaveBeenCalledWith(
            `/notes/${mockNote.id}`
        );
    });

    it('saveTheNote (saveNew): does not redirect after first save when exit is true', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);
        mockUseNotes.getNote.mockResolvedValue(null);
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote(true);

        expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('saveTheNote (saveNew): does not redirect after first save when storeNote returns null', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);
        mockUseNotes.getNote.mockResolvedValue(null);
        mockUseNotes.storeNote.mockResolvedValue(null);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote();

        expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    // ---------- TEST PER IL SALVATAGGIO NOTA ESISTENTE ----------

    it('saveTheNote: calls saveNote when id is present', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteName.value = 'Updated Note';
        noteContent.value = 'Updated Content';
        await saveTheNote();

        expect(mockUseNotes.saveNote).toHaveBeenCalledWith(
            mockNote,
            'Updated Content',
            'Updated Note'
        );
        expect(isDirty.value).toBe(false);
    });

    it('saveTheNote: does not redirect after saving existing note', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteName.value = 'Updated Note';
        noteContent.value = 'Updated Content';
        await saveTheNote(true);

        expect(mockRouter.replace).not.toHaveBeenCalled();
        expect(isDirty.value).toBe(false);
    });

    it('saveTheNote: does not update note when saveNote returns null', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote.mockResolvedValue(null);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        const nameBefore = noteName.value;
        const contentBefore = noteContent.value;
        const isDirtyBefore = isDirty.value;
        await saveTheNote();

        expect(noteName.value).toBe(nameBefore);
        expect(noteContent.value).toBe(contentBefore);
        expect(isDirty.value).toBe(isDirtyBefore);
    });

    // ---------- TEST CASO NoteNotUpdatedError ----------

    it('saveTheNote: opens SavePromise when NoteNotUpdatedError is thrown', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote.mockRejectedValue(
            new NoteNotUpdatedError(mockNote)
        );
        mockUseModals.SavePromise.start.mockResolvedValue(null);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote();

        expect(mockUseModals.SavePromise.start).toHaveBeenCalled();
    });

    it('saveTheNote: does nothing when SavePromise returns null', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote.mockRejectedValue(
            new NoteNotUpdatedError(mockNote)
        );
        mockUseModals.SavePromise.start.mockResolvedValue(null);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote();

        expect(mockUseModals.SaveAsPromise.start).not.toHaveBeenCalled(); // saveAs
        expect(mockUseNotes.refreshNote).not.toHaveBeenCalled(); // update
        expect(mockUseNotes.saveNote).toHaveBeenCalledTimes(1); // overwrite
    });

    it('saveTheNote (overwrite): overwrites correctly when SavePromise returns "overwrite"', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.saveNote
            .mockRejectedValueOnce(new NoteNotUpdatedError(mockNote))
            .mockResolvedValueOnce(mockNote);
        mockUseModals.SavePromise.start.mockResolvedValue('overwrite');

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteName.value = 'Updated Note';
        noteContent.value = 'Updated Content';
        await saveTheNote();

        expect(mockUseNotes.saveNote).toHaveBeenCalledTimes(2);
        expect(mockUseNotes.saveNote).toHaveBeenCalledWith(
            mockNote,
            'Updated Content',
            'Updated Note',
            true
        );
        expect(isDirty.value).toBe(false);
    });

    it('saveTheNote (saveAs): saves as new note correctly when SavePromise returns "save as"', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.saveNote.mockRejectedValue(
            new NoteNotUpdatedError(mockNote)
        );
        mockUseModals.SavePromise.start.mockResolvedValue('save as');
        mockUseModals.SaveAsPromise.start.mockResolvedValue('New Note');
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteContent.value = 'Updated Content';
        await saveTheNote();

        expect(mockUseNotes.storeNote).toHaveBeenCalledWith(
            'New Note',
            'Updated Content'
        );
        expect(mockRouter.replace).toHaveBeenCalledWith(
            `/notes/${mockNote.id}`
        );
        expect(isDirty.value).toBe(false);
        expect(noteName.value).toBe('New Note');
    });

    it('saveTheNote (saveAs): does not redirect on "save as" when exit is true', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.saveNote.mockRejectedValue(
            new NoteNotUpdatedError(mockNote)
        );
        mockUseModals.SavePromise.start.mockResolvedValue('save as');
        mockUseModals.SaveAsPromise.start.mockResolvedValue('Nuova nota');
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote } = provideNoteEditor();
        await loadNote();
        await saveTheNote(true);

        expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('saveTheNote (update): updates note correctly when SavePromise returns "update"', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.saveNote.mockRejectedValue(
            new NoteNotUpdatedError(mockNote)
        );
        mockUseModals.SavePromise.start.mockResolvedValue('update');
        mockUseNotes.refreshNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNote, noteName, noteContent, isDirty } =
            provideNoteEditor();
        await loadNote();
        noteContent.value = 'Old Content';
        noteName.value = 'Old Name';
        await saveTheNote();

        expect(mockUseNotes.refreshNote).toHaveBeenCalledWith(mockNote.id);
        expect(noteName.value).toBe(mockNote.name);
        expect(noteContent.value).toBe(mockNote.content);
        expect(isDirty.value).toBe(false);
    });

    // ---------- TEST PER IL SALVATAGGIO CON NOME ----------

    it('saveTheNoteAs: shows error toast when note is new', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: {},
        } as any);

        const { loadNote, saveTheNoteAs } = provideNoteEditor();
        await loadNote();
        await saveTheNoteAs();

        expect(mockToast.errorToast).toHaveBeenCalledWith(
            'Errore',
            'The note is not yet in the archive'
        );
    });

    it('saveTheNoteAs: calls storeNote with correct parameters', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseModals.SaveAsPromise.start.mockResolvedValue('New Note');
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNoteAs, noteName, noteContent, isDirty } = provideNoteEditor();
        await loadNote();
        noteContent.value = 'Updated Content';
        await saveTheNoteAs();

        expect(mockUseNotes.storeNote).toHaveBeenCalledWith(
            'New Note',
            'Updated Content'
        );
        expect(mockRouter.replace).toHaveBeenCalledWith(
            `/notes/${mockNote.id}`
        );
        expect(isDirty.value).toBe(false);
        expect(noteName.value).toBe('New Note');
    });

    it('saveTheNoteAs: does not redirect on "save as" when exit is true', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseModals.SaveAsPromise.start.mockResolvedValue('New Note');
        mockUseNotes.storeNote.mockResolvedValue(mockNote);

        const { loadNote, saveTheNoteAs } = provideNoteEditor();
        await loadNote();
        await saveTheNoteAs(true);

        expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    // ---------- TEST SET EDITOR CONTENT ----------

    it('setEditorContent: updates noteContent', () => {
        const { setEditorContent, noteContent } = provideNoteEditor();
        setEditorContent('New Content');
        expect(noteContent.value).toBe('New Content');
    });

    // ---------- TEST PER L'ESPORTAZIONE DELLA NOTA ----------

    it('exportTheNote: calls exportNoteFromRaw with the correct format', async () => {
        mockUseNotes.exportNoteFromRaw.mockResolvedValue(undefined);

        const { exportTheNote } = provideNoteEditor();
        await exportTheNote('pdf');

        expect(mockUseNotes.exportNoteFromRaw).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            'pdf'
        );
    });

    it('exportTheNote: uses fallback name when noteName is empty', async () => {
        mockUseNotes.exportNoteFromRaw.mockResolvedValue(undefined);

        const { exportTheNote } = provideNoteEditor();
        await exportTheNote('md');

        expect(mockUseNotes.exportNoteFromRaw).toHaveBeenCalledWith(
            'Nota senza nome',
            expect.any(String),
            'md'
        );
    });

    it('exportTheNote: uses noteName when it is set', async () => {
        vi.mocked(useRoute).mockReturnValue({
            params: { id: '1' },
        } as any);
        mockUseNotes.getNote.mockResolvedValue(mockNote);
        mockUseNotes.exportNoteFromRaw.mockResolvedValue(undefined);

        const { loadNote, exportTheNote } = provideNoteEditor();
        await loadNote();
        await exportTheNote('html');

        expect(mockUseNotes.exportNoteFromRaw).toHaveBeenCalledWith(
            mockNote.name,
            expect.any(String),
            'html'
        );
    });

    // ---------- TEST ISDIRTY ----------

    it('considers note not dirty when content differs only by &nbsp;', async () => {
        // Carica una nota con contenuto normale
        mockUseNotes.getNote.mockResolvedValue({
            ...mockNote,
            content: 'hello world',
        });

        const { loadNote, setEditorContent, isDirty } = provideNoteEditor();
        await loadNote();

        setEditorContent('hello&nbsp;world');
        await nextTick();

        expect(isDirty.value).toBe(false);
    });

    it('considers note not dirty when content differs only by data-v- attributes', async () => {
        mockUseNotes.getNote.mockResolvedValue({
            ...mockNote,
            content: '<p>text</p>',
        });

        const { loadNote, setEditorContent, isDirty } = provideNoteEditor();
        await loadNote();

        setEditorContent('<p data-v-abc123="">text</p>');
        await nextTick();

        expect(isDirty.value).toBe(false);
    });

    it('considers note not dirty when content has ai markers stripped', async () => {
        mockUseNotes.getNote.mockResolvedValue({
            ...mockNote,
            content: 'original text',
        });

        const { loadNote, setEditorContent, isDirty } = provideNoteEditor();
        await loadNote();

        setEditorContent('<div data-ai-parent="1">original text</div>');
        await nextTick();

        expect(isDirty.value).toBe(false);
    });

    it('considers note dirty when content is actually different', async () => {
        mockUseNotes.getNote.mockResolvedValue({
            ...mockNote,
            content: 'original text',
        });

        const { loadNote, setEditorContent, isDirty } = provideNoteEditor();
        await loadNote();

        setEditorContent('modified text');
        await nextTick();

        expect(isDirty.value).toBe(true);
    });
});
