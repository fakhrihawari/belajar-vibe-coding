import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/user-service";
import { AppError, UnauthorizedError } from "../errors/app-error";

export function extractBearerToken(authorization?: string): string | null {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split(" ")[1] || null;
}

export const usersRoute = new Elysia()
  .post(
    "/api/users",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        return result;
      } catch (error: unknown) {
        if (error instanceof AppError) {
          set.status = error.statusCode;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post(
    "/api/users/login",
    async ({ body, set }) => {
      try {
        const result = await loginUser(body);
        return result;
      } catch (error: unknown) {
        if (error instanceof AppError) {
          set.status = error.statusCode;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .get(
    "/api/users/current",
    async ({ headers, set }) => {
      try {
        const token = extractBearerToken(headers.authorization);

        if (!token) {
          throw new UnauthorizedError("Unauthorized");
        }

        const result = await getCurrentUser(token);
        return result;
      } catch (error: unknown) {
        if (error instanceof AppError) {
          set.status = error.statusCode;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Internal Server Error" };
      }
    },
    {
      headers: t.Object(
        {
          authorization: t.String({ error: "Authorization header with Bearer token is required" }),
        },
        { allowUnknownHeaders: true }
      ),
      response: {
        200: t.Object({
          data: t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            created_at: t.Any(),
          }),
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  );
