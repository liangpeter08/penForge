import type { Offering, Tier } from "./types";
import type { WritingMode } from "@/shared/contracts";

/**
 * Approved offerings, generated from Parker's finish × trim × mode matrix per collection.
 * Prices are ILLUSTRATIVE US retail (in cents) and must be replaced by the merchant price book.
 * Quantity rules: every offering is a stock pen (quantity one), so personal purchase is always viable;
 * team tiers model corporate-gift discounts and pad-print MOQs.
 */

type ModePrice = Partial<Record<WritingMode, number>>;

interface Row {
  family: string;
  surfaces: string[];
  trims: string[];
  modes: ModePrice;
  nibs?: string[];
  padPrintable?: boolean;
  premiumUplift?: number;
}

const STD_NIBS = ["f", "m"];
const FULL_NIBS = ["ef", "f", "m", "b"];

const rows: Row[] = [
  // Heritage
  { family: "duofold", surfaces: ["big_red", "duofold_black"], trims: ["palladium", "gold"], modes: { fountain: 58500, rollerball: 39500, ballpoint: 33500 }, nibs: FULL_NIBS },
  { family: "duofold", surfaces: ["prestige_blue_chevron", "prestige_black_chevron"], trims: ["palladium"], modes: { fountain: 72500, rollerball: 46500, ballpoint: 40500 }, nibs: FULL_NIBS },
  // Classic
  { family: "sonnet", surfaces: ["stainless_steel", "matte_black"], trims: ["palladium", "gold"], modes: { fountain: 16500, rollerball: 12500, ballpoint: 9500 }, nibs: STD_NIBS, padPrintable: true },
  { family: "sonnet", surfaces: ["black_lacquer", "blue_lacquer", "red_lacquer"], trims: ["palladium", "gold"], modes: { fountain: 19500, rollerball: 14500, ballpoint: 11000 }, nibs: STD_NIBS, padPrintable: true },
  { family: "sonnet", surfaces: ["metal_pearl"], trims: ["palladium"], modes: { fountain: 27500, rollerball: 19500, ballpoint: 15000 }, nibs: STD_NIBS },
  { family: "sonnet", surfaces: ["cisele"], trims: ["palladium", "gold"], modes: { fountain: 32500, rollerball: 22500, ballpoint: 17500 }, nibs: STD_NIBS },
  { family: "parker51", surfaces: ["p51_black", "p51_midnight_blue", "p51_burgundy", "p51_teal", "p51_forest_green"], trims: ["chrome"], modes: { fountain: 11500, ballpoint: 7500 }, nibs: STD_NIBS },
  { family: "parker51", surfaces: ["p51_black", "p51_plum", "p51_teal"], trims: ["gold"], modes: { fountain: 21500, ballpoint: 13500 }, nibs: FULL_NIBS },
  { family: "ingenuity", surfaces: ["ing_black"], trims: ["chrome", "gold"], modes: { fountain: 17500, rollerball: 14500, ballpoint: 11500 }, nibs: STD_NIBS, padPrintable: true },
  { family: "ingenuity", surfaces: ["ing_blue", "ing_red", "ing_grey"], trims: ["chrome"], modes: { fountain: 17500, rollerball: 14500, ballpoint: 11500 }, nibs: STD_NIBS, padPrintable: true },
  { family: "ingenuity", surfaces: ["monochrome_black"], trims: ["black"], modes: { fountain: 19500, rollerball: 15500, ballpoint: 12500 }, nibs: STD_NIBS },
  { family: "ingenuity", surfaces: ["monochrome_titanium"], trims: ["black"], modes: { fountain: 19500, rollerball: 15500, ballpoint: 12500 }, nibs: STD_NIBS },
  { family: "ingenuity", surfaces: ["monochrome_pink_gold"], trims: ["rose_gold"], modes: { fountain: 19500, rollerball: 15500, ballpoint: 12500 }, nibs: STD_NIBS },
  // Stylish
  { family: "urban", surfaces: ["muted_black"], trims: ["chrome", "gold"], modes: { fountain: 5500, rollerball: 4500, ballpoint: 3500 }, nibs: STD_NIBS, padPrintable: true },
  { family: "urban", surfaces: ["metro_metallic", "vibrant_blue", "vibrant_magenta"], trims: ["chrome"], modes: { fountain: 5500, rollerball: 4500, ballpoint: 3500 }, nibs: STD_NIBS, padPrintable: true },
  { family: "urban", surfaces: ["ebony_chiselled", "dark_blue_pearl"], trims: ["chrome"], modes: { fountain: 8500, rollerball: 7000, ballpoint: 5500 }, nibs: STD_NIBS },
  // Essential
  { family: "im", surfaces: ["im_black", "brushed_metal"], trims: ["chrome", "gold"], modes: { fountain: 4500, rollerball: 3500, ballpoint: 2800 }, nibs: STD_NIBS, padPrintable: true },
  { family: "im", surfaces: ["im_matte_black", "im_blue", "im_blue_grey", "im_light_blue_grey", "im_dark_espresso"], trims: ["chrome"], modes: { fountain: 4500, rollerball: 3500, ballpoint: 2800 }, nibs: STD_NIBS, padPrintable: true },
  { family: "im", surfaces: ["im_deep_gun_metal", "im_pearl"], trims: ["chrome"], modes: { fountain: 7500, rollerball: 6000, ballpoint: 4800 }, nibs: STD_NIBS, padPrintable: true },
  { family: "im", surfaces: ["im_marine_blue"], trims: ["marine_blue"], modes: { fountain: 5500, rollerball: 4500, ballpoint: 3500 }, nibs: STD_NIBS },
  { family: "im", surfaces: ["im_flame_orange"], trims: ["flame_orange"], modes: { fountain: 5500, rollerball: 4500, ballpoint: 3500 }, nibs: STD_NIBS },
  { family: "im", surfaces: ["im_amethyst_purple"], trims: ["amethyst_purple"], modes: { fountain: 5500, rollerball: 4500, ballpoint: 3500 }, nibs: STD_NIBS },
  { family: "jotter", surfaces: ["jotter_steel"], trims: ["chrome", "gold"], modes: { ballpoint: 1800, gel: 2000, pencil: 1800, fountain: 2400 }, nibs: STD_NIBS, padPrintable: true },
  { family: "jotter", surfaces: ["bond_street_black", "royal_blue", "kensington_red", "waterloo_blue", "portobello_purple", "chelsea_orange", "victoria_violet"], trims: ["chrome"], modes: { ballpoint: 2200, gel: 2400, fountain: 2800 }, nibs: STD_NIBS, padPrintable: true },
  { family: "jotter", surfaces: ["originals_black", "originals_white", "originals_red", "originals_blue", "originals_yellow", "originals_green", "originals_magenta"], trims: ["chrome"], modes: { ballpoint: 1200 }, padPrintable: true },
  { family: "jotter_xl", surfaces: ["xl_matte_black", "xl_richmond_blue", "xl_greenwich_green"], trims: ["chrome"], modes: { ballpoint: 2800 }, padPrintable: true },
  { family: "jotter_xl", surfaces: ["xl_alexandra_rose_gold"], trims: ["rose_gold"], modes: { ballpoint: 3200 } },
  { family: "jotter_xl", surfaces: ["xl_monochrome_gold"], trims: ["gold"], modes: { ballpoint: 3200 } },
  { family: "vector_xl", surfaces: ["vxl_black", "vxl_blue", "vxl_teal", "vxl_lilac", "vxl_green", "vxl_silver_blue"], trims: ["chrome"], modes: { fountain: 2000, rollerball: 1800, ballpoint: 1600 }, nibs: STD_NIBS, padPrintable: true },
];

