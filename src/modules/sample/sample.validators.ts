import { z } from "zod";

export const sendMailBodySchema = {
    body: z.object({
        to: z.string().email(),
        subject: z.string().optional(),
        text: z.string().optional(),
        html: z.string().optional(),
    }),
};

export type SendMailBody = z.infer<typeof sendMailBodySchema.body>;
