<script setup lang="ts">
import type { AiAction } from '@/composables/useNoteEditorUI'

defineProps<{
    wordCount: number
    charCount: number
}>()

const emit = defineEmits<{
    undo: []
    redo: []
    format: [type: 'bold' | 'italic' | 'underline']
    ai: [action: Exclude<AiAction, null>]
}>()
</script>

<template>
    <div class="flex px-6 py-1 border-b-1 border-gray-100 dark:border-neutral-800">
        <div class="pr-4 flex gap-px border-r-1 border-gray-100 dark:border-neutral-800 font-jetbrains">
            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                title="undo"
                @click="emit('undo')"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-3 dark:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M7.7,15.007a1.5,1.5,0,0,1-2.121,0L.858,10.282a2.932,2.932,0,0,1,0-4.145L5.583,1.412A1.5,1.5,0,0,1,7.7,3.533L4.467,6.7l14.213,0A5.325,5.325,0,0,1,24,12.019V18.7a5.323,5.323,0,0,1-5.318,5.318H5.318a1.5,1.5,0,1,1,0-3H18.681A2.321,2.321,0,0,0,21,18.7V12.019A2.321,2.321,0,0,0,18.68,9.7L4.522,9.7,7.7,12.886A1.5,1.5,0,0,1,7.7,15.007Z"/>
                </svg>
            </button>

            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                title="redo"
                @click="emit('redo')"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-3 dark:text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M16.3,15.007a1.5,1.5,0,0,0,2.121,0l4.726-4.725a2.934,2.934,0,0,0,0-4.145L18.416,1.412A1.5,1.5,0,1,0,16.3,3.533L19.532,6.7,5.319,6.7A5.326,5.326,0,0,0,0,12.019V18.7a5.324,5.324,0,0,0,5.318,5.318H18.682a1.5,1.5,0,0,0,0-3H5.318A2.321,2.321,0,0,1,3,18.7V12.019A2.321,2.321,0,0,1,5.319,9.7l14.159,0L16.3,12.886A1.5,1.5,0,0,0,16.3,15.007Z"/>
                </svg>
            </button>
        </div>

        <div class="px-4 flex gap-px border-r-1 border-gray-100 dark:border-neutral-800 font-jetbrains">
            <button
                class="px-2 font-bold cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                title="grassetto"
                @click="emit('format', 'bold')"
            >
                B
            </button>

            <button
                class="px-2 font-bold italic cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                title="italico"
                @click="emit('format', 'italic')"
            >
                I
            </button>

            <button
                class="px-2 font-bold underline cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                title="sottolineato"
                @click="emit('format', 'underline')"
            >
                U
            </button>
        </div>

        <div class="px-4 flex gap-px text-sm font-jetbrains">
            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="emit('ai', 'summarize')"
            >
                riassumi
            </button>

            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="emit('ai', 'hats')"
            >
                cappelli
            </button>

            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="emit('ai', 'translate')"
            >
                traduci
            </button>

            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="emit('ai', 'rewrite')"
            >
                riscrivi
            </button>

            <button
                class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="emit('ai', 'distant writing')"
            >
                distant writing
            </button>
        </div>

        <div class="font-jetbrains text-xs self-center ml-auto">
            <p>
                parole: <span>{{ wordCount }}</span>
                lettere: <span>{{ charCount }}</span>
            </p>
        </div>
    </div>
</template>