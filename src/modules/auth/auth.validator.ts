import { z } from "zod";
import { email, password, token } from "@common/validators/";

export const signInSchema = {
    body: z.object({
        email,
        password,
    }),
};

export const signUpSchema = {
    body: z.object({
        email,
        password,
    }),
};

export const confirmEmailSchema = {
    params: z.object({
        token,
    }),
};

export const resetPasswordSchema = {
    body: z.object({
        token,
        password,
    }),
};

export const requestPasswordResetSchema = {
    body: z.object({
        email,
    }),
};

export const refreshTokenSchema = {
    body: z.object({
        token,
    }),
};

// Définition des types pour les paramètres des contrôleurs
export type SignInBody = z.infer<typeof signInSchema.body>;
export type SignUpBody = z.infer<typeof signUpSchema.body>;
export type ConfirmEmailParams = z.infer<typeof confirmEmailSchema.params>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema.body>;
export type RequestPasswordResetBody = z.infer<typeof requestPasswordResetSchema.body>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema.body>;
