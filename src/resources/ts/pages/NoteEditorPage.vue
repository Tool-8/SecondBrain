<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, watch } from 'vue';
import { marked } from 'marked';
import { useToast } from '@/composables/useToast';
import { useRoute } from 'vue-router';
import { useNotes } from '@/composables/useNotes';
import { createNoteState } from '@/composables/useNoteState';

import AsideAI from '@/components/AsideAI.vue';
import NoteSaveButton from '@/components/editor/NoteSaveButton.vue';
import NoteEditorActions from '@/components/layout/NoteEditorActions.vue';

const { errorToast, warningToast, successToast } = useToast();
const { getNote, saveNote, storeNote } = useNotes();
const { note, noteContent, originalContent, noteName, originalName, isDirty, editorRef } = createNoteState();
const route = useRoute();

type ViewMode = 'editor' | 'split' | 'render';
type AiAction = 'summarize' | 'hats' | 'translate' | null;
type SummarizeMode = 'short' | 'medium' | 'long';
type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue';
type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es';

const viewMode = ref<ViewMode>('split');
const isAiOpen = ref(false);
const aiAction = ref<AiAction>(null);
const selectedText = ref('');

const summarizeMode = ref<SummarizeMode>('medium');
const hatMode = ref<HatMode>('white');
const languageMode = ref<LanguageMode>('en');

watch(isDirty, () => {
    console.log(noteContent.value, originalContent.value, noteName.value, originalName.value);
});

marked.setOptions({
    gfm: true,
    breaks: true,
});

const renderedHtml = computed(() => marked.parse(noteContent.value));

function handleEditorInput() {
    if (!editorRef.value) return;

    const newValue = editorRef.value.innerText;

    if (newValue !== noteContent.value) {
        isDirty.value = true;
    }

    noteContent.value = newValue;
}

function setViewMode(mode: ViewMode) {
    viewMode.value = mode;
}

function getSelectedEditorText() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    const text = selection.toString().trim();
    return text;
}

function openAiPanel(action: Exclude<AiAction, null>) {
    const text = getSelectedEditorText();

    if (!text) {
        warningToast(
            'Attenzione',
            'Seleziona del testo prima di usare questa funzione AI.'
        );
        return;
    }

    selectedText.value = text;
    aiAction.value = action;
    isAiOpen.value = true;
}

function closeAiPanel() {
    isAiOpen.value = false;
    aiAction.value = null;
}

function handleAiRun(payload: {
    action: Exclude<AiAction, null>;
    selectedText: string;
    option: string;
}) {
    console.log('AI payload', payload);
    // chiamata backend
}

const wordCount = computed(() => {
    if (!noteContent.value) return 0;

    return noteContent.value.trim().split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => {
    if (!noteContent.value) return 0;

    return noteContent.value.length;
});

function undoEdit() {
    editorRef.value?.focus();
    document.execCommand('undo');
    handleEditorInput();
}

function redoEdit() {
    editorRef.value?.focus();
    document.execCommand('redo');
    handleEditorInput();
}

function applyFormat(type: 'bold' | 'italic' | 'underline') {
    if (!editorRef.value) return;

    editorRef.value.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();

    if (!selectedText.trim()) {
        warningToast('Attenzione', 'Seleziona del testo');
        return;
    }

    const wrappers = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        underline: ['<u>', '</u>'],
    } as const;

    const [start, end] = wrappers[type];

    const alreadyWrapped =
        selectedText.startsWith(start) && selectedText.endsWith(end);

    const formattedText = alreadyWrapped
        ? selectedText.slice(start.length, selectedText.length - end.length)
        : `${start}${selectedText}${end}`;

    document.execCommand('insertText', false, formattedText);

    handleEditorInput();
}

onMounted(async () => {
    if (route.params.id === undefined) return;
    try {
        const archNote = await getNote(route.params.id as string);

        note.value = archNote;

        noteName.value = archNote.name;
        noteContent.value = archNote.content;

        originalContent.value = archNote.content;
        originalName.value = archNote.name;

        if (editorRef.value) {
            editorRef.value.innerText = archNote.content;
        }
    } catch (error) {
        errorToast('Errore', (error as Error).message);
    }
});
</script>

