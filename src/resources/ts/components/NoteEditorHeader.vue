<script setup lang="ts">
import GeneralButton from '@/components/GeneralButton.vue'
import type { ViewMode } from '@/composables/useNoteEditorUI'

defineProps<{
    name: string
    isDirty: boolean
    viewMode: ViewMode
}>()

const emit = defineEmits<{
    'update:name': [value: string]
    'change-view': [mode: ViewMode]
    save: []
}>()
</script>

<template>
    <header class="grid grid-cols-3 px-6 py-7 border-b-1 border-gray-100 dark:border-neutral-800">
        <div>
            <h1 class="font-bold text-2xl max-w-60">
                <input
                    :value="name"
                    placeholder="Inserisci nome.."
                    class="focus-within:outline-2 focus-within:outline-blue-400"
                    @input="emit('update:name', ($event.target as HTMLInputElement).value)"
                />
            </h1>

            <p class="font-jetbrains text-xs text-gray-500 dark:text-neutral-400">
                <span
                    class="w-2 h-2 inline-block rounded-3xl"
                    :class="isDirty ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-green-500 dark:bg-green-400'"
                ></span>

                <span>
                    {{ isDirty ? ' non salvato' : ' salvato' }}
                </span>
            </p>
        </div>

        <div
            class="self-start flex items-center justify-between gap-2 px-1 py-1 rounded-xl bg-gray-100 border border-gray-50 shadow-xs font-medium dark:bg-neutral-800 dark:border-neutral-700"
        >
            <button
                @click="emit('change-view', 'editor')"
                :active="viewMode === 'editor' || null"
                class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
            >
                Editor
            </button>

            <button
                @click="emit('change-view', 'split')"
                :active="viewMode === 'split' || null"
                class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
            >
                Split
            </button>

            <button
                @click="emit('change-view', 'render')"
                :active="viewMode === 'render' || null"
                class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer hover:border-blue-400 hover:bg-white hover:text-blue-400 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300 [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400 dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
            >
                Render
            </button>
        </div>

        <div class="justify-self-end self-start">
            <GeneralButton label="Salva" @click="emit('save')" />
        </div>
    </header>
</template>