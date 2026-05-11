import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NoteEditorToolbar from '@/components/NoteEditorToolbar.vue';

const defaultProps = {
    wordCount: 10,
    charCount: 50,
};

describe('NoteEditorToolbar', () => {
    it('shows word count', () => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        expect(wrapper.text()).toContain('10');
    });

    it('shows char count', () => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        expect(wrapper.text()).toContain('50');
    });

    it('emits undo on click undo button', async () => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        await wrapper.find('button[title="undo"]').trigger('click');
        expect(wrapper.emitted('undo')).toBeTruthy();
    });

    it('emits redo on click redo button', async () => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        await wrapper.find('button[title="redo"]').trigger('click');
        expect(wrapper.emitted('redo')).toBeTruthy();
    });

    it.each([
        ['grassetto', 'bold'],
        ['italico', 'italic'],
        ['sottolineato', 'underline'],
        ['barrato', 'strikethrough'],
        ['commento', 'comment'],
        ['link', 'link'],
        ['elenco numerato', 'ordered_list'],
        ['elenco puntato', 'unordered_list'],
    ])('%s: emits format with %s on click', async (title, type) => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        await wrapper.find(`button[title="${title}"]`).trigger('click');
        expect(wrapper.emitted('format')?.[0]).toEqual([type]);
    });

    it.each([
        ['Riassumi', 'summarize'],
        ['Critica', 'hats'],
        ['Traduci', 'translate'],
        ['Riscrivi', 'rewrite'],
        ['Distant Writing', 'distant writing'],
    ])('%s: emits ai with %s on click', async (label, action) => {
        const wrapper = mount(NoteEditorToolbar, { props: defaultProps });
        const btn = wrapper.findAll('button').find(b => b.text() === label);
        await btn?.trigger('click');
        expect(wrapper.emitted('ai')?.[0]).toEqual([action]);
    });
});