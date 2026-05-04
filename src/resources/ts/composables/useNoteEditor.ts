import { computed, inject, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from '@/composables/useToast';
import useNotes from '@/composables/useNotes';
import { useModals } from '@/composables/useModals';
import { Note, NoteWithContent } from '@/types/note';
import router from '@/router';
import { NoteNotUpdatedError } from '@/errors/noteErrors';

function normalizeEditorHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;

    div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach((el) => {
        el.replaceWith(document.createTextNode(el.textContent || ''));
    });

    return div.innerText;
}

function useNoteEditorState() {
    const { errorToast, warningToast, successToast } = useToast();
    const { getNote, saveNote, storeNote } = useNotes();
    const route = useRoute();

    const noteContent = ref('');
    const noteName = ref('');

    const originalNote = ref<NoteWithContent | null>(null);

    const isDirty = ref(false);

    const isNew = computed(() => !route.params.id);

    const { RenamePromise, SavePromise } = useModals();

    watch([noteContent, noteName], ([newContent, newName]) => {
        if (!originalNote.value) isDirty.value = true;
        else {
            isDirty.value =
            normalizeEditorHtml(newContent) !==
            normalizeEditorHtml(originalNote.value?.content) ||
            newName !== originalNote.value?.name
        }
    });

    function setEditorContent(html: string) {
        noteContent.value = html;
    }

    function updateNote() {
        // @ts-ignore
        originalNote.value.content = noteContent.value;
        // @ts-ignore
        originalNote.value.name = noteName.value;
        isDirty.value = false;
    }

    const saveNew = async () => {
        const newNote = await storeNote(noteName.value, noteContent.value);
        if (!newNote) return;
        (originalNote.value as Note) = newNote;
        updateNote();
        await router.replace(`/notes/${newNote.id}`);
    };

    const overwrite = async () => {
        if (!originalNote.value) return;
        const updatedNote = await saveNote(originalNote.value, noteContent.value, noteName.value, true);
        if (!updatedNote) return;
        (originalNote.value as Note) = updatedNote;
        updateNote();
    };

    const saveAs = async () => {
        const newName = await RenamePromise.start(noteName.value);
        if (!newName) return;
        const newNote = await storeNote(newName, noteContent.value);
        if (!newNote) return;
        (originalNote.value as Note) = newNote;
        updateNote();
        await router.replace(`/notes/${newNote.id}`);
    };

    const update = async (id: string) => {
        const updatedNote = await getNote(id);
        if (!updatedNote) return;
        (originalNote.value as Note) = updatedNote;
        noteContent.value = updatedNote.content;
        noteName.value = updatedNote.name;
        updateNote();
    };

    async function saveTheNoteAs() {
        const id = route.params.id as string | undefined;

        // Errore: la nota non è ancora presente nell'archivio
        if (!id) {
            errorToast('Errore', 'The note is not yet in the archive');
            return;
        }

        await saveAs();
    }

    async function saveTheNote() {
        const id = route.params.id as string | undefined;

        // Primo salvataggio nota
        if (!originalNote.value || !id) {
            await saveNew();
            return;
        }

        // Salvataggio nota esistente
        try {
            console.log(noteName.value);
            const updatedNote = await saveNote(originalNote.value, noteContent.value, noteName.value);
            if (!updatedNote) return;
            (originalNote.value as Note) = updatedNote;
            updateNote();
        } catch (error) {
            if (error instanceof NoteNotUpdatedError) {
                // Caso d'uso nota non aggiornata al salvataggio
                const response = await SavePromise.start();
                if (!response) return;

                switch (response) {
                    case 'overwrite': {
                        await overwrite();
                        break;
                    }
                    case 'save as': {
                        await saveAs();
                        break;
                    }
                    case 'update': {
                        await update(id);
                        break;
                    }
                }
            }
        }
    }

    async function loadNote() {
        const id = route.params.id as string | undefined;

        if (!id) return;

        const noteArch = await getNote(id);
        if (!noteArch) return;

        originalNote.value = noteArch;

        noteName.value = noteArch.name;
        noteContent.value = noteArch.content;

        isDirty.value = false;
    }

    return {
        noteContent,
        noteName,
        isDirty,
        saveTheNote,
        saveTheNoteAs,
        isNew,
        loadNote,
        setEditorContent,
    };
}

const NOTE_EDITOR_KEY = Symbol('noteEditor');

export function provideNoteEditor() {
    const state = useNoteEditorState();
    provide(NOTE_EDITOR_KEY, state);
    return state;
}

export function useNoteEditor() {
    const state =
        inject<ReturnType<typeof useNoteEditorState>>(NOTE_EDITOR_KEY);
    if (!state)
        throw new Error(
            'useNoteEditor must be used within the NoteEditorPage.vue'
        );
    return state;
}
