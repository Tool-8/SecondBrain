import { describe, vi, expect, it, beforeEach } from "vitest";
import { useAi } from "@/composables/useAi";

const { mockTranslate, mockRewrite, mockDistantWriting, mockSummarize, mockRedhat, mockYellowhat,
    mockGreenhat, mockBlackhat, mockWhitehat, mockBluehat } = vi.hoisted(() => ({
        mockTranslate: vi.fn(),
        mockRewrite: vi.fn(), 
        mockDistantWriting: vi.fn(),
        mockSummarize: vi.fn(),
        mockRedhat: vi.fn(),
        mockYellowhat: vi.fn(),
        mockGreenhat: vi.fn(),
        mockBlackhat: vi.fn(),
        mockWhitehat: vi.fn(),
        mockBluehat: vi.fn()
}));

vi.mock('@/services/aiService', () => ({
    aiService: {
        translate: mockTranslate,
        rewrite: mockRewrite,
        distantWriting: mockDistantWriting,
        summarize: mockSummarize,
        redhat: mockRedhat,
        bluehat: mockBluehat,
        blackhat: mockBlackhat,
        greenhat: mockGreenhat,
        yellowhat: mockYellowhat,
        whitehat: mockWhitehat
    }
}));

describe('useAi', () => {
    let ai: ReturnType<typeof useAi>;

    beforeEach(() => {
        vi.clearAllMocks();
        ai = useAi();
    });

    describe('default state', () => {
        it('result is null', () => {
            expect(ai.result.value).toBeNull();
        });

        it('loading is false', () => {
            expect(ai.loading.value).toBe(false);
        });

        it('error is null', () => {
            expect(ai.error.value).toBeNull();
        });
    });

    describe('execute — success', () => {
        it('sets loading to true during execution', async () => {
            let loadingDuranteEsecuzione = false;
            mockSummarize.mockImplementation(() => {
                loadingDuranteEsecuzione = ai.loading.value;
                return Promise.resolve('risultato');
            });

            await ai.summarize('contenuto');

            expect(loadingDuranteEsecuzione).toBe(true);
        });

        it('expected result', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.result.value).toBe('risultato');
        });

        it('set loading to false after execution', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.loading.value).toBe(false);
        });

        it('no error after successful execution', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.error.value).toBeNull();
        });
    });

    describe('execute — error', () => {
        it('set error with the exception message', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore di rete'));
            await ai.summarize('contenuto');
            expect(ai.error.value).toBe('Errore di rete');
        });

        it('set error with default message', async () => {
            mockSummarize.mockRejectedValue({});
            await ai.summarize('contenuto');
            expect(ai.error.value).toBe('Errore durante l\'elaborazione');
        });

        it('no result after error', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore'));
            await ai.summarize('contenuto');
            expect(ai.result.value).toBeNull();
        });

        it('set loading to false after error', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore'));
            await ai.summarize('contenuto');
            expect(ai.loading.value).toBe(false);
        });

        it('set error and result to null before each execution', async () => {
            mockSummarize.mockRejectedValueOnce(new Error('Primo errore'));
            await ai.summarize('contenuto');

            mockSummarize.mockResolvedValueOnce('secondo risultato');
            await ai.summarize('contenuto');

            expect(ai.error.value).toBeNull();
            expect(ai.result.value).toBe('secondo risultato');
        });
    });

    describe('translate', () => {
        it('calls aiService.translate with default language en', async () => {
            mockTranslate.mockResolvedValue('tradotto');
            await ai.translate('contenuto');
            expect(mockTranslate).toHaveBeenCalledWith('contenuto', 'en');
        });

        it('calls aiService.translate with the specified language', async () => {
            mockTranslate.mockResolvedValue('tradotto');
            await ai.translate('contenuto', 'it');
            expect(mockTranslate).toHaveBeenCalledWith('contenuto', 'it');
        });
    });

    describe('summarize', () => {
        it('calls aiService.summarize with content', async () => {
            mockSummarize.mockResolvedValue('riassunto');
            await ai.summarize('contenuto');
            expect(mockSummarize).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('rewrite', () => {
        it('calls aiService.rewrite with content and style', async () => {
            mockRewrite.mockResolvedValue('riscritto');
            await ai.rewrite('contenuto', ['grammar']);
            expect(mockRewrite).toHaveBeenCalledWith('contenuto', ['grammar']);
        });
    });

    describe('distantWriting', () => {
        it('calls aiService.distantWriting with content', async () => {
            mockDistantWriting.mockResolvedValue('risultato');
            await ai.distantWriting('contenuto');
            expect(mockDistantWriting).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('bluehat', () => {
        it('calls aiService.bluehat with content', async () => {
            mockBluehat.mockResolvedValue('risultato');
            await ai.bluehat('contenuto');
            expect(mockBluehat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('blackhat', () => {
        it('calls aiService.blackhat with content', async () => {
            mockBlackhat.mockResolvedValue('risultato');
            await ai.blackhat('contenuto');
            expect(mockBlackhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('redhat', () => {
        it('calls aiService.redhat with content', async () => {
            mockRedhat.mockResolvedValue('risultato');
            await ai.redhat('contenuto');
            expect(mockRedhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('yellowhat', () => {
        it('calls aiService.yellowhat with content', async () => {
            mockYellowhat.mockResolvedValue('risultato');
            await ai.yellowhat('contenuto');
            expect(mockYellowhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('greenhat', () => {
        it('calls aiService.greenhat with content', async () => {
            mockGreenhat.mockResolvedValue('risultato');
            await ai.greenhat('contenuto');
            expect(mockGreenhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('whitehat', () => {
        it('calls aiService.whitehat with content', async () => {
            mockWhitehat.mockResolvedValue('risultato');
            await ai.whitehat('contenuto');
            expect(mockWhitehat).toHaveBeenCalledWith('contenuto');
        });
    });
})
