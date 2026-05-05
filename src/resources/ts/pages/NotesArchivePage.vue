<script setup lang="ts">
import NoteArchiveCard from '@/components/NoteArchiveCard.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import { computed, onMounted, ref } from 'vue';
import useNotes from '@/composables/useNotes';
import { useToast } from '@/composables/useToast';
import { useContextMenu } from '@/composables/useContextMenu';
import type { ContextAction } from '@/types/contextaction';
import type { Note } from '@/types/note';
import { useModals } from '@/composables/useModals';
import GeneralButton from '@/components/GeneralButton.vue';

const { errorToast } = useToast();

const {
    notes,
    loading,
    error,
    fetchNotes,
    renameNote,
    removeNote,
    cloneNote,
    exportNote,
    importNote,
} = useNotes();
const { RenamePromise, DeletePromise, ClonePromise } = useModals();

onMounted(() => fetchNotes());
const noteCount = computed(() => notes.value.length);

const actions: ContextAction<Note>[] = [
    {
        label: 'Rinomina',
        handler: async (note) => {
            const new_name = await RenamePromise.start(note.name);
            if (!new_name) return;
            await renameNote(note, new_name);
            await fetchNotes();
        },
    },
    {
        label: 'Clona',
        handler: async (note) => {
            const clone_name = await ClonePromise.start(
                note.name +
                    ' - ' +
                    new Intl.DateTimeFormat('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }).format(new Date())
            );
            if (!clone_name) return;
            await cloneNote(note.id, clone_name);
            await fetchNotes();
        },
    },
    {
        label: 'Esporta in PDF',
        handler: async (note) => {
            await exportNote(note.id, 'pdf');
        },
    },
    {
        label: 'Esporta in MD',
        handler: async (note) => {
            await exportNote(note.id, 'md');
        },
    },
    {
        label: 'Esporta in HTML',
        handler: async (note) => {
            await exportNote(note.id, 'html');
        },
    },
    {
        label: 'Elimina',
        handler: async (note) => {
            const confirm = await DeletePromise.start();
            if (!confirm) return;
            await removeNote(note.id);
            await fetchNotes();
        },
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

const fileInput = ref<HTMLInputElement | null>(null);
const importEvent = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
        errorToast(
            "Errore nell'importazione della nota",
            'Nessun file selezionato'
        );
        return;
    }
    await importNote(file);
    await fetchNotes();
};
</script>

<template>
    <div class="p-6">
        <header class="grid grid-cols-2 pb-2 pt-1">
            <h1 class="font-bold text-3xl">Archivio note</h1>

            <!-- tasto importa -->
            <div class="justify-self-end self-start">
                <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    @change="importEvent"
                    accept=".md"
                />
                <GeneralButton
                    label="Importa nota"
                    @click="fileInput?.click()"
                />
            </div>
        </header>
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
                {{ noteCount }}
                {{ noteCount === 1 ? 'nota trovata' : 'note trovate' }} nella
                memoria collettiva
            </p>
        </div>

        <div v-if="loading">Caricamento...</div>
        <div v-else-if="error">{{ error }}</div>
        <ul v-else class="pt-3 space-y-4">
            <NoteArchiveCard
                v-for="note in notes"
                :key="note.id"
                :id="note.id"
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
</template>
