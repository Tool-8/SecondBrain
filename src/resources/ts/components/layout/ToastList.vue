<script setup lang="ts">
import { useToast } from '@/composables/useToast';
import ActionToast from './../ActionToast.vue';
const { toasts, removeToast } = useToast();
</script>

<template>
    <div class="fixed top-3 right-3 z-50 w-90">
        <TransitionGroup name="toastlist" tag="ul"
            class="flex flex-col gap-3" appear
        >
            <li v-for="toast in toasts" :key="toast.id">
                <ActionToast
                    :title="toast.title"
                    :message="toast.message"
                    :type="toast.type"
                    @close="removeToast(toast.id)"
                />
            </li>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toastlist-enter-active {
    animation: slide-in 0.3s ease-out;
}
.toastlist-leave-active {
    animation: slide-out 0.3s ease-out;
}
</style>
