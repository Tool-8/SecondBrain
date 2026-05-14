import { describe, expect, it } from "vitest";
import GeneralButton from "@/components/GeneralButton.vue";
import { mount } from "@vue/test-utils";

describe('GeneralButton', () => {

    const label = 'Test Label';  
    const action = 'action';
    const disabled = false;

    it('renders correctly on default', () => {
        const wrapper = mount(GeneralButton, { props: { label, action, disabled}});
        expect(wrapper.find('button').text()).toBe(label);
        expect(wrapper.find('button').element.disabled).toBe(false);
    });

    it('renders correctly when passing disabled prop', () => {
        const wrapper = mount(GeneralButton, { props: { label, action, disabled:true }});
        expect(wrapper.find('button').element.disabled).toBe(true);
    });

    it('renders correct icon when passing slot', () => {
        const wrapper = mount(
            GeneralButton, { 
                props: { label, action, disabled},
                slots: { icon: '<p id="icon">test slot</p>'}
        })
        expect(wrapper.find('#icon').text()).toBe('test slot');
    });
});