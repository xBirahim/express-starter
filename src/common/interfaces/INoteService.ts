import type { NoteType } from "@common/types";
import type { CreateNoteDto, UpdateNoteDto } from "@/common/dtos/note.dto";

/**
 * Interface representing the Note Service.
 */
export interface INoteService {
    /**
     * Finds a note by its ID and the user ID.
     * @param id - The ID of the note.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to the note.
     */
    findById(id: number, userId: number): Promise<NoteType>;

    /**
     * Finds all notes for a specific user.
     * @param userId - The ID of the user.
     * @returns A promise that resolves to an array of notes.
     */
    findAllUserNotes(userId: number): Promise<NoteType[]>;

    /**
     * Creates a new note.
     * @param data - The data for the new note, including the user ID.
     * @returns A promise that resolves to the created note.
     */
    create(data: CreateNoteDto & { userId: number }): Promise<NoteType>;

    /**
     * Updates an existing note.
     * @param id - The ID of the note to update.
     * @param userId - The ID of the user.
     * @param data - The new data for the note.
     * @returns A promise that resolves to the updated note.
     */
    updateOne(id: number, userId: number, data: UpdateNoteDto): Promise<NoteType>;

    /**
     * Deletes a note.
     * @param id - The ID of the note to delete.
     * @param userId - The ID of the user.
     * @returns A promise that resolves when the note is deleted.
     */
    deleteOne(id: number, userId: number): Promise<void>;
}
