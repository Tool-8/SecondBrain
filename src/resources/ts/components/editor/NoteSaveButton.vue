<script setup lang="ts">
import GeneralButton from '@/components/GeneralButton.vue';
import { useNoteState } from '@/composables/useNoteState';
import { useRoute } from 'vue-router';
import { useNotes } from '@/composables/useNotes';
import { useToast } from '@/composables/useToast';
import { useModals } from '@/composables/useModals';
import router from '@/router';
import { Note, NoteWithContent } from '@/types/note';
import { NoteNotUpdatedError } from '@/errors/noteErrors';

const { successToast, errorToast } = useToast();
const { storeNote, saveNote, getNote } = useNotes();
const { RenamePromise, SavePromise } = useModals();
const {
    note,
    noteContent,
    originalContent,
    noteName,
    originalName,
    editorRef,
} = useNoteState();
const route = useRoute();

const saveNew = async () => {
    await storeNote(noteName.value, noteContent.value)
        .then(async (newNote: Note) => {
            note.value = newNote;
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
        .then(() => {
            successToast('Nota salvata con successo', '');
        })
        .catch((error) => {
            errorToast('Errore', (error as Error).message);
        });
};

const update = async () => {
    await getNote(route.params.id as string)
        .then((updatedNote: NoteWithContent) => {
            note.value = updatedNote;
            noteContent.value = updatedNote.content;
            if (note.value) {
                (editorRef.value as HTMLElement).innerText =
                    updatedNote.content;
            }
            successToast('Nota aggiornata', '');
        })
        .catch((error) => {
            errorToast('Errore', (error as Error).message);
        });
};

async function saveNoteButton() {
    // Primo salvataggio nota
    if (!route.params.id) {
        await saveNew();
    }

    // Salvataggio nota esistente
    else {
        try {
            (note.value as Note).name = noteName.value;
            await saveNote(note.value as Note, noteContent.value).then(
                (updatedNote: Note) => {
                    note.value = updatedNote;
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
                        await update();
                        break;
                    }
                }
            } else {
                errorToast('Errore', (error as Error).message);
            }
        }
    }

    // Aggiorna i valori originali
    originalContent.value = noteContent.value;
    originalName.value = noteName.value;
}
</script>

<template>
    <div class="self-start">
        <GeneralButton label="Salva" @click="saveNoteButton" />
    </div>
</template>
