import apiClient from '@/services/apiClient';
import type { Note } from '@/types/note';

interface NoteAPI {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

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
        name: raw.title,
        last_edit: formatDate(raw.updated_at),
        creation: formatDate(raw.created_at),
    };
}

export const noteService = {
    getAll: async (): Promise<Note[]> => {
        const response = await apiClient.get<NoteAPI[]>('/notes');
        return response.data.map(mapNote);
    },
}
