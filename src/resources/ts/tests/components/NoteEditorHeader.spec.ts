import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NoteEditorHeader from '@/components/NoteEditorHeader.vue';

vi.mock('@/components/NoteEditorActions.vue', () => ({
    default: { template: '<div />' },
}));

const defaultProps = {
    name:     'Titolo nota',
    isDirty:  false,
    viewMode: 'split' as const,
};

describe('NoteEditorHeader', () => {
    it('shows note name in input', () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        expect(wrapper.find('input').element.value).toBe('Titolo nota');
    });

    it('shows saved status when not dirty', () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        expect(wrapper.text()).toContain('salvato');
        expect(wrapper.text()).not.toContain('non salvato');
    });

    it('shows unsaved status when dirty', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, isDirty: true } });
        expect(wrapper.text()).toContain('non salvato');
    });

    it('indicator is green when not dirty', () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        expect(wrapper.find('span.inline-block').classes()).toContain('bg-green-500');
    });

    it('indicator is yellow when dirty', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, isDirty: true } });
        expect(wrapper.find('span.inline-block').classes()).toContain('bg-yellow-500');
    });

    it('emits update:name on input', async () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        await wrapper.find('input').setValue('Nuovo titolo');
        expect(wrapper.emitted('update:name')?.[0]).toEqual(['Nuovo titolo']);
    });

    it('emits change-view with editor on click Editor', async () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        const buttons = wrapper.findAll('button');
        await buttons.find(b => b.text() === 'Editor')?.trigger('click');
        expect(wrapper.emitted('change-view')?.[0]).toEqual(['editor']);
    });

    it('emits change-view with split on click Split', async () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        const buttons = wrapper.findAll('button');
        await buttons.find(b => b.text() === 'Split')?.trigger('click');
        expect(wrapper.emitted('change-view')?.[0]).toEqual(['split']);
    });

    it('emits change-view with render on click Render', async () => {
        const wrapper = mount(NoteEditorHeader, { props: defaultProps });
        const buttons = wrapper.findAll('button');
        await buttons.find(b => b.text() === 'Render')?.trigger('click');
        expect(wrapper.emitted('change-view')?.[0]).toEqual(['render']);
    });

    it('Editor button is active when viewMode is editor', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, viewMode: 'editor' } });
        const editorBtn = wrapper.findAll('button').find(b => b.text() === 'Editor');
        expect(editorBtn?.attributes('active')).toBeDefined();
    });

    it('Split button is active when viewMode is split', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, viewMode: 'split' } });
        const splitBtn = wrapper.findAll('button').find(b => b.text() === 'Split');
        expect(splitBtn?.attributes('active')).toBeDefined();
    });

    it('Render button is active when viewMode is render', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, viewMode: 'render' } });
        const renderBtn = wrapper.findAll('button').find(b => b.text() === 'Render');
        expect(renderBtn?.attributes('active')).toBeDefined();
    });

    it('Editor button is not active when viewMode is split', () => {
        const wrapper = mount(NoteEditorHeader, { props: { ...defaultProps, viewMode: 'split' } });
        const editorBtn = wrapper.findAll('button').find(b => b.text() === 'Editor');
        expect(editorBtn?.attributes('active')).toBeUndefined();
    });
});