import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import NotesArchivePage from '@/pages/NotesArchivePage.vue';

const mockNotes = ref<any[]>([]);
const mockLoading = ref(false);
const mockError = ref<string | null>(null);

const { mockFetchNotes, mockRenameNote, mockRemoveNote, mockCloneNote, mockExportNote, mockImportNote } = vi.hoisted(() =>({
    mockFetchNotes: vi.fn(),
    mockRenameNote: vi.fn(),
    mockRemoveNote: vi.fn(),
    mockCloneNote: vi.fn(),
    mockExportNote: vi.fn(),
    mockImportNote: vi.fn(),
}));

const { mockRenamePromiseStart, mockDeletePromiseStart, mockClonePromiseStart } = vi.hoisted(() => ({
    mockRenamePromiseStart: vi.fn(),
    mockDeletePromiseStart: vi.fn(),
    mockClonePromiseStart: vi.fn(),
}));

const { mockErrorToast } = vi.hoisted(() => ({
    mockErrorToast: vi.fn(),
}));

vi.mock('@/composables/useNotes', () => ({
    default: () => ({
        notes: mockNotes,
        loading: mockLoading,
        error: mockError,
        fetchNotes: mockFetchNotes,
        renameNote: mockRenameNote,
        removeNote: mockRemoveNote,
        cloneNote: mockCloneNote,
        exportNote: mockExportNote,
        importNote: mockImportNote,
    }),
}));

vi.mock('@/composables/useModals', () => ({
    useModals: () => ({
        RenamePromise: { start: mockRenamePromiseStart },
        DeletePromise: { start: mockDeletePromiseStart },
        ClonePromise: { start: mockClonePromiseStart },
    }),
}));

vi.mock('@/composables/useToast', () => ({
    useToast: () => ({
        errorToast: mockErrorToast,
        successToast: vi.fn(),
        infoToast: vi.fn(),
        warningToast: vi.fn(),
    }),
}));

vi.mock('@/components/NoteArchiveCard.vue', () => ({
    default: {
        props: ['id', 'name', 'last_edit', 'creation'],
        emits: ['contextmenu'],
        template: '<li @contextmenu="$emit(\'contextmenu\', $event)">{{ name }}</li>',
    },
}));

vi.mock('@/components/ContextMenu.vue', () => ({
    default: {
        props: ['x', 'y', 'actions'],
        emits: ['action-clicked', 'close'],
        template: `<div><button v-for="action in actions" :key="action.label" @click="$emit('action-clicked', action)">{{ action.label }}</button></div>`,
    },
}));

vi.mock('@/components/GeneralButton.vue', () => ({
    default: {
        props: ['label', 'disabled'],
        emits: ['click'],
        template: '<button @click="$emit(\'click\')">{{ label }}</button>',
    },
}));

const sampleNote = {
    id: '1',
    name: 'Nota di test',
    last_edit: '15/01/2024 - 10:30:00',
    creation: '10/01/2024 - 08:00:00',
};

