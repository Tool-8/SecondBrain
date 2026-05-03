import { noteService } from "@/services/noteService";
import type { Note, NoteWithContent } from "@/types/note";
import { ref } from 'vue';
import { NoteNotUpdatedError } from "@/errors/noteErrors";

export function useNotes() {
    const notes = ref<Note[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

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

    const getNote = async (id: string): Promise<NoteWithContent> => {
        return await noteService.get(id);
    }

    const saveNote = async (
        note: Note,
        content: string,
        overwrite: boolean = false
    ) => {
        console.log(note.last_edit);
        const backendNote = await getNote(note.id);
        console.log(backendNote.last_edit);
        if (backendNote.last_edit !== note.last_edit && !overwrite) {
            throw new NoteNotUpdatedError(note);
        }

        return await noteService.update(note.id, note.name, content);
    };

    const renameNote = async (id: string, newName: string) => {
        await noteService.rename(id, newName);
    }

    const removeNote = async (id: string) => {
        await noteService.remove(id);
    }

    const storeNote = async (name: string, content: string): Promise<Note> => {
        return await noteService.store(name, content);
    }

    const cloneNote = async (id: string, name: string) => {
        const cloned_note = await noteService.get(id);
        await storeNote(name, cloned_note.content);
    }

    const exportNote = async (id: string, format: 'pdf' | 'md' | 'html') => {
        await noteService.export(id, format);
    }

    const importNote = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        await noteService.import(formData);
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
        saveNote,
        importNote,
    }
}
