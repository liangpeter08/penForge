import { FAMILIES, familyById } from "./families";
import { SURFACES, TRIMS, NIBS, INKS, PACKAGING, FONTS, surfaceById, trimById } from "./attributes";
import { OFFERINGS, PAD_PRINT_RULE, ENGRAVE_RULE } from "./offerings";
import type { Offering } from "./types";
import type { AssetManifest, Selection } from "@/shared/contracts";

export const CATALOG_VERSION = "catalog_parker_2026_09";
export const PRICE_BOOK_VERSION = "prices_illustrative_1";
export const MERCHANT = { name: "PenForge", accent: "#b8321f", currency: "USD" };

export { FAMILIES, SURFACES, TRIMS, NIBS, INKS, PACKAGING, FONTS, OFFERINGS, PAD_PRINT_RULE, ENGRAVE_RULE, familyById, surfaceById, trimById };

export const offeringById = (id: string): Offering | undefined => OFFERINGS.find((o) => o.id === id);

export function manifestFor(offering: Offering): AssetManifest {
  const family = familyById(offering.bodyFamilyId)!;
  const surface = surfaceById(offering.surfaceId)!;
  const trim = trimById(offering.trimId)!;
  return {
    version: `assets_${offering.bodyFamilyId}_${offering.surfaceId}_${offering.trimId}_1`,
    silhouette: family.silhouette,
    material: surface.material,
    trim: trim.spec,
    zones: family.zones,
    poster: `/api/poster?family=${family.id}&surface=${surface.id}&trim=${trim.id}`,
  };
}

/** Approved default offering for the personal entry route: available at quantity one and engravable. */
export const DEFAULT_SELECTION: Selection = {
  bodyFamilyId: "sonnet",
  surfaceId: "matte_black",
  trimId: "palladium",
  modeId: "fountain",
  nibId: "m",
  inkId: "black",
  packagingId: "gift_box",
  identity: { type: "none" },
  quantity: 1,
  intent: "personal",
  marketId: "market_us",
};

/** Catalog publication checks (spec §14): run at build/test time. */
export function validateCatalog(): string[] {
  const errors: string[] = [];
  for (const o of OFFERINGS) {
    if (!familyById(o.bodyFamilyId)) errors.push(`${o.id}: unknown family`);
    if (!surfaceById(o.surfaceId)) errors.push(`${o.id}: unknown surface`);
    if (!trimById(o.trimId)) errors.push(`${o.id}: unknown trim`);
    if (o.modeId === "fountain" && o.nibIds.length === 0) errors.push(`${o.id}: fountain without nibs`);
    if (o.baseUnitMinor <= 0) errors.push(`${o.id}: no price`);
  }
  for (const f of FAMILIES) {
    if (!OFFERINGS.some((o) => o.bodyFamilyId === f.id)) errors.push(`${f.id}: family has no offerings`);
    if (f.zones.length === 0) errors.push(`${f.id}: no decoration zones`);
  }
  const ids = new Set<string>();
  for (const o of OFFERINGS) {
    if (ids.has(o.id)) errors.push(`${o.id}: duplicate`);
    ids.add(o.id);
  }
  return errors;
}
