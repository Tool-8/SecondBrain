<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  label: string
  to: string
}>()
</script>

<template>
    <li>
        <RouterLink
            :to="to"
            class="block border border-transparent rounded-lg px-4 py-2 text-sm font-medium transition-colors
                    text-gray-500 hover:bg-gray-100 hover:text-gray-700
                    dark:text-neutral-400 dark:hover:border-neutral-800 dark:hover:bg-transparent dark:hover:text-gray-100"
            active-class="text-gray-700 bg-gray-100 dark:text-neutral-300 dark:bg-transparent dark:border-neutral-800"
        >
            {{ label }}
        </RouterLink>
    </li>
</template>