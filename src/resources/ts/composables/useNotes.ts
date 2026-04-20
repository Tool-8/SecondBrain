import { noteService } from "@/services/noteService";
import type { Note } from "@/types/note";
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

    return {
        notes,
        loading,
        error,
        fetchNotes,
    }
}
