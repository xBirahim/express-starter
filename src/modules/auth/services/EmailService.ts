import type { IEmailService } from "../interfaces/IEmailService";
import { db } from "@common/providers/database/database";
import { MailManager } from "@common/providers/mail/mail";
import { AppError } from "@common/errors/app.error";
import { Logger } from "@common/lib/logger";
import crypto from "node:crypto";
import { EmailConfirmation, User } from "@/common/schemas";
import { eq } from "drizzle-orm";
import Env from "@/common/config/env.config";

export class EmailService implements IEmailService {
    async createEmailConfirmation(userId: number) {
        try {
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await db.insert(EmailConfirmation).values({ userId, token, expiresAt });
            await this.sendConfirmationEmail(userId, token);
        } catch (error) {
            throw new AppError({ message: "Confirmation email cannot be sent", code: 500, cause: error });
        }
    }

    async sendConfirmationEmail(userId: number, token: string) {
        try {
            const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
            if (!user) {
                throw new AppError({ message: "User not found", code: 404 });
            }

            const link = `${Env.FRONTEND_BASE_URL}${Env.FRONTEND_EMAIL_CONFIRMATION_URL}/${token}`;
            const emailContent = MailManager.getEmailContent(
                "email-confirmation.html",
                { key: "username", value: user.email.split("@")[0] },
                { key: "link", value: link }
            );

            await MailManager.sendMail({
                to: user.email,
                subject: "Confirm your email",
                html: emailContent,
            });

            Logger.Info("Confirmation email sent", { userId });
        } catch (error) {
            throw new AppError({ message: "Confirmation email cannot be sent", code: 500, cause: error });
        }
    }

    async sendPasswordResetEmail(userId: number, token: string) {
        try {
            const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
            if (!user) {
                throw new AppError({ message: "User not found", code: 404 });
            }

            const link = `${Env.FRONTEND_BASE_URL}${Env.FRONTEND_PASSWORD_RESET_URL}/${token}`;
            const emailContent = MailManager.getEmailContent(
                "password-reset.html",
                { key: "username", value: user.email.split("@")[0] },
                { key: "resetLink", value: link }
            );

            await MailManager.sendMail({
                to: user.email,
                subject: "Reset your password",
                html: emailContent,
            });

            Logger.Info("Password reset email sent", { userId });
        } catch (error) {
            throw new AppError({ message: "Password Reset email cannot be sent", code: 500, cause: error });
        }
    }
}
