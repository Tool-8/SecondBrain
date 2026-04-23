<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { marked } from 'marked'
import GeneralButton from '@/components/GeneralButton.vue'
import AsideAI from '@/components/AsideAI.vue'

type ViewMode = 'editor' | 'split' | 'render'
type AiAction = 'summarize' | 'hats' | 'translate' | null
type SummarizeMode = 'short' | 'medium' | 'long'
type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue'
type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es'

const viewMode = ref<ViewMode>('split')
const isAiOpen = ref(false)
const aiAction = ref<AiAction>(null)
const selectedText = ref('')

const summarizeMode = ref<SummarizeMode>('short')
const hatMode = ref<HatMode>('white')
const languageMode = ref<LanguageMode>('en')

const noteContent = ref(`**Oggetto**: Discussione su collaborazione con un gruppo universitario per lo sviluppo di un progetto

## Punti principali trattati:

1. **Introduzione all’idea del progetto**  
È stata proposta l'idea di affidare la realizzazione di un progetto [descrivere brevemente il tipo di progetto, es. tecnologico, di ricerca, sociale, ecc.] a un gruppo di studenti universitari. L’obiettivo è coinvolgere i giovani talenti in un’iniziativa che permetta loro di sviluppare competenze pratiche, mentre noi beneficeremmo di nuove idee e approcci.

2. **Definizione dei compiti**  
Si è discusso delle attività specifiche da assegnare al gruppo. Questi includono:
- Analisi preliminare del problema
- Progettazione e sviluppo delle soluzioni
- Presentazione dei risultati e report finale
- Eventuale prototipazione o test di prodotto

3. **Selezione del gruppo universitario**  
È stato deciso di collaborare con [nome dell'università o dipartimento specifico], scegliendo un gruppo che abbia esperienza o interesse nell’ambito del progetto. Verranno contattati i professori di riferimento per selezionare i membri più adatti.

## Conclusioni:  
La riunione si è conclusa con un consenso unanime sull’approccio proposto. Verranno presi i prossimi passi per avviare la collaborazione e definire i dettagli operativi.

Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, iure rerum facere numquam dicta nobis voluptas, ut voluptates accusamus eligendi aspernatur a saepe repellendus, laboriosam repudiandae at perferendis? Totam, ullam?
Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum porro aperiam laborum nobis repellat aliquid mollitia velit numquam, magni quo quisquam, temporibus et? Animi ipsum quibusdam repellendus obcaecati harum ipsam quos, tempora et odio deserunt eius numquam ut repellat deleniti est maxime quas recusandae illum dignissimos voluptatum voluptate autem consectetur? Temporibus aperiam error pariatur facere dicta, molestiae excepturi, officia, quia nihil repudiandae reiciendis cum nulla dolorum magni ex numquam sit recusandae autem. Enim fugiat, quos dolorum recusandae reprehenderit illo libero animi sint, porro ipsa ea quidem. Perspiciatis voluptates tenetur labore aliquid quis inventore magni, voluptatum fuga corporis, necessitatibus sunt cupiditate?
`)
const editorRef = useTemplateRef<HTMLElement>('editor')

marked.setOptions({
    gfm: true,
    breaks: true,
})

const renderedHtml = computed(() => marked.parse(noteContent.value))

function handleEditorInput() {
    if (!editorRef.value) return
    noteContent.value = editorRef.value.innerText
}

function setViewMode(mode: ViewMode) {
    viewMode.value = mode
}

function getSelectedEditorText() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return ''

    const text = selection.toString().trim()
    return text
}

function openAiPanel(action: Exclude<AiAction, null>) {
    const text = getSelectedEditorText()

    if (!text) {
        return
    }

    selectedText.value = text
    aiAction.value = action
    isAiOpen.value = true
}

function closeAiPanel() {
    isAiOpen.value = false
    aiAction.value = null
}

function handleAiRun(payload: {
    action: Exclude<AiAction, null>
    selectedText: string
    option: string
}) {
    console.log('AI payload', payload)
    // chiamata backend
}

onMounted(() => {
    if (!editorRef.value) return
    editorRef.value.innerText = noteContent.value
})
</script>