<template>
    <div
        id="noteEditor"
        :class="
            isAiOpen
                ? 'blur-xs pointer-events-none select-none overflow-hidden'
                : ''
        "
        class="flex flex-col"
    >
        <!-- FUNCTION CONTAINER -->
        <div class="bg-white dark:bg-neutral-900 sticky top-0">
            <!-- HEADER -->
            <header
                class="grid grid-cols-3 px-6 py-7 border-b-1 border-gray-100 dark:border-neutral-800"
            >
                <!-- titolo + stato del salvataggio -->
                <div>
                    <h1 class="font-bold text-2xl max-w-60">
                        <input
                            v-model="noteName"
                            placeholder="Inserisci nome.."
                            class="focus-within:outline-2 focus-within:outline-blue-400"
                        />
                    </h1>
                    <p
                        class="font-jetbrains text-xs text-gray-500 dark:text-neutral-400"
                    >
                        <span
                            class="w-2 h-2 inline-block rounded-3xl"
                            :class="
                                isDirty
                                    ? 'bg-yellow-500 dark:bg-yellow-400'
                                    : 'bg-green-500 dark:bg-green-400'
                            "
                        ></span>

                        <span>
                            {{ isDirty ? ' non salvato' : ' salvato' }}
                        </span>
                    </p>
                </div>

                <!-- switch interfaccia editor | split | render -->
                <div
                    class="self-start flex items-center justify-between gap-2 px-1 py-1 rounded-xl bg-gray-100 border border-gray-50 shadow-xs font-medium dark:bg-neutral-800 dark:border-neutral-700"
                >
                    <button
                        @click="setViewMode('editor')"
                        :active="viewMode === 'editor' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >
                        Editor
                    </button>
                    <button
                        @click="setViewMode('split')"
                        :active="viewMode === 'split' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >
                        Split
                    </button>
                    <button
                        @click="setViewMode('render')"
                        :active="viewMode === 'render' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >
                        Render
                    </button>
                </div>

                <NoteEditorActions />
            </header>

            <!-- SUBHEADER -->
            <div
                class="flex px-6 py-1 border-b-1 border-gray-100 dark:border-neutral-800"
            >
                <!-- tasti undo | redo -->
                <div
                    class="pr-4 flex gap-px border-r-1 border-gray-100 dark:border-neutral-800 font-jetbrains"
                >
                    <button
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="undo"
                        @click="undoEdit"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-3 dark:text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M7.7,15.007a1.5,1.5,0,0,1-2.121,0L.858,10.282a2.932,2.932,0,0,1,0-4.145L5.583,1.412A1.5,1.5,0,0,1,7.7,3.533L4.467,6.7l14.213,0A5.325,5.325,0,0,1,24,12.019V18.7a5.323,5.323,0,0,1-5.318,5.318H5.318a1.5,1.5,0,1,1,0-3H18.681A2.321,2.321,0,0,0,21,18.7V12.019A2.321,2.321,0,0,0,18.68,9.7L4.522,9.7,7.7,12.886A1.5,1.5,0,0,1,7.7,15.007Z"
                            />
                        </svg>
                    </button>
                    <button
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="redo"
                        @click="redoEdit"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-3 dark:text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M16.3,15.007a1.5,1.5,0,0,0,2.121,0l4.726-4.725a2.934,2.934,0,0,0,0-4.145L18.416,1.412A1.5,1.5,0,1,0,16.3,3.533L19.532,6.7,5.319,6.7A5.326,5.326,0,0,0,0,12.019V18.7a5.324,5.324,0,0,0,5.318,5.318H18.682a1.5,1.5,0,0,0,0-3H5.318A2.321,2.321,0,0,1,3,18.7V12.019A2.321,2.321,0,0,1,5.319,9.7l14.159,0L16.3,12.886A1.5,1.5,0,0,0,16.3,15.007Z"
                            />
                        </svg>
                    </button>
                </div>

                <!-- tasti stile font grassetto | italico | sottolineato -->
                <div
                    class="px-4 flex gap-px border-r-1 border-gray-100 dark:border-neutral-800 font-jetbrains"
                >
                    <button
                        class="px-2 font-bold cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="grassetto"
                        @click="applyFormat('bold')"
                    >
                        B
                    </button>
                    <button
                        class="px-2 font-bold italic cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="italico"
                        @click="applyFormat('italic')"
                    >
                        I
                    </button>
                    <button
                        class="px-2 font-bold underline cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        title="sottolineato"
                        @click="applyFormat('underline')"
                    >
                        U
                    </button>
                </div>

                <!-- funzioni AI -->
                <div class="px-4 flex gap-px text-sm font-jetbrains">
                    <button
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('summarize')"
                    >
                        riassumi
                    </button>
                    <button
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('hats')"
                    >
                        cappelli
                    </button>
                    <button
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('translate')"
                    >
                        traduci
                    </button>
                </div>

                <!-- contatore parole e lettere -->
                <div class="font-jetbrains text-xs self-center ml-auto">
                    <p>
                        parole: <span>{{ wordCount }}</span> lettere:
                        <span>{{ charCount }}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- VIEW CONTAINER -->
        <div
            id="view_container"
            class="flex w-full h-full divide-x-1 divide-gray-100 dark:divide-neutral-800"
        >
            <!-- EDITOR -->
            <section
                v-show="viewMode === 'editor' || viewMode === 'split'"
                id="editor"
                :ref="(el => editorRef = el as HTMLElement)"
                class="p-6 flex-1 min-w-0 font-jetbrains h-full focus:outline-none"
                contenteditable="true"
                @input="handleEditorInput"
            ></section>

            <!-- RENDER -->
            <section
                v-show="viewMode === 'render' || viewMode === 'split'"
                id="render"
                class="p-6 flex-1 min-w-0 overflow-auto"
            >
                <div
                    class="prose max-w-none dark:prose-invert"
                    v-html="renderedHtml"
                ></div>
            </section>
        </div>
    </div>

    <!-- AI FUNCTION CONTAINER -->
    <AsideAI
        :open="isAiOpen"
        :action="aiAction"
        :selected-text="selectedText"
        :summarize-mode="summarizeMode"
        :hat-mode="hatMode"
        :language-mode="languageMode"
        @close="closeAiPanel"
        @update:summarizeMode="summarizeMode = $event"
        @update:hatMode="hatMode = $event"
        @update:languageMode="languageMode = $event"
        @run="handleAiRun"
    />
</template>
