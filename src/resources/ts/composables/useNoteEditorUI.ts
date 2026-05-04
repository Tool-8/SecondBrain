import { computed, ref, type Ref } from 'vue'
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'
import { useAi } from '@/composables/useAi'
import { AiTone } from '@/services/aiService'

export type ViewMode = 'editor' | 'split' | 'render'
export type AiAction = 'summarize' | 'hats' | 'translate' | 'rewrite' | null
export type SummarizeMode = 'short' | 'medium' | 'long'
export type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue'
export type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es'
export type RewriteStyle = 'grammar' | 'extension' | 'lexicon' | 'stylistic'
export type InsertMode = 'before' | 'after' | 'replace'

marked.setOptions({
    gfm: true,
    breaks: true,
})

export function useNoteEditorUI(options: {
    noteContent: Ref<string>
    setEditorContent: (html: string) => void
}) {
    const { warningToast } = useToast()
    const {
        result,
        error,
        loading,
        translate,
        summarize,
        rewrite,
        distantWriting,
        bluehat,
        redhat,
        yellowhat,
        greenhat,
        whitehat,
        blackhat,
    } = useAi();

    const editorRef = ref<HTMLElement | null>(null)

    const viewMode = ref<ViewMode>('split')
    const isAiOpen = ref(false)
    const aiAction = ref<AiAction>(null)
    const selectedText = ref('')
    const aiResult = ref('')
    const selectedRange = ref<Range | null>(null)

    const summarizeMode = ref<SummarizeMode>('medium')
    const hatMode = ref<HatMode>('white')
    const languageMode = ref<LanguageMode>('en')
    const rewriteStyle = ref<RewriteStyle[]>(['grammar'])

    const warnedParents = new Set<string>()
    const warnedChildren = new Set<string>()

    const plainContent = computed(() => {
        return htmlToMarkdownText(options.noteContent.value)
    })

    const renderedHtml = computed(() => {
        return marked.parse(plainContent.value)
    })

    const wordCount = computed(() => {
        if (!plainContent.value.trim()) return 0
        return plainContent.value.trim().split(/\s+/).filter(Boolean).length
    })

    const charCount = computed(() => {
        return plainContent.value.length
    })

    function setEditorRef(element: HTMLElement) {
        editorRef.value = element
    }

    function setViewMode(mode: ViewMode) {
        viewMode.value = mode
    }

    function handleEditorInput() {
        if (!editorRef.value) return
        options.setEditorContent(editorRef.value.innerHTML)
    }

    function undoEdit() {
        editorRef.value?.focus()
        document.execCommand('undo')
        handleEditorInput()
    }

    function redoEdit() {
        editorRef.value?.focus()
        document.execCommand('redo')
        handleEditorInput()
    }

    function applyFormat(type: 'bold' | 'italic' | 'underline') {
        if (!editorRef.value) return

        editorRef.value.focus()

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const text = selection.toString()

        if (!text.trim()) {
        warningToast('Attenzione', 'Seleziona del testo')
        return
        }

        const wrappers = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        underline: ['<u>', '</u>'],
        } as const

        const [start, end] = wrappers[type]

        const alreadyWrapped = text.startsWith(start) && text.endsWith(end)

        const formattedText = alreadyWrapped
        ? text.slice(start.length, text.length - end.length)
        : `${start}${text}${end}`

        document.execCommand('insertText', false, formattedText)

        handleEditorInput()
    }

    function openAiPanel(action: Exclude<AiAction, null>) {
        const selection = window.getSelection()

        if (!selection || selection.rangeCount === 0) return

        const text = selection.toString().trim()

        if (!text) {
        warningToast(
            'Attenzione',
            'Seleziona del testo prima di usare questa funzione AI.'
        )
        return
        }

        selectedRange.value = selection.getRangeAt(0).cloneRange()
        selectedText.value = text
        aiAction.value = action
        isAiOpen.value = true
    }

    function closeAiPanel() {
        isAiOpen.value = false
        aiAction.value = null
    }

    async function handleAiRun(payload: {
        action: Exclude<AiAction, null>
        selectedText: string
        option: string
    }) {

        switch (payload.action) {
            case 'summarize':
                await summarize(payload.selectedText);
                break;
            case 'rewrite':
                const stylesArray = payload.option.split(',')
                const activeStyles = stylesArray as [AiTone, ...AiTone[]]
                await rewrite(payload.selectedText, activeStyles);
                break;
            default:
                console.log('Hello');
                return null;
        }

        if (error.value) {
            warningToast('Errore AI', error.value)
            return
        }
        
        aiResult.value = result.value as string;
    }

    function stripAiMarkers(html: string) {
        const div = document.createElement('div')
        div.innerHTML = html

        div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach(el => {
        el.replaceWith(document.createTextNode(el.textContent || ''))
        })

        return div.innerText
    }

    function createAiGroupId() {
        return crypto.randomUUID()
    }

    function getNextAiIndex() {
        if (!editorRef.value) return 1
        return editorRef.value.querySelectorAll('[data-ai-child]').length + 1
    }

    function createAiBlock(options: {
        type: 'parent' | 'child'
        groupId: string
        aiIndex: number
        text: string
    }) {
        const block = document.createElement('div')

        block.className = `ai-marker ai-${options.type}`

        if (options.type === 'parent') {
        block.dataset.aiParent = options.groupId
        block.dataset.aiLabel = `AI #${options.aiIndex} input`
        } else {
        block.dataset.aiChild = options.groupId
        block.dataset.aiLabel = `AI #${options.aiIndex} output`
        }

        block.textContent = options.text

        return block
    }

    function createExitBlock() {
        const exit = document.createElement('div')
        exit.className = 'normal-edit-zone'
        exit.dataset.normalBlock = 'true'
        exit.innerHTML = '<br>'
        return exit
    }

    function moveCursorToElement(element: HTMLElement) {
        editorRef.value?.focus()

        const range = document.createRange()
        range.selectNodeContents(element)
        range.collapse(true)

        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
    }

    function moveOutsideAiBlock() {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return false

        const node = selection.anchorNode

        const el = node instanceof HTMLElement
        ? node
        : node?.parentElement

        if (!el) return false

        const aiBlock = el.closest('[data-ai-parent], [data-ai-child]') as HTMLElement | null
        if (!aiBlock) return false

        const exit = createExitBlock()

        aiBlock.after(exit)
        moveCursorToElement(exit)

        handleEditorInput()

        return true
    }

    function escapeHtml(value: string) {
        const div = document.createElement('div')
        div.textContent = value
        return div.innerHTML
    }

    function createAiBlockHtml(options: {
        type: 'parent' | 'child'
        groupId: string
        aiIndex: number
        text: string
        hidden?: boolean
        }) {
        const attr =
            options.type === 'parent'
            ? `data-ai-parent="${options.groupId}" data-ai-label="AI #${options.aiIndex} input"`
            : `data-ai-child="${options.groupId}" data-ai-label="AI #${options.aiIndex} output"`

        return `
            <div
            class="ai-marker ai-${options.type}"
            ${attr}
            ${options.hidden ? 'hidden' : ''}
            >${escapeHtml(options.text)}</div>
        `
    }

    function createExitBlockHtml() {
        return `
            <div class="normal-edit-zone" data-normal-block="true"><br></div>
        `
    }

    function insertAiResult(mode: InsertMode) {
        if (!editorRef.value || !selectedRange.value || !aiResult.value) return

        editorRef.value.focus()

        const groupId = createAiGroupId()
        const aiIndex = getNextAiIndex()

        const range = selectedRange.value.cloneRange()
        const selected = range.toString()

        const parentHtml = createAiBlockHtml({
            type: 'parent',
            groupId,
            aiIndex,
            text: selected,
            hidden: mode === 'replace',
        })

        const childHtml = createAiBlockHtml({
            type: 'child',
            groupId,
            aiIndex,
            text: aiResult.value,
        })

        const exitHtml = createExitBlockHtml()

        let html = ''

        if (mode === 'replace') {
            html = childHtml + exitHtml
        }

        if (mode === 'before') {
            html = childHtml + parentHtml + exitHtml
        }

        if (mode === 'after') {
            html = parentHtml + childHtml + exitHtml
        }

        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)

        document.execCommand('insertHTML', false, html)

        const exit = editorRef.value.querySelector(
            '[data-normal-block="true"]:last-child'
        ) as HTMLElement | null

        if (exit) {
            moveCursorToElement(exit)
        }

        handleEditorInput()
        closeAiPanel()
        }

    function handleBeforeInput() {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const node = selection.anchorNode

        const el = node instanceof HTMLElement
        ? node
        : node?.parentElement

        if (!el) return

        const parentMarker = el.closest('[data-ai-parent]') as HTMLElement | null
        const childMarker = el.closest('[data-ai-child]') as HTMLElement | null

        if (parentMarker) {
        const id = parentMarker.dataset.aiParent

        if (id && !warnedParents.has(id)) {
            warnedParents.add(id)

            warningToast(
            'Attenzione',
            'Stai modificando testo da cui è stato generato testo AI.'
            )
        }
        }

        if (childMarker) {
        const id = childMarker.dataset.aiChild

        if (id && !warnedChildren.has(id)) {
            warnedChildren.add(id)

            warningToast(
            'Attenzione',
            'Stai modificando testo generato da AI.'
            )
        }
        }
    }

    function htmlToMarkdownText(html: string) {
        const div = document.createElement('div')
        div.innerHTML = html

        div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach(
            (el) => {
                if (el.previousSibling?.nodeType === Node.TEXT_NODE) {
                    el.previousSibling.textContent =
                        el.previousSibling.textContent?.replace(
                            /[ \t]+$/,
                            ''
                        ) ?? '';
                }
                if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
                    el.nextSibling.textContent =
                        el.nextSibling.textContent?.replace(/^[ \t]+/, '') ??
                        '';
                }

                el.replaceWith(document.createTextNode(el.textContent || '')); // niente trim
            }
        );

        div.querySelectorAll('div, p, br').forEach(el => {
        el.after(document.createTextNode('\n'))
        })

        return div.textContent || ''
    }

    function handlePaste(event: ClipboardEvent) {
        event.preventDefault()

        const text = event.clipboardData?.getData('text/plain') || ''

        document.execCommand('insertText', false, text)
        handleEditorInput()
    }

    function handleEditorKeydown(event: KeyboardEvent) {
        if (event.key !== 'Enter') return

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const node = selection.anchorNode

        const el = node instanceof HTMLElement
        ? node
        : node?.parentElement

        if (!el) return

        const aiBlock = el.closest('[data-ai-parent], [data-ai-child]') as HTMLElement | null

        if (!aiBlock) return

        event.preventDefault()
        moveOutsideAiBlock()
    }

    return {
        viewMode,
        isAiOpen,
        aiAction,
        selectedText,
        aiResult,
        loading,
        summarizeMode,
        hatMode,
        languageMode,
        rewriteStyle,
        renderedHtml,
        wordCount,
        charCount,
        setViewMode,
        setEditorRef,
        handleEditorInput,
        undoEdit,
        redoEdit,
        applyFormat,
        openAiPanel,
        closeAiPanel,
        handleAiRun,
        insertAiResult,
        handleBeforeInput,
        handlePaste,
        handleEditorKeydown,
        stripAiMarkers,
    }
}
