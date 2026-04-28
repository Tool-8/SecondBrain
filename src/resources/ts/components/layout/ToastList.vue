<script setup lang="ts">
import { useToast } from '@/composables/useToast';
import ActionToast from './../ActionToast.vue';
const { toasts, removeToast } = useToast();
</script>

<template>
    <div class="fixed top-3 right-3 z-50 w-90">
        <TransitionGroup 
            name="toastlist" 
            tag="ul"
            class="flex flex-col gap-3" 
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-x-full opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition-all duration-300 ease-out"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="translate-x-full opacity-0"
            appear
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