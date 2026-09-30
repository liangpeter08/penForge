import type { DecorationZone, MaterialSpec, ProductFacts, Silhouette, TrimSpec, WritingMode } from "@/shared/contracts";

export interface BodyFamily {
  id: string;
  label: string;
  /** Parker's own grouping: Heritage, Classic, Stylish, Essential. */
  tier: "Heritage" | "Classic" | "Stylish" | "Essential";
  tagline: string;
  description: string;
  silhouette: Silhouette;
  facts: Omit<ProductFacts, "refill" | "packaging">;
  zones: DecorationZone[];
  /** Grip is part of the body on every Parker pen; kept explicit so the UI never invents a grip option. */
  gripFixed: true;
}

export interface Surface {
  id: string;
  label: string;
  material: MaterialSpec;
  swatch: string;
  swatch2?: string;
}

export interface Trim {
  id: string;
  label: string;
  spec: TrimSpec;
  swatch: string;
}

export interface Nib {
  id: string;
  label: string;
}

export interface Ink {
  id: string;
  label: string;
  swatch: string;
  modes: WritingMode[];
}

export interface Packaging {
  id: string;
  label: string;
  unitMinor: number;
}

export interface QuantityRule {
  moq: number;
  packSize: number;
}

export interface Tier {
  minQty: number;
  unitMinor: number;
  label: string;
}

/**
 * The atomic manufacturable record: one SKU-level combination that the merchant can actually sell.
 * Everything customer-facing resolves to exactly one of these.
 */
export interface Offering {
  id: string;
  bodyFamilyId: string;
  surfaceId: string;
  trimId: string;
  modeId: WritingMode;
  nibIds: string[];
  /** Illustrative merchant SKU; a real catalog maps this to a Shopify variant id. */
  sku: string;
  variantId: string;
  baseUnitMinor: number;
  quantityRule: QuantityRule;
  tiers: Tier[];
  /** Engraving supported for quantity one via local personalization. */
  engravable: boolean;
  /** Pad print (logo) supported via the quote-led route. */
  padPrintable: boolean;
  availability: "in_stock" | "made_to_order";
  productionBusinessDays: number;
}
