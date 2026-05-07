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
        it('chiama GET /notes e restituisce le note mappate', async () => {
            mockGet.mockResolvedValue({ data: [rawNote] });

            const result = await noteService.getAll();

            expect(mockGet).toHaveBeenCalledWith('/notes');
            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject(mappedNote);
        });

        it('restituisce un array vuoto se non ci sono note', async () => {
            mockGet.mockResolvedValue({ data: [] });

            const result = await noteService.getAll();

            expect(result).toEqual([]);
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockGet.mockRejectedValue(new Error('Network error'));

            await expect(noteService.getAll()).rejects.toThrow('Network error');
        });
    });
    
    describe('get', () => {
        it('chiama GET /notes/:id e restituisce la nota con contenuto', async () => {
            mockGet.mockResolvedValue({ data: rawNote });

            const result = await noteService.get('1');

            expect(mockGet).toHaveBeenCalledWith('/notes/1');
            expect(result).toMatchObject(mappedNoteWithContent);
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockGet.mockRejectedValue(new Error('Not found'));

            await expect(noteService.get('1')).rejects.toThrow('Not found');
        });
    });

    describe('rename', () => {
        it('chiama PUT /notes/:id con il nuovo nome e restituisce la nota mappata', async () => {
            mockPut.mockResolvedValue({ data: { ...rawNote, title: 'Nuovo titolo' } });

            const result = await noteService.rename('1', 'Nuovo titolo');

            expect(mockPut).toHaveBeenCalledWith('/notes/1', { title: 'Nuovo titolo' });
            expect(result.name).toBe('Nuovo titolo');
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockPut.mockRejectedValue(new Error('Errore'));

            await expect(noteService.rename('1', 'Nuovo titolo')).rejects.toThrow('Errore');
        });
    });

    describe('remove', () => {
        it('chiama DELETE /notes/:id', async () => {
            mockDelete.mockResolvedValue({});

            await noteService.remove('1');

            expect(mockDelete).toHaveBeenCalledWith('/notes/1');
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockDelete.mockRejectedValue(new Error('Errore'));

            await expect(noteService.remove('1')).rejects.toThrow('Errore');
        });
    });

    describe('store', () => {
        it('chiama POST /notes con nome e contenuto e restituisce la nota mappata', async () => {
            mockPost.mockResolvedValue({ data: rawNote });

            const result = await noteService.store('Titolo nota', '# Contenuto');

            expect(mockPost).toHaveBeenCalledWith('/notes', {
                title:      'Titolo nota',
                content_md: '# Contenuto',
            });
            expect(result).toMatchObject(mappedNote);
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockPost.mockRejectedValue(new Error('Errore'));

            await expect(noteService.store('Titolo', 'Contenuto')).rejects.toThrow('Errore');
        });
    });

    describe('update', () => {
        it('chiama PUT /notes/:id con titolo e contenuto e restituisce la nota con contenuto', async () => {
            mockPut.mockResolvedValue({ data: rawNote });

            const result = await noteService.update('1', 'Titolo nota', '# Contenuto');

            expect(mockPut).toHaveBeenCalledWith('/notes/1', {
                title:      'Titolo nota',
                content_md: '# Contenuto',
            });
            expect(result).toMatchObject(mappedNoteWithContent);
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
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

        it('chiama GET /notes/export/:id con il formato corretto', async () => {
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

        it('usa il filename dall\'header content-disposition', async () => {
            const mockLink = { href: '', setAttribute: vi.fn(), click: vi.fn() };
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

            mockGet.mockResolvedValue({
                data:    new Blob(),
                headers: { 'content-disposition': 'attachment; filename="mia-nota.pdf"' },
            });

            await noteService.export('1', 'pdf');

            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'mia-nota.pdf');
        });

        it('usa il filename di fallback se content-disposition è assente', async () => {
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

        it('chiama POST /notes/export con nome, contenuto e formato', async () => {
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
        it('chiama POST /notes/import con il FormData e restituisce la nota mappata', async () => {
            mockPost.mockResolvedValue({ data: rawNote });

            const formData = new FormData();
            const result = await noteService.import(formData);

            expect(mockPost).toHaveBeenCalledWith('/notes/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result).toMatchObject(mappedNote);
        });

        it('propaga l\'errore se la chiamata fallisce', async () => {
            mockPost.mockRejectedValue(new Error('Errore import'));

            await expect(noteService.import(new FormData())).rejects.toThrow('Errore import');
        });
    });
});