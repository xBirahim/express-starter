import type { NextFunction, Request, Response } from "express";
import { AppError } from "@common/errors/app.error";
import { getUserId } from "@common/utils/user.utils";
import type { CreateNoteDto, UpdateNoteDto } from "@/common/dtos/note.dto";
import type { INoteService } from "@/common/interfaces/INoteService";
import { NoteService } from "@common/services/NoteService";

export class NoteController {
    constructor(private noteService: INoteService) {}

    create = async (req: Request<any, any, CreateNoteDto>, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            const note = await this.noteService.create({ ...req.body, userId });

            return res.status(201).json({
                message: "Note created successfully",
                data: note,
            });
        } catch (error) {
            next(error);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            const noteId = Number(req.params.id);

            const note = await this.noteService.findById(noteId, userId);

            if (!note) {
                throw new AppError({ message: "Note not found", code: 404 });
            }

            return res.status(200).json({
                message: "Note retrieved successfully",
                data: note,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            const notes = await this.noteService.findAllUserNotes(userId);

            return res.status(200).json({
                message: "Notes retrieved successfully",
                data: notes,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request<any, any, UpdateNoteDto>, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            const noteId = Number(req.params.id);
            const note = await this.noteService.updateOne(noteId, userId, req.body);

            if (!note) {
                throw new AppError({ message: "Note not found", code: 404 });
            }

            return res.status(200).json({
                message: "Note updated successfully",
                data: note,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            const noteId = Number(req.params.id);
            await this.noteService.deleteOne(noteId, userId);

            return res.status(200).json({
                message: "Note deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}

const noteService = new NoteService();
export const noteController = new NoteController(noteService);
