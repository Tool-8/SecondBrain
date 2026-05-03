import apiClient from '@/services/apiClient';
import type { Note, NoteWithContent, NoteAPI } from '@/types/note';
import { serviceHandler } from '@/utils/serviceHandler';
import { title } from 'node:process';

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
        second: '2-digit',
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

function mapNoteWithContent(raw: NoteAPI): NoteWithContent {
    return {
        ...mapNote(raw),
        content: raw.content_md,
    };
}

export const noteService = {
    getAll: async (): Promise<Note[]> => {
        const response = await apiClient.get('/notes');
        return response.data.map(mapNote);
    },
    get: async (id: string): Promise<NoteWithContent> => {
        return serviceHandler(() =>
            apiClient.get('/notes/' + id).then(response => mapNoteWithContent(response.data))
        );
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
    },
    store: async (name: string, content: string): Promise<Note> => {
        return serviceHandler(() =>
            apiClient.post('/notes', {
                title: name,
                content_md: content,
            }).then(response => mapNote(response.data))
        );
    },
    update: async (id: string, title: string, content: string): Promise<NoteWithContent> => {
        return serviceHandler(() =>
            apiClient.put('/notes/' + id, {
                title: title,
                content_md: content,
            }).then(response => mapNoteWithContent(response.data))
        );
    },
    export: async (id: string, format: 'pdf' | 'md' | 'html'): Promise<void> => {
        return serviceHandler(() =>
            apiClient.get('/notes/export/' + id, {
                params: {
                    format,
                },
                responseType: 'blob',
            }).then(response => {
                const disposition = response.headers['content-disposition'];
                const filename =
                    disposition?.split('filename=')[1]?.replace(/"/g, '') ??
                    `nota.${format}`;
                const url = URL.createObjectURL(response.data);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                link.click();
                URL.revokeObjectURL(url);
            })
        )
    },
    import: async (file: FormData): Promise<Note> => {
        return serviceHandler(() =>
            apiClient.post('/notes/import', file, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })).then(response => mapNote(response.data));
    }
};
