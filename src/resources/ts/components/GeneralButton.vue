<script setup lang="ts">
defineProps<{
    label: string
    action?: string
    disabled?: boolean
}>()
</script>

<template>
    <button
        :disabled="disabled"
        class="block border w-full border-blue-400 rounded-lg px-4 py-1 text-sm font-medium text-blue-400 text-center hover:bg-blue-400 hover:text-gray-50
            dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
    >
        {{ label }}
    </button>
</template>