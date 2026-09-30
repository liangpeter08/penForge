"use client";

import { useMemo } from "react";
import { penSvg } from "@/shared/pen2d";
import type { AssetManifest, Identity } from "@/shared/contracts";

/**
 * Verified 2D representation (spec §4): the same selections, identity and price as the 3D scene.
 * Personalised imagery is shown as a base-product view plus a dimensioned flat layout, explicitly separate.
 */
export default function Pen2D({ manifest, identity, fontCss }: { manifest: AssetManifest; identity: Identity; fontCss: string }) {
  const base = useMemo(() => penSvg(manifest, { identity: null, background: null }), [manifest]);
  const zone = identity.type === "none" ? null : manifest.zones.find((z) => z.id === identity.zoneId);
  return (
    <div className="stage stage--2d">
      <figure className="pen2d">
        <div className="pen2d__img" dangerouslySetInnerHTML={{ __html: base }} />
        <figcaption>Base product view</figcaption>
      </figure>
      {zone && identity.type !== "none" && (
        <figure className="pen2d pen2d--flat">
          <FlatLayout zone={zone} identity={identity} fontCss={fontCss} />
          <figcaption>Flat artwork layout on the {zone.label.toLowerCase()} zone (dimensions in mm). Shown separately; not a decorated-product render.</figcaption>
        </figure>
      )}
    </div>
  );
}

function FlatLayout({ zone, identity, fontCss }: { zone: AssetManifest["zones"][number]; identity: Identity; fontCss: string }) {
  const scale = 10;
  const W = zone.widthMm * scale + 80;
  const H = zone.heightMm * scale + 70;
  const ox = 40,
    oy = 30;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pen2d__img" role="img" aria-label={`Flat artwork layout, ${zone.widthMm} by ${zone.heightMm} millimetres`}>
      <rect x={ox} y={oy} width={zone.widthMm * scale} height={zone.heightMm * scale} fill="#fff" stroke="#b8321f" strokeDasharray="4 3" />
      {identity.type === "text" && (
        <text x={ox + (zone.widthMm * scale) / 2} y={oy + (zone.heightMm * scale) / 2} textAnchor="middle" dominantBaseline="middle" fontSize={identity.heightMm * scale} fontFamily={fontCss} fill="#222">
          {identity.text}
        </text>
      )}
      {identity.type === "logo" && (
        <rect x={ox + (zone.widthMm * scale - identity.widthMm * scale) / 2} y={oy + 4} width={identity.widthMm * scale} height={zone.heightMm * scale - 8} fill="#ddd" stroke="#666" />
      )}
      <line x1={ox} y1={oy + zone.heightMm * scale + 14} x2={ox + zone.widthMm * scale} y2={oy + zone.heightMm * scale + 14} stroke="#333" />
      <text x={ox + (zone.widthMm * scale) / 2} y={oy + zone.heightMm * scale + 30} textAnchor="middle" fontSize="12" fill="#333">
        {zone.widthMm} mm
      </text>
      <line x1={ox - 12} y1={oy} x2={ox - 12} y2={oy + zone.heightMm * scale} stroke="#333" />
      <text x={ox - 18} y={oy + (zone.heightMm * scale) / 2} textAnchor="end" fontSize="12" fill="#333" dominantBaseline="middle">
        {zone.heightMm} mm
      </text>
    </svg>
  );
}
