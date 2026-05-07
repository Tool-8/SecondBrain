import { mount, VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest'
import ActionToast from '@/components/ActionToast.vue'
import type { ToastType } from '@/composables/useToast';
import IconCheck from '@/components/icons/IconCheck.vue';
import IconError from '@/components/icons/IconError.vue';
import IconWarning from '@/components/icons/IconWarning.vue';
import IconInfo from '@/components/icons/IconInfo.vue';

describe('ActionToast', () => {
    const title = 'Test Title';
    const message = 'Test Message';

    const toastColorMap: Record<ToastType, string> = {
        success:
            'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-800',
        error: 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-800',
        warning:
            'border-yellow-500 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-800',
        info: 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-800',
    };

    const toastCancelButtonColorMap: Record<ToastType, string> = {
        success:
            'border-green-500 bg-green-50 hover:bg-green-500 dark:border-green-400 dark:bg-green-800 dark:hover:bg-green-400 text-green-700 hover:text-green-200 dark:text-green-200 dark:hover:text-green-700',
        error: 'border-red-500 bg-red-50 hover:bg-red-500 dark:border-red-400 dark:bg-red-800 dark:hover:bg-red-400 text-red-700 hover:text-red-200 dark:text-red-200 dark:hover:text-red-700',
        warning:
            'border-yellow-500 bg-yellow-50 hover:bg-yellow-500 dark:border-yellow-400 dark:bg-yellow-800 dark:hover:bg-yellow-400 text-yellow-700 hover:text-yellow-200 dark:text-yellow-200 dark:hover:text-yellow-700',
        info: 'border-blue-500 bg-blue-50 hover:bg-blue-500 dark:border-blue-400 dark:bg-blue-800 dark:hover:bg-blue-400 text-blue-700 hover:text-blue-200 dark:text-blue-200 dark:hover:text-blue-700',
    };

    const toastIconColorMap: Record<ToastType, string> = {
        success: 'text-green-700 dark:text-green-200',
        error: 'text-red-700 dark:text-red-200',
        warning: 'text-yellow-700 dark:text-yellow-200',
        info: 'text-blue-700 dark:text-blue-200',
    };

    const toastTitleColorMap: Record<ToastType, string> = {
        success: 'text-green-800 dark:text-green-100',
        error: 'text-red-800 dark:text-red-100',
        warning: 'text-yellow-800 dark:text-yellow-100',
        info: 'text-blue-800 dark:text-blue-100',
    };

    const toastMessageColorMap: Record<ToastType, string> = {
        success: 'text-green-700 dark:text-green-200',
        error: 'text-red-700 dark:text-red-200',
        warning: 'text-yellow-700 dark:text-yellow-200',
        info: 'text-blue-700 dark:text-blue-200',
    };

    function checkColors(colorClasses: string[], expectedColors: string[]) {
        for (const colorClass of expectedColors) {
            expect(colorClasses).toContain(colorClass);
        }
    }

    function checkToastColors(wrapper: VueWrapper<any>, type: ToastType) {
        const containerClasses = wrapper
            .find('[data-testid="toast-container"]')
            .classes();
        checkColors(containerClasses, toastColorMap[type].split(' '));

        const iconClasses = wrapper
            .find('[data-testid="toast-icon"]')
            .classes();
        checkColors(iconClasses, toastIconColorMap[type].split(' '));

        const titleClasses = wrapper.find('strong').classes();
        checkColors(titleClasses, toastTitleColorMap[type].split(' '));

        const messageClasses = wrapper.find('p').classes();
        checkColors(messageClasses, toastMessageColorMap[type].split(' '));

        const cancelButtonClasses = wrapper.find('button').classes();
        checkColors(
            cancelButtonClasses,
            toastCancelButtonColorMap[type].split(' ')
        );
    }

    // Test parametri
    it('renders string props on the toast (props.title and props.message)', () => {
        const type: ToastType = 'success';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        expect(wrapper.find('strong').text()).toBe(title);
        expect(wrapper.find('p').text()).toBe(message);
    });

    // Test emit di close
    it('emits the close event when the cancel button is pressed', () => {
        const type: ToastType = 'success';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        wrapper.find('button').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    })

    // Test toast di successo
    it('renders the correct color and icon for the success toast', () => {
        const type: ToastType = 'success';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        checkToastColors(wrapper, type);
        expect(wrapper.findComponent(IconCheck).exists()).toBe(true);
    });

    // Test toast di warning
    it('renders the correct color and icon for the warning toast', () => {
        const type: ToastType = 'warning';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        checkToastColors(wrapper, type);
        expect(wrapper.findComponent(IconWarning).exists()).toBe(true);
    });

    // Test toast di error
    it('renders the correct color and icon for the error toast', () => {
        const type: ToastType = 'error';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        checkToastColors(wrapper, type);
        expect(wrapper.findComponent(IconError).exists()).toBe(true);
    });

    // Test toast di info
    it('renders the correct color and icon for the info toast', () => {
        const type: ToastType = 'info';
        const wrapper = mount(ActionToast, { props: { title, message, type } });
        checkToastColors(wrapper, type);
        expect(wrapper.findComponent(IconInfo).exists()).toBe(true);
    });
});
