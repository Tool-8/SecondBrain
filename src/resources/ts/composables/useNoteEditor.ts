import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useNotes } from '@/composables/useNotes'

function normalizeEditorHtml(html: string) {
    const div = document.createElement('div')
    div.innerHTML = html

    div.querySelectorAll('[data-ai-parent], [data-ai-child]').forEach(el => {
        el.replaceWith(document.createTextNode(el.textContent || ''))
    })

    return div.innerText
}

export function useNoteEditor() {
    const { errorToast, warningToast, successToast } = useToast()
    const { getNote, saveNote, storeNote } = useNotes()
    const route = useRoute()

    const noteContent = ref('')
    const noteName = ref('')

    const originalContent = ref('')
    const originalName = ref('')

    const isDirty = ref(false)

    watch([noteContent, noteName], ([newContent, newName]) => {
        isDirty.value =
        normalizeEditorHtml(newContent) !== normalizeEditorHtml(originalContent.value) ||
        newName !== originalName.value
    })

    function setEditorContent(html: string) {
        noteContent.value = html
    }

    async function saveTheNote() {
        if (!noteName.value.trim()) {
        warningToast('Attenzione', 'Inserire un nome per la nota')
        return
        }

        const id = route.params.id as string | undefined

        try {
        if (id) {
            await saveNote(id, noteName.value, noteContent.value)
        } else {
            await storeNote(noteName.value, noteContent.value)
        }

        successToast('Nota salvata', '')

        originalContent.value = noteContent.value
        originalName.value = noteName.value
        isDirty.value = false
        } catch (error) {
        errorToast('Errore', (error as Error).message)
        }
    }

    async function loadNote() {
        const id = route.params.id as string | undefined

        if (!id) return

        try {
        const note = await getNote(id)

        noteName.value = note.name
        noteContent.value = note.content

        originalContent.value = note.content
        originalName.value = note.name

        isDirty.value = false
        } catch (error) {
        errorToast('Errore', (error as Error).message)
        }
    }

    return {
        noteContent,
        noteName,
        isDirty,
        saveTheNote,
        loadNote,
        setEditorContent,
    }
}