import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Ref, ref } from 'vue'
import { useNoteEditorUI } from '@/composables/useNoteEditorUI'

const warningToast = vi.fn()

const mockAi = {
    result: ref('risultato AI'),
    error: ref(''),
    loading: ref(false),
    translate: vi.fn(),
    summarize: vi.fn(),
    rewrite: vi.fn(),
    distantWriting: vi.fn(),
    bluehat: vi.fn(),
    redhat: vi.fn(),
    yellowhat: vi.fn(),
    greenhat: vi.fn(),
    whitehat: vi.fn(),
    blackhat: vi.fn(),
}

vi.mock('@/composables/useToast', () => ({
    useToast: () => ({
        warningToast,
    }),
}))

vi.mock('@/composables/useAi', () => ({
    useAi: () => mockAi,
}))

describe('useNoteEditorUI', () => {
    let noteContent: Ref<string>
    let setEditorContent: (html: string) => void

    beforeEach(() => {
        noteContent = ref('<p>testo di prova</p>')
        setEditorContent = vi.fn()

        vi.clearAllMocks()
    })

    describe('text properties', () => {
        it('should calculate word count correctly', () => {
            noteContent.value = '<p>questo è un testo di prova</p>'

            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            expect(composable.wordCount.value).toBe(6)
        })

        it('should calculate character count correctly', () => {
            noteContent.value = '<p>ciao mondo</p>'

            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            expect(composable.charCount.value).toBe(10)
        })
    })

    describe('html utilities', () => {
        it('should convert html to plain text while preserving paragraphs structure', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.htmlToMarkdownText(`<div>testo di prova</div>\n<p>seconda riga</p>`)

            expect(result).toBe('testo di prova\n\nseconda riga')
        })

        it('should escape html correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.escapeHtml(
                '<script>alert("ciao")</script>'
            )

            expect(result).toBe(
                '&lt;script&gt;alert("ciao")&lt;/script&gt;'
            )
        })

        it('should strip ai markers correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const html = `<div data-ai-parent="1"><span data-ai-content="true">contenuto AI</span></div>`

            const result = composable.stripAiMarkers(html)

            expect(result).toBe('contenuto AI')
        })
    })

    describe('list formatting', () => {
        it('should format unordered list correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.formatList(
                'mele\npere',
                'unordered_list'
            )

            expect(result).toBe('- mele\n- pere')
        })

        it('should format ordered list correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.formatList(
                'primo elemento\nsecondo elemento',
                'ordered_list'
            )

            expect(result).toBe(
                '1. primo elemento\n2. secondo elemento'
            )
        })

        it('should remove unordered list formatting when all lines are already formatted', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.formatList(
                '- mele\n- pere',
                'unordered_list'
            )

            expect(result).toBe('mele\npere')
        })

        it('should remove ordered list formatting when all lines are already formatted', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const result = composable.formatList(
                '1. primo elemento\n2. secondo elemento',
                'ordered_list'
            )

            expect(result).toBe(
                'primo elemento\nsecondo elemento'
            )
        })
    })

    describe('view mode', () => {
        it('should set render view mode', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            composable.setViewMode('render')

            expect(composable.viewMode.value).toBe('render')
        })

        it('should set split view mode', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            composable.setViewMode('split')

            expect(composable.viewMode.value).toBe('split')
        })

        it('should set editor view mode', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            composable.setViewMode('editor')

            expect(composable.viewMode.value).toBe('editor')
        })
    })

    describe('ai actions', () => {
        it('should call summarize action', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'summarize',
                selectedText: 'testo da riassumere',
                option: '',
            })

            expect(mockAi.summarize).toHaveBeenCalledWith(
                'testo da riassumere'
            )
        })

        it('should call translate action', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'translate',
                selectedText: 'testo da tradurre',
                option: 'en',
            })

            expect(mockAi.translate).toHaveBeenCalledWith(
                'testo da tradurre',
                'en'
            )
        })

        it('should call rewrite action with styles', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'rewrite',
                selectedText: 'testo da correggere',
                option: 'grammar,lexicon',
            })

            expect(mockAi.rewrite).toHaveBeenCalledWith(
                'testo da correggere',
                ['grammar', 'lexicon']
            )
        })

        it('should call correct hat function', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'hats',
                selectedText: 'problema complesso',
                option: 'blue',
            })

            expect(mockAi.bluehat).toHaveBeenCalledWith(
                'problema complesso'
            )
        })

        it('should show warning toast when ai returns error', async () => {
            mockAi.error.value = 'errore simulato'

            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'summarize',
                selectedText: 'testo di prova',
                option: '',
            })

            expect(warningToast).toHaveBeenCalledWith(
                'Errore AI',
                'errore simulato'
            )
        })
    })

    describe('editor interactions', () => {
        it('should handle paste event correctly', () => {
            document.execCommand = vi.fn()

            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const preventDefault = vi.fn()

            const event = {
                preventDefault,
                clipboardData: {
                    getData: vi.fn().mockReturnValue('testo incollato'),
                },
            } as unknown as ClipboardEvent

            composable.handlePaste(event)

            expect(preventDefault).toHaveBeenCalled()

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'testo incollato'
            )
        })

        it('should call setEditorContent on editor input', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            editor.innerHTML = '<p>contenuto aggiornato</p>'

            composable.setEditorRef(editor)
            composable.handleEditorInput()

            expect(setEditorContent).toHaveBeenCalledWith(
                '<p>contenuto aggiornato</p>'
            )
        })
    })
    describe('applyFormat', () => {
        beforeEach(() => {
            Object.defineProperty(document, 'execCommand', {
                value: vi.fn(),
                writable: true,
            })
        })

        const setupSelection = (testoSelezionato: string) => {
            const mockRange = {
                cloneRange: vi.fn(),
            } as unknown as Range

            vi.spyOn(window, 'getSelection').mockReturnValue({
                rangeCount: 1,
                toString: () => testoSelezionato,
                getRangeAt: () => mockRange,
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            } as unknown as Selection)
        }

        it('should apply bold formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('testo in grassetto')

            composable.applyFormat('bold')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '**testo in grassetto**'
            )
        })

        it('should apply italic formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('testo in corsivo')

            composable.applyFormat('italic')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '*testo in corsivo*'
            )
        })

        it('should apply underline formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('testo sottolineato')

            composable.applyFormat('underline')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '<u>testo sottolineato</u>'
            )
        })

        it('should apply strikethrough formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('testo barrato')

            composable.applyFormat('strikethrough')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '~~testo barrato~~'
            )
        })

        it('should apply comment formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('commento di prova')

            composable.applyFormat('comment')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '<!--[Inizio commento]\ncommento di prova\n[Fine commento]-->'
            )
        })

        it('should apply link formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('sito di prova')

            composable.applyFormat('link')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                '[sito di prova](www.example.com)'
            )
        })

        it('should remove existing bold formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('**testo già formattato**')

            composable.applyFormat('bold')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'testo già formattato'
            )
        })

        it('should remove existing italic formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('*testo già in corsivo*')

            composable.applyFormat('italic')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'testo già in corsivo'
            )
        })

        it('should remove existing underline formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('<u>testo già sottolineato</u>')

            composable.applyFormat('underline')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'testo già sottolineato'
            )
        })

        it('should remove existing strikethrough formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('~~testo già barrato~~')

            composable.applyFormat('strikethrough')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'testo già barrato'
            )
        })

        it('should remove existing comment formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection(
                '<!--[Inizio commento]\ncommento esistente\n[Fine commento]-->'
            )

            composable.applyFormat('comment')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'commento esistente'
            )
        })

        it('should remove existing link formatting', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            composable.setEditorRef(editor)

            setupSelection('[documentazione](https://example.com)')

            composable.applyFormat('link')

            expect(document.execCommand).toHaveBeenCalledWith(
                'insertText',
                false,
                'documentazione'
            )
        })
    })
})