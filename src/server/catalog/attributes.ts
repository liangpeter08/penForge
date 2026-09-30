import type { Ink, Nib, Packaging, Surface, Trim } from "./types";

const lacquer = (color: string, gloss = true) =>
  ({ kind: gloss ? "lacquer_gloss" : "lacquer_matte", color, roughness: gloss ? 0.18 : 0.6, metalness: 0.05, clearcoat: gloss ? 1 : 0 }) as const;
const metal = (color: string, brushed = true) =>
  ({ kind: brushed ? "brushed_metal" : "polished_metal", color, roughness: brushed ? 0.42 : 0.15, metalness: 1, clearcoat: 0 }) as const;
const resin = (color: string) => ({ kind: "resin", color, roughness: 0.2, metalness: 0, clearcoat: 0.8 }) as const;

/** Every finish that appears across the current Parker collections. Which family/trim/mode it applies to lives in offerings.ts. */
export const SURFACES: Surface[] = [
  // Duofold
  { id: "big_red", label: "Big Red Vintage", material: resin("#b8321f"), swatch: "#b8321f" },
  { id: "duofold_black", label: "Classic Black", material: resin("#111214"), swatch: "#111214" },
  { id: "prestige_blue_chevron", label: "Prestige Blue Chevron", material: { kind: "chiselled", color: "#1d3a6b", color2: "#3b5b93", roughness: 0.3, metalness: 0.6, clearcoat: 0.5 }, swatch: "#1d3a6b", swatch2: "#3b5b93" },
  { id: "prestige_black_chevron", label: "Prestige Black Chevron", material: { kind: "chiselled", color: "#18191c", color2: "#3a3b40", roughness: 0.3, metalness: 0.6, clearcoat: 0.5 }, swatch: "#18191c", swatch2: "#3a3b40" },
  // Sonnet
  { id: "stainless_steel", label: "Stainless Steel", material: metal("#c9cbcf"), swatch: "#c9cbcf" },
  { id: "black_lacquer", label: "Black Lacquer", material: lacquer("#0f1012"), swatch: "#0f1012" },
  { id: "matte_black", label: "Matte Black", material: lacquer("#1a1b1e", false), swatch: "#1a1b1e" },
  { id: "blue_lacquer", label: "Blue Lacquer", material: lacquer("#12305e"), swatch: "#12305e" },
  { id: "red_lacquer", label: "Red Lacquer", material: lacquer("#8f1d24"), swatch: "#8f1d24" },
  { id: "metal_pearl", label: "Metal & Pearl", material: { kind: "pearl", color: "#e9e4d8", color2: "#c6c9cc", roughness: 0.25, metalness: 0.4, clearcoat: 1 }, swatch: "#e9e4d8", swatch2: "#c6c9cc" },
  { id: "cisele", label: "Ciselé Chiselled Silver", material: { kind: "chiselled", color: "#d3d5d8", color2: "#9ea1a6", roughness: 0.35, metalness: 1, clearcoat: 0 }, swatch: "#d3d5d8", swatch2: "#9ea1a6" },
  // Parker 51
  { id: "p51_black", label: "Black", material: resin("#101113"), swatch: "#101113" },
  { id: "p51_midnight_blue", label: "Midnight Blue", material: resin("#162244"), swatch: "#162244" },
  { id: "p51_burgundy", label: "Burgundy", material: resin("#5a1a26"), swatch: "#5a1a26" },
  { id: "p51_teal", label: "Teal Blue", material: resin("#1f5f6e"), swatch: "#1f5f6e" },
  { id: "p51_plum", label: "Plum", material: resin("#4a2545"), swatch: "#4a2545" },
  { id: "p51_forest_green", label: "Forest Green", material: resin("#1f4a3a"), swatch: "#1f4a3a" },
  // Ingenuity
  { id: "ing_black", label: "Black", material: lacquer("#121315"), swatch: "#121315" },
  { id: "ing_blue", label: "Blue", material: lacquer("#153a72"), swatch: "#153a72" },
  { id: "ing_grey", label: "Grey", material: lacquer("#6d7278", false), swatch: "#6d7278" },
  { id: "ing_red", label: "Red", material: lacquer("#9a1f2a"), swatch: "#9a1f2a" },
  { id: "monochrome_black", label: "Monochrome Black", material: lacquer("#141416", false), swatch: "#141416" },
  { id: "monochrome_titanium", label: "Monochrome Titanium", material: metal("#8a8d92"), swatch: "#8a8d92" },
  { id: "monochrome_pink_gold", label: "Monochrome Pink Gold", material: metal("#d3a48f", false), swatch: "#d3a48f" },
  // Urban
  { id: "muted_black", label: "Muted Black", material: lacquer("#1b1c1f", false), swatch: "#1b1c1f" },
  { id: "metro_metallic", label: "Metro Metallic", material: metal("#9fa3a8"), swatch: "#9fa3a8" },
  { id: "vibrant_blue", label: "Vibrant Blue", material: lacquer("#1749a8"), swatch: "#1749a8" },
  { id: "vibrant_magenta", label: "Vibrant Magenta", material: lacquer("#a5236e"), swatch: "#a5236e" },
  { id: "ebony_chiselled", label: "Premium Ebony Metal Chiselled", material: { kind: "chiselled", color: "#1c1d20", color2: "#45474c", roughness: 0.3, metalness: 0.9, clearcoat: 0 }, swatch: "#1c1d20", swatch2: "#45474c" },
  { id: "dark_blue_pearl", label: "Premium Dark Blue Pearl", material: { kind: "pearl", color: "#1a2c5a", color2: "#3d5390", roughness: 0.25, metalness: 0.4, clearcoat: 1 }, swatch: "#1a2c5a", swatch2: "#3d5390" },
  // IM
  { id: "im_black", label: "Black", material: lacquer("#111214"), swatch: "#111214" },
  { id: "im_matte_black", label: "Matte Black", material: lacquer("#1a1b1e", false), swatch: "#1a1b1e" },
  { id: "brushed_metal", label: "Brushed Metal", material: metal("#b9bcc1"), swatch: "#b9bcc1" },
  { id: "im_blue", label: "Blue", material: lacquer("#183b7a"), swatch: "#183b7a" },
  { id: "im_blue_grey", label: "Blue Grey", material: lacquer("#4f5f73", false), swatch: "#4f5f73" },
  { id: "im_light_blue_grey", label: "Light Blue Grey", material: lacquer("#8d9aab", false), swatch: "#8d9aab" },
  { id: "im_dark_espresso", label: "Dark Espresso", material: lacquer("#3a2a22", false), swatch: "#3a2a22" },
  { id: "im_deep_gun_metal", label: "Premium Deep Gun Metal", material: metal("#4a4d53"), swatch: "#4a4d53" },
  { id: "im_pearl", label: "Premium Pearl", material: { kind: "pearl", color: "#ece7dc", color2: "#cfc9bd", roughness: 0.25, metalness: 0.3, clearcoat: 1 }, swatch: "#ece7dc", swatch2: "#cfc9bd" },
  { id: "im_marine_blue", label: "Vibrant Rings Marine Blue", material: lacquer("#151619", false), swatch: "#151619", swatch2: "#1e7fd8" },
  { id: "im_flame_orange", label: "Vibrant Rings Flame Orange", material: lacquer("#151619", false), swatch: "#151619", swatch2: "#f0641e" },
  { id: "im_amethyst_purple", label: "Vibrant Rings Amethyst Purple", material: lacquer("#151619", false), swatch: "#151619", swatch2: "#7b3fb8" },
  // Jotter / Jotter XL
  { id: "jotter_steel", label: "Stainless Steel", material: metal("#c9cbcf"), swatch: "#c9cbcf" },
  { id: "bond_street_black", label: "Bond Street Black", material: lacquer("#101113"), swatch: "#101113" },
  { id: "royal_blue", label: "Royal Blue", material: lacquer("#153d8f"), swatch: "#153d8f" },
  { id: "kensington_red", label: "Kensington Red", material: lacquer("#a2151d"), swatch: "#a2151d" },
  { id: "waterloo_blue", label: "Waterloo Blue", material: lacquer("#2e6db3"), swatch: "#2e6db3" },
  { id: "portobello_purple", label: "Portobello Purple", material: lacquer("#5b2d7f"), swatch: "#5b2d7f" },
  { id: "chelsea_orange", label: "Chelsea Orange", material: lacquer("#e8651c"), swatch: "#e8651c" },
  { id: "victoria_violet", label: "Victoria Violet", material: lacquer("#6a5ab8"), swatch: "#6a5ab8" },
  { id: "originals_black", label: "Originals Black", material: lacquer("#1b1c1f", false), swatch: "#1b1c1f" },
  { id: "originals_white", label: "Originals White", material: lacquer("#f2f1ec", false), swatch: "#f2f1ec" },
  { id: "originals_red", label: "Originals Red", material: lacquer("#c8262b", false), swatch: "#c8262b" },
  { id: "originals_blue", label: "Originals Blue", material: lacquer("#1f4fa0", false), swatch: "#1f4fa0" },
  { id: "originals_yellow", label: "Originals Yellow", material: lacquer("#f2c12e", false), swatch: "#f2c12e" },
  { id: "originals_green", label: "Originals Green", material: lacquer("#2e8b57", false), swatch: "#2e8b57" },
  { id: "originals_magenta", label: "Originals Magenta", material: lacquer("#c4267e", false), swatch: "#c4267e" },
  { id: "xl_matte_black", label: "Matte Black", material: lacquer("#1a1b1e", false), swatch: "#1a1b1e" },
  { id: "xl_richmond_blue", label: "Richmond Matte Blue", material: lacquer("#1d3f7a", false), swatch: "#1d3f7a" },
  { id: "xl_greenwich_green", label: "Greenwich Matte Green", material: lacquer("#274b3e", false), swatch: "#274b3e" },
  { id: "xl_alexandra_rose_gold", label: "Alexandra Rose Gold", material: metal("#d9a58e", false), swatch: "#d9a58e" },
  { id: "xl_monochrome_gold", label: "Monochrome Gold", material: metal("#c9a24d", false), swatch: "#c9a24d" },
  // Vector XL
  { id: "vxl_black", label: "Black Metallic", material: lacquer("#2a2b2f", false), swatch: "#2a2b2f" },
  { id: "vxl_blue", label: "Blue Metallic", material: lacquer("#2a5aa8", false), swatch: "#2a5aa8" },
  { id: "vxl_teal", label: "Teal Metallic", material: lacquer("#1f7f86", false), swatch: "#1f7f86" },
  { id: "vxl_lilac", label: "Lilac Metallic", material: lacquer("#9b7fc4", false), swatch: "#9b7fc4" },
  { id: "vxl_green", label: "Green Metallic", material: lacquer("#3f8f5a", false), swatch: "#3f8f5a" },
  { id: "vxl_silver_blue", label: "Silver Blue", material: metal("#a9b7c7"), swatch: "#a9b7c7" },
];

