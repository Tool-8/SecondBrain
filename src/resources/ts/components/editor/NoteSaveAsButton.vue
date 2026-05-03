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
import { computed } from 'vue';

const { successToast, errorToast } = useToast();
const { storeNote } = useNotes();
const { RenamePromise } = useModals();
const {
    note,
    noteContent,
    originalContent,
    noteName,
    originalName,
    editorRef,
} = useNoteState();
const route = useRoute();

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

async function saveAsNoteButton() {
    // Errore: la nota non è ancora presente nell'archivio
    if (!route.params.id) {
        errorToast('Errore', 'The note is not yet in the archive');
        return;
    }

    await saveAs();

    // Aggiorna i valori originali
    originalContent.value = noteContent.value;
    originalName.value = noteName.value;
}

const isNew = computed(() => !route.params.id);
</script>

<template>
    <div class="self-start">
        <GeneralButton
            label="Salva con nome"
            class="disabled:opacity-50 disabled:pointer-events-none"
            :disabled="isNew"
            @click="saveAsNoteButton"
        />
    </div>
</template>
