import axios from 'axios';

export async function serviceHandler<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (axios.isAxiosError(e)) {
            throw new Error(e.response?.data?.message || 'Errore sconosciuto', { cause: e });
        }
        throw new Error('Errore sconosciuto', { cause: e });
    }
}
