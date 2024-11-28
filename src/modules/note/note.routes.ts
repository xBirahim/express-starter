import express from "express";
import { AccessTokenKey, RefreshTokenKey } from "@/common/constants/TokenKeys";
import { authenticationMiddleware } from "@common/middlewares/authentication.middlware";
import { hasCookie } from "@common/middlewares/has-cookie.middleware";
import { validate } from "@common/middlewares/validate.middleware";
import { noteController } from "@/modules/note/note.controller";
import {
    CreateNoteSchema,
    DeleteNoteByIdSchema,
    GetNoteByIdSchema,
    UpdateNoteSchema,
} from "@modules/note/note.routes.validator";

const noteRoutes = express.Router();

// Routes
noteRoutes.get(
    "/",
    hasCookie(AccessTokenKey),
    hasCookie(RefreshTokenKey),
    authenticationMiddleware.decodeToken,
    noteController.getAll
);
noteRoutes.get(
    "/:id",
    hasCookie(AccessTokenKey),
    hasCookie(RefreshTokenKey),
    authenticationMiddleware.decodeToken,
    validate(GetNoteByIdSchema),
    noteController.get
);
noteRoutes.post(
    "/",
    hasCookie(AccessTokenKey),
    hasCookie(RefreshTokenKey),
    authenticationMiddleware.decodeToken,
    validate(CreateNoteSchema),
    noteController.create
);

noteRoutes.put(
    "/:id",
    hasCookie(AccessTokenKey),
    hasCookie(RefreshTokenKey),
    authenticationMiddleware.decodeToken,
    validate(UpdateNoteSchema),
    noteController.update
);

noteRoutes.delete(
    "/:id",
    hasCookie(AccessTokenKey),
    hasCookie(RefreshTokenKey),
    authenticationMiddleware.decodeToken,
    validate(DeleteNoteByIdSchema),
    noteController.delete
);

export default noteRoutes;
