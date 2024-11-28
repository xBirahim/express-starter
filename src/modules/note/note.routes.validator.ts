import { z } from "zod";

const NoteId = z.object({
    id: z
        .string()
        .refine((val) => /^\d+$/.test(val), { message: "ID must be a numerical string" })
        .transform((val) => Number.parseInt(val, 10)),
});

const NoteContent = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters long" })
        .max(255, { message: "Title must be at most 255 characters long" }),
    content: z.string().min(5, { message: "Content must be at least 5 characters long" }),
    pinned: z.boolean().optional(),
});

export const CreateNoteSchema = {
    body: NoteContent,
};

export const GetNoteByIdSchema = {
    params: NoteId,
};

export const UpdateNoteSchema = {
    params: NoteId,
    body: NoteContent.partial().refine((data) => Object.keys(data).length > 0, { message: "Body cannot be undefined" }),
};

export const DeleteNoteByIdSchema = {
    params: NoteId,
};

export type CreateNoteBody = z.infer<typeof CreateNoteSchema.body>;
export type GetNoteByIdParam = z.infer<typeof GetNoteByIdSchema.params>;
export type UpdateNoteBody = z.infer<typeof UpdateNoteSchema.body>;
export type DeleteNoteByIdParam = z.infer<typeof DeleteNoteByIdSchema.params>;
