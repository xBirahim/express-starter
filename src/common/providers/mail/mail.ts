import fs from "node:fs";
import path from "node:path";
import { Logger } from "@common/lib/logger";
import Env from "@common/config/env.config";
import nodemailer, { type Transporter } from "nodemailer";
import { getAppDir } from "@/common/lib/app-dir";

interface MailOptions {
    to: string;
    subject?: string;
    text?: string;
    html?: string;
}

let transporter: Transporter;

// Function to initialize the transporter only once
function initializeTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: Env.MAIL_HOST,
            port: Number(Env.NODE_ENV === "production" ? Env.MAIL_TLS_PORT : Env.MAIL_SSL_PORT),
            secure: Env.MAIL_SECURE ?? Env.NODE_ENV === "production",
            auth: {
                user: Env.MAIL_USERNAME,
                pass: Env.MAIL_PASSWORD,
            },
        });
    }
    return transporter;
}

export const MailManager = {
    /**
     * Sends an email with the specified options.
     * @param mailOptions - The email options including recipient, subject, text, and HTML content.
     */
    async sendMail(mailOptions: MailOptions): Promise<void> {
        try {
            const transporter = initializeTransporter();
            await transporter.sendMail({
                from: Env.MAIL_FROM,
                to: mailOptions.to,
                subject: mailOptions.subject,
                text: mailOptions.text,
                html: mailOptions.html,
            });
            Logger.Info("Mail sent successfully", { to: mailOptions.to, subject: mailOptions.subject });
        } catch (error) {
            Logger.Error("Error while sending mail", { error });
            throw error;
        }
    },

    /**
     * Retrieves email content from a file and performs replacements.
     * @param filename - The name of the email template file.
     * @param replacements - Key-value pairs for template replacements.
     */
    getEmailContent(filename: string, ...replacements: { key: string; value: string }[]): string {
        const filePath = path.join(getAppDir(), "common", "emails", filename);
        console.log("filename", filename);
        console.log("filePath", filePath);
        let content = fs.readFileSync(filePath).toString();

        for (const replacement of replacements) {
            content = content.replace(new RegExp(`{{${replacement.key}}}`, "g"), replacement.value);
        }

        return content;
    },
};
