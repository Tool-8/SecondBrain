import { createTemplatePromise } from '@vueuse/core';

const RenamePromise = createTemplatePromise<string | null, [string, string]>({
    singleton: true,
});

const DeletePromise = createTemplatePromise<boolean | null, [string]>({
    singleton: true,
});

export function useModals() {
    return {
        RenamePromise,
        DeletePromise,
    };
}
