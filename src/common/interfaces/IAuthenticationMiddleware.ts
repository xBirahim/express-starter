import { Request, Response, NextFunction } from "express";

export interface IAuthenticationMiddleware {
    authenticateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    requireEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void>;
    requireActiveAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
    decodeToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
