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
            class="block border border-blue-400 rounded-lg px-4 py-2 text-sm font-medium text-blue-400 text-center hover:bg-blue-400 hover:text-gray-50
                    dark:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-300"
        >
            {{ label }}
        </RouterLink>
    </li>
</template>