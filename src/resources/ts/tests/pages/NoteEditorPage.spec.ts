import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import NoteEditorPage from '@/pages/NoteEditorPage.vue';

vi.mock('@/components/AsideAI.vue', () => ({ default: { name: 'AsideAI', template: '<div />' } }));
vi.mock('@/components/NoteEditorHeader.vue', () => ({ default: { name: 'NoteEditorHeader', template: '<div />' } }));
vi.mock('@/components/NoteEditorToolbar.vue', () => ({ default: { name: 'NoteEditorToolbar', template: '<div />' } }));
vi.mock('@/components/NoteEditorContent.vue', () => ({ default: { name: 'NoteEditorContent', template: '<div />' } }));

const mockDiscardPromiseStart = vi.fn();
vi.mock('@/composables/useModals', () => ({
    useModals: () => ({
        DiscardPromise: { start: mockDiscardPromiseStart }
    })
}));

const mockNoteEditor = {
    noteName: ref('New Note'),
    noteContent: ref('Hello World'),
    isDirty: ref(false),
    saveTheNote: vi.fn(),
    loadNote: vi.fn(),
    setEditorContent: vi.fn(),
};

vi.mock('@/composables/useNoteEditor', () => ({
    provideNoteEditor: () => mockNoteEditor
}));

const mockUI = {
    viewMode: ref('edit'),
    isAiOpen: ref(false),
    aiAction: ref(''),
    selectedText: ref(''),
    aiResult: ref(''),
    loading: ref(false),
    hatMode: ref('red'),
    languageMode: ref('en'),
    rewriteStyle: ref('grammar'),
    renderedHtml: ref('<p>Hello</p>'),
    wordCount: ref(2),
    charCount: ref(11),
    setViewMode: vi.fn(),
    setEditorRef: vi.fn(),
    handleEditorInput: vi.fn(),
    undoEdit: vi.fn(),
    redoEdit: vi.fn(),
    applyFormat: vi.fn(),
    openAiPanel: vi.fn(),
    closeAiPanel: vi.fn(),
    handleAiRun: vi.fn(),
    insertAiResult: vi.fn(),
    handleBeforeInput: vi.fn(),
    handlePaste: vi.fn(),
    handleEditorKeydown: vi.fn(),
    retranslateAiBlock: vi.fn(),
};

vi.mock('@/composables/useNoteEditorUI', () => ({
    useNoteEditorUI: () => mockUI
}));

let capturedNavigationGuard: any = null;
vi.mock('vue-router', () => ({
    onBeforeRouteLeave: (guard: any) => {
        capturedNavigationGuard = guard;
    }
}));

describe('NoteEditorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNoteEditor.isDirty.value = false;
        mockUI.isAiOpen.value = false;
        capturedNavigationGuard = null;
    });

    it('should initialize by calling loadNote', () => {
        mount(NoteEditorPage);
        expect(mockNoteEditor.loadNote).toHaveBeenCalled();
    });

    it('should apply blur classes when AI panel is open', async () => {
        mockUI.isAiOpen.value = true;
        const wrapper = mount(NoteEditorPage);
        const container = wrapper.find('#noteEditor');
        
        expect(container.classes()).toContain('blur-xs');
        expect(container.classes()).toContain('pointer-events-none');
    });

    it('should not apply blur classes when AI panel is closed', async () => {
        mockUI.isAiOpen.value = false;
        const wrapper = mount(NoteEditorPage);
        const container = wrapper.find('#noteEditor');
        
        expect(container.classes()).not.toContain('blur-xs');
    });

    describe('Navigation Guard (onBeforeRouteLeave)', () => {
        it('should allow navigation if the note is not dirty', async () => {
            mount(NoteEditorPage);
            const next = vi.fn();
            
            await capturedNavigationGuard({}, {}, next);
            
            expect(next).toHaveBeenCalledWith();
            expect(mockDiscardPromiseStart).not.toHaveBeenCalled();
        });

        it('should prompt user to save when note is dirty', async () => {
            mockNoteEditor.isDirty.value = true;
            mockDiscardPromiseStart.mockResolvedValue('discard');
            mount(NoteEditorPage);
            const next = vi.fn();

            await capturedNavigationGuard({}, {}, next);

            expect(mockDiscardPromiseStart).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith();
        });

        it('should call saveTheNote and proceed if user chooses "save"', async () => {
            mockNoteEditor.isDirty.value = true;
            mockDiscardPromiseStart.mockResolvedValue('save');
            mount(NoteEditorPage);
            const next = vi.fn();

            await capturedNavigationGuard({}, {}, next);

            expect(mockNoteEditor.saveTheNote).toHaveBeenCalledWith(true);
            expect(next).toHaveBeenCalled();
        });

        it('should cancel navigation if user cancels the modal', async () => {
            mockNoteEditor.isDirty.value = true;
            mockDiscardPromiseStart.mockResolvedValue('cancel');
            mount(NoteEditorPage);
            const next = vi.fn();

            await capturedNavigationGuard({}, {}, next);

            expect(next).toHaveBeenCalledWith(false);
        });
    });

    describe('Component Interactivity', () => {
        it('should trigger saveTheNote when NoteEditorHeader emits "save"', async () => {
            const wrapper = mount(NoteEditorPage);
            const header = wrapper.findComponent({ name: 'NoteEditorHeader' });
            
            await header.vm.$emit('save');
            expect(mockNoteEditor.saveTheNote).toHaveBeenCalled();
        });

        it('should open AI panel when NoteEditorToolbar emits "ai"', async () => {
            const wrapper = mount(NoteEditorPage);
            const toolbar = wrapper.findComponent({ name: 'NoteEditorToolbar' });
            
            await toolbar.vm.$emit('ai');
            expect(mockUI.openAiPanel).toHaveBeenCalled();
        });

        it('should handle editor click for retranslation blocks', async () => {
            const wrapper = mount(NoteEditorPage);
            const content = wrapper.findComponent({ name: 'NoteEditorContent' });

            const mockTarget = document.createElement('button');
            mockTarget.setAttribute('data-ai-retranslate', 'true');
            const mockChild = document.createElement('div');
            mockChild.setAttribute('data-ai-child', 'true');
            mockChild.appendChild(mockTarget);

            const mockEvent = {
                target: mockTarget
            } as unknown as MouseEvent;

            await content.vm.$emit('click', mockEvent);
            
            expect(mockUI.retranslateAiBlock).toHaveBeenCalled();
        });
    });

    it('should update state when AsideAI emits update events', async () => {
        const wrapper = mount(NoteEditorPage);
        const asideAI = wrapper.findComponent({ name: 'AsideAI' });

        await asideAI.vm.$emit('update:hatMode', 'red');
        expect(mockUI.hatMode.value).toBe('red');

        await asideAI.vm.$emit('update:languageMode', 'fr');
        expect(mockUI.languageMode.value).toBe('fr');

        await asideAI.vm.$emit('update:rewriteStyle', 'lexicon');
        expect(mockUI.rewriteStyle.value).toBe('lexicon');
    });
});