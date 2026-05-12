import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLayout from '@/layouts/AppLayout.vue'

vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router') as any
    return {
        ...actual,
        useRoute: () => ({
            path: '/',
            fullPath: '/'
        }),
        useRouter: () => ({
            push: vi.fn()
        })
    }
})

describe('AppLayout', () => {
    const createWrapper = () => {
        return mount(AppLayout, {
            global: {
                stubs: {
                    AppSidebar: {
                        template: '<div data-testid="sidebar">Sidebar Mock</div>'
                    },
                    RouterView: {
                        template: '<div data-testid="router-view">RouterView Mock</div>'
                    }
                },
                mocks: {
                    $route: {
                        fullPath: '/'
                    }
                }
            }
        })
    }

    it('should render the layout container with correct flex classes', () => {
        const wrapper = createWrapper()
        const container = wrapper.find('.flex.min-h-screen')
        
        expect(container.exists()).toBe(true)
    })

    it('should render the AppSidebar component', () => {
        const wrapper = createWrapper()
        const sidebar = wrapper.find('[data-testid="sidebar"]')
        
        expect(sidebar.exists()).toBe(true)
        expect(sidebar.text()).toBe('Sidebar Mock')
    })

    it('should render the RouterView within the main content area', () => {
        const wrapper = createWrapper()
        const main = wrapper.find('main')
        const routerView = wrapper.find('[data-testid="router-view"]')

        expect(main.exists()).toBe(true)
        expect(main.classes()).toContain('flex-1')
        expect(main.classes()).toContain('h-dvh')
        
        expect(routerView.exists()).toBe(true)
        expect(main.find('[data-testid="router-view"]').exists()).toBe(true)
    })
})