<template>
    <div id="noteEditor" :class="isAiOpen ? 'blur-xs pointer-events-none select-none overflow-hidden' : ''" class="flex flex-col">
        <!-- FUNCTION CONTAINER -->
        <div class="bg-white dark:bg-neutral-900 sticky top-0">
            <!-- HEADER -->
            <header class="grid grid-cols-3 px-6 py-7 border-b-1 border-gray-100 dark:border-neutral-800">
                <!-- titolo + stato del salvataggio -->
                <div>
                    <h1 class="font-bold text-2xl max-w-60">Nuova nota</h1>
                    <p class="font-jetbrains text-xs text-gray-500 dark:text-neutral-400">
                        <span class="bg-green-500 dark:bg-green-400 w-2 h-2 inline-block rounded-3xl" id="note_save_status_icon"></span>
                        <span id="note_save_status_text"> salvato</span>
                    </p>
                </div>
    
                <!-- switch interfaccia editor | split | render -->
                <div class="self-start flex items-center justify-between gap-2 px-1 py-1 rounded-xl bg-gray-100 border border-gray-50 shadow-xs font-medium dark:bg-neutral-800 dark:border-neutral-700">
                    <button
                        @click="setViewMode('editor')"
                        :active="viewMode === 'editor' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer
                        hover:border-blue-400 hover:bg-white hover:text-blue-400
                        dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300
                        [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400
                        dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >Editor</button>
                    <button
                        @click="setViewMode('split')"
                        :active="viewMode === 'split' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer
                        hover:border-blue-400 hover:bg-white hover:text-blue-400
                        dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300
                        [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400
                        dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >Split</button>
                    <button
                        @click="setViewMode('render')"
                        :active="viewMode === 'render' || null"
                        class="rounded-lg w-full text-gray-600 border border-transparent cursor-pointer
                        hover:border-blue-400 hover:bg-white hover:text-blue-400
                        dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-blue-300 dark:hover:border-blue-300
                        [&[active]]:border-blue-400 [&[active]]:bg-white [&[active]]:text-blue-400
                        dark:[&[active]]:border-blue-300 dark:[&[active]]:bg-neutral-700 dark:[&[active]]:text-blue-300"
                    >Render</button>
                </div>
    
                <!-- tasto salva -->
                <div class="justify-self-end self-start">
                    <GeneralButton label="Salva"/>
                </div>
            </header>
    
            <!-- SUBHEADER -->
            <div class="flex px-6 py-1 border-b-1 border-gray-100 dark:border-neutral-800">
                <!-- tasti stile font grassetto | italico | sottolineato -->
                <div class="pr-4 flex gap-px border-r-1 border-gray-100 dark:border-neutral-800 font-jetbrains">
                    <button class="px-2 font-bold cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800" title="grassetto">B</button>
                    <button class="px-2 font-bold italic cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800" title="italico">I</button>
                    <button class="px-2 font-bold underline cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800" title="sottolineato">U</button>
                </div>
    
                <!-- funzioni AI -->
                <div class="px-4 flex gap-px text-sm font-jetbrains">
                    <button 
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('summarize')"
                    >riassumi</button>
                    <button 
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('hats')"
                    >cappelli</button>
                    <button 
                        class="px-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        @click="openAiPanel('translate')"
                    >traduci</button>
                </div>
    
                <!-- contatore parole e lettere -->
                <div class="font-jetbrains text-xs self-center ml-auto">
                    <p>parole: <span>1000</span> lettere: <span>5000</span></p>
                </div>
            </div>
        </div>
    
        <!-- VIEW CONTAINER -->
        <div id="view_container" class="flex w-full h-full divide-x-1 divide-gray-100 dark:divide-neutral-800 ">
            <!-- EDITOR -->
            <section 
                v-show="viewMode === 'editor' || viewMode === 'split'"
                id="editor" 
                ref="editor"
                class="p-6 flex-1 min-w-0 font-jetbrains h-full focus:outline-none" 
                contenteditable="true"
                @input="handleEditorInput"
            ></section>
    
            <!-- RENDER -->
            <section 
                v-show="viewMode === 'render' || viewMode === 'split'"
                id="render" 
                class="p-6 flex-1 min-w-0 overflow-auto"
            >
                <div class="prose max-w-none dark:prose-invert" v-html="renderedHtml"></div>
            </section>
        </div>
    </div>

    <!-- AI FUNCTION CONTAINER -->
    <AsideAI
        :open="isAiOpen"
        :action="aiAction"
        :selected-text="selectedText"
        :summarize-mode="summarizeMode"
        :hat-mode="hatMode"
        :language-mode="languageMode"
        @close="closeAiPanel"
        @update:summarizeMode="summarizeMode = $event"
        @update:hatMode="hatMode = $event"
        @update:languageMode="languageMode = $event"
        @run="handleAiRun"
    />
</template>