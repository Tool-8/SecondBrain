<script setup lang="ts">
defineProps<{
    id: string,
    name: string
    last_edit: string
    creation: string
}>()
</script>

<template>
    <li>
        <a :href="'/notes/' + id || '#'">
            <div class="px-6 py-4 rounded shadow-xs border border-gray-200 hover:border-blue-500 hover:bg-blue-500/10 dark:border-neutral-800 dark:hover:border-blue-400 dark:hover:bg-blue-400/10">
                <div class="flex flex-col gap-2">
                    <p class="font-bold text-xl dark:text-neutral-200">{{ name }}</p>
                    <div class="flex flex-row items-end justify-between gap-2">
                        <p class="text-gray-500 text-sm dark:text-neutral-400">Data modifica: {{ last_edit }}</p>
                        <p class="text-gray-500 text-sm text-right dark:text-neutral-400">Data creazione: {{ creation }}</p>
                    </div>
                </div>
            </div>
        </a>
    </li>
</template>