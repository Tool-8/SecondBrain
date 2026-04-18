export interface ContextAction {
    label: string;
    action?: string;
    children?: ContextAction[];
}
