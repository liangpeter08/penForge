"use client";

import { useRef, useState } from "react";
import type { Facet, FacetOption } from "@/shared/contracts";

interface Props {
  facet: Facet;
  value: string | null;
  onCommit: (id: string, label: string) => void;
  onPreview?: (id: string | null) => void;
  swatches?: boolean;
  /** Text shown when the facet is a fixed, inspectable fact rather than a choice. */
  fixedNote?: string;
}

/**
 * Single-choice facet as a radio group (spec §4). Usable options first; incompatible ones stay
 * discoverable behind a disclosure with a concise reason. Hover preview after a 150 ms dwell.
 */
export default function FacetGroup({ facet, value, onCommit, onPreview, swatches, fixedNote }: Props) {
  const [showAll, setShowAll] = useState(false);
  const dwell = useRef<number | null>(null);
  const usable = facet.options.filter((o) => o.available);
  const blocked = facet.options.filter((o) => !o.available);
  const selected = facet.options.find((o) => o.id === value);

  if (!facet.editable) {
    return (
      <fieldset className="facet">
        <legend>
          {facet.label} <span className="sel">fixed</span>
        </legend>
        <div className="facet__fixed">
          {selected?.label ?? fixedNote ?? "Included with this pen"}
          {fixedNote && selected ? ` — ${fixedNote}` : ""}
        </div>
      </fieldset>
    );
  }

  const enter = (o: FacetOption) => {
    if (!onPreview || !o.available || window.matchMedia("(hover: none)").matches) return;
    dwell.current = window.setTimeout(() => onPreview(o.id), 150);
  };
  const leave = () => {
    if (dwell.current) window.clearTimeout(dwell.current);
    dwell.current = null;
    onPreview?.(null);
  };

  const render = (o: FacetOption) => (
    <label
      key={o.id}
      className={`opt ${swatches ? "opt--swatch" : ""} ${o.available ? "" : "opt--unavailable"}`}
      onPointerEnter={() => enter(o)}
      onPointerLeave={leave}
      title={swatches ? `${o.label}${o.reason ? ` — ${o.reason}` : ""}` : undefined}
    >
      <input
        type="radio"
        name={facet.id}
        value={o.id}
        checked={o.id === value}
        onChange={() => onCommit(o.id, `${facet.label}: ${o.label}`)}
        onKeyDown={(e) => e.key === "Escape" && leave()}
        aria-describedby={o.reason ? `${facet.id}-${o.id}-reason` : undefined}
      />
      {o.swatch && (
        <span
          className={`swatch ${o.swatch2 ? "swatch--split" : ""} ${o.finishKind === "brushed_metal" ? "swatch--brushed" : ""}`}
          style={{ ["--sw" as string]: o.swatch, ["--sw2" as string]: o.swatch2 ?? o.swatch }}
          aria-hidden="true"
        />
      )}
      <span className={swatches ? "visually-hidden" : "opt__label"}>
        {o.label}
        {o.description && !swatches && <span className="opt__desc">{o.description}</span>}
        {o.reason && (
          <span className="opt__reason" id={`${facet.id}-${o.id}-reason`}>
            {o.reason}
          </span>
        )}
      </span>
    </label>
  );

  return (
    <fieldset className="facet">
      <legend>
        {facet.label} <span className="sel">{selected?.label}</span>
      </legend>
      <div className={`opts ${swatches ? "opts--swatches" : ""}`} role="radiogroup" aria-label={facet.label}>
        {usable.map(render)}
        {showAll && blocked.map(render)}
      </div>
      {blocked.length > 0 && (
        <button type="button" className="facet__more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? "Hide" : "Show"} {blocked.length} option{blocked.length > 1 ? "s" : ""} not available with your current choices
        </button>
      )}
    </fieldset>
  );
}
