import { ref } from 'vue';

export type ContextMenuPosition = {
  x: number;
  y: number;
};

export function useContextMenu<T>() {
    const isOpen = ref(false);
    const position = ref<ContextMenuPosition>({ x: 0, y: 0 });
    const selectedItem = ref<T | null>(null);

    const open = (event: MouseEvent, item: T) => {
        event.preventDefault();

        isOpen.value = true;
        position.value = {
            x: event.clientX,
            y: event.clientY,
        };
        selectedItem.value = item;
    };

    const close = () => {
        isOpen.value = false;
        selectedItem.value = null;
    };

    return {
        isOpen,
        position,
        selectedItem,
        open,
        close,
    };
}