function tiersFor(base: number): Tier[] {
  const t = (minQty: number, pct: number, label: string): Tier => ({ minQty, unitMinor: Math.round(base * (1 - pct)), label });
  return [t(1, 0, "1-24"), t(25, 0.08, "25-99"), t(100, 0.15, "100-249"), t(250, 0.22, "250+")];
}

function build(): Offering[] {
  const out: Offering[] = [];
  for (const r of rows) {
    for (const surface of r.surfaces) {
      for (const trim of r.trims) {
        for (const [mode, price] of Object.entries(r.modes) as [WritingMode, number][]) {
          const id = `${r.family}__${surface}__${trim}__${mode}`;
          out.push({
            id,
            bodyFamilyId: r.family,
            surfaceId: surface,
            trimId: trim,
            modeId: mode,
            nibIds: mode === "fountain" ? (r.nibs ?? STD_NIBS) : [],
            sku: `PK-${r.family.toUpperCase()}-${surface.toUpperCase()}-${trim.toUpperCase()}-${mode.toUpperCase()}`,
            variantId: `gid://shopify/ProductVariant/${hash(id)}`,
            baseUnitMinor: price,
            quantityRule: { moq: 1, packSize: 1 },
            tiers: tiersFor(price),
            engravable: true,
            padPrintable: r.padPrintable ?? false,
            availability: price >= 30000 ? "made_to_order" : "in_stock",
            productionBusinessDays: price >= 30000 ? 10 : 3,
          });
        }
      }
    }
  }
  return out;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return 40000000000 + (h % 1000000000);
}

export const OFFERINGS: Offering[] = build();

/** Pad-print (logo) production rules; separate from stock quantity rules so MOQ and pack size stay distinct facts. */
export const PAD_PRINT_RULE = { moq: 50, packSize: 25, setupMinor: 4500, unitMinor: 350, proofBusinessDays: 3, productionBusinessDays: 12 };
/** Local laser engraving for quantity one. */
export const ENGRAVE_RULE = { unitMinor: 1200, productionBusinessDays: 2 };
