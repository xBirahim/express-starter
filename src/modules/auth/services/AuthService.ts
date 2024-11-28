import { compare, hash } from "bcrypt";
import { JsonWebTokenError, sign, verify } from "jsonwebtoken";
import crypto from "node:crypto";
import { eq, and, gt, isNull } from "drizzle-orm";
import { Logger } from "@common/lib/logger";
import type { IAuthService } from "../interfaces/IAuthService";
import type { IUserService } from "../interfaces/IUserService";
import type { ISessionService } from "../interfaces/ISessionService";
import type { IEmailService } from "../interfaces/IEmailService";
import type { ICacheManager } from "@/common/providers/cache/ICacheManager";
import type { AccessTokenPayload } from "@/common/types";
import { AppError } from "@common/errors/app.error";
import Env from "@/common/config/env.config";
import { db } from "@/common/providers/database/database";
import { EmailConfirmation, PasswordReset, RefreshToken, Session, User } from "@/common/schemas";
import { TOKEN_EXPIRY } from "@/common/constants/Expiry";
import { SALT_ROUNDS } from "@/common/constants/Crypto";

export class AuthService implements IAuthService {
    constructor(
        private userService: IUserService,
        private sessionService: ISessionService,
        private emailService: IEmailService,
        private cache: ICacheManager
    ) {}
    async isEmailVerified(userId: number): Promise<boolean> {
        const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
        return user.emailVerified;
    }
    async isUserActive(userId: number): Promise<boolean> {
        const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
        return user.active;
    }
    async checkAccessToken(token: string): Promise<any> {
        try {
            const decoded = verify(token, Env.SECRET_KEY);
            return decoded;
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                throw new AppError({ message: "Invalid token", code: 401 });
            }
            Logger.Error("Token check failed", { error });
            throw error;
        }
    }

    async register(email: string, password: string, userAgent?: string, ipAddress?: string) {
        const user = await this.userService.register(email, password);
        const session = await this.sessionService.createSession(user.id, userAgent, ipAddress);
        await this.emailService.createEmailConfirmation(user.id);
        Logger.Info("User registered successfully", { userId: user.id });
        return { user: { id: user.id, email: user.email }, ...session };
    }

    async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
        const user = await this.userService.login(email, password);
        const session = await this.sessionService.createSession(user.id, userAgent, ipAddress);
        Logger.Info("User logged in successfully", { userId: user.id });
        return { user: { id: user.id, email: user.email, emailVerified: user.emailVerified }, ...session };
    }

    async refreshToken(refreshTokenString: string) {
        try {
            const [token] = await db
                .select()
                .from(RefreshToken)
                .where(
                    and(
                        eq(RefreshToken.token, refreshTokenString),
                        eq(RefreshToken.revoked, false),
                        gt(RefreshToken.expiresAt, new Date())
                    )
                )
                .limit(1)
                .execute();

            if (!token) {
                throw new AppError({ message: "Invalid refresh token", code: 401 });
            }

            const [session] = await db
                .select()
                .from(Session)
                .where(
                    and(eq(Session.id, token.sessionId), eq(Session.isValid, true), gt(Session.expiresAt, new Date()))
                )
                .limit(1)
                .execute();

            if (!session) {
                throw new AppError({ message: "Invalid session", code: 401 });
            }

            // Create new access token
            const accessToken = sign({ userId: session.userId, sessionId: session.id }, Env.SECRET_KEY, {
                expiresIn: TOKEN_EXPIRY,
            });

            // Generate a new refresh token
            const newRefreshTokenString = crypto.randomBytes(40).toString("hex");
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + 7);

            await db.insert(RefreshToken).values({
                token: newRefreshTokenString,
                sessionId: session.id,
                expiresAt: newExpiresAt,
                revoked: false,
            });

            // Revoke the old refresh token
            await db
                .update(RefreshToken)
                .set({ revoked: true })
                .where(eq(RefreshToken.token, refreshTokenString))
                .execute();

            // Update session last activity
            await db.update(Session).set({ lastActivityAt: new Date() }).where(eq(Session.id, session.id)).execute();

            return {
                accessToken,
                refreshToken: newRefreshTokenString,
                expiresIn: TOKEN_EXPIRY,
            };
        } catch (error) {
            Logger.Error("Token refresh failed", { error });
            throw error;
        }
    }

    async logout(sessionId: string) {
        const [user] = await db.select({ userId: Session.userId }).from(Session).where(eq(Session.id, sessionId));
        await this.sessionService.invalidateAllUserSessions(user.userId, sessionId);
        Logger.Info("User logged out successfully", { sessionId });
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        try {
            const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();

            if (!user) {
                throw new AppError({ message: "User not found", code: 404 });
            }

            // Verify current password
            const isValid = await compare(currentPassword, user.password);
            if (!isValid) {
                throw new AppError({ message: "Invalid current password", code: 401 });
            }

            // Hash new password
            const hashedPassword = await hash(newPassword, SALT_ROUNDS);

            // Update password
            await db.update(User).set({ password: hashedPassword }).where(eq(User.id, userId)).execute();

            // Invalidate all sessions except current one for security
            await this.sessionService.invalidateAllUserSessions(userId);

            Logger.Info("Password changed successfully", { userId });
        } catch (error) {
            Logger.Error("Password change failed", { error });
            throw error;
        }
    }

    async resendConfirmationEmail(email: string) {
        try {
            const [user] = await db.select().from(User).where(eq(User.email, email)).limit(1).execute();

            if (!user) {
                // Return success even if user doesn't exist for security
                return;
            }

            if (user.emailVerified) {
                throw new AppError({ message: "Email already verified", code: 400 });
            }

            // Check if there's a recent confirmation email
            const recentConfirmation = await db
                .select()
                .from(EmailConfirmation)
                .where(
                    and(
                        eq(EmailConfirmation.userId, user.id),
                        isNull(EmailConfirmation.confirmedAt),
                        gt(EmailConfirmation.expiresAt, new Date())
                    )
                )
                .limit(1)
                .execute();

            if (recentConfirmation.length > 0) {
                throw new AppError({
                    message: "Confirmation email recently sent. Please wait before requesting another.",
                    code: 429,
                });
            }

            await this.emailService.createEmailConfirmation(user.id);
            Logger.Info("Confirmation email resent", { userId: user.id });
        } catch (error) {
            Logger.Error("Failed to resend confirmation email", { error });
            throw error;
        }
    }

    async requestPasswordReset(email: string) {
        try {
            const [user] = await db.select().from(User).where(eq(User.email, email)).limit(1).execute();

            if (!user) {
                // Return success even if user doesn't exist for security
                return;
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            // Create reset record
            await db.insert(PasswordReset).values({
                userId: user.id,
                token,
                expiresAt,
            });

            // Send email
            await this.emailService.sendPasswordResetEmail(user.id, token);
        } catch (error) {
            Logger.Error("Failed to request password reset", { error });
            throw error;
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            Logger.Debug("Starting password reset process", { token, newPassword });

            const [reset] = await db
                .select()
                .from(PasswordReset)
                .where(
                    and(
                        eq(PasswordReset.token, token),
                        isNull(PasswordReset.usedAt),
                        gt(PasswordReset.expiresAt, new Date())
                    )
                )
                .limit(1)
                .execute();

            if (!reset) {
                Logger.Debug("Invalid or expired token", { token });
                throw new AppError({ message: "Invalid or expired token", code: 400 });
            }

            Logger.Debug("Valid reset token found", { reset });

            // Hash new password
            const hashedPassword = await hash(newPassword, SALT_ROUNDS);
            Logger.Debug("New password hashed", { hashedPassword });

            // Update password
            await db.update(User).set({ password: hashedPassword }).where(eq(User.id, reset.userId)).execute();
            Logger.Debug("User password updated", { userId: reset.userId });

            // Mark reset token as used
            await db.update(PasswordReset).set({ usedAt: new Date() }).where(eq(PasswordReset.id, reset.id)).execute();
            Logger.Debug("Reset token marked as used", { resetId: reset.id });

            // Invalidate all sessions for security
            await this.sessionService.invalidateAllUserSessions(reset.userId);
            Logger.Debug("All user sessions invalidated", { userId: reset.userId });

            Logger.Info("Password reset successful", { userId: reset.userId });
        } catch (error) {
            Logger.Error("Password reset failed", { error });
            throw error;
        }
    }

    async confirmEmail(token: string) {
        try {
            const [confirmation] = await db
                .select()
                .from(EmailConfirmation)
                .where(
                    and(
                        eq(EmailConfirmation.token, token),
                        isNull(EmailConfirmation.confirmedAt),
                        gt(EmailConfirmation.expiresAt, new Date())
                    )
                )
                .limit(1)
                .execute();

            if (!confirmation) {
                throw new AppError({ message: "Invalid or expired token", code: 400 });
            }

            // Update confirmation
            await db
                .update(EmailConfirmation)
                .set({ confirmedAt: new Date() })
                .where(eq(EmailConfirmation.id, confirmation.id))
                .execute();

            // Update user
            await db.update(User).set({ emailVerified: true }).where(eq(User.id, confirmation.userId)).execute();

            Logger.Info("Email confirmed successfully", { userId: confirmation.userId });
        } catch (error) {
            Logger.Error("Email confirmation failed", { error });
            throw error;
        }
    }

    async validateAccessToken(token: string) {
        try {
            const decoded = verify(token, Env.SECRET_KEY) as AccessTokenPayload;

            Logger.Debug("Validating access token", { decoded });

            // Check cache first
            const cachedSession = await this.cache.get(`session:${decoded.sessionId}`);
            if (cachedSession) {
                Logger.Debug("Session found in cache", { cachedSession });
                const session = JSON.parse(cachedSession);
                if (!session.isValid) {
                    throw new AppError({ message: "Invalid session", code: 401 });
                }
                return decoded;
            }

            Logger.Debug("Session not found in cache", { sessionId: decoded.sessionId });

            // If not in cache, check database
            const [session] = await db
                .select()
                .from(Session)
                .where(
                    and(eq(Session.id, decoded.sessionId), eq(Session.isValid, true), gt(Session.expiresAt, new Date()))
                )
                .limit(1)
                .execute();

            if (!session) {
                Logger.Debug("Session not found in database", { sessionId: decoded.sessionId });
                throw new AppError({ message: "Invalid session", code: 401 });
            }

            // Cache the session
            await this.cache.set(
                `session:${decoded.sessionId}`,
                JSON.stringify({ userId: decoded.userId, isValid: true }),
                60 * 60 * 24 // 24 hours
            );

            return decoded;
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                throw new AppError({ message: "Invalid token", code: 401 });
            }
            Logger.Error("Token validation failed", { error });
            throw error;
        }
    }
}
