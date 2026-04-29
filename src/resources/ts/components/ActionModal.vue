<script setup lang="ts">
import BaseModal from '@/components/layout/BaseModal.vue';
import { useModals } from '@/composables/useModals';

const { RenamePromise, DeletePromise, ClonePromise } = useModals();
</script>

<template>
    <!-- Modale per la rinomina -->
    <RenamePromise v-slot="{ resolve, args }">
        <BaseModal title="Rinomina nota">
            <template #body>
                <label for="Name">
                    <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Nuovo nome
                    </span>
                    <input
                        type="text"
                        v-model="args[0]"
                        class="mt-1 p-2 w-full rounded border border-gray-200 pe-10 shadow-xs sm:text-sm focus:outline-blue-400 focus:outline-1 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                </label>
            </template>
            <template #footer>
                <button
                    @click="resolve(null)"
                    class="cursor-pointer min-w-22 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(args[0])"
                    class="cursor-pointer min-w-22 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                    OK
                </button>
            </template>
        </BaseModal>
    </RenamePromise>

    <!-- Modale per la conferma dell'elimina -->
    <DeletePromise v-slot="{ resolve }">
        <BaseModal title="Conferma elimina">
            <template #body>
                <div class="mt-4">
                    <p class="text-pretty text-gray-700 dark:text-gray-200">
                        Una volta eliminata la nota non sarà più possibile
                        recuperarla.
                    </p>
                </div>
            </template>
            <template #footer>
                <button
                    @click="resolve(false)"
                    class="cursor-pointer min-w-22 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(true)"
                    class="cursor-pointer min-w-22 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 "
                >
                    Conferma
                </button>
            </template>
        </BaseModal>
    </DeletePromise>

    <!-- Modale per la clonazione -->
    <ClonePromise v-slot="{ resolve, args }">
        <BaseModal title="Clona nota">
            <template #body>
                <label for="Name">
                    <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                        Nome della nota clonata
                    </span>
                    <input
                        type="text"
                        v-model="args[0]"
                        class="mt-1 p-2 w-full rounded border border-gray-200 pe-10 shadow-xs sm:text-sm focus:outline-blue-400 focus:outline-1 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                </label>
            </template>
            <template #footer>
                <button
                    @click="resolve(null)"
                    class="cursor-pointer min-w-22 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(args[0])"
                    class="cursor-pointer min-w-22 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                    OK
                </button>
            </template>
        </BaseModal>
    </ClonePromise>
</template>

<style scoped></style>
