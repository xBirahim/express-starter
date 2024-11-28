import type { IUserService } from "../interfaces/IUserService";
import { db } from "@common/providers/database/database";
import { eq } from "drizzle-orm";
import { AppError } from "@common/errors/app.error";
import { hash, compare } from "bcrypt";
import { User } from "@/common/schemas";
import { SALT_ROUNDS } from "@/common/constants/Crypto";

export class UserService implements IUserService {
    async register(email: string, password: string) {
        const existingUser = await db.select().from(User).where(eq(User.email, email)).limit(1).execute();
        if (existingUser.length > 0) {
            throw new AppError({ message: "Email already registered", code: 409 });
        }

        const hashedPassword = await hash(password, SALT_ROUNDS);
        const [user] = await db
            .insert(User)
            .values({
                email,
                password: hashedPassword,
                emailVerified: false,
                active: true,
            })
            .returning();

        return user;
    }

    async login(email: string, password: string) {
        const [user] = await db.select().from(User).where(eq(User.email, email)).limit(1).execute();
        if (!user) {
            throw new AppError({ message: "Invalid credentials", code: 401 });
        }

        if (!user.active) {
            throw new AppError({ message: "Account is deactivated", code: 403 });
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
            throw new AppError({ message: "Invalid credentials", code: 401 });
        }

        await db.update(User).set({ lastLoginAt: new Date() }).where(eq(User.id, user.id)).execute();
        return user;
    }

    async isEmailVerified(userId: number) {
        const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
        return user.emailVerified;
    }

    async isUserActive(userId: number) {
        const [user] = await db.select().from(User).where(eq(User.id, userId)).limit(1).execute();
        return user.active;
    }
}
