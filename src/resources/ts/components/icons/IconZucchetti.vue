<script setup lang="ts">
withDefaults(
    defineProps<{
        size?: number;
    }>(),
    {
        size: 24,
    }
);
</script>

<template>
    <img
        src="@/../images/zucchetti.jpeg"
        alt=""
        :width="size"
        :height="size"
    />
</template>

<style scoped></style>
