import { mount, VueWrapper } from '@vue/test-utils';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import useNotes from '@/composables/useNotes';
import { noteService } from '@/services/noteService';
import type { Note, NoteWithContent } from '@/types/note';

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
    vi.mocked(noteService.rename).mockResolvedValue(mockNote as Note);
});

describe('useNotes', () => {

    // TEST PER LA RINOMINA
    it('shows info toast when renaming a note with the same name', async () => {
        const { renameNote } = useNotes();
        await renameNote(mockNote as Note, mockNote.name);
        expect(mockToast.infoToast).toHaveBeenCalledWith(
            'Il nome non ha subito modifiche',
            ''
        );
    });


});
