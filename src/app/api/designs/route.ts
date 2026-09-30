import { z } from "zod";
import { CATALOG_VERSION } from "@/server/catalog";
import { encodeToken } from "@/server/orders/signing";
import { SelectionSchema } from "@/shared/contracts";
import { json, readJson, validationError } from "../_lib";

export const dynamic = "force-dynamic";

const Body = z.object({ selection: SelectionSchema, includePersonal: z.boolean().default(false) });

/**
 * Create a shareable design token. Personal text and artwork are stripped unless the owner deliberately
 * includes them. Tokens are signed, not stored; a production deployment issues revocable opaque ids.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);
  const { selection, includePersonal } = parsed.data;
  const shared = includePersonal ? selection : { ...selection, identity: { type: "none" as const } };
  const token = encodeToken({ v: 1, catalogVersion: CATALOG_VERSION, selection: shared, personal: includePersonal });
  return json({ token, url: `/?design=${encodeURIComponent(token)}` }, { status: 201 });
}
