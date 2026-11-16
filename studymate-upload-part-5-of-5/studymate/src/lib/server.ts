import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 18;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  console.error("StudyMate API error:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function enforceRateLimit(request: Request, route: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${route}:${ip}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (rateBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateBuckets) if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
  }
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_REQUESTS) {
    throw new ApiError(429, "Too many requests. Please wait a minute and try again.");
  }
  current.count += 1;
}

export function requireText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${field} is required.`);
  }
  const result = value.trim();
  if (result.length > maxLength) {
    throw new ApiError(400, `${field} must be ${maxLength.toLocaleString()} characters or fewer.`);
  }
  return result;
}

export function optionalText(value: unknown, field: string, maxLength: number) {
  if (value === undefined || value === null || value === "") return "";
  return requireText(value, field, maxLength);
}

export function requireInteger(value: unknown, field: string, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ApiError(400, `${field} must be a whole number between ${min} and ${max}.`);
  }
  return parsed;
}

export function requireEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(400, `${field} must be one of: ${allowed.join(", ")}.`);
  }
  return value as T;
}
