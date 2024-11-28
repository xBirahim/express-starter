import express from "express";
import { authenticationMiddleware } from "@common/middlewares/authentication.middlware";
import { validate } from "@common/middlewares/validate.middleware";
import { sendMailBodySchema } from "@/modules/sample/sample.validators";
import { sampleController } from "./sample.controller";
import { FileUploadMiddleware } from "@common/middlewares/file-upload.middleware";

const sampleRouter = express.Router();
const authenticateSession = [
    authenticationMiddleware.decodeToken,
    authenticationMiddleware.requireActiveAccount,
    authenticationMiddleware.requireEmailVerification,
    authenticationMiddleware.authenticateSession,
];

sampleRouter.get("/emoji", sampleController.emoji);
sampleRouter.get("/chat", sampleController.chat);
sampleRouter.post("/mail", validate(sendMailBodySchema), sampleController.mail);
sampleRouter.post("/cache/write", authenticateSession, sampleController.cacheWrite);
sampleRouter.post("/cache/read", authenticateSession, sampleController.cacheRead);
sampleRouter.get("/database", sampleController.database);

sampleRouter.post(
    "/upload",
    authenticateSession,
    FileUploadMiddleware.MultipleFilesUpload("file"),
    sampleController.upload
);

sampleRouter.get("/download/:fileKey", authenticateSession, sampleController.download);

export default sampleRouter;
