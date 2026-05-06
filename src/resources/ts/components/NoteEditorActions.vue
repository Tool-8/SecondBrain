<script setup lang="ts">
import GeneralButton from '@/components/GeneralButton.vue';
import { useNoteEditor } from '@/composables/useNoteEditor';
import { useContextMenu } from '@/composables/useContextMenu';
import type { ContextAction } from '@/types/contextaction';
import type { Note } from '@/types/note';
import ContextMenu from '@/components/ContextMenu.vue';
const { saveTheNote, saveTheNoteAs, exportTheNote, isNew } = useNoteEditor();

const actions: ContextAction<void>[] = [
    {
        label: 'Esporta in PDF',
        handler: async () => {
            await exportTheNote('pdf');
        },
    },
    {
        label: 'Esporta in MD',
        handler: async () => {
            await await exportTheNote('md');
        },
    },
    {
        label: 'Esporta in HTML',
        handler: async () => {
            await await exportTheNote('html');
        },
    },
];

const exportMenu = useContextMenu<void>();

const openExportMenu = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    exportMenu.openAt(rect.left, rect.bottom, undefined);
};

const handleAction = (action: ContextAction<void>) => {
    action.handler?.();
    exportMenu.close();
};
</script>

<template>
    <div class="flex flex-row gap-2 justify-end py-1">
        <div class="relative self-start">
            <GeneralButton
                label="Esporta"
                @click="openExportMenu"
            >
                <template #icon>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.8"
                        stroke="currentColor"
                        class="size-4"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        ></path>
                    </svg>
                </template>
            </GeneralButton>

            <ContextMenu
                v-if="exportMenu.isOpen.value"
                :x="exportMenu.position.value.x"
                :y="exportMenu.position.value.y"
                :actions="actions"
                @action-clicked="handleAction"
                @close="exportMenu.close"
            />
        </div>
        <div class="self-start">
            <GeneralButton
                label="Salva come.."
                :disabled="isNew"
                @click="saveTheNoteAs()"
            />
        </div>
        <div class="self-start">
            <GeneralButton label="Salva" @click="saveTheNote()" />
        </div>
    </div>
</template>
