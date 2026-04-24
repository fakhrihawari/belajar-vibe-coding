import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(payload: any) {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
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
