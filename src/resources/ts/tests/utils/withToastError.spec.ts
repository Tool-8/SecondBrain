import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withToastError } from '@/utils/withToastError';

const { mockSuccessToast, mockErrorToast } = vi.hoisted(() => ({
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
}));

vi.mock('@/composables/useToast', () => ({
    useToast: () => ({
        successToast: mockSuccessToast,
        errorToast: mockErrorToast,
    }),
}));

describe('withToastError', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('esegue la funzione e mostra il toast di successo', async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        const wrapped = withToastError(fn, 'Errore');

        await wrapped('item');

        expect(fn).toHaveBeenCalledWith('item');
        expect(mockSuccessToast).toHaveBeenCalledWith('Operazione completata', '');
        expect(mockErrorToast).not.toHaveBeenCalled();
    });

    it('mostra il toast di errore se la funzione lancia un errore', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('dettaglio errore'));
        const wrapped = withToastError(fn, 'Operazione fallita');

        await wrapped('item');

        expect(mockErrorToast).toHaveBeenCalledWith('Operazione fallita', 'dettaglio errore');
        expect(mockSuccessToast).not.toHaveBeenCalled();
    });

    it('passa il parametro corretto alla funzione', async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        const wrapped = withToastError(fn, 'Errore');

        await wrapped(42);

        expect(fn).toHaveBeenCalledWith(42);
    });
});