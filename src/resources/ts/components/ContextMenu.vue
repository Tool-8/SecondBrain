<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { ContextAction } from '@/types/contextaction';

const props = defineProps<{
    actions: ContextAction<any>[];
    x: number;
    y: number;
}>();

const emit = defineEmits<{
    'action-clicked': [action: ContextAction<any>];
    close: [];
}>();

const menuRef = ref<HTMLElement | null>(null);

const menuPosition = ref({
    top: props.y,
    left: props.x,
});

const updateMenuPosition = async () => {
    await nextTick();

    const menu = menuRef.value;
    if (!menu) return;

    const padding = 8;
    const rect = menu.getBoundingClientRect();

    let top = props.y;
    let left = props.x;

    if (top + rect.height > window.innerHeight - padding) {
        top = props.y - rect.height;
    }

    if (left + rect.width > window.innerWidth - padding) {
        left = props.x - rect.width;
    }

    menuPosition.value = {
        top: Math.max(padding, top),
        left: Math.max(padding, left),
    };
};

onMounted(updateMenuPosition);

onClickOutside(menuRef, () => {
    emit('close');
});

const emitAction = (action: ContextAction) => {
    emit('action-clicked', action);
};

const variantClasses: Record<string, string> = {
    default:
        'text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800',
    warning:
        'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
};
</script>

<template>
    <Teleport to="body">
        <div
            ref="menuRef"
            class="fixed z-99 min-w-42 rounded-sm border border-gray-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            :style="{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
            }"
        >
            <button
                v-for="item in actions"
                :class="[
                    'block w-full cursor-pointer px-4 py-2 text-left',
                    variantClasses[item.variant ?? 'default'],
                ]"
                @click="emitAction(item)"
            >
                {{ item.label }}
            </button>
        </div>
    </Teleport>
</template>
