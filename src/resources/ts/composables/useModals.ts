import { createTemplatePromise } from '@vueuse/core';

const RenamePromise = createTemplatePromise<string | null, [string]>({
    singleton: true,
});

const DeletePromise = createTemplatePromise<boolean | null>({
    singleton: true,
});

const ClonePromise = createTemplatePromise<string | null, [string]>({
    singleton: true,
});

export function useModals() {
    return {
        RenamePromise,
        DeletePromise,
        ClonePromise,
    };
}
