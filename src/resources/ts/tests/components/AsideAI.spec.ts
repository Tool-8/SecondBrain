import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AsideAI  from '@/components/AsideAI.vue';


const { mockSuccessToast, mockErrorToast } = vi.hoisted(() => ({
    mockSuccessToast: vi.fn(),
    mockErrorToast: vi.fn(),
}));

vi.mock('@/composables/useToast', () => ({
    useToast: () => ({
        successToast: mockSuccessToast,
        errorToast: mockErrorToast,
    }),
}));

vi.mock('@/components/GeneralButton.vue', () => ({
    default: {
        props: ['label', 'disabled'],
        emits: ['click'],
        template: '<button :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>',
    },
}));


const defaultProps = {
    open:          true,
    action:        null as 'summarize' | 'hats' | 'translate' | 'rewrite' | 'distant writing' | null,
    selectedText:  '',
    result:        '',
    loading:       false,
    hatMode:       'white' as 'white' | 'red' | 'black' | 'yellow' | 'green' | 'blue',
    languageMode:  'en' as 'it' | 'en' | 'fr' | 'de' | 'es',
    rewriteStyle:  ['grammar'] as ('grammar' | 'extension' | 'lexicon' | 'stylistic')[],
};

describe('AsideAI', () => {
    beforeEach(() => {
        mockSuccessToast.mockReset();
        mockErrorToast.mockReset();
    });

    describe('visibility', () => {
        it('visible when open is true', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, open: true } });
            expect(wrapper.find('aside').classes()).toContain('translate-x-0');
        });

        it('hidden whe open is false', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, open: false } });
            expect(wrapper.find('aside').classes()).toContain('translate-x-full');
        });
    });

    describe('panelTitle', () => {
        it.each([
            ['summarize', 'Riassumi'],
            ['rewrite', 'Riscrivi'],
            ['distant writing', 'Distant writing'],
            ['hats', 'Sei cappelli'],
            ['translate', 'Traduci'],
            [null, 'AI Brain'],
        ])('shows "%s" as panelTitle for action %s', (action, expected) => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: action as any } });
            expect(wrapper.find('p.font-jetbrains').text()).toBe(expected);
        });
    });

    describe('actionLabel', () => {
        it.each([
            ['summarize', 'Riassumi'],
            ['rewrite', 'Riscrivi'],
            ['distant writing', 'Genera'],
            ['hats', 'Applica cappello'],
            ['translate', 'Traduci'],
            [null, 'Azione'],
        ])('shows "%s" as actionLabel for action %s', (action, expected) => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: action as any } });
            const button = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            expect(button.props('label')).toBe(expected);
        });
    });

    describe('selectedText', () => {
        it('shows selectedText', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, selectedText: 'Testo di prova' } });
            expect(wrapper.text()).toContain('Testo di prova');
        });

        it('shows the placeholder if there is not selectedText', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, selectedText: '' } });
            expect(wrapper.text()).toContain('Nessun testo selezionato');
        });
    });

    describe('actions', () => {

        it('shows select hats when action is hats', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: 'hats' } });
            expect(wrapper.find('option[value="white"]').exists()).toBe(true);
        });

        it('shows select translate when action is translate', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: 'translate' } });
            expect(wrapper.find('option[value="it"]').exists()).toBe(true);
        });

        it('shows all rewrite style buttons when action is rewrite', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: 'rewrite' } });
            const buttons = wrapper.findAll('button.rounded-full');
            const labels = buttons.map(b => b.text());

            expect(labels).toContain('grammar');
            expect(labels).toContain('extension');
            expect(labels).toContain('lexicon');
            expect(labels).toContain('stylistic');
            expect(buttons).toHaveLength(4);
        });

        it('does not show copy button if result is empty', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, result: '' } });
            expect(wrapper.find('button.text-blue-600').exists()).toBe(false);
        });

        it('shows copy button if result is not empty', () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, result: 'Risultato AI' } });
            expect(wrapper.find('button.text-blue-600').exists()).toBe(true);
        });
    });

    it('emits close on Chiudi click su', async () => {
        const wrapper = mount(AsideAI, { props: defaultProps });
        await wrapper.find('button').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits update:hatMode on select change', async () => {
        const wrapper = mount(AsideAI, { props: { ...defaultProps, action: 'hats' } });
        const select = wrapper.find('select');
        await select.setValue('red');
        expect(wrapper.emitted('update:hatMode')?.[0]).toEqual(['red']);
    });

    it('emits update:languageMode on select change', async () => {
        const wrapper = mount(AsideAI, { props: { ...defaultProps, action: 'translate' } });
        const select = wrapper.find('select');
        await select.setValue('fr');
        expect(wrapper.emitted('update:languageMode')?.[0]).toEqual(['fr']);
    });

    describe('toggleStyle', () => {
        it('adds a style if not already added', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'rewrite', rewriteStyle: ['grammar'] },
            });
            const buttons = wrapper.findAll('button.rounded-full');
            const extensionBtn = buttons.find(b => b.text() === 'extension');
            await extensionBtn?.trigger('click');
            expect(wrapper.emitted('update:rewriteStyle')?.[0]).toEqual([['grammar', 'extension']]);
        });

        it('removes a style if there is at least one', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'rewrite', rewriteStyle: ['grammar', 'lexicon'] },
            });
            const buttons = wrapper.findAll('button.rounded-full');
            const grammarBtn = buttons.find(b => b.text() === 'grammar');
            await grammarBtn?.trigger('click');
            expect(wrapper.emitted('update:rewriteStyle')?.[0]).toEqual([['lexicon']]);
        });

        it('does not remove style if last one', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'rewrite', rewriteStyle: ['grammar'] },
            });
            const buttons = wrapper.findAll('button.rounded-full');
            const grammarBtn = buttons.find(b => b.text() === 'grammar');
            await grammarBtn?.trigger('click');
            expect(wrapper.emitted('update:rewriteStyle')).toBeFalsy();
        });
    });

    describe('runAction', () => {
        it('does not emit run if action is null', async () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, action: null } });
            const actionButton = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            await actionButton.trigger('click');
            expect(wrapper.emitted('run')).toBeFalsy();
        });

        it('emits run with summarizeMode for summarize', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, selectedText: 'Testo da riassumere', action: 'summarize'},
            });
            const actionButton = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            await actionButton.trigger('click');
            expect(wrapper.emitted('run')?.[0]).toEqual([{
                action: 'summarize', selectedText: 'Testo da riassumere', option: '',
            }]);
        });

        it('emits run with option hatMode for hats', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'hats', selectedText: 'Testo da criticare',  hatMode: 'red' },
            });
            const actionButton = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            await actionButton.trigger('click');
            expect(wrapper.emitted('run')?.[0]).toEqual([{
                action: 'hats', selectedText: 'Testo da criticare', option: 'red',
            }]);
        });

        it('emits run with option languageMode for translate', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'translate', selectedText: 'Testo da tradurre', languageMode: 'fr' },
            });
            const actionButton = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            await actionButton.trigger('click');
            expect(wrapper.emitted('run')?.[0]).toEqual([{
                action: 'translate', selectedText: 'Testo da tradurre', option: 'fr',
            }]);
        });

        it('emits run with style for rewrite', async () => {
            const wrapper = mount(AsideAI, {
                props: { ...defaultProps, action: 'rewrite', selectedText: 'Testo da riscrivere', rewriteStyle: ['grammar', 'lexicon'] },
            });
            const actionButton = wrapper.findAllComponents({ name: 'GeneralButton' })[0];
            await actionButton.trigger('click');
            expect(wrapper.emitted('run')?.[0]).toEqual([{
                action: 'rewrite', selectedText: 'Testo da riscrivere', option: 'grammar,lexicon',
            }]);
        });
    });

    describe('copyToClipboard', () => {
        beforeEach(() => {
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
            });
        });

        it('copy result and show successToast', async () => {
            const wrapper = mount(AsideAI, { props: { ...defaultProps, result: 'Risultato AI' } });
            await wrapper.find('button.text-blue-600').trigger('click');
            await wrapper.vm.$nextTick();
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Risultato AI');
            expect(mockSuccessToast).toHaveBeenCalledWith('Copiato', 'Risultato copiato negli appunti');
        });

        it('shows errorToast if copy fails', async () => {
            Object.assign(navigator, {
                clipboard: {
                    writeText: vi.fn().mockRejectedValue(new Error('Errore')),
                },
            });
            const wrapper = mount(AsideAI, { props: { ...defaultProps, result: 'Risultato AI' } });
            await wrapper.find('button.text-blue-600').trigger('click');
            await wrapper.vm.$nextTick();
            expect(mockErrorToast).toHaveBeenCalledWith('Errore durante la copia', 'Qualcosa è andato storto durante la copia');
        });
    });

    describe('insert', () => {
        it.each([
            ['prima',                 'before'],
            ['dopo',                  'after'],
            ['sostituisci',           'replace'],
            ['in fondo alla pagina',  'bottom'],
        ])('emits insert with "%s" on "%s" click', async (label, mode) => {
            const wrapper = mount(AsideAI, { props: defaultProps });
            const buttons = wrapper.findAllComponents({ name: 'GeneralButton' });
            const btn = buttons.find(b => b.props('label') === label);
            await btn?.trigger('click');
            expect(wrapper.emitted('insert')?.[0]).toEqual([mode]);
        });
    });
});