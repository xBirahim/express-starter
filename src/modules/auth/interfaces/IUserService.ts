import type { UserType } from "@/common/types";

export interface IUserService {
    register(email: string, password: string): Promise<UserType>;
    login(email: string, password: string): Promise<UserType>;
    isEmailVerified(userId: number): Promise<boolean>;
    isUserActive(userId: number): Promise<boolean>;
    // Autres méthodes liées à l'utilisateur
}
