import type { AccessTokenPayload } from "@/common/types";

declare global {
    namespace Express {
        interface Request {
            payload?: AccessTokenPayload;
        }
    }
}
