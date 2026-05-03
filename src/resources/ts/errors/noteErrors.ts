import { Note } from '@/types/note';

export class NoteNotUpdatedError extends Error {
    constructor(note: Note) {
        super(`Note "${note.name}" has been updated since last read.`);
        this.name = 'NoteNotUpdatedError';
        Object.setPrototypeOf(this, NoteNotUpdatedError.prototype); // fix per instanceof in TS
    }
}
