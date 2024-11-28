import type { SessionType } from "@/common/types";

export interface ISessionService {
    createSession(
        userId: number,
        userAgent?: string,
        ipAddress?: string
    ): Promise<{
        accessToken;
        refreshToken;
        expiresIn;
    }>;
    invalidateAllUserSessions(userId: number, exceptSessionId?: string): Promise<void>;
    // Autres méthodes liées aux sessions
}