export const TRIMS: Trim[] = [
  { id: "chrome", label: "Chrome", spec: { color: "#d8dadd", roughness: 0.15, metalness: 1 }, swatch: "#d8dadd" },
  { id: "palladium", label: "Palladium", spec: { color: "#cfd1d4", roughness: 0.22, metalness: 1 }, swatch: "#cfd1d4" },
  { id: "gold", label: "Gold", spec: { color: "#d4b25a", roughness: 0.2, metalness: 1 }, swatch: "#d4b25a" },
  { id: "rose_gold", label: "Rose Gold", spec: { color: "#d9a58e", roughness: 0.2, metalness: 1 }, swatch: "#d9a58e" },
  { id: "black", label: "Black PVD", spec: { color: "#232427", roughness: 0.35, metalness: 0.9 }, swatch: "#232427" },
  { id: "marine_blue", label: "Marine Blue rings", spec: { color: "#1e7fd8", roughness: 0.3, metalness: 0.6 }, swatch: "#1e7fd8" },
  { id: "flame_orange", label: "Flame Orange rings", spec: { color: "#f0641e", roughness: 0.3, metalness: 0.6 }, swatch: "#f0641e" },
  { id: "amethyst_purple", label: "Amethyst Purple rings", spec: { color: "#7b3fb8", roughness: 0.3, metalness: 0.6 }, swatch: "#7b3fb8" },
];

