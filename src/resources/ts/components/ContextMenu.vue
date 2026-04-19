<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { ContextAction } from '@/types/contextaction';

defineProps<{
  actions: ContextAction[];
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  'action-clicked': [action: ContextAction];
  close: [];
}>();

const menuRef = ref<HTMLElement | null>(null);

onClickOutside(menuRef, () => {
  emit('close');
});

const emitAction = (action: ContextAction) => {
  emit('action-clicked', action);
};

const variantClasses: Record<string, string> = {
    default: 'text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800',
    warning:'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
};
</script>

<template>
    <Teleport to="body">
        <div
            ref="menuRef"
            class="fixed z-99 min-w-42 rounded-sm border border-gray-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            :style="{ top: `${y}px`, left: `${x}px` }"
        >
            <button
                v-for="item in actions"
                :key="item.action"
                :class="[
                    'block w-full cursor-pointer px-4 py-2 text-left',
                    variantClasses[item.variant ?? 'default']
                ]"
                @click="emitAction(item)"
            >
                {{ item.label }}
            </button>
        </div>
    </Teleport>
</template>