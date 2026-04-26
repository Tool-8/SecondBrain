<script setup lang="ts">
import NoteArchiveCard from '@/components/NoteArchiveCard.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import ToastList from '@/components/layout/ToastList.vue';
import { computed, onMounted } from 'vue';
import { useNotes } from '@/composables/useNotes';
import { useToast } from '@/composables/useToast';

import { useContextMenu } from '@/composables/useContextMenu';

import type { ContextAction } from '@/types/contextaction';
import type { Note } from '@/types/note';

const { successToast, errorToast, warningToast, infoToast } = useToast();
const { notes, loading, error, fetchNotes, renameNote, removeNote } =
    useNotes();

onMounted(() => fetchNotes());
const noteCount = computed(() => notes.value.length);

const actions: ContextAction<Note>[] = [
    {
        label: 'Rinomina',
        handler: async (note) => {
            try {
                await renameNote(note.id, 'La mia seconda nota');
                successToast('Rinomina effettuata', '');
            } catch (error) {
                errorToast(
                    'Errore nella rinomina della nota',
                    (error as Error).message
                );
            } finally {
                await fetchNotes();
            }
        },
    },
    {
        label: 'Clona',
        handler: (note) => console.log('Clona', note),
    },
    {
        label: 'Esporta',
        handler: (note) => console.log('Esporta', note),
    },
    {
        label: 'Elimina',
        handler: (note) => console.log('Elimina', note),
        variant: 'warning',
    },
];

const noteMenu = useContextMenu<Note>();

const handleAction = (action: ContextAction<Note>) => {
    const note = noteMenu.selectedItem.value;
    if (!note) return;

    action.handler?.(note);
    noteMenu.close();
};
</script>

<template>
    <div class="p-6">
        <h1 class="font-bold text-3xl pb-2">Archivio note</h1>

        <div class="pt-5">
            <label for="Search">
                <div class="relative group">
                    <span
                        class="absolute inset-y-0 left-1 grid w-8 place-content-center"
                    >
                        <button
                            type="button"
                            aria-label="Submit"
                            class="rounded-full p-1.5 text-gray-700 transition-colors hover:bg-gray-100"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-4 group-focus-within:text-blue-500 dark:text-neutral-700"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>
                        </button>
                    </span>

                    <input
                        id="Search"
                        type="text"
                        class="py-2 pl-8 w-full rounded border border-gray-200 pe-10 shadow-xs sm:text-sm focus:outline-blue-400 focus:outline-1 dark:border-neutral-700"
                    />
                </div>
            </label>
            <p class="text-sm pt-2 text-gray-500 dark:text-neutral-500">
                {{ noteCount }} {{ noteCount === 1 ? 'nota trovata' : 'note trovate' }} nella memoria collettiva
            </p>
        </div>

        <div v-if="loading">Caricamento...</div>
        <div v-else-if="error">{{ error }}</div>
        <ul v-else class="pt-3 space-y-4">
            <NoteArchiveCard
                v-for="note in notes"
                :key="note.name"
                :name="note.name"
                :last_edit="note.last_edit"
                :creation="note.creation"
                @contextmenu="noteMenu.open($event, note)"
            />
        </ul>

    <ContextMenu
        v-if="noteMenu.isOpen.value"
        :x="noteMenu.position.value.x"
        :y="noteMenu.position.value.y"
        :actions="actions"
        @action-clicked="handleAction"
        @close="noteMenu.close"
    />
    </div>

    <ToastList />
</template>
