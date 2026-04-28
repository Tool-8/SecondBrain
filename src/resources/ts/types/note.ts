export type Note = {
    id: string;
    name: string;
    last_edit: string;
    creation: string;
};

export type NoteWithContent = Note & {
    content: string;
}

// JSON ritornato dal backend
export type NoteAPI = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    content_md: string;
};
