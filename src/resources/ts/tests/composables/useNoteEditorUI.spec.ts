import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useNoteEditorUI } from '@/composables/useNoteEditorUI'

vi.mock('@/composables/useToast', () => ({
    useToast: () => ({
        warningToast: vi.fn(),
    }),
}))

vi.mock('@/composables/useAi', () => ({
    useAi: () => ({
        result: ref(''),
        error: ref(null),
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
    }),
}))

vi.mock('@/services/aiService', () => ({
    AiLang: {},
    AiTone: {},
}))

// --- funzioni non esportate da useNoteEditorUI (non testabile con mock dom perché jsdom non support execCommand)---

function escapeHtml(value: string): string {
    const div = document.createElement('div')
    div.textContent = value
    return div.innerHTML
}

function htmlToMarkdownText(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html

    div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach((el) => {
        if (el.previousSibling?.nodeType === Node.TEXT_NODE) {
            el.previousSibling.textContent =
                el.previousSibling.textContent?.replace(/[ \t]+$/, '') ?? ''
        }
        if (el.nextSibling?.nodeType === Node.TEXT_NODE) {
            el.nextSibling.textContent =
                el.nextSibling.textContent?.replace(/^[ \t]+/, '') ?? ''
        }
        el.querySelectorAll('[data-ai-retranslate]').forEach((button) => button.remove())
        const content = el.querySelector('[data-ai-content]') as HTMLElement | null
        el.replaceWith(document.createTextNode(content?.textContent || el.textContent || ''))
    })

    div.querySelectorAll('div, p, br').forEach((el) => {
        el.after(document.createTextNode('\n'))
    })

    return (div.textContent || '')
        .split('\n')
        .map((line) => line.replace(/^[ \t]+/, ''))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

function formatList(text: string, type: 'ordered_list' | 'unordered_list'): string {
    const prefix =
        type === 'unordered_list' ? /^(\s*)[-*]\s/ : /^(\s*)\d+\.\s/
    const lines = text.split('\n')
    const allHavePrefix = lines.every((line) => prefix.test(line))
    return lines
        .map((line, i) =>
            allHavePrefix
                ? line.replace(prefix, '$1')
                : prefix.test(line)
                    ? line
                    : `${line.match(/^(\s*)/)?.[1] ?? ''}${type === 'unordered_list' ? '- ' : `${i + 1}. `
                    }${line.trimStart()}`
        )
        .join('\n')
}

function applyWrapper(text: string, start: string, end: string): string {
    const alreadyWrapped = text.startsWith(start) && text.endsWith(end)
    return alreadyWrapped
        ? text.slice(start.length, text.length - end.length)
        : `${start}${text}${end}`
}

function formatLink(text: string): string {
    const match = text.match(/^\[(.*?)\]\((.*?)\)$/)
    return match ? match[1] : `[${text}](www.example.com)`
}

// ---- Test ----

describe('escapeHtml', () => {
    it('escapes angle brackets', () => {
        expect(escapeHtml('<b>testo</b>')).toBe('&lt;b&gt;testo&lt;/b&gt;')
    })

    it('escapes ampersand', () => {
        expect(escapeHtml('prova & test')).toBe('prova &amp; test')
    })
})


describe('htmlToMarkdownText', () => {
    it('strips basic HTML tags returning plain text', () => {
        expect(htmlToMarkdownText('<p>testo</p>')).toBe('testo')
    })

    it('collapses more than two consecutive newlines into two', () => {
        expect(htmlToMarkdownText('<p>inizio</p><p></p><p></p><p>fine</p>')).not.toMatch(/\n{3,}/)
    })

    it('replaces ai-child block with its content', () => {
        const html = `
      <div data-ai-child="abc">
        <span data-ai-content="true">testo generato da AI</span>
      </div>
    `
        expect(htmlToMarkdownText(html)).toBe('testo generato da AI')
    })

    it('replaces ai-parent block with its content', () => {
        const html = `
      <div data-ai-parent="xyz">
        <span data-ai-content="true">testo originale selezionato</span>
      </div>
    `
        expect(htmlToMarkdownText(html)).toBe('testo originale selezionato')
    })

    it('removes retranslate button from ai blocks', () => {
        const html = `
      <div data-ai-child="abc">
        <span data-ai-content="true">risposta tradotta</span>
        <button data-ai-retranslate="true">Ritraduci</button>
      </div>
    `
        expect(htmlToMarkdownText(html)).not.toContain('Ritraduci')
    })

    it('trims leading whitespace from each line', () => {
        expect(htmlToMarkdownText('<p>   riga con spazi iniziali</p>')).toBe('riga con spazi iniziali')
    })

    it('handles br tag as newline', () => {
        expect(htmlToMarkdownText('prima riga<br>seconda riga')).toBe('prima riga\nseconda riga')
    })
})


describe('formatList - unordered_list', () => {
    it('adds bullet to plain lines', () => {
        expect(formatList('mele\nbanane\narance', 'unordered_list')).toBe('- mele\n- banane\n- arance')
    })

    it('removes bullet when all lines already have it', () => {
        expect(formatList('- mele\n- banane\n- arance', 'unordered_list')).toBe('mele\nbanane\narance')
    })

    it('adds bullet to lines without it', () => {
        expect(formatList('- mele\nbanane', 'unordered_list')).toBe('- mele\n- banane')
    })

    it('preserves indentation when adding bullet', () => {
        expect(formatList('  voce indentata', 'unordered_list')).toBe('  - voce indentata')
    })

    it('supports asterisk as existing bullet prefix', () => {
        expect(formatList('* voce uno\n* voce due', 'unordered_list')).toBe('voce uno\nvoce due')
    })
})


describe('formatList - ordered_list', () => {
    it('adds numbered prefix to plain lines', () => {
        expect(formatList('primo\nsecondo\nterzo', 'ordered_list')).toBe('1. primo\n2. secondo\n3. terzo')
    })

    it('removes numbered prefix when all lines already have it', () => {
        expect(formatList('1. primo\n2. secondo\n3. terzo', 'ordered_list')).toBe('primo\nsecondo\nterzo')
    })

    it('preserves indentation when adding number', () => {
        expect(formatList('  voce indentata', 'ordered_list')).toBe('  1. voce indentata')
    })
})


describe('stripAiMarkers', () => {
    const { stripAiMarkers } = useNoteEditorUI({
        noteContent: ref(''),
        setEditorContent: vi.fn(),
    })

    it('replaces ai-child with its plain text content', () => {
        const html = `<div data-ai-child="abc"><span data-ai-content="true">risposta AI</span></div>`
        expect(stripAiMarkers(html)).toBe('risposta AI')
    })

    it('replaces ai-parent with its plain text content', () => {
        const html = `<div data-ai-parent="xyz"><span data-ai-content="true">testo originale</span></div>`
        expect(stripAiMarkers(html)).toBe('testo originale')
    })

    it('removes retranslate buttons', () => {
        const html = `
      <div data-ai-child="abc">
        <span data-ai-content="true">testo</span>
        <button data-ai-retranslate="true">Ritraduci</button>
      </div>
    `
        expect(stripAiMarkers(html)).not.toContain('Ritraduci')
    })
})


describe('useNoteEditorUI - computed: wordCount and charCount', () => {
    it('counts words correctly for a normal sentence', () => {
        const { wordCount } = useNoteEditorUI({
            noteContent: ref('<p>ciao come stai</p>'),
            setEditorContent: vi.fn(),
        })
        expect(wordCount.value).toBe(3)
    })

    it('counts zero words for whitespace only', () => {
        const { wordCount } = useNoteEditorUI({
            noteContent: ref('<p>   </p>'),
            setEditorContent: vi.fn(),
        })
        expect(wordCount.value).toBe(0)
    })

    it('handles multiple spaces between words', () => {
        const { wordCount } = useNoteEditorUI({
            noteContent: ref('<p>parola   doppio   spazio</p>'),
            setEditorContent: vi.fn(),
        })
        expect(wordCount.value).toBe(3)
    })

    it('counts characters correctly', () => {
        const { charCount } = useNoteEditorUI({
            noteContent: ref('<p>ciao</p>'),
            setEditorContent: vi.fn(),
        })
        expect(charCount.value).toBe(4)
    })
})


describe('useNoteEditorUI - applyFormat: wrapper logic', () => {
    it('wraps text in bold markers', () => {
        expect(applyWrapper('testo importante', '**', '**')).toBe('**testo importante**')
    })

    it('unwraps text already in bold', () => {
        expect(applyWrapper('**testo in grassetto**', '**', '**')).toBe('testo in grassetto')
    })

    it('wraps text in italic markers', () => {
        expect(applyWrapper('testo corsivo', '*', '*')).toBe('*testo corsivo*')
    })

    it('unwraps text already in italic', () => {
        expect(applyWrapper('*testo corsivo*', '*', '*')).toBe('testo corsivo')
    })

    it('wraps text in strikethrough markers', () => {
        expect(applyWrapper('testo barrato', '~~', '~~')).toBe('~~testo barrato~~')
    })

    it('unwraps text already in strikethrough', () => {
        expect(applyWrapper('~~testo barrato~~', '~~', '~~')).toBe('testo barrato')
    })

    it('wraps text in underline tags', () => {
        expect(applyWrapper('testo sottolineato', '<u>', '</u>')).toBe('<u>testo sottolineato</u>')
    })

    it('unwraps text already in underline tags', () => {
        expect(applyWrapper('<u>testo sottolineato</u>', '<u>', '</u>')).toBe('testo sottolineato')
    })

    it('wraps text in comment markers', () => {
        expect(applyWrapper('nota interna', '<!--[Inizio commento]\n', '\n[Fine commento]-->')).toBe('<!--[Inizio commento]\nnota interna\n[Fine commento]-->')
    })

    it('unwraps text already in comment markers', () => {
        expect(applyWrapper('<!--[Inizio commento]\nnota interna\n[Fine commento]-->', '<!--[Inizio commento]\n', '\n[Fine commento]-->')).toBe('nota interna')
    })
})


describe('useNoteEditorUI - link format logic', () => {
    it('wraps plain text as markdown link', () => {
        expect(formatLink('visita il sito')).toBe('[visita il sito](www.example.com)')
    })

    it('unwraps an existing markdown link returning only the label', () => {
        expect(formatLink('[testo del link](link.com)')).toBe('testo del link')
    })
})