import { CATALOG_VERSION } from "@/server/catalog";
import { decodeToken } from "@/server/orders/signing";
import { resolve } from "@/server/resolver";
import { SCHEMA_VERSION, SelectionSchema, newId, type Selection } from "@/shared/contracts";
import { json } from "../../_lib";

export const dynamic = "force-dynamic";

interface DesignToken {
  v: number;
  catalogVersion: string;
  selection: Selection;
  personal: boolean;
}

/** Reopen a saved design: revalidates against the current catalog and reports what changed before purchase. */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const payload = decodeToken<DesignToken>(decodeURIComponent(token));
  if (!payload) return json({ error: { code: "NOT_FOUND", message: "This design link is not valid." } }, { status: 404 });
  const parsed = SelectionSchema.safeParse(payload.selection);
  if (!parsed.success) return json({ error: { code: "NOT_FOUND", message: "This design link is out of date." } }, { status: 404 });
  const resolution = resolve({ schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision: 0, selection: parsed.data });
  return json({
    selection: parsed.data,
    catalogChanged: payload.catalogVersion !== CATALOG_VERSION,
    stillAvailable: resolution.resolution.manufacturing === "compatible",
    resolution,
  });
}
