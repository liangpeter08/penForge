import { z } from "zod";
import { createQuote } from "@/server/orders";
import { RevisionSchema } from "@/shared/contracts";
import { handleError, json, readJson, validationError } from "../_lib";

export const dynamic = "force-dynamic";

const Body = z.object({
  mutationId: z.string().min(8).max(64),
  revision: RevisionSchema,
  contact: z.object({ name: z.string().min(1).max(120), email: z.string().email(), company: z.string().max(120).optional() }),
  requiredBy: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    return json(createQuote(parsed.data.revision, parsed.data.mutationId, parsed.data.contact), { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
