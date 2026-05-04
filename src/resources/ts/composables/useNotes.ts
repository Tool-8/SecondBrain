import { noteService } from "@/services/noteService";
import type { Note, NoteWithContent } from "@/types/note";
import { ref } from 'vue';
import { NoteNotUpdatedError } from "@/errors/noteErrors";
import { useToast } from "@/composables/useToast";

function useNotes() {
    const notes = ref<Note[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { errorToast, infoToast, successToast } = useToast()

    const fetchNotes = async () => {
        loading.value = true;
        error.value = null;
        try {
            notes.value = await noteService.getAll();
        } catch (e) {
            error.value = "Errore nel recupero delle note."
        } finally {
            loading.value = false;
        }
    }

    const getNote = async (id: string): Promise<NoteWithContent | null> => {
        try {
            return await noteService.get(id);
        } catch (e) {
            errorToast(
                'Errore durante il recupero della nota',
                (e as Error).message
            );
            return null;
        }
    }

    const updateNote = async (id: string): Promise<NoteWithContent | null> => {
        try {
            const note = noteService.get(id);
            successToast("Nota aggiornata con successo", "");
            return note;
        } catch (e) {
            errorToast(
                'Errore durante l\'aggiornamento della nota',
                (e as Error).message
            );
            return null;
        }
    }

    const saveNote = async (
        note: NoteWithContent,
        content: string,
        name: string,
        overwrite: boolean = false
    ) => {
        if (note.content === content && note.name === name) {
            infoToast('La nota non ha subito modifiche', '');
            return;
        }
        try {
            const backendNote = await noteService.get(note.id);
            if (!backendNote) {
                return null;
            }
            if (backendNote.last_edit !== note.last_edit && !overwrite) {
                throw new NoteNotUpdatedError(note);
            }
            const savedNote = await noteService.update(
                note.id,
                name,
                content
            );
            if (overwrite) {
                successToast('Nota sovrascritta con successo', '');
            } else {
                successToast('Nota salvata con successo', '');
            }
            return savedNote;
        } catch (e) {
            if (e instanceof NoteNotUpdatedError) throw e;
            errorToast(
                "Errore durante l'aggiornamento della nota",
                (e as Error).message
            );
            return null;
        }
    };

    const renameNote = async (note: Note, newName: string) => {
        if (newName === note.name) {
            infoToast('Il nome non ha subito modifiche', '');
            return;
        }
        try {
            await noteService.rename(note.id, newName);
            successToast("Nota rinominata con successo", "");
        } catch (e) {
            errorToast("Errore durante la rinominazione della nota", (e as Error).message);
        }
    }

    const removeNote = async (id: string) => {
        try {
            await noteService.remove(id);
            successToast("Nota eliminata con successo", "");
        } catch (e) {
            errorToast("Errore durante la cancellazione della nota", (e as Error).message);
        }
    }

    const storeNote = async (name: string, content: string): Promise<Note | null> => {
        try {
            const note = await noteService.store(name, content);
            successToast("Nota salvata con successo", "");
            return note;
        } catch (e) {
            errorToast("Errore durante la creazione della nota", (e as Error).message);
            return null;
        }
    }

    const cloneNote = async (id: string, name: string) => {
        try {
            const cloned_note = await noteService.get(id);
            if (!cloned_note) { return null; }
            await noteService.store(name, cloned_note.content);
            successToast("Nota clonata con successo", "");
        } catch (e) {
            errorToast("Errore durante la clonazione della nota", (e as Error).message);
        }
    }

    const exportNote = async (id: string, format: 'pdf' | 'md' | 'html') => {
        if (format !== 'pdf' && format !== 'md' && format !== 'html') {
            errorToast('Formato non supportato', '');
            return;
        }

        try {
            await noteService.export(id, format);
            successToast("Nota esportata con successo", "");
        } catch (e) {
            errorToast("Errore durante l'esportazione della nota", (e as Error).message);
        }

    }

    const importNote = async (file: File) => {
        if (file.type !== 'text/markdown') {
            errorToast('Formato non supportato', '');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            await noteService.import(formData);
            successToast("Nota importata con successo", "");
        } catch (e) {
            errorToast("Errore durante l'importazione della nota", (e as Error).message);
        }

    }

    return {
        notes,
        loading,
        error,
        fetchNotes,
        renameNote,
        removeNote,
        storeNote,
        cloneNote,
        exportNote,
        getNote,
        updateNote,
        saveNote,
        importNote,
    }
}

export default useNotes
