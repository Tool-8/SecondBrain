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
    summarizeMode,
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
} = useNoteEditorUI({
    noteContent,
    setEditorContent,
});
loadNote();

onBeforeRouteLeave(async (to, from, next) => {
    if (!isDirty.value) return next();

    const response = await DiscardPromise.start();

    if (response === 'save') {
        await saveTheNote();
        next();
    } else if (response === 'discard') {
        next();
    } else {
        next(false);
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
        <div class="bg-white dark:bg-neutral-900 sticky top-0">
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
        />
    </div>

    <AsideAI
        :open="isAiOpen"
        :action="aiAction"
        :selected-text="selectedText"
        :result="aiResult"
        :loading="loading"
        :summarize-mode="summarizeMode"
        :hat-mode="hatMode"
        :rewrite-style="rewriteStyle"
        :language-mode="languageMode"
        @close="closeAiPanel"
        @update:summarizeMode="summarizeMode = $event"
        @update:hatMode="hatMode = $event"
        @update:languageMode="languageMode = $event"
        @update:rewriteStyle="rewriteStyle = $event"
        
        @run="handleAiRun"
        @insert="insertAiResult"
    />
</template>
