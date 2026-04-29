import { noteService } from "@/services/noteService";
import type { Note, NoteWithContent } from "@/types/note";
import { ref } from 'vue';

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
            error.value = "Errore nel recupero dei note."
        } finally {
            loading.value = false;
        }
    }

    const getNote = async (id: string): Promise<NoteWithContent> => {
        return await noteService.get(id);
    }

    const saveNote = async (id: string, name: string, content: string): Promise<NoteWithContent> => {
        return await noteService.update(id, name, content);
    }

    const renameNote = async (id: string, newName: string) => {
        await noteService.rename(id, newName);
    }

    const removeNote = async (id: string) => {
        await noteService.remove(id);
    }

    const storeNote = async (name: string, content: string) => {
        await noteService.store(name, content);
    }

    const cloneNote = async (id: string, name: string) => {
        const cloned_note = await noteService.get(id);
        await storeNote(name, cloned_note.content);
    }

    const exportNote = async (id: string, format: 'pdf' | 'md' | 'html') => {
        await noteService.export(id, format);
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
    }
}
