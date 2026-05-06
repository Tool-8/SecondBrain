import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToast } from '@/composables/useToast';


describe('useToast', () => {
    let toast: ReturnType<typeof useToast>;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllTimers();
        toast = useToast();
        toast.toasts.value = [];
    });

    afterEach(() => {
        vi.useRealTimers();
    });


    it('creates success toast', () => {
        toast.successToast('Salvato', 'Operazione completata');

        expect(toast.toasts.value).toHaveLength(1);
        expect(toast.toasts.value[0]).toMatchObject({
            title: 'Salvato',
            message: 'Operazione completata',
            type: 'success',
        });
    });

    it('creates error toast', () => {
        toast.errorToast('Errore', 'Qualcosa è andato storto');

        expect(toast.toasts.value[0].type).toBe('error');
    });

    it('creates warning toast', () => {
        toast.warningToast('Attenzione', 'Controlla i dati');

        expect(toast.toasts.value[0].type).toBe('warning');
    });

    it('creates info toast', () => {
        toast.infoToast('Info', 'Messaggio informativo');

        expect(toast.toasts.value[0].type).toBe('info');
    });

    it('removes toast after default timeout (5s)', () => {
        toast.successToast('Titolo', 'Messaggio');
        expect(toast.toasts.value).toHaveLength(1);

        vi.advanceTimersByTime(5000);

        expect(toast.toasts.value).toHaveLength(0);
    });

    it('error toast is not removed after default timeout', () => {
        toast.errorToast('Errore', 'Critico');

        vi.advanceTimersByTime(5000);

        expect(toast.toasts.value).toHaveLength(1);
    });

    it('error toast is removed after 1 hour', () => {
        toast.errorToast('Errore', 'Critico');

        vi.advanceTimersByTime(1000 * 60 * 60);

        expect(toast.toasts.value).toHaveLength(0);
    });

    it('toast removed after custom timeout', () => {
        toast.successToast('Titolo', 'Messaggio', 2000);

        vi.advanceTimersByTime(1999);
        expect(toast.toasts.value).toHaveLength(1);

        vi.advanceTimersByTime(1);
        expect(toast.toasts.value).toHaveLength(0);
    });


    it('removeToast removes chosen toast', () => {
        let time = 1000;
        vi.spyOn(Date, 'now').mockImplementation(() => time++); // evita id uguali

        toast.successToast('A', 'Primo', 999999);
        toast.successToast('B', 'Secondo', 999999);

        const idToRemove = toast.toasts.value[0].id;
        toast.removeToast(idToRemove);

        expect(toast.toasts.value).toHaveLength(1);
        expect(toast.toasts.value[0].title).toBe('B');
    });

    it('removeToast with non-existent id', () => {
        toast.successToast('A', 'Messaggio');
        toast.removeToast(999999);

        expect(toast.toasts.value).toHaveLength(1);
    });

});