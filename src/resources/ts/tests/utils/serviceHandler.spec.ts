import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { serviceHandler } from '@/utils/serviceHandler';

describe('serviceHandler', () => {
    it('restituisce il valore della funzione se non ci sono errori', async () => {
        const result = await serviceHandler(() => Promise.resolve(42));
        expect(result).toBe(42);
    });

    it('lancia un errore con il messaggio del server se è un errore axios', async () => {
        const axiosError = new axios.AxiosError('errore', '500', undefined, undefined, {
            data: { message: 'Errore dal server' },
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: { headers: {} } as any,
        });

        await expect(serviceHandler(() => Promise.reject(axiosError)))
            .rejects
            .toThrow('Errore dal server');
    });

    it('lancia un errore generico se la risposta axios non ha messaggio', async () => {
        const axiosError = new axios.AxiosError('errore', '500', undefined, undefined, {
            data: {},
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: { headers: {} } as any,
        });

        await expect(serviceHandler(() => Promise.reject(axiosError)))
            .rejects
            .toThrow('Errore sconosciuto');
    });

    it('lancia un errore generico se la risposta axios non ha data', async () => {
        const axiosError = new axios.AxiosError('errore', '500', undefined, undefined, {
            data: null,
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: { headers: {} } as any,
        });

        await expect(serviceHandler(() => Promise.reject(axiosError)))
            .rejects
            .toThrow('Errore sconosciuto');
    });

    it('lancia un errore generico se non è un errore axios', async () => {
        await expect(serviceHandler(() => Promise.reject(new Error('altro errore'))))
            .rejects
            .toThrow('Errore sconosciuto');
    });

    it('preserva la causa dell\'errore', async () => {
        const originalError = new Error('originale');

        try {
            await serviceHandler(() => Promise.reject(originalError));
        } catch (e) {
            expect((e as Error).cause).toBe(originalError);
        }
    });
});