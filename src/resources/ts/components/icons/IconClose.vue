<script setup lang="ts">
withDefaults(
    defineProps<{
        size?: number;
        color?: string;
    }>(),
    {
        size: 24,
        color: 'currentColor',
    }
);
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        :class="color"
        stroke="currentColor"
        :stroke-width="2"
        fill="none"
        viewBox="0 0 24 24"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
        />
    </svg>
</template>

<style scoped></style>
