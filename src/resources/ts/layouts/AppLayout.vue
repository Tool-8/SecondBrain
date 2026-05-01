<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="flex min-h-screen">
        <AppSidebar />

        <main class="flex flex-col flex-1 bg-white overflow-x-hidden dark:bg-neutral-900 dark:text-gray-50">
            <RouterView :key="$route.fullPath" />
        </main>
    </div>
</template>