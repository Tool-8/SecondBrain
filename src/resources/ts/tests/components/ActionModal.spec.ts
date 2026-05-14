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
                BaseModal: {
                    template: ' <div> <slot name="body" /> <slot name="footer" /> </div>' 
                }
                }
            }
            });

        const input = wrapper.find('input');
        await input.setValue('Nuovo nome');

        const button = wrapper.findAll('button').find(b => b.text() === 'OK')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('Nuovo nome')
    }) 

    it('rename: should resolve with null value', async () => {
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
                BaseModal: {
                    template: ' <div> <slot name="body" /> <slot name="footer" /> </div>' 
                }
                }
            }
            });

        const button = wrapper.findAll('button').find(b => b.text() === 'Annulla')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith(null)
    }) 

    it('saveAs: should resolve with input value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SaveAsPromise: {
                    template: `<div><slot :resolve="resolve" :args="args" /></div>`,
                    props: ['resolve', 'args'],
                    setup(props) {
                    return { 
                        resolve: resolveMock, 
                        args: ['Nota Originale'] 
                    };
                    }
                },
                BaseModal: {
                    template: ' <div> <slot name="body" /> <slot name="footer" /> </div>' 
                }
                }
            }
            });

        const input = wrapper.find('input');
        await input.setValue('Nuovo nome');

        const button = wrapper.findAll('button').find(b => b.text() === 'OK')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('Nuovo nome')
    }) 

    it('rename: should resolve with null value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SaveAsPromise: {
                    template: `<div><slot :resolve="resolve" :args="args" /></div>`,
                    props: ['resolve', 'args'],
                    setup(props) {
                    return { 
                        resolve: resolveMock, 
                        args: ['Nota Originale'] 
                    };
                    }
                },
                BaseModal: {
                    template: ' <div> <slot name="body" /> <slot name="footer" /> </div>' 
                }
                }
            }
            });

        const button = wrapper.findAll('button').find(b => b.text() === 'Annulla')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith(null)
    }) 

})