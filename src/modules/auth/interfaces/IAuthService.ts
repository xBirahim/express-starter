export interface IAuthService {
    register(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<any>;
    login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<any>;
    refreshToken(refreshTokenString: string): Promise<any>;
    logout(sessionId: string): Promise<void>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    resendConfirmationEmail(email: string): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    confirmEmail(token: string): Promise<void>;
    isUserActive(userId: number): Promise<boolean>;
    isEmailVerified(userId: number): Promise<boolean>;
    validateAccessToken(token: string): Promise<any>;
    checkAccessToken(token: string): Promise<any>;
}
