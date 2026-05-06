import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '@/services/aiService';

const { mockPost } = vi.hoisted(() => ({
    mockPost: vi.fn(),
}));

vi.mock('@/services/apiClient', () => ({
    default: {
        post: mockPost,
    },
}));

vi.mock('@/utils/serviceHandler', () => ({
    serviceHandler: vi.fn((fn) => fn()),
}));

describe('aiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPost.mockResolvedValue({ data: { result: 'risultato' } });
    });

    describe('process', () => {
        it('chiama apiClient.post con i parametri corretti', async () => {
            await aiService.process('contenuto', 'summarize');

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'summarize',
                options: {},
            });
        });

        it('restituisce il risultato della risposta', async () => {
            const result = await aiService.process('contenuto', 'summarize');
            expect(result).toBe('risultato');
        });

        it('passa le options se fornite', async () => {
            await aiService.process('contenuto', 'rewrite', { style: ['grammar'] });

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'rewrite',
                options: { style: ['grammar'] },
            });
        });

        it('propaga l\'errore se apiClient.post fallisce', async () => {
            mockPost.mockRejectedValueOnce(new Error('Network error'));

            await expect(aiService.process('contenuto', 'summarize'))
                .rejects
                .toThrow('Network error');
        });
    });

    describe('translate', () => {
        it('chiama process con action translate e lang di default en', async () => {
            await aiService.translate('contenuto');

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'translate',
                options: { lang: 'en' },
            });
        });

        it('chiama process con la lang specificata', async () => {
            await aiService.translate('contenuto', 'it');

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'translate',
                options: { lang: 'it' },
            });
        });
    });

    describe('summarize', () => {
        it('chiama process con action summarize', async () => {
            await aiService.summarize('contenuto');

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'summarize',
                options: {},
            });
        });
    });

    describe('rewrite', () => {
        it('chiama process con action rewrite e lo style', async () => {
            await aiService.rewrite('contenuto', ['grammar']);

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'rewrite',
                options: { style: ['grammar'] },
            });
        });
    });

    describe('blackhat', () => {
        it('chiama process con action blackhat', async () => {
            await aiService.blackhat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'blackhat',
                options: {},
            });
        });
    });

    describe('bluehat', () => {
        it('chiama process con action bluehat', async () => {
            await aiService.bluehat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'bluehat',
                options: {},
            });
        });
    });

    describe('greenhat', () => {
        it('chiama process con action greenhat', async () => {
            await aiService.greenhat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'greenhat',
                options: {},
            });
        });
    });

    describe('redhat', () => {
        it('chiama process con action redhat', async () => {
            await aiService.redhat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'redhat',
                options: {},
            });
        });
    });

    describe('whitehat', () => {
        it('chiama process con action whitehat', async () => {
            await aiService.whitehat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'whitehat',
                options: {},
            });
        });
    });

    describe('yellowhat', () => {
        it('chiama process con action yellowhat', async () => {
            await aiService.yellowhat('contenuto');
            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'yellowhat',
                options: {},
            });
        });
    });

    describe('distantWriting', () => {
        it('chiama process con action distant writing', async () => {
            await aiService.distantWriting('contenuto');

            expect(mockPost).toHaveBeenCalledWith('/llm', {
                content: 'contenuto',
                action: 'distant writing',
                options: {},
            });
        });
    });
});