import { computed, inject, provide, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useNotes } from '@/composables/useNotes';
import { useModals } from '@/composables/useModals';
import { Note, NoteWithContent } from '@/types/note';
import router from '@/router';
import { NoteNotUpdatedError } from '@/errors/noteErrors';
import { useNoteEditorUI } from '@/composables/useNoteEditorUI';

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

    const originalContent = ref('');
    const originalName = ref('');

    const note = ref<Note | null>(null);

    const isDirty = ref(false);

    const isNew = computed(() => !route.params.id);

    const { RenamePromise, SavePromise } = useModals();

    watch([noteContent, noteName], ([newContent, newName]) => {
        isDirty.value =
            normalizeEditorHtml(newContent) !==
                normalizeEditorHtml(originalContent.value) ||
            newName !== originalName.value;
    });

    function setEditorContent(html: string) {
        noteContent.value = html;
    }

    function updateNote() {
        originalContent.value = noteContent.value;
        originalName.value = noteName.value;
        isDirty.value = false;
    }

    const saveNew = async () => {
        await storeNote(noteName.value, noteContent.value)
            .then(async (newNote: Note) => {
                note.value = newNote;
                updateNote();
                await router.replace(`/notes/${newNote.id}`);
                successToast('Nota salvata', '');
            })
            .catch((error) => {
                errorToast('Errore', (error as Error).message);
            });
    };

    const overwrite = async () => {
        await saveNote(note.value as Note, noteContent.value, true)
            .then((updatedNote: Note) => {
                note.value = updatedNote;
                updateNote();
                successToast('Nota sovrascritta', '');
            })
            .catch((error) => {
                errorToast('Errore', (error as Error).message);
            });
    };

    const saveAs = async () => {
        const newName = await RenamePromise.start((note.value as Note).name);
        if (!newName) return;
        await storeNote(newName, noteContent.value)
            .then(async (newNote: Note) => {
                updateNote();
                await router.replace(`/notes/${newNote.id}`);
                successToast('Nota salvata con successo', '');
            })
            .catch((error) => {
                errorToast('Errore', (error as Error).message);
            });
    };

    const update = async (id: string) => {
        await getNote(id)
            .then((updatedNote: NoteWithContent) => {
                note.value = updatedNote;
                noteContent.value = updatedNote.content;
                updateNote();
                successToast('Nota aggiornata', '');
            })
            .catch((error) => {
                errorToast('Errore', (error as Error).message);
            });
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
        if (!id) {
            await saveNew();
        }

        // Salvataggio nota esistente
        else {
            try {
                (note.value as Note).name = noteName.value;
                await saveNote(note.value as Note, noteContent.value).then(
                    (updatedNote: Note) => {
                        note.value = updatedNote;
                        updateNote();
                        successToast('Nota salvata', '');
                    }
                );
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
                } else {
                    errorToast('Errore', (error as Error).message);
                }
            }
        }
    }

    async function loadNote() {
        const id = route.params.id as string | undefined;

        if (!id) return;

        try {
            const noteArch = await getNote(id);

            note.value = noteArch as Note;

            noteName.value = noteArch.name;
            noteContent.value = noteArch.content;

            originalContent.value = noteArch.content;
            originalName.value = noteArch.name;

            isDirty.value = false;
        } catch (error) {
            errorToast('Errore', (error as Error).message);
        }
    }

    return {
        note,
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
