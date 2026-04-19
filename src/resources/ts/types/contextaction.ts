export type ContextActionVariant = 'default' | 'warning';

export type ContextAction<T = unknown> = {
    label: string;
    action: string;
    handler?: (item: T) => void;
    variant?: ContextActionVariant;
};