export const NIBS: Nib[] = [
  { id: "ef", label: "Extra Fine" },
  { id: "f", label: "Fine" },
  { id: "m", label: "Medium" },
  { id: "b", label: "Broad" },
];

export const INKS: Ink[] = [
  { id: "black", label: "Black ink", swatch: "#111", modes: ["fountain", "rollerball", "ballpoint", "gel"] },
  { id: "blue", label: "Blue ink", swatch: "#1d4ed8", modes: ["fountain", "rollerball", "ballpoint", "gel"] },
  { id: "hb", label: "HB 0.5 mm lead", swatch: "#555", modes: ["pencil"] },
];

export const PACKAGING: Packaging[] = [
  { id: "gift_box", label: "Parker gift box", unitMinor: 0 },
  { id: "premium_box", label: "Premium chevron gift box with sleeve", unitMinor: 1500 },
  { id: "bulk", label: "Bulk sleeve (team orders)", unitMinor: -400 },
];

export const FONTS = [
  { id: "sans", label: "Engraver's Sans", css: "'Helvetica Neue', Arial, sans-serif" },
  { id: "serif", label: "Engraver's Roman", css: "Georgia, 'Times New Roman', serif" },
  { id: "script", label: "Signature Script", css: "'Snell Roundhand', 'Brush Script MT', cursive" },
];

/** Production-approved glyph policy: Latin letters, digits, common punctuation and accented Latin-1. */
export const ALLOWED_TEXT = /^[A-Za-z0-9 .,'&\-@#!?()À-ÿ]*$/;

export const surfaceById = (id: string) => SURFACES.find((s) => s.id === id);
export const trimById = (id: string) => TRIMS.find((t) => t.id === id);
