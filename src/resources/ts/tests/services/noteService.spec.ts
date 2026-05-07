import { describe, it, expect, vi, beforeEach } from 'vitest';
import { noteService } from '@/services/noteService';

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
    mockGet:    vi.fn(),
    mockPost:   vi.fn(),
    mockPut:    vi.fn(),
    mockDelete: vi.fn(),
}));

vi.mock('@/services/apiClient', () => ({
    default: {
        get:    mockGet,
        post:   mockPost,
        put:    mockPut,
        delete: mockDelete,
    },
}));

vi.mock('@/utils/serviceHandler', () => ({
    serviceHandler: vi.fn((fn) => fn()),
}));

const rawNote = {
    id:         '1',
    title:      'Titolo nota',
    updated_at: '2024-01-15T10:30:00.000Z',
    created_at: '2024-01-10T08:00:00.000Z',
    content_md: '# Contenuto',
};

const mappedNote = {
    id:        '1',
    name:      'Titolo nota',
    last_edit: expect.any(String),
    creation:  expect.any(String),
};

const mappedNoteWithContent = {
    ...mappedNote,
    content: '# Contenuto',
};

describe('noteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('calls GET /notes and returns the mapped notes', async () => {
            mockGet.mockResolvedValue({ data: [rawNote] });

            const result = await noteService.getAll();

            expect(mockGet).toHaveBeenCalledWith('/notes');
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject(mappedNote);
        });

        it('returns an empty array if there are no notes', async () => {
            mockGet.mockResolvedValue({ data: [] });

            const result = await noteService.getAll();

            expect(result).toEqual([]);
        });

        it('propagates the error if the call fails', async () => {
            mockGet.mockRejectedValue(new Error('Network error'));

            await expect(noteService.getAll()).rejects.toThrow('Network error');
        });
    });
    
    describe('get', () => {
        it('calls GET /notes/:id and returns the note with content', async () => {
            mockGet.mockResolvedValue({ data: rawNote });

            const result = await noteService.get('1');

            expect(mockGet).toHaveBeenCalledWith('/notes/1');
            expect(result).toMatchObject(mappedNoteWithContent);
        });

        it('propagates the error if the call fails', async () => {
            mockGet.mockRejectedValue(new Error('Not found'));

            await expect(noteService.get('1')).rejects.toThrow('Not found');
        });
    });

    describe('rename', () => {
        it('calls PUT /notes/:id with the new name and returns the mapped note', async () => {
            mockPut.mockResolvedValue({ data: { ...rawNote, title: 'Nuovo titolo' } });

            const result = await noteService.rename('1', 'Nuovo titolo');

            expect(mockPut).toHaveBeenCalledWith('/notes/1', { title: 'Nuovo titolo' });
            expect(result.name).toBe('Nuovo titolo');
        });

        it('propagates the error if the call fails', async () => {
            mockPut.mockRejectedValue(new Error('Errore'));

            await expect(noteService.rename('1', 'Nuovo titolo')).rejects.toThrow('Errore');
        });
    });

    describe('remove', () => {
        it('calls DELETE /notes/:id', async () => {
            mockDelete.mockResolvedValue({});

            await noteService.remove('1');

            expect(mockDelete).toHaveBeenCalledWith('/notes/1');
        });

        it('propagates the error if the call fails', async () => {
            mockDelete.mockRejectedValue(new Error('Errore'));

            await expect(noteService.remove('1')).rejects.toThrow('Errore');
        });
    });

    describe('store', () => {
        it('calls POST /notes with name and content and returns the mapped note', async () => {
            mockPost.mockResolvedValue({ data: rawNote });

            const result = await noteService.store('Titolo nota', '# Contenuto');

            expect(mockPost).toHaveBeenCalledWith('/notes', {
                title:      'Titolo nota',
                content_md: '# Contenuto',
            });
            expect(result).toMatchObject(mappedNote);
        });

        it('propagates the error if the call fails', async () => {
            mockPost.mockRejectedValue(new Error('Errore'));

            await expect(noteService.store('Titolo', 'Contenuto')).rejects.toThrow('Errore');
        });
    });

    describe('update', () => {
        it('calls PUT /notes/:id with title and content and returns the map with content', async () => {
            mockPut.mockResolvedValue({ data: rawNote });

            const result = await noteService.update('1', 'Titolo nota', '# Contenuto');

            expect(mockPut).toHaveBeenCalledWith('/notes/1', {
                title:      'Titolo nota',
                content_md: '# Contenuto',
            });
            expect(result).toMatchObject(mappedNoteWithContent);
        });

        it('propagates the error if the call fails', async () => {
            mockPut.mockRejectedValue(new Error('Errore'));

            await expect(noteService.update('1', 'Titolo', 'Contenuto')).rejects.toThrow('Errore');
        });
    });
    
    describe('export', () => {
        beforeEach(() => {
            // Mocka le API del browser usate da noteBlobHandler
            global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
            global.URL.revokeObjectURL = vi.fn();

            const mockLink = {
                href:         '',
                setAttribute: vi.fn(),
                click:        vi.fn(),
            };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        });

        it('calls GET /notes/export/:id with the correct format', async () => {
            mockGet.mockResolvedValue({
                data:    new Blob(),
                headers: { 'content-disposition': 'attachment; filename="nota.pdf"' },
            });

            await noteService.export('1', 'pdf');

            expect(mockGet).toHaveBeenCalledWith('/notes/export/1', {
                params:       { format: 'pdf' },
                responseType: 'blob',
            });
        });

        it('uses the filename from the content-disposition header', async () => {
            const mockLink = { href: '', setAttribute: vi.fn(), click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

            mockGet.mockResolvedValue({
                data:    new Blob(),
                headers: { 'content-disposition': 'attachment; filename="mia-nota.pdf"' },
            });

            await noteService.export('1', 'pdf');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'mia-nota.pdf');
        });

        it('uses the fallback filename if content-disposition is missing', async () => {
            const mockLink = { href: '', setAttribute: vi.fn(), click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

            mockGet.mockResolvedValue({
                data:    new Blob(),
                headers: {},
            });

            await noteService.export('1', 'md');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'nota.md');
        });
    });

    describe('exportRaw', () => {
        beforeEach(() => {
            global.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
            global.URL.revokeObjectURL = vi.fn();

            const mockLink = { href: '', setAttribute: vi.fn(), click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        });

        it('calls POST /notes/export with name, content and format', async () => {
            mockPost.mockResolvedValue({
                data:    new Blob(),
                headers: { 'content-disposition': 'attachment; filename="nota.html"' },
            });

            await noteService.exportRaw('Titolo', '# Contenuto', 'html');

            expect(mockPost).toHaveBeenCalledWith('/notes/export', {
                title:   'Titolo',
                content: '# Contenuto',
                format:  'html',
            }, { responseType: 'blob' });
        });
    });

    describe('import', () => {
        it('calss POST /notes/import with FormData and returns the mapped note', async () => {
            mockPost.mockResolvedValue({ data: rawNote });

            const formData = new FormData();
            const result = await noteService.import(formData);

            expect(mockPost).toHaveBeenCalledWith('/notes/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toMatchObject(mappedNote);
        });

        it('propagates the error if the call fails', async () => {
            mockPost.mockRejectedValue(new Error('Errore import'));

            await expect(noteService.import(new FormData())).rejects.toThrow('Errore import');
        });
    });
});
