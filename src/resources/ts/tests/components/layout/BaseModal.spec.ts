import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseModal from '@/components/layout/BaseModal.vue';

describe('BaseModal', () => {
    it('si monta senza errori', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it('mostra il titolo di default nello slot header', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
        });
        expect(wrapper.find('h2').text()).toBe('Titolo test');
    });

    it('ha role="dialog"', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
        });
        expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    });

    it('renders lo slot body', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
            slots: {
                body: '<p>Contenuto body</p>',
            },
        });
        expect(wrapper.find('p').text()).toBe('Contenuto body');
    });

    it('renders lo slot footer', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
            slots: {
                footer: '<button>Conferma</button>',
            },
        });
        expect(wrapper.find('footer button').text()).toBe('Conferma');
    });

    it('sovrascrive lo slot header', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
            slots: {
                header: '<h1>Header custom</h1>',
            },
        });
        expect(wrapper.find('h1').text()).toBe('Header custom');
        expect(wrapper.find('h2').exists()).toBe(false);
    });

    it('renders più elementi nello slot footer', () => {
        const wrapper = mount(BaseModal, {
            props: { title: 'Titolo test' },
            slots: {
                footer: '<button>Annulla</button><button>Conferma</button>',
            },
        });
        const buttons = wrapper.findAll('footer button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0].text()).toBe('Annulla');
        expect(buttons[1].text()).toBe('Conferma');
    });
});