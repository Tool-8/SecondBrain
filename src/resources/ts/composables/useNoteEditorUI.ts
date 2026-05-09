import { computed, ref, type Ref } from 'vue'
import { marked } from 'marked'
import { useToast } from '@/composables/useToast'
import { useAi } from '@/composables/useAi'
import { AiLang, AiTone } from '@/services/aiService'

export type ViewMode = 'editor' | 'split' | 'render'
export type AiAction = 'summarize' | 'hats' | 'translate' | 'rewrite' | 'distant writing' | null
export type HatMode = 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue'
export type LanguageMode = 'it' | 'en' | 'fr' | 'de' | 'es'
export type RewriteStyle = 'grammar' | 'extension' | 'lexicon' | 'stylistic'
export type InsertMode = 'before' | 'after' | 'replace' | 'bottom'

marked.use({
  renderer: {
    link({ href, title, text }) {
      const fixedHref = /^https?:\/\//.test(href) ? href : `https://${href}`;
      return `<a href="${fixedHref}" target="_blank" rel="noopener noreferrer"${title ? ` title="${title}"` : ''}>${text}</a>`;
    }
  }
});

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

    function formatList(text: string, type: 'ordered_list' | 'unordered_list'): string {
        const prefix = type === 'unordered_list' ? /^(\s*)[-*]\s/ : /^(\s*)\d+\.\s/
        const lines = text.split('\n')
        const allHavePrefix = lines.every(line => prefix.test(line))
        return lines.map((line, i) =>
            allHavePrefix
                ? line.replace(prefix, '$1')
                : prefix.test(line) ? line : `${line.match(/^(\s*)/)?.[1] ?? ''}${type === 'unordered_list' ? '- ' : `${i + 1}. `}${line.trimStart()}`
        ).join('\n')
    }

    function applyFormat(type: 'bold' | 'italic' | 'underline'| 'strikethrough' | 'comment' | 'link' | 'ordered_list' | 'unordered_list') {
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
        strikethrough: ['~~', '~~'],
        comment: ['<!--[Inizio commento]\n', '\n[Fine commento]-->'],
        link: ['[', '](www.example.com)'],
        ordered_list: ['', ''],
        unordered_list: ['', '']
        } as const

        const [start, end] = wrappers[type]

        if (type === 'link') {
            const match = text.match(/^\[(.*?)\]\((.*?)\)$/)

            const formattedText = match
                ? match[1]
                : `${start}${text}${end}`

            document.execCommand('insertText', false, formattedText)
        } else if (type === 'ordered_list' || type === 'unordered_list') {
            document.execCommand('insertText', false, formatList(text, type))
        } else {
            const alreadyWrapped = text.startsWith(start) && text.endsWith(end)

            const formattedText = alreadyWrapped
                ? text.slice(start.length, text.length - end.length)
                : `${start}${text}${end}`

            document.execCommand('insertText', false, formattedText)
        }

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
            case 'hats': {
                const hatFunctions: Record<string, (text: string) => Promise<void>> = {
                    white: whitehat,
                    red: redhat,
                    black: blackhat,
                    yellow: yellowhat,
                    green: greenhat,
                    blue: bluehat,
                };

                const selectedHatFn = hatFunctions[payload.option];

                if (selectedHatFn) await selectedHatFn(payload.selectedText);
                break;
            }
            case 'translate':
                await translate(payload.selectedText, payload.option as AiLang)
                break;
            case 'distant writing':
                await distantWriting(payload.selectedText)
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
            el.querySelectorAll('[data-ai-retranslate]').forEach(button => button.remove())

            const content = el.querySelector('[data-ai-content]') as HTMLElement | null
            el.replaceWith(document.createTextNode(content?.textContent || el.textContent || ''))
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
        action?: Exclude<AiAction, null>
        lang?: LanguageMode
        sourceChildId?: string
    }) {

        const attr =
            options.type === 'parent'
                ? `data-ai-parent="${options.groupId}" data-ai-label="AI #${options.aiIndex} input"`
                : `
                    data-ai-child="${options.groupId}"
                    data-ai-label="AI #${options.aiIndex} output"
                    data-ai-action="${options.action ?? ''}"
                    data-ai-lang="${options.lang ?? ''}"
                    data-ai-source-child="${options.sourceChildId ?? ''}"
                `

        const retranslateButton =
            options.type === 'child' && options.action === 'translate'
                ? `<button type="button" data-ai-retranslate="true" contenteditable="false" class="ai-retranslate-btn hidden">Ritraduci</button>`
                : ''

        return `
            <div
                class="ai-marker ai-${options.type}"
                ${attr}
                ${options.hidden ? 'hidden' : ''}
            >
                <span data-ai-content="true">${escapeHtml(options.text)}</span>
                ${retranslateButton}
            </div>
        `
    }

    function createExitBlockHtml() {
        return `
            <div class="normal-edit-zone" data-normal-block="true"><br></div>
        `
    }

    function getAiBlockFromRange(range: Range) {
        const node = range.commonAncestorContainer
        const el = node instanceof HTMLElement ? node : node.parentElement

        return el?.closest('[data-ai-parent], [data-ai-child]') as HTMLElement | null
    }

    function insertHtmlOutsideElement(
        target: HTMLElement,
        html: string,
        mode: 'before' | 'after'
    ) {
        target.insertAdjacentHTML(mode === 'before' ? 'beforebegin' : 'afterend', html)
    }

    function insertAiResult(mode: InsertMode) {
        if (!editorRef.value || !selectedRange.value || !aiResult.value) return

        editorRef.value.focus()

        const groupId = createAiGroupId()
        const aiIndex = getNextAiIndex()

        const range = selectedRange.value.cloneRange()
        const selected = range.toString()

        const aiBlock = getAiBlockFromRange(range)
        const sourceChildId = aiBlock?.dataset.aiChild

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
            action: aiAction.value ?? undefined,
            lang: aiAction.value === 'translate' ? languageMode.value : undefined,
            sourceChildId: aiAction.value === 'translate' ? sourceChildId : undefined,
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

        if (aiBlock && mode === 'replace') {
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)

            document.execCommand('insertHTML', false, escapeHtml(aiResult.value))

            handleEditorInput()
            closeAiPanel()
            return
        }

        if (aiBlock && (mode === 'before' || mode === 'after')) {
            const outputOnlyHtml = childHtml + exitHtml

            insertHtmlOutsideElement(aiBlock, outputOnlyHtml, mode)

            const exit = editorRef.value.querySelector(
                '[data-normal-block="true"]:last-child'
            ) as HTMLElement | null

            if (exit) moveCursorToElement(exit)

            handleEditorInput()
            closeAiPanel()
            return
        }

        if (mode === 'bottom') {
            html = childHtml + exitHtml

            editorRef.value.insertAdjacentHTML('beforeend', html)

            const exit = editorRef.value.querySelector(
                '[data-normal-block="true"]:last-child'
            ) as HTMLElement | null

            if (exit) moveCursorToElement(exit)

            handleEditorInput()
            closeAiPanel()
            return
        }

        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)

        document.execCommand('insertHTML', false, html)

        const exit = editorRef.value.querySelector(
            '[data-normal-block="true"]:last-child'
        ) as HTMLElement | null

        if (exit) moveCursorToElement(exit)

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
            const child = editorRef.value?.querySelector(
                `[data-ai-child="${id}"][data-ai-action="translate"]`
            ) as HTMLElement | null

            if (child) {
                child.dataset.aiDirty = 'true'

                const button = child.querySelector('[data-ai-retranslate]') as HTMLElement | null
                button?.classList.remove('hidden')
            }

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

            if (id) {
                const translatedChildren = editorRef.value?.querySelectorAll(
                    `[data-ai-source-child="${id}"][data-ai-action="translate"]`
                )

                translatedChildren?.forEach(child => {
                    const translatedChild = child as HTMLElement

                    translatedChild.dataset.aiDirty = 'true'

                    const button = translatedChild.querySelector('[data-ai-retranslate]') as HTMLElement | null
                    button?.classList.remove('hidden')
                })
            }

            if (id && !warnedChildren.has(id)) {
                warnedChildren.add(id)

                warningToast(
                    'Attenzione',
                    'Stai modificando testo generato da AI.'
                )
            }
        }
    }

    async function retranslateAiBlock(child: HTMLElement) {
        const groupId = child.dataset.aiChild
        const lang = child.dataset.aiLang as AiLang | undefined
        const sourceChildId = child.dataset.aiSourceChild

        if (!groupId || !lang) return

        let sourceText = ''

        if (sourceChildId) {
            const sourceChild = editorRef.value?.querySelector(
                `[data-ai-child="${sourceChildId}"]`
            ) as HTMLElement | null

            if (!sourceChild) return

            const content = sourceChild.querySelector('[data-ai-content]') as HTMLElement | null
            sourceText = (content?.innerText ?? sourceChild.innerText).trim()
        } else {
            const parent = editorRef.value?.querySelector(
                `[data-ai-parent="${groupId}"]`
            ) as HTMLElement | null

            if (!parent) return

            const parentContent = parent.querySelector('[data-ai-content]') as HTMLElement | null
            sourceText = (parentContent?.innerText ?? parent.innerText).trim()
        }

        if (!sourceText) return

        const content = child.querySelector('[data-ai-content]') as HTMLElement | null
        const button = child.querySelector('[data-ai-retranslate]') as HTMLElement | null

        if (!content) return

        await translate(sourceText, lang)
        if (error.value) {
            warningToast('Errore AI', error.value)
            return
        }

        content.textContent = result.value ?? ''
        delete child.dataset.aiDirty
        button?.classList.add('hidden')

        handleEditorInput()
    }

    function htmlToMarkdownText(html: string) {
        const div = document.createElement('div')
        div.innerHTML = html

        div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach(
            (el) => {
                if (el.previousSibling?.nodeType === Node.TEXT_NODE) {
                    el.previousSibling.textContent =
                        el.previousSibling.textContent?.replace(/[ \t]+$/, '') ?? ''
                }

                if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
                    el.nextSibling.textContent =
                        el.nextSibling.textContent?.replace(/^[ \t]+/, '') ?? ''
                }

                el.querySelectorAll('[data-ai-retranslate]').forEach(button => button.remove())

                const content = el.querySelector('[data-ai-content]') as HTMLElement | null
                el.replaceWith(document.createTextNode(content?.textContent || el.textContent || ''))
            }
        )

        div.querySelectorAll('div, p, br').forEach(el => {
            el.after(document.createTextNode('\n'))
        })

        return (div.textContent || '')
            .split('\n')
            .map(line => line.replace(/^[ \t]+/, ''))
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    }

    function handleListEnter(
        textNode: Node,
        cursorOffset: number,
        range: Range
    ): boolean {
        const fullText = textNode.textContent ?? ''
        const textBeforeCursor = fullText.slice(0, cursorOffset)
        const lineStart = textBeforeCursor.lastIndexOf('\n') + 1
        const currentLine = textBeforeCursor.slice(lineStart)

        const unorderedMatch = currentLine.match(/^(\s*[-*]\s)/)
        const orderedMatch = currentLine.match(/^(\s*(\d+)\.\s)/)
        if (!unorderedMatch && !orderedMatch) return false

        const lineContent = currentLine.slice((unorderedMatch ?? orderedMatch)![1].length)

        if (lineContent.trim() === '') {
            const prefixLength = (unorderedMatch ?? orderedMatch)![1].length
            const deleteRange = range.cloneRange()
            deleteRange.setStart(textNode, cursorOffset - prefixLength)
            deleteRange.setEnd(textNode, cursorOffset)
            deleteRange.deleteContents()
            document.execCommand('insertText', false, '\n')
        } else if (orderedMatch) {
            const nextNumber = parseInt(orderedMatch[2], 10) + 1
            const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
            document.execCommand('insertText', false, `\n${indent}${nextNumber}. `)
        } else {
            const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
            const bullet = unorderedMatch![1].trim() + ' '
            document.execCommand('insertText', false, `\n${indent}${bullet}`)
        }

        return true
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
        const el = node instanceof HTMLElement ? node : node?.parentElement
        if (!el) return

        const aiBlock = el.closest('[data-ai-parent], [data-ai-child]') as HTMLElement | null
        if (aiBlock) {
            if (event.shiftKey) {
                event.preventDefault()
                insertLineBreak()
                handleEditorInput()
                return
            }

            event.preventDefault()
            moveOutsideAiBlock()
            return
        }

        const textNode = selection.anchorNode
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return

        const isList = handleListEnter(textNode, selection.anchorOffset, selection.getRangeAt(0))
        if (isList) {
            event.preventDefault()
            handleEditorInput()
        }
    }

    function insertLineBreak() {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)

        const br = document.createElement('br')
        const textNode = document.createTextNode('\u200B') // zero width space

        range.deleteContents()
        range.insertNode(textNode)
        range.insertNode(br)

        range.setStartAfter(textNode)
        range.collapse(true)

        selection.removeAllRanges()
        selection.addRange(range)
    }

    return {
        viewMode,
        isAiOpen,
        aiAction,
        selectedText,
        aiResult,
        loading,
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
        retranslateAiBlock,
    }
}
