import { z } from "zod";
import { createCartIntent } from "@/server/orders";
import { RevisionSchema } from "@/shared/contracts";
import { handleError, json, readJson, validationError } from "../_lib";

export const dynamic = "force-dynamic";

const Body = z.object({ mutationId: z.string().min(8).max(64), revision: RevisionSchema });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    return json(createCartIntent(parsed.data.revision, parsed.data.mutationId), { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
