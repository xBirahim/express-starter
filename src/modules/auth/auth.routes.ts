import { Router } from "express";
import { validate } from "@common/middlewares/validate.middleware";
import { hasCookie } from "@common/middlewares/has-cookie.middleware";
import { AccessTokenKey, RefreshTokenKey } from "@common/constants/TokenKeys";
import {
    signInSchema,
    signUpSchema,
    confirmEmailSchema,
    resetPasswordSchema,
    requestPasswordResetSchema,
    refreshTokenSchema,
} from "./auth.validator";
import { AuthenticationController } from "./auth.controller";

const router = Router();

router.post("/signup", validate(signUpSchema), AuthenticationController.signUp);

router.post("/signin", validate(signInSchema), AuthenticationController.signIn);

router.post("/signout", hasCookie(AccessTokenKey), AuthenticationController.signOut);

router.post(
    "/refresh-token",
    hasCookie(RefreshTokenKey),
    validate(refreshTokenSchema),
    AuthenticationController.refreshToken
);

router.post(
    "/request-password-reset",
    validate(requestPasswordResetSchema),
    AuthenticationController.requestPasswordReset
);

router.post("/reset-password", validate(resetPasswordSchema), AuthenticationController.resetPassword);

router.post("/confirm-mail/:token", validate(confirmEmailSchema), AuthenticationController.confirmEmail);

router.post(
    "/resend-confirmation-mail",
    validate(requestPasswordResetSchema),
    AuthenticationController.resendConfirmation
);

export default router;
