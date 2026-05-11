<script setup lang="ts">
import { computed } from 'vue';
import GeneralButton from '@/components/GeneralButton.vue';
import { useToast } from '@/composables/useToast';
import IconLoading from '@/components/icons/IconLoading.vue';

const { successToast, errorToast } = useToast();

type AiAction =
    | 'summarize'
    | 'hats'
    | 'translate'
    | 'rewrite'
    | 'distant writing'
    | null;
type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue';
type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es';
type RewriteStyle = 'grammar' | 'extension' | 'lexicon' | 'stylistic';

const props = defineProps<{
    open: boolean;
    action: AiAction;
    selectedText: string;
    result: string;
    loading: boolean;
    hatMode: HatMode;
    languageMode: LanguageMode;
    rewriteStyle: RewriteStyle[];
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:hatMode', value: HatMode): void;
    (e: 'update:languageMode', value: LanguageMode): void;
    (e: 'update:rewriteStyle', value: RewriteStyle[]): void;
    (
        e: 'run',
        payload: {
            action:
                | 'summarize'
                | 'hats'
                | 'translate'
                | 'rewrite'
                | 'distant writing';
            selectedText: string;
            option: string;
        }
    ): void;
    (e: 'insert', mode: 'before' | 'after' | 'replace' | 'bottom'): void;
}>();

const panelTitle = computed(() => {
    if (props.action === 'summarize') return 'Riassumi';
    if (props.action === 'rewrite') return 'Riscrivi';
    if (props.action === 'distant writing') return 'Distant writing';
    if (props.action === 'hats') return 'Sei cappelli';
    if (props.action === 'translate') return 'Traduci';
    return 'AI Brain';
});

const actionLabel = computed(() => {
    if (props.action === 'summarize') return 'Riassumi';
    if (props.action === 'rewrite') return 'Riscrivi';
    if (props.action === 'distant writing') return 'Genera';
    if (props.action === 'hats') return 'Applica cappello';
    if (props.action === 'translate') return 'Traduci';
    return 'Azione';
});

function toggleStyle(style: RewriteStyle) {
    const current = [...props.rewriteStyle];
    const index = current.indexOf(style);
    if (index > -1) {
        if (current.length > 1) {
            current.splice(index, 1);
            emit('update:rewriteStyle', current);
        }
    } else {
        current.push(style);
        emit('update:rewriteStyle', current);
    }
}

function copyToClipboard() {
    if (!props.result) return;

    navigator.clipboard
        .writeText(props.result)
        .then(() => {
            successToast('Copiato', 'Risultato copiato negli appunti');
        })
        .catch((err) => {
            errorToast(
                'Errore durante la copia',
                'Qualcosa è andato storto durante la copia'
            );
        });
}

function runAction() {
    if (!props.action) return;

    let option = '';
    if (props.action === 'hats') option = props.hatMode;
    if (props.action === 'translate') option = props.languageMode;
    if (props.action === 'rewrite') option = props.rewriteStyle.join(',');

    emit('run', {
        action: props.action,
        selectedText: props.selectedText,
        option,
    });
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
                    <p
                        class="font-jetbrains text-xs text-gray-500 dark:text-neutral-400"
                    >
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
                <p class="pb-1 text-xs text-gray-500 dark:text-neutral-400">
                    Testo selezionato
                </p>
                <div
                    class="max-h-40 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-800 whitespace-pre-wrap"
                >
                    {{ selectedText || 'Nessun testo selezionato' }}
                </div>
            </div>

            <div
                v-if="action === 'hats'"
                class="flex justify-between items-center text-sm"
            >
                <p>Cappello</p>
                <select
                    class="rounded border border-gray-300 px-4 py-1 text-sm dark:bg-neutral-800"
                    :value="hatMode"
                    @change="
                        $emit(
                            'update:hatMode',
                            ($event.target as HTMLSelectElement)
                                .value as HatMode
                        )
                    "
                >
                    <option value="white">Bianco</option>
                    <option value="red">Rosso</option>
                    <option value="black">Nero</option>
                    <option value="yellow">Giallo</option>
                    <option value="green">Verde</option>
                    <option value="blue">Blu</option>
                </select>
            </div>

            <div
                v-if="action === 'translate'"
                class="flex justify-between items-center text-sm"
            >
                <p>Lingua</p>
                <select
                    class="rounded border border-gray-300 px-4 py-1 text-sm dark:bg-neutral-800"
                    :value="languageMode"
                    @change="
                        $emit(
                            'update:languageMode',
                            ($event.target as HTMLSelectElement)
                                .value as LanguageMode
                        )
                    "
                >
                    <option value="it">Italiano</option>
                    <option value="en">Inglese</option>
                    <option value="fr">Francese</option>
                    <option value="de">Tedesco</option>
                    <option value="es">Spagnolo</option>
                </select>
            </div>

            <div v-if="action === 'rewrite'" class="flex flex-col gap-2">
                <p class="text-sm">Stile riscrittura</p>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="style in [
                            'grammar',
                            'extension',
                            'lexicon',
                            'stylistic',
                        ] as RewriteStyle[]"
                        :key="style"
                        type="button"
                        @click="toggleStyle(style)"
                        :class="[
                            'px-3 py-1 rounded-full border transition-colors text-xs capitalize',
                            rewriteStyle.includes(style)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-transparent border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700',
                        ]"
                    >
                        {{ style }}
                    </button>
                </div>
            </div>

            <GeneralButton
                :label="actionLabel"
                @click="runAction"
                :disabled="loading"
            >
                <template #icon>
                    <IconLoading v-if="loading" class="self-start" />
                </template>
            </GeneralButton>

            <div class="pt-2">
                <div class="flex justify-between items-center pb-1">
                    <p class="text-xs text-gray-500 dark:text-neutral-400">
                        Risultato
                    </p>
                    <button
                        v-if="result"
                        @click="copyToClipboard"
                        class="text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        Copia
                    </button>
                </div>
                <div
                    class="max-h-60 overflow-auto rounded bg-gray-100 p-2 dark:bg-neutral-800"
                >
                    {{ result || '' }}
                </div>
            </div>

            <div class="mt-auto">
                <p class="pb-1 text-xs text-gray-500 dark:text-neutral-400">
                    Inserisci testo
                </p>
                <div class="grid grid-cols-3 gap-2">
                    <GeneralButton
                        label="prima"
                        :disabled="loading"
                        @click="$emit('insert', 'before')"
                    />
                    <GeneralButton
                        label="dopo"
                        :disabled="loading"
                        @click="$emit('insert', 'after')"
                    />
                    <GeneralButton
                        label="sostituisci"
                        :disabled="loading"
                        @click="$emit('insert', 'replace')"
                    />
                    <GeneralButton
                        label="in fondo alla pagina"
                        class="col-span-3"
                        :disabled="loading"
                        @click="$emit('insert', 'bottom')"
                    />
                </div>
            </div>
        </div>
    </aside>
</template>
