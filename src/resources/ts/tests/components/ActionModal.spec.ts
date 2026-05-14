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

    it('saveAs: should resolve with null value', async () => {
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


    it('clone: should resolve with input value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                ClonePromise: {
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
        await input.setValue('Nome clone');

        const button = wrapper.findAll('button').find(b => b.text() === 'OK')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('Nome clone')
    }) 

    it('clone: should resolve with null value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                ClonePromise: {
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

    it('save: should resolve with null value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SavePromise: {
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

    it('save: should resolve with overwrite value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SavePromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Sovrascrivi')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('overwrite')
    }) 

    it('save: should resolve with save as value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SavePromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Salva con nome')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('save as')
    }) 

    it('save: should resolve with update value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                SavePromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Aggiorna')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('update')
    }) 

    it('delete: should resolve with false value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                DeletePromise: {
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

        expect(resolveMock).toHaveBeenCalledWith(false)
    }) 

    it('delete: should resolve with true value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                DeletePromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Conferma')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith(true)
    }) 

    it('discard: should resolve with cancel value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                DiscardPromise: {
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

        expect(resolveMock).toHaveBeenCalledWith('cancel')
    }) 

    it('discard: should resolve with discard value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                DiscardPromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Esci senza salvare')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('discard')
    }) 

    it('discard: should resolve with save value', async () => {
        const resolveMock = vi.fn();

        const wrapper = mount(ActionModal, {
            global: {
                stubs: {
                DiscardPromise: {
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

        const button = wrapper.findAll('button').find(b => b.text() === 'Salva ed esci')
        await button?.trigger('click')

        expect(resolveMock).toHaveBeenCalledWith('save')
    }) 
})