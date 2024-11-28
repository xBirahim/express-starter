import crypto from "node:crypto";
import { sign } from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import Env from "@common/config/env.config";
import { db } from "@common/providers/database/database";
import { RefreshToken, Session } from "@/common/schemas";
import type { ISessionService } from "../interfaces/ISessionService";
import { TOKEN_EXPIRY } from "@/common/constants/Expiry";
import type { ICacheManager } from "@/common/providers/cache/ICacheManager";

export class SessionService implements ISessionService {
    constructor(private cache: ICacheManager) {}

    async createSession(userId: number, userAgent?: string, ipAddress?: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const [session] = await db
            .insert(Session)
            .values({
                userId,
                expiresAt,
                userAgent,
                ipAddress,
                isValid: true,
            })
            .returning();

        const refreshTokenString = crypto.randomBytes(40).toString("hex");
        await db.insert(RefreshToken).values({
            token: refreshTokenString,
            sessionId: session.id,
            expiresAt,
            revoked: false,
        });

        const accessToken = sign({ userId, sessionId: session.id }, Env.SECRET_KEY, { expiresIn: TOKEN_EXPIRY });

        await this.cache.set(
            `session:${session.id}`,
            JSON.stringify({ userId, isValid: true }),
            60 * 60 * 24 * 7 // 7 days
        );

        return {
            accessToken,
            refreshToken: refreshTokenString,
            expiresIn: TOKEN_EXPIRY,
        };
    }

    async invalidateAllUserSessions(userId: number, exceptSessionId?: string) {
        const sessions = await db
            .select()
            .from(Session)
            .where(
                and(
                    eq(Session.userId, userId),
                    eq(Session.isValid, true),
                    exceptSessionId ? eq(Session.id, exceptSessionId) : undefined
                )
            )
            .execute();

        for (const session of sessions) {
            await db.update(Session).set({ isValid: false }).where(eq(Session.id, session.id)).execute();
            await db
                .update(RefreshToken)
                .set({ revoked: true })
                .where(eq(RefreshToken.sessionId, session.id))
                .execute();
            await this.cache.delete(`session:${session.id}`);
        }
    }
}
