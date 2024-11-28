import { AccessTokenKey, RefreshTokenKey } from "@common/constants/TokenKeys";
import { AppError } from "@common/errors/app.error";
import { AuthManager } from "@/modules/auth/auth.manager";
import type { NextFunction, Request, Response } from "express";
import type {
    ConfirmEmailParams,
    RefreshTokenBody,
    RequestPasswordResetBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
} from "./auth.validator";

const signIn = async (req: Request<any, any, SignInBody>, res: Response, next: NextFunction) => {
    try {
        const userData = req.body;
        const { user, accessToken, refreshToken, expiresIn } = await AuthManager.login(
            userData.email,
            userData.password,
            req.headers["user-agent"],
            req.ip
        );

        // Set access token cookie
        res.cookie(AccessTokenKey, accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: expiresIn,
        });

        // Set refresh token cookie
        res.cookie(RefreshTokenKey, refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === "production"
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({ status: 200, message: "Logged in successfully", data: { user: user } });
    } catch (error) {
        next(error);
    }
};

const signUp = async (req: Request<any, any, SignUpBody>, res: Response, next: NextFunction) => {
    try {
        const userData = req.body;
        const { user, accessToken, refreshToken, expiresIn } = await AuthManager.register(
            userData.email,
            userData.password,
            req.headers["user-agent"],
            req.ip
        );

        // Set access token cookie
        res.cookie(AccessTokenKey, accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: expiresIn,
        });

        // Set refresh token cookie
        res.cookie(RefreshTokenKey, refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === "production"
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(201).json({ status: 201, message: "User registered successfully", data: { user: user } });
    } catch (error) {
        next(error);
    }
};

const signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await AuthManager.validateAccessToken(req.cookies[AccessTokenKey]);

        // Logout using session ID
        await AuthManager.logout(decoded.sessionId);

        // Clear cookies
        res.clearCookie(AccessTokenKey);
        res.clearCookie(RefreshTokenKey);

        return res.status(200).json({ status: 200, message: "Logged out successfully" });
    } catch (error) {
        // Even if token validation fails, we still want to clear cookies
        res.clearCookie(AccessTokenKey);
        res.clearCookie(RefreshTokenKey);
        next(error);
    }
};

const refreshToken = async (req: Request<any, any, RefreshTokenBody>, res: Response, next: NextFunction) => {
    try {
        const { token: refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError({ message: "Refresh token is missing", code: 400 });
        }

        const { accessToken, expiresIn, refreshToken: newRefreshToken } = await AuthManager.refreshToken(refreshToken);

        // Set new access token cookie
        res.cookie(AccessTokenKey, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: expiresIn,
        });

        // Set refresh token cookie
        res.cookie(RefreshTokenKey, newRefreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === "production"
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({ status: 200, message: "Token refreshed successfully" });
    } catch (error) {
        next(error);
    }
};

const requestPasswordReset = async (
    req: Request<any, any, RequestPasswordResetBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;
        await AuthManager.requestPasswordReset(email);

        return res
            .status(200)
            .json({ status: 200, message: "If the email exists, a password reset link has been sent" });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req: Request<any, any, ResetPasswordBody>, res: Response, next: NextFunction) => {
    try {
        const { token, password } = req.body;
        await AuthManager.resetPassword(token, password);

        return res.status(200).json({ status: 200, message: "Password has been reset successfully" });
    } catch (error) {
        next(error);
    }
};

const confirmEmail = async (req: Request<ConfirmEmailParams, any, any>, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        await AuthManager.confirmEmail(token);

        return res.status(200).json({ status: 200, message: "Email confirmed successfully" });
    } catch (error) {
        next(error);
    }
};

const resendConfirmation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await AuthManager.resendConfirmationEmail(email);

        return res.status(200).json({
            status: 200,
            message: "If the email exists and is not verified, a confirmation email has been sent",
        });
    } catch (error) {
        next(error);
    }
};

export const AuthenticationController = {
    signIn,
    signUp,
    signOut,
    refreshToken,
    requestPasswordReset,
    resetPassword,
    confirmEmail,
    resendConfirmation,
};
