import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";
import { SessionService } from "./services/SessionService";
import { EmailService } from "./services/EmailService";
import { CacheManager } from "@/common/providers/cache/cache";

const cacheManager = new CacheManager();
const userService = new UserService();
const sessionService = new SessionService(cacheManager);
const emailService = new EmailService();

export const AuthManager = new AuthService(userService, sessionService, emailService, cacheManager);
