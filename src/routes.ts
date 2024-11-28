import type { Express } from "express";
import authRoutes from "./modules/auth/auth.routes";
import noteRoutes from "./modules/note/note.routes";
import sampleRouter from "./modules/sample/sample.routes";

export const buildRoutes = (app: Express) => {
    // -- Auth
    app.use("/auth", authRoutes);

    // -- Business
    app.use("/note", noteRoutes);
    app.use("/sample", sampleRouter);
};
