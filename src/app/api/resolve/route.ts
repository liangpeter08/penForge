import { resolve } from "@/server/resolver";
import { ResolveRequestSchema } from "@/shared/contracts";
import { handleError, json, readJson, validationError } from "../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const parsed = ResolveRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    return json(resolve(parsed.data));
  } catch (e) {
    return handleError(e);
  }
}
