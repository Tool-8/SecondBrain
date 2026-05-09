import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { ref } from 'vue';

let mockTheme = ref('light')
const mockSetTheme = vi.fn()

vi.mock('@/composables/useTheme', () => ({
    useTheme: () => ({
        theme:    mockTheme,
        setTheme: mockSetTheme,
    }),
}));

vi.mock('@/components/icons/IconZucchetti.vue', () => ({
    default: { template: '<span />' },
}));

vi.mock('@/components/navigation/NavItem.vue', () => ({
    default: { template: '<li />', props: ['label', 'to'] },
}));

vi.mock('@/components/navigation/NavButton.vue', () => ({
    default: { template: '<li />', props: ['label', 'to'] },
}));

async function mountWithRoute(path: string) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/',          component: { template: '<div />' } },
            { path: '/notes/new', component: { template: '<div />' } },
            { path: '/notes/:id', component: { template: '<div />' } },
        ],
    });

    await router.push(path);
    await router.isReady();

    return mount(AppSidebar, {
        global: { plugins: [router] },
    });
}

describe('AppSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockTheme = ref('light');
    });

    describe('stato iniziale', () => {
        it('it\'s open home on / ', async () => {
            const wrapper = await mountWithRoute('/');
            expect(wrapper.find('aside').classes()).toContain('w-64');
        });

        it('it\'s closed on /notes/new', async () => {
            const wrapper = await mountWithRoute('/notes/new');
            expect(wrapper.find('aside').classes()).toContain('w-0');
        });

        it('it\'s closed on /notes/:id', async () => {
            const wrapper = await mountWithRoute('/notes/123');
            expect(wrapper.find('aside').classes()).toContain('w-0');
        });
    });

    describe('toggleSidebar', () => {
        it('open if closed', async () => {
            const wrapper = await mountWithRoute('/notes/new');
            expect(wrapper.find('aside').classes()).toContain('w-0');

            await wrapper.find('button').trigger('click');

            expect(wrapper.find('aside').classes()).toContain('w-64');
        });

        it('close if opened', async () => {
            const wrapper = await mountWithRoute('/');
            expect(wrapper.find('aside').classes()).toContain('w-64');

            await wrapper.find('button').trigger('click');

            expect(wrapper.find('aside').classes()).toContain('w-0');
        });
    });

    describe('theme', () => {
        it('light button it\'s active when theme is light', async () => {
            mockTheme = ref('light');
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            expect(buttons[0].attributes('data-active')).toBe('true');
            expect(buttons[1].attributes('data-active')).toBe('false');
            expect(buttons[2].attributes('data-active')).toBe('false');
        });

        it('dark button it\'s active when theme is dark', async () => {
            mockTheme = ref('dark');
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            expect(buttons[0].attributes('data-active')).toBe('false');
            expect(buttons[1].attributes('data-active')).toBe('true');
            expect(buttons[2].attributes('data-active')).toBe('false');
        });

        it('system button it\'s active when theme is system', async () => {
            mockTheme = ref('system');
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            expect(buttons[0].attributes('data-active')).toBe('false');
            expect(buttons[1].attributes('data-active')).toBe('false');
            expect(buttons[2].attributes('data-active')).toBe('true');
        });

        it('calls setTheme("light") on light button click', async () => {
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            await buttons[0].trigger('click');
            expect(mockSetTheme).toHaveBeenCalledWith('light');
        });

        it('calls setTheme("dark") on dark button click', async () => {
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            await buttons[1].trigger('click');
            expect(mockSetTheme).toHaveBeenCalledWith('dark');
        });

        it('calls setTheme("system") on system button click', async () => {
            const wrapper = await mountWithRoute('/');
            const buttons = wrapper.findAll('[data-active]');
            await buttons[2].trigger('click');
            expect(mockSetTheme).toHaveBeenCalledWith('system');
        });
    });
});