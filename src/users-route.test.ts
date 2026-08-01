import { describe, expect, it } from "bun:test";
import { extractBearerToken } from "./routes/users-route";
import { AppError, UnauthorizedError, BadRequestError } from "./errors/app-error";

describe("Authentication & Error Helpers", () => {
  it("should correctly extract Bearer token from authorization header", () => {
    const token = extractBearerToken("Bearer sample-token-123");
    expect(token).toBe("sample-token-123");
  });

  it("should return null if Bearer prefix is missing or invalid", () => {
    expect(extractBearerToken("Basic sample-token-123")).toBeNull();
    expect(extractBearerToken("sample-token-123")).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it("should instantiate custom AppError classes with correct status codes", () => {
    const appErr = new AppError("Generic error", 400);
    expect(appErr.statusCode).toBe(400);

    const unauthErr = new UnauthorizedError();
    expect(unauthErr.statusCode).toBe(401);
    expect(unauthErr.message).toBe("Unauthorized");

    const badReqErr = new BadRequestError("Invalid input");
    expect(badReqErr.statusCode).toBe(400);
    expect(badReqErr.message).toBe("Invalid input");
  });
});