describe('NotesArchivePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNotes.value = [];
        mockLoading.value = false;
        mockError.value = null;
        mockFetchNotes.mockResolvedValue(undefined);
    });

    it('calls fetchNotes on mount', () => {
        mount(NotesArchivePage);
        expect(mockFetchNotes).toHaveBeenCalled();
    });

    it('shows loading state', () => {
        mockLoading.value = true;
        const wrapper = mount(NotesArchivePage);
        expect(wrapper.text()).toContain('Caricamento...');
    });

    it('shows error state', () => {
        mockError.value = 'Errore nel recupero delle note.';
        const wrapper = mount(NotesArchivePage);
        expect(wrapper.text()).toContain('Errore nel recupero delle note.');
    });

    it('shows notes list', () => {
        mockNotes.value = [sampleNote];
        const wrapper = mount(NotesArchivePage);
        expect(wrapper.text()).toContain('Nota di test');
    });

    it('shows note count singular', () => {
        mockNotes.value = [sampleNote];
        const wrapper = mount(NotesArchivePage);
        expect(wrapper.text()).toContain('1 nota trovata');
    });

    it('shows note count plural', () => {
        mockNotes.value = [sampleNote, { ...sampleNote, id: '2', name: 'Seconda nota' }];
        const wrapper = mount(NotesArchivePage);
        expect(wrapper.text()).toContain('2 note trovate');
    });

    it('filters notes by search query', async () => {
        mockNotes.value = [
            sampleNote,
            { ...sampleNote, id: '2', name: 'Altra nota' },
        ];
        const wrapper = mount(NotesArchivePage);
        await wrapper.find('input#Search').setValue('Altra');
        expect(wrapper.text()).toContain('Altra nota');
        expect(wrapper.text()).not.toContain('Nota di test');
    });

    it('shows all notes when search query is empty', async () => {
        mockNotes.value = [
            sampleNote,
            { ...sampleNote, id: '2', name: 'Altra nota' },
        ];
        const wrapper = mount(NotesArchivePage);
        await wrapper.find('input#Search').setValue('');
        expect(wrapper.text()).toContain('Nota di test');
        expect(wrapper.text()).toContain('Altra nota');
    });

    it('search is case insensitive', async () => {
        mockNotes.value = [sampleNote];
        const wrapper = mount(NotesArchivePage);
        await wrapper.find('input#Search').setValue('NOTA DI TEST');
        expect(wrapper.text()).toContain('Nota di test');
    });

    it('opens context menu on contextmenu event', async () => {
        mockNotes.value = [sampleNote];
        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');
        expect(wrapper.findComponent({ name: 'ContextMenu' }).exists()).toBe(true);
    });

    it('calls renameNote after RenamePromise resolves', async () => {
        mockNotes.value = [sampleNote];
        mockRenamePromiseStart.mockResolvedValue('Nuovo nome');
        mockRenameNote.mockResolvedValue(undefined);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const renameBtn = wrapper.findAll('button').find(b => b.text() === 'Rinomina');
        await renameBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockRenameNote).toHaveBeenCalledWith(sampleNote, 'Nuovo nome');
    });

    it('does not call renameNote if RenamePromise resolves null', async () => {
        mockNotes.value = [sampleNote];
        mockRenamePromiseStart.mockResolvedValue(null);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const renameBtn = wrapper.findAll('button').find(b => b.text() === 'Rinomina');
        await renameBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockRenameNote).not.toHaveBeenCalled();
    });

    it('calls removeNote after DeletePromise resolves true', async () => {
        mockNotes.value = [sampleNote];
        mockDeletePromiseStart.mockResolvedValue(true);
        mockRemoveNote.mockResolvedValue(undefined);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Elimina');
        await deleteBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockRemoveNote).toHaveBeenCalledWith('1');
    });

    it('does not call removeNote if DeletePromise resolves false', async () => {
        mockNotes.value = [sampleNote];
        mockDeletePromiseStart.mockResolvedValue(false);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Elimina');
        await deleteBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockRemoveNote).not.toHaveBeenCalled();
    });

    it('calls cloneNote after ClonePromise resolves', async () => {
        mockNotes.value = [sampleNote];
        mockClonePromiseStart.mockResolvedValue('Nota clonata');
        mockCloneNote.mockResolvedValue(undefined);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const cloneBtn = wrapper.findAll('button').find(b => b.text() === 'Clona');
        await cloneBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockCloneNote).toHaveBeenCalledWith('1', 'Nota clonata');
    });

    it.each([
        ['Esporta in PDF', 'pdf'],
        ['Esporta in MD',  'md'],
        ['Esporta in HTML','html'],
    ])('calls exportNote with %s', async (label, format) => {
        mockNotes.value = [sampleNote];
        mockExportNote.mockResolvedValue(undefined);

        const wrapper = mount(NotesArchivePage);
        await wrapper.find('li').trigger('contextmenu');

        const exportBtn = wrapper.findAll('button').find(b => b.text() === label);
        await exportBtn?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(mockExportNote).toHaveBeenCalledWith('1', format);
    });

    it('calls importNote with file on file input change', async () => {
        mockImportNote.mockResolvedValue(undefined);
        const wrapper = mount(NotesArchivePage);

        const file = new File(['contenuto'], 'nota.md', { type: 'text/markdown' });
        const input = wrapper.find('input[type="file"]');

        Object.defineProperty(input.element, 'files', { value: [file] });
        await input.trigger('change');
        await wrapper.vm.$nextTick();

        expect(mockImportNote).toHaveBeenCalledWith(file);
    });

    it('shows errorToast if no file selected on import', async () => {
        const wrapper = mount(NotesArchivePage);
        const input = wrapper.find('input[type="file"]');

        Object.defineProperty(input.element, 'files', { value: [] });
        await input.trigger('change');
        await wrapper.vm.$nextTick();

        expect(mockErrorToast).toHaveBeenCalledWith(
            "Errore nell'importazione della nota",
            'Nessun file selezionato'
        );
    });
});