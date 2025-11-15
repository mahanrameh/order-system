import { Role } from "libs/prisma/generated";

export type AccessTokenPayload = {
    sub: number;
    email: string;
    role: Role;
}

export type RefreshTokenPayload = {
    sub: number;
    tokenId: string;
}

