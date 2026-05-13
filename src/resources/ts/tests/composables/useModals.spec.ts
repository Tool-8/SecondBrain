import { describe, it, expect } from 'vitest';
import { useModals } from '@/composables/useModals'; // aggiusta il path

describe('useModals Composable', () => {
    
    it('should return all required modal promises', () => {
        const modals = useModals();

        expect(modals.RenamePromise).toBeDefined();
        expect(modals.DeletePromise).toBeDefined();
        expect(modals.ClonePromise).toBeDefined();
        expect(modals.SavePromise).toBeDefined();
        expect(modals.DiscardPromise).toBeDefined();
        expect(modals.SaveAsPromise).toBeDefined();
    });

    it('should return the same instances on multiple calls (singleton pattern)', () => {
        const modals1 = useModals();
        const modals2 = useModals();

        expect(modals1.RenamePromise).toBe(modals2.RenamePromise);
        expect(modals1.SavePromise).toBe(modals2.SavePromise);
    });
});