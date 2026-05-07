<script setup lang="ts">
const props = defineProps<{
    title: string;
}>();
</script>

<template>
    <div
        role="dialog"
        class="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
    >
        <div
            class="w-full max-w-xl min-w-100 rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900 dark:text-white"
        >
            <slot name="header">
                <h2
                    class="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white"
                >
                    {{ props.title }}
                </h2>
            </slot>
            <div class="mt-4">
                <slot name="body" />
            </div>

            <footer class="mt-6 flex justify-end gap-2">
                <slot name="footer" />
            </footer>
        </div>
    </div>
</template>

<style scoped></style>
