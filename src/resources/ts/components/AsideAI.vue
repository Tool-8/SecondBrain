<script setup lang="ts">
import { computed } from 'vue'
import GeneralButton from '@/components/GeneralButton.vue'

type AiAction = 'summarize' | 'hats' | 'translate' | null
type SummarizeMode = 'short' | 'medium' | 'long'
type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue'
type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es'

const props = defineProps<{
    open: boolean
    action: AiAction
    selectedText: string
    summarizeMode: SummarizeMode
    hatMode: HatMode
    languageMode: LanguageMode
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update:summarizeMode', value: SummarizeMode): void
    (e: 'update:hatMode', value: HatMode): void
    (e: 'update:languageMode', value: LanguageMode): void
    (e: 'run', payload: {
        action: 'summarize' | 'hats' | 'translate'
        selectedText: string
        option: string
    }): void
}>()

const panelTitle = computed(() => {
    if (props.action === 'summarize') return 'Riassumi'
    if (props.action === 'hats') return 'Sei cappelli'
    if (props.action === 'translate') return 'Traduci'
    return 'AI Brain'
})

const actionLabel = computed(() => {
    if (props.action === 'summarize') return 'Riassumi'
    if (props.action === 'hats') return 'Applica cappello'
    if (props.action === 'translate') return 'Traduci'
    return 'Azione'
})

function runAction() {
    if (!props.action) return

    let option = ''

    if (props.action === 'summarize') option = props.summarizeMode
    if (props.action === 'hats') option = props.hatMode
    if (props.action === 'translate') option = props.languageMode

    emit('run', {
        action: props.action,
        selectedText: props.selectedText,
        option,
    })
}
</script>

<template>
    <aside
        class="fixed top-0 right-0 z-50 h-screen w-full max-w-98 border-l border-gray-100 bg-white p-6 transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900"
        :class="open ? 'translate-x-0' : 'translate-x-full'"
    >
        <div class="flex h-full flex-col gap-4">
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="text-xl font-bold">AI Brain</h3>
                    <p class="font-jetbrains text-xs text-gray-500 dark:text-neutral-400">
                        {{ panelTitle }}
                    </p>
                </div>

                <button
                    class="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800"
                    @click="$emit('close')"
                >
                Chiudi
                </button>
            </div>

            <div>
                <p class="pb-1 text-xs text-gray-500 dark:text-neutral-400">Testo selezionato</p>
                <div class="max-h-50 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-800 whitespace-pre-wrap">
                {{ selectedText || 'Nessun testo selezionato' }}
                </div>
            </div>

            <div v-if="action === 'summarize'" class="flex justify-between items-center text-sm" hidden>
                <p>Lunghezza</p>
                <select
                class="rounded border border-gray-300 px-4 py-1 text-sm dark:bg-neutral-800"
                :value="summarizeMode"
                @change="$emit('update:summarizeMode', ($event.target as HTMLSelectElement).value as SummarizeMode)"
                >
                <option value="short">Corto</option>
                <option value="medium">Medio</option>
                <option value="long">Lungo</option>
                </select>
            </div>

            <div v-if="action === 'hats'" class="flex justify-between items-center text-sm">
                <p>Cappello</p>
                <select
                    class="rounded border border-gray-300 px-4 py-1 text-sm dark:bg-neutral-800"
                    :value="hatMode"
                    @change="$emit('update:hatMode', ($event.target as HTMLSelectElement).value as HatMode)"
                >
                    <option value="white">Bianco</option>
                    <option value="red">Rosso</option>
                    <option value="black">Nero</option>
                    <option value="yellow">Giallo</option>
                    <option value="green">Verde</option>
                    <option value="blue">Blu</option>
                </select>
            </div>

            <div v-if="action === 'translate'" class="flex justify-between items-center text-sm">
                <p>Lingua</p>
                <select
                    class="rounded border border-gray-300 px-4 py-1 text-sm dark:bg-neutral-800"
                    :value="languageMode"
                    @change="$emit('update:languageMode', ($event.target as HTMLSelectElement).value as LanguageMode)"
                >
                    <option value="it">Italiano</option>
                    <option value="en">Inglese</option>
                    <option value="fr">Francese</option>
                    <option value="de">Tedesco</option>
                    <option value="es">Spagnolo</option>
                </select>
            </div>

            <GeneralButton :label="actionLabel" @click="runAction" />

            <div class="pt-4">
                <p class="pb-1 text-xs text-gray-500 dark:text-neutral-400">Risultato</p>
                <div class="max-h-60 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-800">
                </div>
            </div>

            <div class="mt-auto">
                <p class="pb-1 text-xs text-gray-500 dark:text-neutral-400">Inserisci testo</p>
                <div class="flex gap-2">
                <GeneralButton label="prima" />
                <GeneralButton label="dopo" />
                <GeneralButton label="sostituisci" />
                </div>
            </div>
        </div>
    </aside>
</template>