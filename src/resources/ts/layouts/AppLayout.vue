<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="flex min-h-screen">
        <AppSidebar />

        <main class="flex-1 p-6 bg-white dark:bg-neutral-900 dark:text-gray-50">
            <RouterView />
        </main>
    </div>
</template>