export interface IEmailService {
    createEmailConfirmation(userId: number): Promise<void>;
    sendConfirmationEmail(userId: number, email: string): Promise<void>;
    sendPasswordResetEmail(userId: number, email: string): Promise<void>;
}
