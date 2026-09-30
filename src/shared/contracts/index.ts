/**
 * Shared request/response contracts between storefront and server.
 * The server is authoritative; the client never reconstructs compatibility from names.
 */
import { z } from "zod";

export const SCHEMA_VERSION = 1;

export type WritingMode = "fountain" | "rollerball" | "ballpoint" | "gel" | "pencil";
export type Intent = "personal" | "team";
export type ChapterId = "form" | "surface" | "details" | "identity" | "review";
export const CHAPTERS: ChapterId[] = ["form", "surface", "details", "identity", "review"];

export const REASON = {
  NO_APPROVED_OFFERING: "NO_APPROVED_OFFERING",
  MOQ_NOT_MET: "MOQ_NOT_MET",
  PACK_INCREMENT: "PACK_INCREMENT",
  ARTWORK_PENDING: "ARTWORK_PENDING",
  QUOTE_REQUIRED: "QUOTE_REQUIRED",
  PRICE_EXPIRED: "PRICE_EXPIRED",
  TEXT_TOO_LONG: "TEXT_TOO_LONG",
  TEXT_UNSUPPORTED_GLYPH: "TEXT_UNSUPPORTED_GLYPH",
  ZONE_UNAVAILABLE: "ZONE_UNAVAILABLE",
  STALE_REVISION: "STALE_REVISION",
  BAD_SIGNATURE: "BAD_SIGNATURE",
  CATALOG_VERSION_CHANGED: "CATALOG_VERSION_CHANGED",
} as const;
export type ReasonCode = (typeof REASON)[keyof typeof REASON];

export const IdentitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({
    type: z.literal("text"),
    text: z.string().max(60),
    fontId: z.string(),
    zoneId: z.string(),
    heightMm: z.number().min(1).max(6),
  }),
  z.object({
    type: z.literal("logo"),
    zoneId: z.string(),
    fileName: z.string().max(200),
    fileType: z.string().max(100),
    fileBytes: z.number().int().nonnegative(),
    widthMm: z.number().min(2).max(60),
    /** Set by the customer after reading the preflight note; never implies production approval. */
    acknowledgedPreview: z.boolean().default(false),
  }),
]);
export type Identity = z.infer<typeof IdentitySchema>;

export const SelectionSchema = z.object({
  bodyFamilyId: z.string(),
  surfaceId: z.string(),
  trimId: z.string(),
  modeId: z.enum(["fountain", "rollerball", "ballpoint", "gel", "pencil"]),
  nibId: z.string().nullable(),
  inkId: z.string().nullable(),
  packagingId: z.string(),
  identity: IdentitySchema,
  quantity: z.number().int().min(1).max(100000),
  intent: z.enum(["personal", "team"]),
  marketId: z.string().default("market_us"),
});
export type Selection = z.infer<typeof SelectionSchema>;

/** A single-facet edit the client wants to make. Used to derive minimal-change proposals. */
export const EditSchema = z
  .object({
    facet: z.enum(["bodyFamilyId", "surfaceId", "trimId", "modeId", "nibId", "inkId", "packagingId", "quantity"]),
    value: z.union([z.string(), z.number()]),
  })
  .nullable();
export type Edit = z.infer<typeof EditSchema>;

export const ResolveRequestSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  requestId: z.string().min(1).max(64),
  draftRevision: z.number().int().nonnegative(),
  catalogVersion: z.string().optional(),
  selection: SelectionSchema,
  /** The edit that produced this draft, so conflicts can propose minimal changes relative to it. */
  edit: EditSchema.optional(),
});
export type ResolveRequest = z.infer<typeof ResolveRequestSchema>;

export type PricingStatus = "exact" | "estimated" | "quote_required" | "unavailable";
export type ManufacturingStatus = "compatible" | "conflict";
export type ArtworkStatus = "not_required" | "preview" | "preflight_passed" | "proof_pending" | "rejected";
export type AvailabilityStatus = "confirmed" | "stale" | "unavailable";
export type CommerceRoute = "variant_cart" | "draft_order" | "quote";

export interface PriceLine {
  label: string;
  amountMinor: number;
  note?: string;
}

export interface Pricing {
  status: PricingStatus;
  currency: string;
  minorUnitExponent: number;
  unitMinor: number;
  decorationUnitMinor: number;
  packagingUnitMinor: number;
  setupMinor: number;
  discountMinor: number;
  merchandiseSubtotalMinor: number;
  effectivePerPenMinor: number;
  lines: PriceLine[];
  tax: "included" | "estimated" | "checkout";
  shipping: "included" | "estimated" | "checkout";
  priceBookVersion: string;
  tier: { minQty: number; unitMinor: number; label: string } | null;
  tiers: { minQty: number; unitMinor: number; label: string }[];
}

export interface FacetOption {
  id: string;
  label: string;
  /** Usable with the other committed facets held fixed. */
  available: boolean;
  /** Present when the option is currently incompatible: a concise reason + what would change. */
  reason?: string;
  swatch?: string;
  swatch2?: string;
  finishKind?: string;
  description?: string;
}

export interface Facet {
  id: "bodyFamilyId" | "surfaceId" | "trimId" | "modeId" | "nibId" | "inkId" | "packagingId";
  label: string;
  chapter: ChapterId;
  /** false = the facet is a fixed, inspectable fact for this offering, not a choice. */
  editable: boolean;
  options: FacetOption[];
}

export interface ProposedChange {
  facet: keyof Selection;
  from: string | number | null;
  to: string | number | null;
  label: string;
}

