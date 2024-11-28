import type { UserType } from "@common/types";

export type CreateUserDto = Pick<UserType, "email" | "password">;
export type UpdateUserDto = Partial<CreateUserDto>;
