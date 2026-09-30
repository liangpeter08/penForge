import type { AssetManifest, Identity } from "./contracts";

/**
 * Verified 2D representation of the pen, shared by the poster endpoint, the 2D fallback mode and the
 * flat proof layout. It is drawn from the same manifest as the 3D scene so both views agree.
 */
export interface Pen2dOptions {
  width?: number;
  height?: number;
  identity?: Identity | null;
  fontCss?: string;
  showZones?: boolean;
  background?: string | null;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `#${[c(16), c(8), c(0)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function penSvg(manifest: AssetManifest, opts: Pen2dOptions = {}): string {
  const W = opts.width ?? 1200;
  const H = opts.height ?? 360;
  const s = manifest.silhouette;
  const m = manifest.material;
  const t = manifest.trim;
  const scale = (W * 0.82) / s.lengthMm;
  const x0 = (W - s.lengthMm * scale) / 2;
  const cy = H / 2;
  const rb = (s.barrelDiameterMm * scale) / 2;
  const rc = (s.capDiameterMm * scale) / 2;
  const L = s.lengthMm * scale;
  const capL = L * s.capFraction;
  const tipL = L * 0.08 * (0.5 + s.tipTaper);
  const bodyStart = x0 + tipL;
  const capStart = x0 + L - capL;

  const metal = m.kind === "brushed_metal" || m.kind === "polished_metal" || m.kind === "chiselled";
  const hi = metal ? "#ffffff" : mix(m.color, "#ffffff", m.kind === "lacquer_matte" ? 0.18 : 0.5);
  const lo = mix(m.color, "#000000", metal ? 0.55 : 0.45);
  const hiT = mix(t.color, "#ffffff", 0.55);
  const loT = mix(t.color, "#000000", 0.5);

  const engr = opts.identity && opts.identity.type !== "none" ? opts.identity : null;
  const zone = engr ? manifest.zones.find((z) => z.id === engr.zoneId) : null;

  const endCap = (x: number, r: number, dir: 1 | -1) => {
    const d = s.endStyle === "flat" ? r * 0.15 : s.endStyle === "domed" ? r * 0.6 : r;
    return dir === 1 ? `Q ${x + d} ${cy - r} ${x + d} ${cy} Q ${x + d} ${cy + r} ${x} ${cy + r}` : `Q ${x - d} ${cy + r} ${x - d} ${cy} Q ${x - d} ${cy - r} ${x} ${cy - r}`;
  };

  const parts: string[] = [];
  const bodyFill = m.kind === "chiselled" || m.kind === "pearl" ? "url(#chisel)" : "url(#body)";

  // Tip / nib
  parts.push(`<path d="M ${x0} ${cy} L ${bodyStart} ${cy - rb * 0.85} L ${bodyStart} ${cy + rb * 0.85} Z" fill="url(#trim)"/>`);
  if (s.hoodedNib) parts.push(`<path d="M ${x0 + tipL * 0.3} ${cy} L ${bodyStart} ${cy - rb * 0.55} L ${bodyStart} ${cy + rb * 0.55} Z" fill="${bodyFill}"/>`);

  // Grip section
  const gripL = L * 0.12;
  if (s.gripSeparate) {
    parts.push(`<rect x="${bodyStart}" y="${cy - rb * 0.92}" width="${gripL}" height="${rb * 1.84}" fill="${bodyFill}" />`);
    parts.push(`<rect x="${bodyStart + gripL - 3}" y="${cy - rb * 0.95}" width="3" height="${rb * 1.9}" fill="url(#trim)"/>`);
  }

  // Barrel
  const barrelStart = s.gripSeparate ? bodyStart + gripL : bodyStart;
  const barrelEnd = capStart;
  if (s.bodySplit !== null) {
    // Jotter: lacquered/steel barrel, always-steel cap.
    parts.push(`<rect x="${barrelStart}" y="${cy - rb}" width="${barrelEnd - barrelStart}" height="${rb * 2}" fill="${bodyFill}"/>`);
  } else {
    parts.push(`<rect x="${barrelStart}" y="${cy - rb}" width="${barrelEnd - barrelStart}" height="${rb * 2}" fill="${bodyFill}"/>`);
  }

  // Cap
  const capFill = s.bodySplit !== null ? "url(#steel)" : bodyFill;
  parts.push(`<path d="M ${capStart} ${cy - rc} L ${x0 + L - rc} ${cy - rc} ${endCap(x0 + L - rc, rc, 1)} L ${capStart} ${cy + rc} Z" fill="${capFill}"/>`);
  for (let i = 0; i < s.capRings; i++) {
    parts.push(`<rect x="${capStart + 2 + i * 6}" y="${cy - rc}" width="3" height="${rc * 2}" fill="url(#trim)"/>`);
  }
  if (s.bodySplit !== null) parts.push(`<rect x="${x0 + L - rc * 1.2}" y="${cy - rc * 0.5}" width="${rc * 0.9}" height="${rc}" rx="2" fill="url(#trim)"/>`);

  // Clip
  const clipL = capL * 0.7;
  const clipY = cy - rc - 3;
  if (s.clipStyle === "arrow") {
    parts.push(
      `<path d="M ${x0 + L - rc * 0.6} ${clipY + 2} L ${x0 + L - clipL} ${clipY - 1} L ${x0 + L - clipL - 8} ${clipY + 3} L ${x0 + L - clipL} ${clipY + 6} L ${x0 + L - rc * 0.6} ${clipY + 7} Z" fill="url(#trim)"/>`,
    );
  } else if (s.clipStyle === "modern") {
    parts.push(`<rect x="${x0 + L - clipL}" y="${clipY - 2}" width="${clipL - rc * 0.6}" height="8" rx="3" fill="url(#trim)"/>`);
  } else {
    parts.push(`<rect x="${x0 + L - clipL}" y="${clipY}" width="${clipL - rc * 0.6}" height="5" rx="2.5" fill="url(#trim)"/>`);
  }

  // Engraving preview: physically sized from the zone in mm.
  if (engr && zone && engr.type === "text") {
    const zx = x0 + zone.axialFraction * L;
    const fontPx = engr.heightMm * scale;
    const fill = metal ? "#2b2b2b" : mix(m.color, "#ffffff", 0.55);
    parts.push(`<text x="${zx}" y="${cy + fontPx * 0.35}" text-anchor="middle" font-size="${fontPx}" font-family="${opts.fontCss ?? "sans-serif"}" fill="${fill}" letter-spacing="0.06em">${escapeXml(engr.text)}</text>`);
  }
  if (engr && zone && engr.type === "logo") {
    const zx = x0 + zone.axialFraction * L;
    const w = engr.widthMm * scale;
    const h = Math.min(zone.heightMm * scale, w * 0.4);
    parts.push(`<rect x="${zx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-dasharray="4 3"/>`);
    parts.push(`<text x="${zx}" y="${cy + 3}" text-anchor="middle" font-size="${Math.min(10, h * 0.6)}" fill="#ffffff" fill-opacity="0.85" font-family="sans-serif">LOGO</text>`);
  }
  if (opts.showZones) {
    for (const z of manifest.zones) {
      const zx = x0 + z.axialFraction * L;
      parts.push(`<rect x="${zx - (z.widthMm * scale) / 2}" y="${cy - (z.heightMm * scale) / 2}" width="${z.widthMm * scale}" height="${z.heightMm * scale}" fill="none" stroke="#b8321f" stroke-width="1" stroke-dasharray="3 2"/>`);
    }
  }

  const bg = opts.background === undefined ? "#f4f3ef" : opts.background;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Pen preview">
<defs>
  <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lo}"/><stop offset="0.28" stop-color="${hi}"/><stop offset="0.5" stop-color="${m.color}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
  <linearGradient id="chisel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lo}"/><stop offset="0.25" stop-color="${m.color2 ?? hi}"/><stop offset="0.5" stop-color="${m.color}"/><stop offset="0.75" stop-color="${m.color2 ?? hi}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
  <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8085"/><stop offset="0.3" stop-color="#f2f3f5"/><stop offset="0.55" stop-color="#c9cbcf"/><stop offset="1" stop-color="#6f7278"/></linearGradient>
  <linearGradient id="trim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${loT}"/><stop offset="0.35" stop-color="${hiT}"/><stop offset="0.6" stop-color="${t.color}"/><stop offset="1" stop-color="${loT}"/></linearGradient>
  <filter id="shadow" x="-5%" y="-50%" width="110%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ""}
<ellipse cx="${W / 2}" cy="${cy + rc * 2.2}" rx="${L * 0.46}" ry="${rc * 0.7}" fill="#000" fill-opacity="0.16" filter="url(#shadow)"/>
<g>${parts.join("\n")}</g>
</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}
