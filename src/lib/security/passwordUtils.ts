import { pbkdf2Sync, randomBytes } from "crypto";

const SALT_LENGTH = 64;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = "sha512";

export interface HashedPassword {
  hash: string;
  salt: string;
}

export const hashPassword = (password: string): HashedPassword => {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST
  ).toString("hex");

  return {
    hash,
    salt,
  };
};

export const verifyPassword = (
  password: string,
  hashedPassword: HashedPassword
): boolean => {
  const hash = pbkdf2Sync(
    password,
    hashedPassword.salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST
  ).toString("hex");

  return hash === hashedPassword.hash;
};

export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "Password is strong" };
};
