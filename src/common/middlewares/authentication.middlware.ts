import { Request, Response, NextFunction } from "express";
import { Logger } from "@common/lib/logger";
import { AppError } from "@common/errors/app.error";
import { AuthManager } from "@modules/auth/auth.manager";
import { AccessTokenKey } from "@common/constants/TokenKeys";
import { IAuthenticationMiddleware } from "@common/interfaces/IAuthenticationMiddleware";

export class AuthenticationMiddleware implements IAuthenticationMiddleware {
    async authenticateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accessToken = req.cookies[AccessTokenKey];

            if (!accessToken) {
                throw new AppError({ message: "Access token is missing", code: 401 });
            }

            const decoded = await AuthManager.validateAccessToken(accessToken);
            req.payload = decoded;

            next();
        } catch (error) {
            Logger.Error("Authentication failed", { error });
            next(
                new AppError({
                    message: "Authentication failed",
                    code: 401,
                    cause: error,
                })
            );
        }
    }

    async requireEmailVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.payload?.userId) {
                throw new AppError({ message: "User ID is missing", code: 401 });
            }

            const isVerified = await AuthManager.isEmailVerified(req.payload.userId);
            if (!isVerified) {
                throw new AppError({ message: "Email not verified", code: 403 });
            }

            next();
        } catch (error) {
            Logger.Error("Email verification check failed", { error });
            next(error);
        }
    }

    async requireActiveAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        Logger.Debug("Payload in requireActiveAccount", { payload: req.payload });
        try {
            if (!req.payload?.userId) {
                Logger.Warn("Trying to access protected route without an active account", {
                    headers: req.headers,
                    cookies: req.cookies,
                    params: req.params,
                    body: req.body,
                    ips: req.ips,
                    ip: req.ip,
                });
                throw new AppError({
                    message: "Authentication required",
                    code: 401,
                    cause: this.requireActiveAccount.name,
                });
            }

            const isActive = await AuthManager.isUserActive(req.payload.userId);
            if (!isActive) {
                throw new AppError({ message: "Account is deactivated", code: 403 });
            }

            next();
        } catch (error) {
            Logger.Error("Account status check failed", { error });
            next(error);
        }
    }

    async decodeToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accessToken = req.cookies[AccessTokenKey];

            if (!accessToken) {
                throw new AppError({ message: "Access token is missing", code: 401 });
            }

            const decoded = await AuthManager.validateAccessToken(accessToken);
            req.payload = decoded;

            next();
        } catch (error) {
            Logger.Error("Token decoding failed", { error });
            next(error);
        }
    }
}

export const authenticationMiddleware = new AuthenticationMiddleware();
