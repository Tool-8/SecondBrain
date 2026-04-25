import apiClient from '@/services/apiClient';
import type { Note, NoteAPI } from '@/types/note';
import { serviceHandler } from '@/utils/serviceHandler';

function formatDate(timestamp: string): string {
    const date = new Date(timestamp);

    const day = date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const time = date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${day} - ${time}`;
}

function mapNote(raw: NoteAPI): Note {
    return {
        id: raw.id,
        name: raw.title,
        last_edit: formatDate(raw.updated_at),
        creation: formatDate(raw.created_at),
    };
}

export const noteService = {
    getAll: async (): Promise<Note[]> => {
        const response = await apiClient.get('/notes');
        return response.data.map(mapNote);
    },
    rename: async (id: string, newName: string): Promise<Note> => {
        return serviceHandler(() =>
            apiClient.put('/notes/' + id, {
                title: newName,
            }).then(response => mapNote(response.data))
        );
    },
    remove: async (id: string): Promise<void> => {
        return serviceHandler(() =>
            apiClient.delete('/notes/' + id));
    }
};
