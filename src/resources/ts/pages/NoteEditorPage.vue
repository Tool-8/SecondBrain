<script setup lang="ts">
import AsideAI from '@/components/AsideAI.vue';
import NoteEditorHeader from '@/components/NoteEditorHeader.vue';
import NoteEditorToolbar from '@/components/NoteEditorToolbar.vue';
import NoteEditorContent from '@/components/NoteEditorContent.vue';

import { onBeforeRouteLeave } from 'vue-router';
import { provideNoteEditor } from '@/composables/useNoteEditor';
import { useNoteEditorUI } from '@/composables/useNoteEditorUI';
import { useModals } from '@/composables/useModals';

const { DiscardPromise } = useModals()

const {
    noteName,
    noteContent,
    isDirty,
    saveTheNote,
    loadNote,
    setEditorContent,
} = provideNoteEditor();

const {
    viewMode,
    isAiOpen,
    aiAction,
    selectedText,
    aiResult,
    loading,
    hatMode,
    languageMode,
    rewriteStyle,
    renderedHtml,
    wordCount,
    charCount,
    setViewMode,
    setEditorRef,
    handleEditorInput,
    undoEdit,
    redoEdit,
    applyFormat,
    openAiPanel,
    closeAiPanel,
    handleAiRun,
    insertAiResult,
    handleBeforeInput,
    handlePaste,
    handleEditorKeydown,
    retranslateAiBlock,
} = useNoteEditorUI({
    noteContent,
    setEditorContent,
});
loadNote();

onBeforeRouteLeave(async (to, from, next) => {
    if (!isDirty.value) return next();

    const response = await DiscardPromise.start();

    if (response === 'save') {
        await saveTheNote(true);
        if(isDirty.value) {
            return next(false);
        }
        next();
    } else if (response === 'discard') {
        next();
    } else {
        next(false);
    }
});

function handleEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement

    const button = target.closest('[data-ai-retranslate]') as HTMLElement | null
    if (!button) return

    const child = button.closest('[data-ai-child]') as HTMLElement | null
    if (!child) return

    retranslateAiBlock(child)
}
</script>

<template>
    <div
        id="noteEditor"
        :class="
            isAiOpen
                ? 'blur-xs pointer-events-none select-none overflow-hidden'
                : ''
        "
        class="flex flex-col items-stretch"
    >
        <div class="bg-white dark:bg-neutral-900 sticky top-0 z-20">
            <NoteEditorHeader
                v-model:name="noteName"
                :is-dirty="isDirty"
                :view-mode="viewMode"
                @change-view="setViewMode"
                @save="saveTheNote"
            />

            <NoteEditorToolbar
                :word-count="wordCount"
                :char-count="charCount"
                @undo="undoEdit"
                @redo="redoEdit"
                @format="applyFormat"
                @ai="openAiPanel"
            />
        </div>

        <NoteEditorContent
            :content="noteContent"
            :view-mode="viewMode"
            :rendered-html="renderedHtml"
            @editor-ready="setEditorRef"
            @input="handleEditorInput"
            @beforeinput="handleBeforeInput"
            @paste="handlePaste"
            @keydown="handleEditorKeydown"
            @click="handleEditorClick"
        />
    </div>

    <AsideAI
        :open="isAiOpen"
        :action="aiAction"
        :selected-text="selectedText"
        :result="aiResult"
        :loading="loading"
        :hat-mode="hatMode"
        :rewrite-style="rewriteStyle"
        :language-mode="languageMode"
        @close="closeAiPanel"

        @update:hatMode="hatMode = $event"
        @update:languageMode="languageMode = $event"
        @update:rewriteStyle="rewriteStyle = $event"

        @run="handleAiRun"
        @insert="insertAiResult"
    />
</template>
