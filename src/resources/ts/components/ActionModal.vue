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
                        Nuovo Nome
                    </span>
                    <input
                        type="text"
                        v-model="args[0]"
                        class="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                </label>
            </template>
            <template #footer>
                <button
                    @click="resolve(null)"
                    class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(args[0])"
                    class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
                    class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(true)"
                    class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
                        class="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                </label>
            </template>
            <template #footer>
                <button
                    @click="resolve(null)"
                    class="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                    Annulla
                </button>
                <button
                    @click="resolve(args[0])"
                    class="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    OK
                </button>
            </template>
        </BaseModal>
    </ClonePromise>
</template>

<style scoped></style>
