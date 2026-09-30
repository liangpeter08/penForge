import { z } from "zod";
import { createConfiguration } from "@/server/orders";
import { SelectionSchema } from "@/shared/contracts";
import { handleError, json, readJson, validationError } from "../_lib";

export const dynamic = "force-dynamic";

const Body = z.object({
  selection: SelectionSchema,
  catalogVersion: z.string(),
  merchandiseSubtotalMinor: z.number().int(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const rev = createConfiguration(parsed.data.selection, parsed.data);
    return json(rev, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
