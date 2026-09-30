import { CATALOG_VERSION, PRICE_BOOK_VERSION, offeringById, familyById } from "@/server/catalog";
import { resolve } from "@/server/resolver";
import { REASON, SCHEMA_VERSION, newId, type CartIntent, type ConfigurationRevision, type QuoteReceipt, type Selection } from "@/shared/contracts";
import { shortHash, sign, verify } from "./signing";

const REVISION_TTL_MS = 60 * 60 * 1000;
const ENGRAVING_SERVICE_VARIANT = "gid://shopify/ProductVariant/40000000001";

export class OrderError extends Error {
  constructor(
    public status: 409 | 422,
    public code: string,
    message: string,
    public fields?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

function snapshotOf(rev: Omit<ConfigurationRevision, "signature">) {
  const { ...rest } = rev;
  return rest;
}

/**
 * Freeze an immutable, signed configuration revision after revalidating against the current catalog.
 * Stateless by design: the signature lets later steps trust the snapshot without a database.
 * A production deployment persists these (spec §11) so operations can audit them.
 */
export function createConfiguration(selection: Selection, expected: { catalogVersion: string; merchandiseSubtotalMinor: number }): ConfigurationRevision {
  if (expected.catalogVersion !== CATALOG_VERSION) {
    throw new OrderError(409, REASON.CATALOG_VERSION_CHANGED, "The catalog changed since this design was priced. Review the updated terms.");
  }
  const res = resolve({ schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision: 0, selection });
  const r = res.resolution;
  if (r.manufacturing !== "compatible" || !r.commerce.eligible) {
    throw new OrderError(
      422,
      r.commerce.reasons[0]?.code ?? REASON.NO_APPROVED_OFFERING,
      r.commerce.reasons[0]?.message ?? "This configuration cannot be ordered as configured.",
      r.commerce.reasons.map((x) => ({ path: x.field ?? "selection", message: x.message })),
    );
  }
  if (r.pricing.status === "exact" && r.pricing.merchandiseSubtotalMinor !== expected.merchandiseSubtotalMinor) {
    throw new OrderError(409, REASON.PRICE_EXPIRED, "The price changed since it was displayed. Review the new total before continuing.");
  }
  const now = new Date();
  const body: Omit<ConfigurationRevision, "signature"> = {
    configurationRevisionId: newId("cfg"),
    catalogVersion: CATALOG_VERSION,
    priceBookVersion: PRICE_BOOK_VERSION,
    assetManifestVersion: r.assetManifestVersion,
    selection: res.selection,
    offeringId: r.offeringId,
    merchandiseSubtotalMinor: r.pricing.merchandiseSubtotalMinor,
    currency: r.pricing.currency,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + REVISION_TTL_MS).toISOString(),
  };
  return { ...body, signature: sign(snapshotOf(body)) };
}

export function verifyRevision(rev: ConfigurationRevision): void {
  const { signature, ...body } = rev;
  if (!verify(body, signature)) throw new OrderError(422, REASON.BAD_SIGNATURE, "This configuration reference is not valid.");
  if (new Date(rev.expiresAt).getTime() < Date.now()) throw new OrderError(409, REASON.PRICE_EXPIRED, "This configuration expired. Re-price it before ordering.");
  if (rev.catalogVersion !== CATALOG_VERSION) throw new OrderError(409, REASON.CATALOG_VERSION_CHANGED, "The catalog changed since this configuration was created.");
}

/**
 * Create (or idempotently retrieve) a cart intent. The browser never supplies a price; the intent carries
 * the variant ids and the merchant-side reference. Retrying with the same mutation id returns the same intent.
 */
export function createCartIntent(rev: ConfigurationRevision, mutationId: string): CartIntent & { lines: CartLine[]; merchandiseSubtotalMinor: number } {
  verifyRevision(rev);
  const res = resolve({ schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision: 0, selection: rev.selection });
  const r = res.resolution;
  if (r.commerce.route !== "variant_cart" || !r.commerce.eligible) {
    throw new OrderError(422, REASON.QUOTE_REQUIRED, "This configuration must go through a quote, not the cart.");
  }
  if (r.pricing.merchandiseSubtotalMinor !== rev.merchandiseSubtotalMinor) {
    throw new OrderError(409, REASON.PRICE_EXPIRED, "The price changed since this configuration was accepted.");
  }
  const offering = offeringById(rev.offeringId)!;
  const family = familyById(offering.bodyFamilyId)!;
  const s = rev.selection;
  const intentId = `int_${shortHash(mutationId)}`;
  const properties: Record<string, string> = {
    Pen: r.offeringLabel,
    ...(s.nibId ? { Nib: r.facts.refill.split(", ")[1] ?? s.nibId } : {}),
    Packaging: r.facts.packaging,
  };
  const lines: CartLine[] = [
    {
      variantId: offering.variantId,
      sku: offering.sku,
      quantity: s.quantity,
      unitMinor: r.pricing.tier?.unitMinor ?? r.pricing.unitMinor,
      title: `Parker ${family.label}`,
      properties,
      privateProperties: { _penforge_ref: rev.configurationRevisionId, _penforge_intent: intentId },
    },
  ];
  if (s.identity.type === "text") {
    lines.push({
      variantId: ENGRAVING_SERVICE_VARIANT,
      sku: "SVC-ENGRAVE",
      quantity: s.quantity,
      unitMinor: r.pricing.decorationUnitMinor,
      title: "Laser engraving",
      properties: { Engraving: s.identity.text, Zone: s.identity.zoneId, "Text height": `${s.identity.heightMm} mm` },
      privateProperties: { _penforge_ref: rev.configurationRevisionId, _penforge_intent: intentId, _linked_to: offering.variantId },
    });
  }
  return {
    intentId,
    mutationId,
    configurationRevisionId: rev.configurationRevisionId,
    variantId: offering.variantId,
    quantity: s.quantity,
    properties,
    privateProperties: lines[0].privateProperties,
    expiresAt: rev.expiresAt,
    lines,
    merchandiseSubtotalMinor: r.pricing.merchandiseSubtotalMinor,
  };
}

export interface CartLine {
  variantId: string;
  sku: string;
  quantity: number;
  unitMinor: number;
  title: string;
  properties: Record<string, string>;
  privateProperties: Record<string, string>;
}

export function createQuote(rev: ConfigurationRevision, mutationId: string, contact: { name: string; email: string; company?: string }): QuoteReceipt {
  verifyRevision(rev);
  const res = resolve({ schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision: 0, selection: rev.selection });
  const r = res.resolution;
  if (!r.commerce.eligible && r.commerce.route === "quote") {
    throw new OrderError(422, r.commerce.reasons[0]?.code ?? REASON.NO_APPROVED_OFFERING, r.commerce.reasons[0]?.message ?? "Fix the highlighted fields first.");
  }
  if (!contact.email.includes("@")) throw new OrderError(422, "VALIDATION", "A contact email is required.", [{ path: "contact.email", message: "Enter a valid email." }]);
  // No persistence in this slice: the request id is deterministic so a retried submission is recognisably the same request.
  return {
    requestId: `quote_${shortHash(`${rev.configurationRevisionId}:${mutationId}`)}`,
    configurationRevisionId: rev.configurationRevisionId,
    submittedAt: new Date().toISOString(),
    nextAction: "Operations checks manufacturability, files and stock, then sends a versioned quote and a production proof for approval.",
    responseTarget: null,
  };
}
