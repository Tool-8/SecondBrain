import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NoteEditorContent from '@/components/NoteEditorContent.vue';
import { nextTick } from 'vue';

describe('NoteEditorContent.vue', () => {
    const defaultProps = {
        content: '# Titolo ',
        viewMode: 'split' as const,
        renderedHtml: '<h1> Titolo </h1>'
    };

    it('renders correctly in split mode', () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        
        const editor = wrapper.find('#editor');
        const render = wrapper.find('#render');
        
        expect(editor.isVisible()).toBe(true);
        expect(render.isVisible()).toBe(true);
    });

    it('shows only editor when viewMode is editor', async () => {
        const wrapper = mount(NoteEditorContent, { 
            props: { ...defaultProps, viewMode: 'editor' } 
        });
        
        expect(wrapper.find('#editor').isVisible()).toBe(true);
        expect(wrapper.find('#render').isVisible()).toBe(false);
    });

    it('shows only render when viewMode is render', async () => {
        const wrapper = mount(NoteEditorContent, { 
            props: { ...defaultProps, viewMode: 'render' } 
        });
        
        expect(wrapper.find('#editor').isVisible()).toBe(false);
        expect(wrapper.find('#render').isVisible()).toBe(true);
    });

    it('emits editor-ready with the element on mount', () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        
        const emitted = wrapper.emitted('editor-ready');
        expect(emitted).toBeTruthy();
        expect(emitted![0][0]).toBeInstanceOf(HTMLElement);
    });

    it('syncs editor innerHTML when content prop changes', async () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        const editor = wrapper.find('#editor').element;
        
        const newContent = '# Nuovo titolo';
        await wrapper.setProps({ content: newContent });
        await nextTick();

        expect(editor.innerHTML).toBe(newContent);
    });

    it('emits input event when user types in the editor', async () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        const editor = wrapper.find('#editor');
        
        await editor.trigger('input');
        
        expect(wrapper.emitted('input')).toBeTruthy();
    });

    it('emits paste event with clipboard data', async () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        const editor = wrapper.find('#editor');

        await editor.trigger('paste', {
            clipboardData: {
                getData: () => 'test data'
            }
        });
        
        expect(wrapper.emitted('paste')).toBeTruthy();
    });


    it('renders HTML content correctly in the render section', () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        const renderDiv = wrapper.find('.prose');
        
        expect(renderDiv.html()).toContain('Titolo');
    });

    it('emits click event when editor is clicked', async () => {
        const wrapper = mount(NoteEditorContent, { props: defaultProps });
        await wrapper.find('#editor').trigger('click');
        
        expect(wrapper.emitted('click')).toBeTruthy();
    });
});
