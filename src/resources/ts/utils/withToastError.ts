// W.I.P.

import { useToast } from '@/composables/useToast';

const { successToast, errorToast, warningToast, infoToast } = useToast();

export function withToastError<T>(
    fn: (item: T) => Promise<void>,
    errorMessage: string
) {
    return async (item: T) => {
        try {
            await fn(item);
            successToast("Operazione completata", "");
        } catch (e) {
            errorToast(errorMessage, (e as Error).message);
        }
    };
}
