<script setup lang="ts">
import GeneralButton from '@/components/GeneralButton.vue';
import { useNoteEditor } from '@/composables/useNoteEditor';
const { saveTheNote, saveTheNoteAs, isNew } = useNoteEditor();
</script>

<template>
    <div class="flex flex-row gap-2 justify-end">
        <div class="self-start">
            <GeneralButton
                label="Salva con nome"
                class="disabled:opacity-50 disabled:pointer-events-none"
                :disabled="isNew"
                @click="saveTheNoteAs"
            />
        </div>
        <div class="self-start">
            <GeneralButton
                label="Salva"
                @click="saveTheNote"
            />
        </div>
    </div>
</template>
