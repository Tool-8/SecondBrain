import { describe, it, expect, vi } from "vitest";
import ActionModal from "@/components/ActionModal.vue";
import { mount } from "@vue/test-utils";

describe('ActionModal', () =>  {
    it('rename: should resolve with input value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                RenamePromise: {
                    template: `<div><slot :resolve="resolve" :args="args" /></div>`,
                    props: ['resolve', 'args'],
                    setup(props) {
                    return { 
                        resolve: resolveMock, 
                        args: ['Nota Originale'] 
                    };
                    }
                },
                BaseModal: true
                }
            }
            });

        const input = wrapper.find('input[type="text"]');
        await input.setValue('Nuovo nome');

        const button = wrapper.findAll('button').find(b => b.text() === 'OK')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('Nuovo nome')
    }) 
})