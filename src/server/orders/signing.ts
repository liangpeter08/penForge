import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_FALLBACK = "penforge-dev-secret-do-not-use-in-production";

export function signingSecret(): string {
  const s = process.env.PENFORGE_SIGNING_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    console.warn("[penforge] PENFORGE_SIGNING_SECRET is unset; using the dev fallback. Set it in Vercel project settings.");
  }
  return DEV_FALLBACK;
}

/** Deterministic JSON with sorted keys so signatures are reproducible across runtimes. */
export function canonical(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
}

export function sign(payload: unknown): string {
  return createHmac("sha256", signingSecret()).update(canonical(payload)).digest("base64url");
}

export function verify(payload: unknown, signature: string): boolean {
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function shortHash(input: string, length = 12): string {
  return createHmac("sha256", signingSecret()).update(input).digest("base64url").slice(0, length);
}

export function encodeToken(payload: unknown): string {
  const body = Buffer.from(canonical(payload)).toString("base64url");
  return `${body}.${sign(payload)}`;
}

export function decodeToken<T>(token: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return verify(payload, sig) ? payload : null;
  } catch {
    return null;
  }
}
