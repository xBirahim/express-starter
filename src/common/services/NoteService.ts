import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "@common/providers/database/database";
import { Note, User } from "@common/schemas";
import { AppError } from "@common/errors/app.error";
import type { NoteType } from "@common/types";
import type { CreateNoteDto, UpdateNoteDto } from "@/common/dtos/note.dto";
import type { INoteService } from "@common/interfaces/INoteService";

export class NoteService implements INoteService {
    async findById(id: number, userId: number): Promise<NoteType> {
        const [data] = await db
            .select({ note: getTableColumns(Note) })
            .from(Note)
            .innerJoin(User, eq(Note.userId, User.id))
            .where(and(eq(Note.id, id), eq(Note.userId, userId)))
            .limit(1);

        if (!data) {
            throw new AppError({ message: "Note not found", code: 404 });
        }
        return data.note;
    }

    async findAllUserNotes(userId: number): Promise<NoteType[]> {
        const notes = await db.select().from(Note).where(eq(Note.userId, userId));
        return notes;
    }

    async create(data: CreateNoteDto & { userId: number }): Promise<NoteType> {
        const [note] = await db.insert(Note).values(data).returning();
        return note;
    }

    async updateOne(id: number, userId: number, data: UpdateNoteDto): Promise<NoteType> {
        const [note] = await db
            .update(Note)
            .set(data)
            .where(and(eq(Note.id, id), eq(Note.userId, userId)))
            .returning();
        if (!note) {
            throw new AppError({ message: "Note not found", code: 404 });
        }
        return note;
    }

    async deleteOne(id: number, userId: number): Promise<void> {
        const result = await db
            .delete(Note)
            .where(and(eq(Note.id, id), eq(Note.userId, userId)))
            .execute();

        if (result.rowCount === 0) {
            throw new AppError({ message: "Note not found", code: 404 });
        }
    }
}
