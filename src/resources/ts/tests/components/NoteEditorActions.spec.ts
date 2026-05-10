import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NoteEditorActions from '@/components/NoteEditorActions.vue';
import { useNoteEditor } from '@/composables/useNoteEditor';

const mockSaveTheNote = vi.fn();
const mockSaveTheNoteAs = vi.fn();
const mockExportTheNote = vi.fn();

vi.mock('@/composables/useNoteEditor', () => ({
    useNoteEditor: vi.fn(() => ({
        saveTheNote: mockSaveTheNote,
        saveTheNoteAs: mockSaveTheNoteAs,
        exportTheNote: mockExportTheNote,
        isNew: false
    }))
}));

describe('NoteEditorActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls saveTheNote when Save button is clicked', async () => {
        const wrapper = mount(NoteEditorActions);
        const buttons = wrapper.findAllComponents({ name: 'GeneralButton' });
        const saveBtn = buttons.find(b => b.props('label') === 'Salva');
        
        await saveBtn?.vm.$emit('click');
        expect(mockSaveTheNote).toHaveBeenCalled();
    });

    it('disables "Salva come.." button if isNew is true', () => {
        vi.mocked(useNoteEditor).mockReturnValueOnce({
            isNew: true,
            saveTheNote: mockSaveTheNote,
            saveTheNoteAs: mockSaveTheNoteAs,
            exportTheNote: mockExportTheNote,
        } as any); 

        const wrapper = mount(NoteEditorActions);
        const saveAsBtn = wrapper.findAllComponents({ name: 'GeneralButton' })
                                 .find(b => b.props('label') === 'Salva come..');
        
        expect(saveAsBtn?.props('disabled')).toBe(true);
    });

    it('opens export menu on "Esporta" click and show options', async () => {
        const wrapper = mount(NoteEditorActions);
        const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Esporta'));
        
        await exportBtn?.trigger('click');
        
        const contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        expect(contextMenu.exists()).toBe(true);
        expect(contextMenu.props('actions')).toHaveLength(3);
    });

    it('calls exportTheNote with pdf format when an action is clicked', async () => {
        const wrapper = mount(NoteEditorActions);
        const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Esporta'));
        
        await exportBtn?.trigger('click');

        const contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        const actionsFromProps = contextMenu.props('actions');
        const pdfAction = actionsFromProps.find((a: any) => a.label === 'Esporta in PDF');
        
        await contextMenu.vm.$emit('action-clicked', pdfAction);
        
        expect(mockExportTheNote).toHaveBeenCalledWith('pdf');
    });

    it('calls exportTheNote with html format when an action is clicked', async () => {
        const wrapper = mount(NoteEditorActions);
        const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Esporta'));
        
        await exportBtn?.trigger('click');

        const contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        const actionsFromProps = contextMenu.props('actions');
        const htmlAction = actionsFromProps.find((a: any) => a.label === 'Esporta in HTML');
        
        await contextMenu.vm.$emit('action-clicked', htmlAction);
        
        expect(mockExportTheNote).toHaveBeenCalledWith('html');
    });

    it('calls exportTheNote with md format when an action is clicked', async () => {
        const wrapper = mount(NoteEditorActions);
        const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Esporta'));
        
        await exportBtn?.trigger('click');

        const contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        const actionsFromProps = contextMenu.props('actions');
        const mdAction = actionsFromProps.find((a: any) => a.label === 'Esporta in MD');
        
        await contextMenu.vm.$emit('action-clicked', mdAction);
        
        expect(mockExportTheNote).toHaveBeenCalledWith('md');
    });

    it('closes the menu after an action has been executed', async () => {
        const wrapper = mount(NoteEditorActions);
        const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Esporta'));
        
        await exportBtn?.trigger('click');
        let contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        expect(contextMenu.exists()).toBe(true);

        const actionsFromProps = contextMenu.props('actions');
        const firstAction = actionsFromProps[0];
        
        await contextMenu.vm.$emit('action-clicked', firstAction);

        contextMenu = wrapper.findComponent({ name: 'ContextMenu' });
        expect(contextMenu.exists()).toBe(false);
    });
});
