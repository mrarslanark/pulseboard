import { randomBytes } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "./prisma";
import { User } from "@prisma/client";
import { CookieSerializeOptions } from "@fastify/cookie";

class AuthService {
  cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  generateAccessToken(userId: string, email: string): string {
    const options: SignOptions = {
      expiresIn: process.env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
    };

    return jwt.sign(
      { id: userId, email },
      process.env.JWT_ACCESS_SECRET as string,
      options,
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(64).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  async rotateRefreshToken(oldToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    await prisma.refreshToken.delete({ where: { token: oldToken } });

    const accessToken = this.generateAccessToken(
      existing.user.id,
      existing.user.email,
    );
    const refreshToken = await this.generateRefreshToken(existing.user.id);

    return { accessToken, refreshToken, user: existing.user };
  }
}

export const authService = new AuthService();
