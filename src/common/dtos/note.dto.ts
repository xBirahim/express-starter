import type { NoteType } from "@common/types";

export type CreateNoteDto = Pick<NoteType, "title" | "content">;
export type UpdateNoteDto = Partial<Pick<NoteType, "title" | "content">>;
