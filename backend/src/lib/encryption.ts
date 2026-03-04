import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class EncryptionService {
  private readonly key: Buffer;

  constructor() {
    const keyHex = process.env.AI_ENCRYPTION_KEY;

    if (!keyHex) {
      throw new Error("AI_ENCRYPTION_KEY is not set");
    }

    const buffer = Buffer.from(keyHex, "hex");
    if (buffer.length !== 32) {
      throw new Error(
        "AI_ENCRYPTION_KEY must be a 32-byte hex string (64 characters)",
      );
    }

    this.key = buffer;
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [
      iv.toString("hex"),
      tag.toString("hex"),
      encrypted.toString("hex"),
    ].join(":");
  }

  decrypt(cipherText: string): string {
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid ciphertext format");
    }

    const [ivHex, tagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  }

  getKeyHint(apiKey: string): string {
    return apiKey.slice(-4);
  }
}

export const encryptionService = new EncryptionService();
