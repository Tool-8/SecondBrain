import { ref, computed, provide, inject, Ref, ComputedRef } from 'vue';
import type { Note } from '@/types/note';

interface NoteState {
    note: Ref<Note | null>
    noteContent: Ref<string>
    originalContent: Ref<string>
    noteName: Ref<string>
    originalName: Ref<string>
    isDirty: ComputedRef<boolean>
    editorRef: Ref<HTMLElement | null>
}

const NOTE_STATE_KEY = Symbol('noteState');

export function createNoteState(): NoteState {
    const note = ref<Note | null>(null);
    const noteContent = ref('');
    const originalContent = ref('');
    const noteName = ref('');
    const originalName = ref('');
    const isDirty = computed(() => noteContent.value !== originalContent.value || noteName.value !== originalName.value);
    const editorRef = ref<HTMLElement | null>(null);

    const state: NoteState = { note, noteContent, originalContent, noteName, originalName, isDirty, editorRef }

    provide(NOTE_STATE_KEY, state);
    return state;
}

export function useNoteState(): NoteState {
    const state = inject<NoteState>(NOTE_STATE_KEY);
    if (!state) {
        throw new Error('useNoteState must be used within the page');
    }
    return state;
}
