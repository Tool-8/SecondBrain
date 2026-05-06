import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useContextMenu } from '@/composables/useContextMenu';

describe('useContextMenu', () => {
    it('default values', () => {
        const { isOpen, position, selectedItem } = useContextMenu<string>();

        expect(isOpen.value).toBe(false);
        expect(position.value).toEqual({ x: 0, y: 0 });
        expect(selectedItem.value).toBeNull();
    });
});

describe('open()', () => {
    it('opens menu with correct position and selected item', () => {
        const { isOpen, position, selectedItem, open } = useContextMenu<string>();

        const event = new MouseEvent('contextmenu', { clientX: 100, clientY: 200 });
        vi.spyOn(event, 'preventDefault');

        open(event, 'item-1');

        expect(event.preventDefault).toHaveBeenCalled();
        expect(isOpen.value).toBe(true);
        expect(position.value).toEqual({ x: 100, y: 200 });
        expect(selectedItem.value).toBe('item-1');
    });
});

describe('openAt()', () => {
    it('opens at specified coordinates', () => {
        const { isOpen, position, selectedItem, openAt } = useContextMenu<string>();

        openAt(50, 75, 'elemento');

        expect(isOpen.value).toBe(true);
        expect(position.value).toEqual({ x: 50, y: 75 });
        expect(selectedItem.value).toBe('elemento');
    });
});

describe('close()', () => {
    it('closes the menu and resets selectedItem', () => {
        const { isOpen, selectedItem, openAt, close } = useContextMenu<string>();

        openAt(10, 20, 'elemento');
        close();

        expect(isOpen.value).toBe(false);
        expect(selectedItem.value).toBeNull();
    });

    it('does not reset position on close', () => {
        const { position, openAt, close } = useContextMenu<string>();

        openAt(10, 20, 'elemento');
        close();

        expect(position.value).toEqual({ x: 10, y: 20 });
    });
});