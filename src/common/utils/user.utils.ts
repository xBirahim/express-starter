// src/common/lib/user.utils.ts
import { AppError } from "@common/errors/app.error";
import type { Request } from "express";
import { Logger } from "../lib/logger";

export const getUserId = (req: Request<any, any, any>): number => {
    const userId = req.payload?.userId;
    Logger.Debug(`Get User ID: ${userId}`, { payload: req.payload });
    if (!userId) {
        throw new AppError({ message: "Unauthorized", code: 401 });
    }
    return userId;
};
