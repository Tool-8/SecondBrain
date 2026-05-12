import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Ref, ref } from 'vue'
import { useNoteEditorUI } from '@/composables/useNoteEditorUI'
import { set } from '@vueuse/core'

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

        Object.defineProperty(document, 'execCommand', {
            value: vi.fn(),
            writable: true,
        })

        vi.spyOn(window, 'getSelection').mockReturnValue({
            rangeCount: 0,
            anchorNode: document.createTextNode(''),
            anchorOffset: 0,
            getRangeAt: vi.fn(),
            removeAllRanges: vi.fn(),
            addRange: vi.fn(),
        } as unknown as Selection)
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

    describe('editor history', () => {
        let mockEditor: HTMLDivElement

        beforeEach(() => {
            mockEditor = document.createElement('div')
            mockEditor.innerHTML = '<p>testo iniziale</p>'
            mockEditor.focus = vi.fn() // Mock del metodo focus
        })

        it('should handle undo correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            composable.setEditorRef(mockEditor)

            composable.undoEdit()

            expect(mockEditor.focus).toHaveBeenCalled()
            expect(document.execCommand).toHaveBeenCalledWith('undo')
            expect(setEditorContent).toHaveBeenCalledWith('<p>testo iniziale</p>')
        })

        it('should handle redo correctly', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            composable.setEditorRef(mockEditor)

            composable.redoEdit()
            expect(mockEditor.focus).toHaveBeenCalled()
            expect(document.execCommand).toHaveBeenCalledWith('redo')
            expect(setEditorContent).toHaveBeenCalledWith('<p>testo iniziale</p>')
        })

        it('should not throw error if editorRef is null during undo/redo', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            expect(() => {
                composable.undoEdit()
                composable.redoEdit()
            }).not.toThrow()
            expect(document.execCommand).toHaveBeenCalledTimes(2)
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

        it('should call distant writing action', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'distant writing',
                selectedText: 'argomento del testo',
                option: '',
            })

            expect(mockAi.distantWriting).toHaveBeenCalledWith(
                'argomento del testo'
            )
        })

        it('should shoe warning toast for not supported action', async () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            await composable.handleAiRun({
                action: 'invalid' as any,
                selectedText: 'argomento del testo',
                option: '',
            })

            expect(warningToast).toHaveBeenCalledWith(
               'Azione non supportata', 
               'Hai inserito un\'azione non supportata'
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

    describe('handleListEnter', () => {
        const setupSelection = (node: Node, offset: number) => {
            const deleteRange = {
                setStart: vi.fn(),
                setEnd: vi.fn(),
                deleteContents: vi.fn(),
            }

            const range = {
                cloneRange: vi.fn(() => deleteRange),
            } as unknown as Range

            vi.spyOn(window, 'getSelection').mockReturnValue({
                rangeCount: 1,
                anchorNode: node,
                anchorOffset: offset,
                getRangeAt: () => range,
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
            } as unknown as Selection)

            return range
        }

        it('should continue unordered list with bullet', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const textNode = document.createTextNode('- primo elemento')

            const range = setupSelection(textNode, 15)

            const result = composable.handleListEnter(
                textNode,
                15,
                range
            )

            expect(result).toBe(true)
        })

        it('should continue ordered list with incremented number', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const textNode = document.createTextNode('1. primo elemento')

            const range = setupSelection(textNode, 17)

            const result = composable.handleListEnter(
                textNode,
                17,
                range
            )

            expect(result).toBe(true)
        })

        it('should exit list when line is empty', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const textNode = document.createTextNode('- ')

            const range = setupSelection(textNode, 2)

            const result = composable.handleListEnter(
                textNode,
                2,
                range
            )

            expect(result).toBe(true)
        })
    })
    describe('handleEditorKeydown', () => {
        const createRangeMock = () => {
            return {
                deleteContents: vi.fn(),
                insertNode: vi.fn(),
                setStart: vi.fn(),
                setEnd: vi.fn(),
                setStartAfter: vi.fn(),
                setEndAfter: vi.fn(),
                collapse: vi.fn(),
                cloneRange: vi.fn(),
            } as unknown as Range
        }

        const setupSelection = (node: Node, range: Range) => {
            vi.spyOn(window, 'getSelection').mockReturnValue({
                rangeCount: 1,
                anchorNode: node,
                anchorOffset: 0,
                getRangeAt: () => range,
                removeAllRanges: vi.fn(),
                addRange: vi.fn(),
                toString: () => node.textContent ?? '',
            } as unknown as Selection)
        }

        it('should not handle key if not Enter', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const node = document.createTextNode('testo')
            const range = createRangeMock()

            setupSelection(node, range)

            const event = new KeyboardEvent('keydown', {
                key: 'a',
            })

            vi.spyOn(event, 'preventDefault')

            composable.handleEditorKeydown(event)

            expect(event.preventDefault).not.toHaveBeenCalled()
        })

        it('should insert line break when Shift+Enter inside AI block', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            const aiBlock = document.createElement('div')
            aiBlock.setAttribute('data-ai-parent', '1')

            editor.appendChild(aiBlock)
            composable.setEditorRef(editor)

            const node = document.createTextNode('testo')
            aiBlock.appendChild(node)

            const range = createRangeMock()

            setupSelection(node, range)

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                shiftKey: true,
            })

            vi.spyOn(event, 'preventDefault')

            composable.handleEditorKeydown(event)

            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should move outside AI block when pressing Enter inside AI block', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            const editor = document.createElement('div')
            const aiBlock = document.createElement('div')
            aiBlock.setAttribute('data-ai-parent', '1')

            editor.appendChild(aiBlock)
            composable.setEditorRef(editor)

            const node = document.createTextNode('testo')
            aiBlock.appendChild(node)

            const range = createRangeMock()

            setupSelection(node, range)

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                shiftKey: false,
            })

            vi.spyOn(event, 'preventDefault')

            composable.handleEditorKeydown(event)

            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should ignore Enter when selection is invalid', () => {
            const composable = useNoteEditorUI({
                noteContent,
                setEditorContent,
            })

            vi.spyOn(window, 'getSelection').mockReturnValue({
                rangeCount: 0,
            } as unknown as Selection)

            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
            })

            vi.spyOn(event, 'preventDefault')

            composable.handleEditorKeydown(event)

            expect(event.preventDefault).not.toHaveBeenCalled()
        })
    })

    describe('open/close AI panel', () => {
        const setupSelection = (text: string) => {
            const range = document.createRange()

            vi.spyOn(window, 'getSelection').mockReturnValue({
                rangeCount: 1,
                toString: () => text,
                getRangeAt: () => range,
            } as unknown as Selection)
        }

        describe('openAiPanel', () => {
            it('should open AI panel when text is selected', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                setupSelection('testo selezionato')

                composable.openAiPanel('summarize')

                expect(composable.isAiOpen.value).toBe(true)
                expect(composable.aiAction.value).toBe('summarize')
                expect(composable.selectedText.value).toBe('testo selezionato')
            })

            it('should not open AI panel when selection is empty', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                setupSelection('   ')

                composable.openAiPanel('rewrite')

                expect(composable.isAiOpen.value).toBe(false)
                expect(composable.aiAction.value).toBe(null)
                expect(warningToast).toHaveBeenCalledWith(
                    'Attenzione',
                    'Seleziona del testo prima di usare questa funzione AI.'
                )
            })

            it('should not open AI panel when selection is null', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                vi.spyOn(window, 'getSelection').mockReturnValue(null as any)

                composable.openAiPanel('summarize')

                expect(composable.isAiOpen.value).toBe(false)
                expect(composable.aiAction.value).toBe(null)
            })

            it('should set correct action for translate', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                setupSelection('testo')

                composable.openAiPanel('translate')

                expect(composable.isAiOpen.value).toBe(true)
                expect(composable.aiAction.value).toBe('translate')
            })

            it('should set correct action for distant writing', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                setupSelection('testo creativo')

                composable.openAiPanel('distant writing')

                expect(composable.isAiOpen.value).toBe(true)
                expect(composable.aiAction.value).toBe('distant writing')
            })
        })

        describe('closeAiPanel', () => {
            it('should close AI panel and reset action', () => {
                const composable = useNoteEditorUI({
                    noteContent,
                    setEditorContent,
                })

                composable.isAiOpen.value = true
                composable.aiAction.value = 'summarize'

                composable.closeAiPanel()

                expect(composable.isAiOpen.value).toBe(false)
                expect(composable.aiAction.value).toBe(null)
            })
        })
    })
    
    describe('retranslateAiBlock', () => {
        /**
         * Costruisce un editor DOM con un blocco AI parent + uno o più child
         * e registra il ref sull'editor.
         */
        const buildEditor = (composable: ReturnType<typeof useNoteEditorUI>) => {
            const editor = document.createElement('div')
            composable.setEditorRef(editor)
            return editor
        }

        const buildParent = (groupId: string, innerText: string) => {
            const parent = document.createElement('div')
            parent.setAttribute('data-ai-parent', groupId)
            const content = document.createElement('span')
            content.setAttribute('data-ai-content', 'true')
            content.innerText = innerText
            parent.appendChild(content)
            return parent
        }

        const buildChild = (
            groupId: string,
            lang: string,
            opts: { sourceChildId?: string; dirty?: boolean; withButton?: boolean } = {}
        ) => {
            const child = document.createElement('div')
            child.setAttribute('data-ai-child', groupId)
            child.setAttribute('data-ai-lang', lang)
            if (opts.sourceChildId) child.setAttribute('data-ai-source-child', opts.sourceChildId)
            if (opts.dirty) child.setAttribute('data-ai-dirty', '1')

            const content = document.createElement('span')
            content.setAttribute('data-ai-content', 'true')
            content.textContent = 'vecchia traduzione'
            child.appendChild(content)

            if (opts.withButton) {
                const btn = document.createElement('button')
                btn.setAttribute('data-ai-retranslate', '1')
                child.appendChild(btn)
            }

            return child
        }

        beforeEach(() => {
            mockAi.result.value = 'nuova traduzione'
            mockAi.error.value = ''
            mockAi.translate.mockReset()
        })

        it('should do nothing if groupId is missing', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            buildEditor(composable)

            const child = document.createElement('div')

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).not.toHaveBeenCalled()
        })

        it('should do nothing if lang is missing', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            buildEditor(composable)

            const child = document.createElement('div')
            child.setAttribute('data-ai-child', 'grp1')

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).not.toHaveBeenCalled()
        })

        it('should call translate using parent content when no sourceChildId', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'en')
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).toHaveBeenCalledWith('testo originale', 'en')
        })

        it('should update content element with AI result', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'fr')
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            const content = child.querySelector('[data-ai-content]') as HTMLElement
            expect(content.textContent).toBe('nuova traduzione')
        })

        it('should remove data-ai-dirty attribute after successful translation', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'de', { dirty: true })
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(child.dataset.aiDirty).toBeUndefined()
        })

        it('should hide retranslate button after successful translation', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'es', { dirty: true, withButton: true })
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            const btn = child.querySelector('[data-ai-retranslate]') as HTMLElement
            expect(btn.classList.contains('hidden')).toBe(true)
        })

        it('should call setEditorContent after successful translation', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'it')
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(setEditorContent).toHaveBeenCalled()
        })

        it('should show warning toast and abort when AI returns an error', async () => {
            mockAi.error.value = 'errore di traduzione'

            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', 'testo originale')
            const child = buildChild('grp1', 'en')
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(warningToast).toHaveBeenCalledWith('Errore AI', 'errore di traduzione')
            const content = child.querySelector('[data-ai-content]') as HTMLElement
            expect(content.textContent).toBe('vecchia traduzione')
        })

        it('should call translate using sourceChild content when sourceChildId is set', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const sourceChild = document.createElement('div')
            sourceChild.setAttribute('data-ai-child', 'src-child')
            const sourceContent = document.createElement('span')
            sourceContent.setAttribute('data-ai-content', 'true')
            sourceContent.innerText = 'testo sorgente figlio'
            sourceChild.appendChild(sourceContent)

            const child = buildChild('grp1', 'ja', { sourceChildId: 'src-child' })

            editor.appendChild(sourceChild)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).toHaveBeenCalledWith('testo sorgente figlio', 'ja')
        })

        it('should do nothing if sourceChild is not found in DOM', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            buildEditor(composable)

            const child = buildChild('grp1', 'zh', { sourceChildId: 'non-existent-id' })

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).not.toHaveBeenCalled()
        })

        it('should do nothing if parent block is not found in DOM', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            buildEditor(composable)

            const child = buildChild('grp-inesistente', 'pt')

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).not.toHaveBeenCalled()
        })

        it('should do nothing if parent has empty source text', async () => {
            const composable = useNoteEditorUI({ noteContent, setEditorContent })
            const editor = buildEditor(composable)

            const parent = buildParent('grp1', '   ')
            const child = buildChild('grp1', 'en')
            editor.appendChild(parent)
            editor.appendChild(child)

            await composable.retranslateAiBlock(child)

            expect(mockAi.translate).not.toHaveBeenCalled()
        })
    })
})