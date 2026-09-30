import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { OrderError } from "@/server/orders";

export function json<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) } });
}

export function validationError(err: ZodError) {
  return json(
    {
      error: {
        code: "VALIDATION",
        message: "The request was not valid.",
        fields: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    },
    { status: 422 },
  );
}

export function handleError(err: unknown) {
  if (err instanceof OrderError) {
    return json({ error: { code: err.code, message: err.message, fields: err.fields } }, { status: err.status });
  }
  console.error(err);
  return json({ error: { code: "INTERNAL", message: "Something went wrong. Please retry." } }, { status: 500 });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
