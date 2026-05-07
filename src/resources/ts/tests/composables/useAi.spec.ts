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

    describe('stato iniziale', () => {
        it('result è null', () => {
            expect(ai.result.value).toBeNull();
        });

        it('loading è false', () => {
            expect(ai.loading.value).toBe(false);
        });

        it('error è null', () => {
            expect(ai.error.value).toBeNull();
        });
    });

    describe('execute — successo', () => {
        it('imposta loading a true durante l\'esecuzione', async () => {
            let loadingDuranteEsecuzione = false;
            mockSummarize.mockImplementation(() => {
                loadingDuranteEsecuzione = ai.loading.value;
                return Promise.resolve('risultato');
            });

            await ai.summarize('contenuto');

            expect(loadingDuranteEsecuzione).toBe(true);
        });

        it('imposta result con il valore restituito', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.result.value).toBe('risultato');
        });

        it('imposta loading a false dopo l\'esecuzione', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.loading.value).toBe(false);
        });

        it('error rimane null in caso di successo', async () => {
            mockSummarize.mockResolvedValue('risultato');
            await ai.summarize('contenuto');
            expect(ai.error.value).toBeNull();
        });
    });

    describe('execute — errore', () => {
        it('imposta error con il messaggio dell\'eccezione', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore di rete'));
            await ai.summarize('contenuto');
            expect(ai.error.value).toBe('Errore di rete');
        });

        it('imposta error con messaggio di default se l\'eccezione non ha messaggio', async () => {
            mockSummarize.mockRejectedValue({});
            await ai.summarize('contenuto');
            expect(ai.error.value).toBe('Errore durante l\'elaborazione');
        });

        it('result rimane null in caso di errore', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore'));
            await ai.summarize('contenuto');
            expect(ai.result.value).toBeNull();
        });

        it('loading è false dopo un errore', async () => {
            mockSummarize.mockRejectedValue(new Error('Errore'));
            await ai.summarize('contenuto');
            expect(ai.loading.value).toBe(false);
        });

        it('azzera error e result prima di ogni nuova esecuzione', async () => {
            mockSummarize.mockRejectedValueOnce(new Error('Primo errore'));
            await ai.summarize('contenuto');

            mockSummarize.mockResolvedValueOnce('secondo risultato');
            await ai.summarize('contenuto');

            expect(ai.error.value).toBeNull();
            expect(ai.result.value).toBe('secondo risultato');
        });
    });

    describe('translate', () => {
        it('chiama aiService.translate con lang di default en', async () => {
            mockTranslate.mockResolvedValue('tradotto');
            await ai.translate('contenuto');
            expect(mockTranslate).toHaveBeenCalledWith('contenuto', 'en');
        });

        it('chiama aiService.translate con la lang specificata', async () => {
            mockTranslate.mockResolvedValue('tradotto');
            await ai.translate('contenuto', 'it');
            expect(mockTranslate).toHaveBeenCalledWith('contenuto', 'it');
        });
    });

    describe('summarize', () => {
        it('chiama aiService.summarize con il contenuto', async () => {
            mockSummarize.mockResolvedValue('riassunto');
            await ai.summarize('contenuto');
            expect(mockSummarize).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('rewrite', () => {
        it('chiama aiService.rewrite con contenuto e style', async () => {
            mockRewrite.mockResolvedValue('riscritto');
            await ai.rewrite('contenuto', ['grammar']);
            expect(mockRewrite).toHaveBeenCalledWith('contenuto', ['grammar']);
        });
    });

    describe('distantWriting', () => {
        it('chiama aiService.distantWriting con il contenuto', async () => {
            mockDistantWriting.mockResolvedValue('risultato');
            await ai.distantWriting('contenuto');
            expect(mockDistantWriting).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('bluehat', () => {
        it('chiama aiService.bluehat con il contenuto', async () => {
            mockBluehat.mockResolvedValue('risultato');
            await ai.bluehat('contenuto');
            expect(mockBluehat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('blackhat', () => {
        it('chiama aiService.blackhat con il contenuto', async () => {
            mockBlackhat.mockResolvedValue('risultato');
            await ai.blackhat('contenuto');
            expect(mockBlackhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('redhat', () => {
        it('chiama aiService.redhat con il contenuto', async () => {
            mockRedhat.mockResolvedValue('risultato');
            await ai.redhat('contenuto');
            expect(mockRedhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('yellowhat', () => {
        it('chiama aiService.blackhat con il contenuto', async () => {
            mockYellowhat.mockResolvedValue('risultato');
            await ai.yellowhat('contenuto');
            expect(mockYellowhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('greenhat', () => {
        it('chiama aiService.greenhat con il contenuto', async () => {
            mockGreenhat.mockResolvedValue('risultato');
            await ai.greenhat('contenuto');
            expect(mockGreenhat).toHaveBeenCalledWith('contenuto');
        });
    });

    describe('whitehat', () => {
        it('chiama aiService.whitehat con il contenuto', async () => {
            mockWhitehat.mockResolvedValue('risultato');
            await ai.whitehat('contenuto');
            expect(mockWhitehat).toHaveBeenCalledWith('contenuto');
        });
    });
})