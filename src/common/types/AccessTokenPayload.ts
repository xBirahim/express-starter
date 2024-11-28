import type { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
    userId: number;
    sessionId: string;
}
