import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
    id: number;
    title: string;
    message: string;
    type: ToastType;
};

const defaultTimeout = 1000 * 5; // 5 secondi
const defaultErrorTimeout = 1000 * 60 * 60; // 1 ora

const toasts = ref<Toast[]>([]);

export function useToast() {

    const addToast = (title: string, message: string, type: ToastType = 'info'): Toast => ({
        id: Date.now(),  // id univoco
        title,
        message,
        type,
    });

    function updateState(title: string, message: string, type: ToastType = 'info', timeout: number = defaultTimeout) {
        const toast = addToast(title, message, type);

        toasts.value.push(toast);

        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== toast.id);
        }, timeout);
    }

    function removeToast(id: number) {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }

    function successToast(title: string, message: string, timeout: number = defaultTimeout) {
        updateState(title, message, 'success', timeout);
    }

    function errorToast(title: string, message: string, timeout: number = defaultErrorTimeout) {
        updateState(title, message, 'error', timeout);
    }

    function warningToast(title: string, message: string, timeout: number = defaultTimeout) {
        updateState(title, message, 'warning', timeout);
    }

    function infoToast(title: string, message: string, timeout: number = defaultTimeout) {
        updateState(title, message, 'info', timeout);
    }

    return {
        toasts,
        removeToast,
        successToast,
        warningToast,
        errorToast,
        infoToast
    }

}
