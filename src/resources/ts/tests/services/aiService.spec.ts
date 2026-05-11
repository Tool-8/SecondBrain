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
        mockPost.mockResolvedValue({ data: { result: 'result_value' } });
    });

    describe('process', () => {
        it('should call apiClient.post with the correct endpoint for summarize', async () => {
            await aiService.process('content_body', 'summarize');

            expect(mockPost).toHaveBeenCalledWith('/llm/summarize', {
                content: 'content_body'
            });
        });

        it('should return the result from the response data', async () => {
            const result = await aiService.process('content_body', 'summarize');
            expect(result).toBe('result_value');
        });

        it('should call the rewrite endpoint with styles in the request body', async () => {
            await aiService.process('content_body', 'rewrite', { style: ['grammar'] });

            expect(mockPost).toHaveBeenCalledWith('/llm/rewrite', {
                content: 'content_body',
                style: ['grammar'],
            });
        });
    });

    describe('translate', () => {
        it('should call the translate endpoint with the specified language', async () => {
            await aiService.translate('content_body', 'it');

            expect(mockPost).toHaveBeenCalledWith('/llm/translate', {
                content: 'content_body',
                lang: 'it',
            });
        });
    });

    describe('summarize', () => {
        it('should call the specific summarize endpoint', async () => {
            await aiService.summarize('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/summarize', {
                content: 'content_body'
            });
        });
    });

    describe('rewrite', () => {
        it('should call the rewrite endpoint with provided styles', async () => {
            await aiService.rewrite('content_body', ['grammar']);
            expect(mockPost).toHaveBeenCalledWith('/llm/rewrite', {
                content: 'content_body',
                style: ['grammar'],
            });
        });
    });

    describe('thinking hats', () => {
        it('should call the dynamic hat endpoint for redhat', async () => {
            await aiService.redhat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/redhat', {
                content: 'content_body'
            });
        });

        it('should call the dynamic hat endpoint for whitehat', async () => {
            await aiService.whitehat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/whitehat', {
                content: 'content_body'
            });
        });

        it('should call the dynamic hat endpoint for yellowhat', async () => {
            await aiService.yellowhat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/yellowhat', {
                content: 'content_body'
            });
        });

        it('should call the dynamic hat endpoint for greenhat', async () => {
            await aiService.greenhat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/greenhat', {
                content: 'content_body'
            });
        });

        it('should call the dynamic hat endpoint for blackhat', async () => {
            await aiService.blackhat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/blackhat', {
                content: 'content_body'
            });
        });

        it('should call the dynamic hat endpoint for bluehat', async () => {
            await aiService.bluehat('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/hat/bluehat', {
                content: 'content_body'
            });
        });
    });

    describe('distantWriting', () => {
        it('should call the distant-writing endpoint', async () => {
            await aiService.distantWriting('content_body');
            expect(mockPost).toHaveBeenCalledWith('/llm/distant-writing', {
                content: 'content_body'
            });
        });
    });
});
