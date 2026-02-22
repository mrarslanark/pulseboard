import { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

export type AuthUser = Pick<User, "id" | "name" | "email">;

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

class AuthService {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("EMAIL_TAKEN");
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return this.buildAuthResult(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    return this.buildAuthResult(user);
  }

  async refresh(oldToken: string): Promise<AuthResult> {
    const existing = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    await prisma.refreshToken.delete({ where: { token: oldToken } });

    return this.buildAuthResult(existing.user);
  }

  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

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

  private async buildAuthResult(user: User): Promise<AuthResult> {
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}

export const authService = new AuthService();