export interface Proposal {
  id: string;
  title: string;
  /** Every change applied together as one undoable transaction. */
  changes: ProposedChange[];
  consequences: string[];
  resultingOfferingId: string;
}

export interface Reason {
  code: ReasonCode;
  field?: string;
  message: string;
}

export interface DecorationZone {
  id: string;
  label: string;
  processes: ("engrave" | "pad_print")[];
  /** Usable area in mm, local origin at zone centre. */
  widthMm: number;
  heightMm: number;
  minTextHeightMm: number;
  maxTextHeightMm: number;
  maxChars: number;
  /** Position along the pen axis as 0..1 from tip to rear, and the circumferential angle in degrees. */
  axialFraction: number;
  angleDeg: number;
}

export interface ProductFacts {
  lengthMm: number;
  barrelDiameterMm: number;
  weightG: number;
  mechanism: string;
  refill: string;
  material: string;
  packaging: string;
  origin?: string;
}

export interface AssetManifest {
  version: string;
  /** Procedural silhouette parameters; a glTF asset would replace this with node names + anchors. */
  silhouette: Silhouette;
  material: MaterialSpec;
  trim: TrimSpec;
  zones: DecorationZone[];
  poster: string;
}

export interface Silhouette {
  lengthMm: number;
  barrelDiameterMm: number;
  capDiameterMm: number;
  /** 0..1 fraction of length occupied by cap from the rear. */
  capFraction: number;
  /** How pointed the tip is. 0 = flat, 1 = long cone. */
  tipTaper: number;
  /** Rounded (Jotter/51) vs flat-top (Duofold) ends. */
  endStyle: "rounded" | "flat" | "domed";
  clipStyle: "arrow" | "plain" | "modern";
  /** Whether the section (grip) is a separate visible part. */
  gripSeparate: boolean;
  /** Number of decorative rings at the cap lip. */
  capRings: number;
  /** Fraction of the barrel that is a separately coloured section (e.g. Jotter's steel barrel). */
  bodySplit: number | null;
  /** Hooded nib like the 51. */
  hoodedNib: boolean;
}

export interface MaterialSpec {
  kind: "lacquer_gloss" | "lacquer_matte" | "brushed_metal" | "polished_metal" | "resin" | "chiselled" | "pearl";
  color: string;
  color2?: string;
  roughness: number;
  metalness: number;
  clearcoat: number;
}

export interface TrimSpec {
  color: string;
  roughness: number;
  metalness: number;
}

export interface Resolution {
  offeringId: string;
  offeringLabel: string;
  manufacturing: ManufacturingStatus;
  artwork: ArtworkStatus;
  availability: AvailabilityStatus;
  pricing: Pricing;
  commerce: { route: CommerceRoute; eligible: boolean; reasons: Reason[] };
  quantityRules: { moq: number; packSize: number };
  timing: { proofBusinessDays: number | null; productionBusinessDays: number; dispatchNote: string };
  assetManifestVersion: string;
  assetManifest: AssetManifest;
  facts: ProductFacts;
  expiresAt: string;
  reasons: Reason[];
  proposedChanges: Proposal[];
  availableFacets: Facet[];
  /** If the request could not be satisfied, the selection that the server considers still committed. */
  committedSelection: Selection;
}

export interface ResolveResponse {
  schemaVersion: number;
  requestId: string;
  draftRevision: number;
  catalogVersion: string;
  configurationRevisionId: string | null;
  selection: Selection;
  resolution: Resolution;
}

export interface BootstrapResponse {
  schemaVersion: number;
  catalogVersion: string;
  merchant: { name: string; accent: string; currency: string };
  families: { id: string; label: string; tier: string; tagline: string; modes: WritingMode[] }[];
  fonts: { id: string; label: string; css: string }[];
  defaultSelection: Selection;
  defaultResolution: ResolveResponse;
  featureFlags: { directCheckoutForPersonalization: boolean; logoUploads: boolean };
}

export const RevisionSchema = z.object({
  configurationRevisionId: z.string(),
  catalogVersion: z.string(),
  priceBookVersion: z.string(),
  assetManifestVersion: z.string(),
  selection: SelectionSchema,
  offeringId: z.string(),
  merchandiseSubtotalMinor: z.number().int(),
  currency: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  signature: z.string(),
});

export interface ConfigurationRevision {
  configurationRevisionId: string;
  catalogVersion: string;
  priceBookVersion: string;
  assetManifestVersion: string;
  selection: Selection;
  offeringId: string;
  merchandiseSubtotalMinor: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
  /** HMAC over the canonical snapshot; verified by cart-intents and quotes. */
  signature: string;
}

export interface CartIntent {
  intentId: string;
  mutationId: string;
  configurationRevisionId: string;
  variantId: string;
  quantity: number;
  properties: Record<string, string>;
  privateProperties: Record<string, string>;
  expiresAt: string;
}

export interface QuoteReceipt {
  requestId: string;
  configurationRevisionId: string;
  submittedAt: string;
  nextAction: string;
  responseTarget: string | null;
}

export interface ApiError {
  error: { code: ReasonCode | "VALIDATION" | "NOT_FOUND" | "INTERNAL"; message: string; fields?: { path: string; message: string }[] };
}

export function newId(prefix: string): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${rnd}`;
}

export function formatMinor(minor: number, currency: string, exponent = 2): string {
  const major = minor / Math.pow(10, exponent);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: exponent }).format(major);
}
