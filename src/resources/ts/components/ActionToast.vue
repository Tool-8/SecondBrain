<script setup lang="ts">
import type { ToastType } from '@/composables/useToast';
import IconCheck from '@/components/icons/IconCheck.vue';
import IconWarning from '@/components/icons/IconWarning.vue';
import IconError from '@/components/icons/IconError.vue';
import IconInfo from '@/components/icons/IconInfo.vue';
import { computed } from 'vue';
import IconClose from '@/components/icons/IconClose.vue';

const props = defineProps<{
    title: string;
    message: string;
    type: ToastType;
}>();

defineEmits<{
    close: [];
}>();

const toastColorMap: Record<ToastType, string> = {
    success:
        'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-800',
    error: 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-800',
    warning:
        'border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-800',
    info: 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-800',
};

const toastCancelButtonColorMap: Record<ToastType, string> = {
    success:
        'border-green-500 bg-green-50 hover:bg-green-500 dark:border-green-400 dark:bg-green-800 dark:hover:bg-green-400 text-green-700 hover:text-green-200 dark:text-green-200 dark:hover:text-green-700',
    error: 'border-red-500 bg-red-50 hover:bg-red-500 dark:border-red-400 dark:bg-red-800 dark:hover:bg-red-400 text-red-700 hover:text-red-200 dark:text-red-200 dark:hover:text-red-700',
    warning:
        'border-yellow-500 bg-yellow-50 hover:bg-yellow-500 dark:border-yellow-400 dark:bg-yellow-800 dark:hover:bg-yellow-400 text-yellow-700 hover:text-yellow-200 dark:text-yellow-200 dark:hover:text-yellow-700',
    info: 'border-blue-500 bg-blue-50 hover:bg-blue-500 dark:border-blue-400 dark:bg-blue-800 dark:hover:bg-blue-400 text-blue-700 hover:text-blue-200 dark:text-blue-200 dark:hover:text-blue-700',
};

const toastIconColorMap: Record<ToastType, string> = {
    success: 'text-green-700 dark:text-green-200',
    error: 'text-red-700 dark:text-red-200',
    warning: 'text-yellow-700 dark:text-yellow-200',
    info: 'text-blue-700 dark:text-blue-200',
};

const toastTitleColorMap: Record<ToastType, string> = {
    success: 'text-green-800 dark:text-green-100',
    error: 'text-red-800 dark:text-red-100',
    warning: 'text-yellow-800 dark:text-yellow-100',
    info: 'text-blue-800 dark:text-blue-100',
};

const toastMessageColorMap: Record<ToastType, string> = {
    success: 'text-green-700 dark:text-green-200',
    error: 'text-red-700 dark:text-red-200',
    warning: 'text-yellow-700 dark:text-yellow-200',
    info: 'text-blue-700 dark:text-blue-200',
};

const toastIconMap: Record<ToastType, any> = {
    success: IconCheck,
    error: IconError,
    warning: IconWarning,
    info: IconInfo,
};

const icon = computed(() => toastIconMap[props.type]);
</script>

<template>
    <div
        role="alert"
        :class="`rounded-md border p-4 shadow-sm ${toastColorMap[type]}`"
    >
        <div class="flex items-start gap-4">
            <component
                :is="icon"
                size="26"
                :color="toastIconColorMap[type]"
            />

            <div class="flex-1">
                <strong
                    :class="`block leading-tight font-medium ${toastTitleColorMap[type]}`"
                >
                    {{ title }}
                </strong>

                <p :class="`mt-0.5 text-sm ${toastMessageColorMap[type]}`">
                    {{ message }}
                </p>
            </div>

            <button
                :class="`rounded-sm border ${toastCancelButtonColorMap[type]} p-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:pointer-events-auto disabled:opacity-50`"
                @click="$emit('close')"
            >
                <IconClose size="14" color="currentColor" />
            </button>
        </div>
    </div>
</template>
