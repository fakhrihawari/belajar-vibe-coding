import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { BadRequestError, UnauthorizedError } from "../errors/app-error";

export async function registerUser(payload: any) {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (existingUser) {
    throw new BadRequestError("Email sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert user
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
  });

  return { data: "OK" };
}

export async function loginUser(payload: any) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const isPasswordValid = await Bun.password.verify(payload.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Email atau password salah");
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

  await db.insert(sessions).values({
    token: token,
    userId: user.id,
    expiresAt: expiresAt,
  });

  return { data: token };
}

export async function getCurrentUser(token: string) {
  if (!token) {
    throw new UnauthorizedError("Unauthorized");
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
  });

  if (!session) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (session.expiresAt && session.expiresAt < new Date()) {
    throw new UnauthorizedError("Session expired");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new UnauthorizedError("Unauthorized");
  }

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
    },
  };
}
