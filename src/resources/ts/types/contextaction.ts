export type ContextActionVariant = 'default' | 'warning';

export type ContextAction<T = unknown> = {
    label: string;
    handler?: (item: T) => void | Promise<void>;
    variant?: ContextActionVariant;
};
