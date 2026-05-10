import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import NoteArchiveCard from '@/components/NoteArchiveCard.vue';

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/notes/:id', component: { template: '<div />' } },
    ],
});

const defaultProps = {
    id: '1',
    name: 'Titolo nota',
    last_edit: '15/01/2024 - 10:30:00',
    creation:  '10/01/2024 - 08:00:00',
};

describe('NoteArchiveCard', () => {
    it('shows note name', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  defaultProps,
            global: { plugins: [router] },
        });
        expect(wrapper.find('p.font-bold').text()).toBe('Titolo nota');
    });

    it('shows last edit timestamp', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  defaultProps,
            global: { plugins: [router] },
        });
        expect(wrapper.text()).toContain('Data modifica: 15/01/2024 - 10:30:00');
    });

    it('shows creation timestamp', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  defaultProps,
            global: { plugins: [router] },
        });
        expect(wrapper.text()).toContain('Data creazione: 10/01/2024 - 08:00:00');
    });

    it('link points to /notes/:id', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  defaultProps,
            global: { plugins: [router] },
        });
        expect(wrapper.find('a').attributes('href')).toBe('/notes/1');
    });

    it('link falls back to # when id is empty', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  { ...defaultProps, id: '' },
            global: { plugins: [router] },
        });
        expect(wrapper.find('a').attributes('href')).toBe('/#');
    });

    it('renders as a li element', () => {
        const wrapper = mount(NoteArchiveCard, {
            props:  defaultProps,
            global: { plugins: [router] },
        });
        expect(wrapper.find('li').exists()).toBe(true);
    });
});