"use client";

import { useEffect, useRef, useState } from "react";
import type { BootstrapResponse, DecorationZone, Identity, Reason } from "@/shared/contracts";

interface Props {
  identity: Identity;
  zones: DecorationZone[];
  fonts: BootstrapResponse["fonts"];
  reasons: Reason[];
  padPrintable: boolean;
  logoUploads: boolean;
  onChange: (identity: Identity, label?: string) => void;
}

const MAX_LOGO_BYTES = 20 * 1024 * 1024;
const LOGO_TYPES = ["image/svg+xml", "application/pdf", "image/png", "image/jpeg"];

/**
 * Identity chapter: none, text (local laser engraving, priced) or logo (pad print, quote-led).
 * Text is preserved exactly; limits are enforced server-side and mirrored here as guidance.
 */
export default function IdentityPanel({ identity, zones, fonts, reasons, padPrintable, logoUploads, onChange }: Props) {
  const engraveZones = zones.filter((z) => z.processes.includes("engrave"));
  const printZones = zones.filter((z) => z.processes.includes("pad_print"));
  const [text, setText] = useState(identity.type === "text" ? identity.text : "");
  const debounce = useRef<number | null>(null);
  const errFor = (field: string) => reasons.find((r) => r.field === field)?.message;

  useEffect(() => {
    if (identity.type === "text") setText(identity.text);
  }, [identity]);

  const choose = (type: Identity["type"]) => {
    if (type === identity.type) return;
    if (type === "none") onChange({ type: "none" }, "Personalisation removed");
    if (type === "text") onChange({ type: "text", text: "", fontId: fonts[0].id, zoneId: engraveZones[0]?.id ?? zones[0].id, heightMm: 3 }, "Engraving added");
    if (type === "logo") onChange({ type: "logo", zoneId: printZones[0]?.id ?? zones[0].id, fileName: "", fileType: "", fileBytes: 0, widthMm: 20, acknowledgedPreview: false }, "Logo added");
  };

  const commitText = (t: string) => {
    if (identity.type !== "text") return;
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => onChange({ ...identity, text: t }, "Engraving text updated"), 350);
  };

  return (
    <div>
      <h2>Identity</h2>
      <p className="lede">Make it yours, or leave it clean. Personalisation is optional and never required to buy.</p>
      <div className="segmented" role="radiogroup" aria-label="Personalisation type">
        {(["none", "text", "logo"] as const).map((t) => (
          <button key={t} type="button" role="radio" aria-checked={identity.type === t} aria-pressed={identity.type === t} onClick={() => choose(t)} disabled={t === "logo" && !logoUploads}>
            {t === "none" ? "None" : t === "text" ? "Engraved text" : "Logo"}
          </button>
        ))}
      </div>

      {identity.type === "text" && (
        <div style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor="engrave-text">Text</label>
            <input
              id="engrave-text"
              type="text"
              value={text}
              maxLength={60}
              autoComplete="off"
              aria-invalid={!!errFor("identity.text")}
              aria-describedby="engrave-text-hint"
              onChange={(e) => {
                setText(e.target.value);
                commitText(e.target.value);
              }}
            />
            {errFor("identity.text") ? (
              <span className="error">{errFor("identity.text")}</span>
            ) : (
              <span className="hint" id="engrave-text-hint">
                Up to {zones.find((z) => z.id === identity.zoneId)?.maxChars ?? 20} characters. Latin letters, digits and basic punctuation. Entered exactly as typed.
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="engrave-font">Font</label>
            <select id="engrave-font" value={identity.fontId} onChange={(e) => onChange({ ...identity, fontId: e.target.value }, "Font changed")}>
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {engraveZones.length > 1 && (
            <div className="field">
              <label htmlFor="engrave-zone">Position</label>
              <select id="engrave-zone" value={identity.zoneId} onChange={(e) => onChange({ ...identity, zoneId: e.target.value }, "Engraving position changed")}>
                {engraveZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label} ({z.widthMm} × {z.heightMm} mm)
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="engrave-height">Text height (mm)</label>
            <input
              id="engrave-height"
              type="number"
              step="0.5"
              min={zones.find((z) => z.id === identity.zoneId)?.minTextHeightMm ?? 2}
              max={zones.find((z) => z.id === identity.zoneId)?.maxTextHeightMm ?? 4}
              value={identity.heightMm}
              aria-invalid={!!errFor("identity.heightMm")}
              onChange={(e) => onChange({ ...identity, heightMm: Number(e.target.value) || 3 }, "Text height changed")}
            />
            {errFor("identity.heightMm") && <span className="error">{errFor("identity.heightMm")}</span>}
          </div>
          <p className="tiny">Screen previews cannot certify engraving contrast. The production outline is typeset server-side with a pinned font version.</p>
        </div>
      )}

      {identity.type === "logo" && (
        <div style={{ marginTop: 14 }}>
          {!padPrintable && <div className="notice notice--err">{errFor("identity.zoneId") ?? "This finish cannot be pad printed. Choose a printable finish or use engraving."}</div>}
          <div className="field">
            <label htmlFor="logo-file">Artwork file</label>
            <input
              id="logo-file"
              type="file"
              accept=".svg,.pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!LOGO_TYPES.includes(f.type)) return onChange({ ...identity, fileName: f.name, fileType: f.type, fileBytes: f.size }, "Unsupported artwork type");
                if (f.size > MAX_LOGO_BYTES) return onChange({ ...identity, fileName: f.name, fileType: f.type, fileBytes: f.size }, "Artwork too large");
                onChange({ ...identity, fileName: f.name, fileType: f.type, fileBytes: f.size }, "Artwork attached");
              }}
            />
            <span className="hint">
              SVG, single-page PDF, PNG or JPEG, up to 20 MB. {identity.fileName ? `Attached: ${identity.fileName} (${(identity.fileBytes / 1024).toFixed(0)} KB).` : ""}
            </span>
            {identity.fileName && !LOGO_TYPES.includes(identity.fileType) && <span className="error">That file type is not supported.</span>}
            {identity.fileBytes > MAX_LOGO_BYTES && <span className="error">The file is larger than 20 MB.</span>}
          </div>
          <div className="field">
            <label htmlFor="logo-width">Print width (mm)</label>
            <input
              id="logo-width"
              type="number"
              min={2}
              max={zones.find((z) => z.id === identity.zoneId)?.widthMm ?? 40}
              value={identity.widthMm}
              aria-invalid={!!errFor("identity.widthMm")}
              onChange={(e) => onChange({ ...identity, widthMm: Number(e.target.value) || 10 }, "Logo width changed")}
            />
            {errFor("identity.widthMm") && <span className="error">{errFor("identity.widthMm")}</span>}
            <span className="hint">Zone: {zones.find((z) => z.id === identity.zoneId)?.widthMm} × {zones.find((z) => z.id === identity.zoneId)?.heightMm} mm. Artwork is stored privately and checked at print size; the preview only shows the footprint.</span>
          </div>
          <label className="opt" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={identity.acknowledgedPreview} onChange={(e) => onChange({ ...identity, acknowledgedPreview: e.target.checked })} style={{ position: "static", opacity: 1, width: 18, height: 18 }} />
            <span className="opt__label">I understand the preview is not a proof; production waits for my approval of a dimensioned proof.</span>
          </label>
          <p className="tiny">Logo work is quote-led: operations checks files, stock and timing, then sends a versioned quote and proof. Pad printing needs 50 pens or more, in packs of 25.</p>
        </div>
      )}
    </div>
  );
}
