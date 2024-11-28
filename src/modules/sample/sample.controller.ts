import { AppError } from "@common/errors/app.error";
import { Logger } from "@common/lib/logger";
import { CacheManager } from "@common/providers/cache/cache";
import { MailManager } from "@common/providers/mail/mail";
import type { NextFunction, Request, Response } from "express";
import type { SendMailBody } from "./sample.validators";
import type { ISampleService } from "./interfaces/ISampleService";
import { sampleManager } from "./sample.manager";

export class SampleController {
    constructor(private sampleService: ISampleService) {}

    emoji = async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(["😀", "😳", "🙄"]);
    };

    chat = async (req: Request, res: Response) => {
        try {
            const mail = MailManager.getEmailContent(
                "email-confirmation.html",
                { key: "username", value: "Dixit" },
                { key: "link", value: "https://www.youtube.com" }
            );

            return res.status(200).send(mail);
        } catch (error) {
            new AppError({ message: "Error in sending mail", code: 500 });
        }
    };

    mail = async (req: Request<any, any, SendMailBody>, res: Response): Promise<Response> => {
        const { to, subject, text, html } = req.body;

        try {
            await MailManager.sendMail({
                to,
                subject,
                text,
                html,
            });
            return res.status(200).json({ status: 200, message: "Mail sent successfully !" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Mail not sent !", error: error });
        }
    };

    cacheWrite = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { key, value, ttl } = req.body;

            const cache = new CacheManager();

            await cache.set(key, value, ttl);

            return res.status(200).json({ message: "Cache test successful !" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Cache test failed !", error: error });
        }
    };

    cacheRead = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { key } = req.body;

            const cache = new CacheManager();

            const cacheValue = await cache.get(key);

            return res.status(200).json({ message: "Cache read successful !", value: cacheValue });
        } catch (error) {
            return res.status(500).json({ status: 500, message: "Cache read failed !", error: error });
        }
    };

    database = async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json({ status: 200, message: "Database test successful !" });
    };

    upload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files: Express.Multer.File[] = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                throw new AppError({ message: "No file uploaded !", code: 400 });
            }
            Logger.Debug("File", { files });

            const fileKeys: any[] = [];

            for (const file of files) {
                const key = await this.sampleService.uploadFile({
                    filePath: file.path,
                    originalFileName: file.originalname,
                });
                fileKeys.push({ original: file.originalname, key: key, fieldname: file.fieldname });
            }

            return res.status(200).json({ status: 200, message: "Upload test successful !", metadata: fileKeys });
        } catch (error) {
            next(error);
        }
    };

    download = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { fileKey } = req.params;

            if (!fileKey) {
                throw new AppError({ message: "No file key provided!", code: 400 });
            }

            const { base64, contentType } = await this.sampleService.downloadFile(fileKey);

            const buffer = Buffer.from(base64, "base64");

            return res
                .setHeader("Content-Type", contentType)
                .setHeader("Content-Disposition", `attachment; filename="${fileKey}"`)
                .send(buffer);
        } catch (error) {
            next(error);
        }
    };
}

export const sampleController = new SampleController(sampleManager);
