<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { ViewMode } from '@/composables/useNoteEditorUI'

const props = defineProps<{
    content: string
    viewMode: ViewMode
    renderedHtml: string | Promise<string>
}>()

const emit = defineEmits<{
    'editor-ready': [element: HTMLElement]
    input: []
    beforeinput: [event: InputEvent]
    paste: [event: ClipboardEvent]
    keydown: [event: KeyboardEvent]
}>()

const editor = ref<HTMLElement | null>(null)

onMounted(() => {
    if (!editor.value) return

    editor.value.innerHTML = props.content
    emit('editor-ready', editor.value)
})

watch(
    () => props.content,
    async newContent => {
        await nextTick()

        if (!editor.value) return
        if (editor.value.innerHTML === newContent) return

        editor.value.innerHTML = newContent
    }
)
</script>

<template>
    <div
        id="view_container"
        class="flex w-full h-full divide-x-1 divide-gray-100 dark:divide-neutral-800"
    >
        <section
            v-show="viewMode === 'editor' || viewMode === 'split'"
            id="editor"
            ref="editor"
            class="p-6 flex-1 min-w-0 font-jetbrains h-full focus:outline-none"
            contenteditable="true"
            spellcheck="false"
            @input="emit('input')"
            @beforeinput="emit('beforeinput', $event as InputEvent)"
            @paste="emit('paste', $event as ClipboardEvent)"
            @keydown="emit('keydown', $event as KeyboardEvent)"
        ></section>

        <section
            v-show="viewMode === 'render' || viewMode === 'split'"
            id="render"
            class="p-6 flex-1 min-w-0 overflow-auto"
        >
            <div class="prose max-w-none dark:prose-invert" v-html="renderedHtml"></div>
        </section>
    </div>
</template>