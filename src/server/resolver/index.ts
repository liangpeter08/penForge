import {
  CATALOG_VERSION,
  FAMILIES,
  INKS,
  NIBS,
  OFFERINGS,
  PACKAGING,
  PAD_PRINT_RULE,
  ENGRAVE_RULE,
  SURFACES,
  TRIMS,
  familyById,
  manifestFor,
  surfaceById,
  trimById,
} from "@/server/catalog";
import { ALLOWED_TEXT } from "@/server/catalog/attributes";
import type { Offering } from "@/server/catalog/types";
import { price } from "@/server/pricing";
import {
  REASON,
  SCHEMA_VERSION,
  type Edit,
  type Facet,
  type FacetOption,
  type Proposal,
  type ProposedChange,
  type Reason,
  type ResolveRequest,
  type ResolveResponse,
  type Resolution,
  type Selection,
  type WritingMode,
} from "@/shared/contracts";

const MODE_LABEL: Record<WritingMode, string> = {
  fountain: "Fountain pen",
  rollerball: "Rollerball",
  ballpoint: "Ballpoint",
  gel: "Gel pen",
  pencil: "Mechanical pencil",
};

const RESOLUTION_TTL_MS = 30 * 60 * 1000;

function matchOffering(s: Selection): Offering | undefined {
  return OFFERINGS.find((o) => o.bodyFamilyId === s.bodyFamilyId && o.surfaceId === s.surfaceId && o.trimId === s.trimId && o.modeId === s.modeId);
}

/** Coerce dependent facets (nib, ink, packaging) so they are valid for the offering. Returns the fixes applied. */
function normalizeDependents(s: Selection, o: Offering): { selection: Selection; changes: ProposedChange[] } {
  const changes: ProposedChange[] = [];
  const next: Selection = { ...s };
  if (o.modeId === "fountain") {
    if (!next.nibId || !o.nibIds.includes(next.nibId)) {
      const to = o.nibIds.includes("m") ? "m" : o.nibIds[0];
      if (next.nibId !== to) changes.push({ facet: "nibId", from: next.nibId, to, label: `Nib becomes ${NIBS.find((n) => n.id === to)?.label}` });
      next.nibId = to;
    }
  } else if (next.nibId !== null) {
    next.nibId = null;
  }
  const ink = INKS.find((i) => i.id === next.inkId);
  if (!ink || !ink.modes.includes(o.modeId)) {
    const to = INKS.find((i) => i.modes.includes(o.modeId))!.id;
    if (next.inkId !== to) changes.push({ facet: "inkId", from: next.inkId, to, label: `Refill becomes ${INKS.find((i) => i.id === to)?.label}` });
    next.inkId = to;
  }
  if (!PACKAGING.some((p) => p.id === next.packagingId)) next.packagingId = "gift_box";
  return { selection: next, changes };
}

function applyEdit(s: Selection, edit: Edit): Selection {
  if (!edit) return s;
  const next: Selection = { ...s };
  switch (edit.facet) {
    case "quantity":
      next.quantity = Math.max(1, Math.floor(Number(edit.value)));
      break;
    case "modeId":
      next.modeId = String(edit.value) as WritingMode;
      break;
    case "nibId":
      next.nibId = String(edit.value);
      break;
    case "inkId":
      next.inkId = String(edit.value);
      break;
    default:
      next[edit.facet] = String(edit.value);
  }
  return next;
}

function differing(a: Selection, o: Offering): (keyof Selection)[] {
  const d: (keyof Selection)[] = [];
  if (a.bodyFamilyId !== o.bodyFamilyId) d.push("bodyFamilyId");
  if (a.surfaceId !== o.surfaceId) d.push("surfaceId");
  if (a.trimId !== o.trimId) d.push("trimId");
  if (a.modeId !== o.modeId) d.push("modeId");
  return d;
}

function labelFor(facet: keyof Selection, value: string | number | null): string {
  if (value === null) return "none";
  switch (facet) {
    case "bodyFamilyId":
      return familyById(String(value))?.label ?? String(value);
    case "surfaceId":
      return surfaceById(String(value))?.label ?? String(value);
    case "trimId":
      return trimById(String(value))?.label ?? String(value);
    case "modeId":
      return MODE_LABEL[value as WritingMode] ?? String(value);
    case "nibId":
      return NIBS.find((n) => n.id === value)?.label ?? String(value);
    default:
      return String(value);
  }
}

const FACET_NAME: Partial<Record<keyof Selection, string>> = {
  bodyFamilyId: "Body",
  surfaceId: "Finish",
  trimId: "Trim",
  modeId: "Writing mode",
  nibId: "Nib",
  inkId: "Refill",
  quantity: "Quantity",
};

/**
 * Build minimal-change proposals that keep the requested edit and change as little else as possible.
 * The edited facet is held fixed; the family is held fixed unless the edit was the family itself.
 */
function proposalsFor(committed: Selection, requested: Selection, edit: Edit): Proposal[] {
  const editedFacet = edit?.facet;
  const candidates = OFFERINGS.filter((o) => {
    if (editedFacet === "bodyFamilyId") return o.bodyFamilyId === requested.bodyFamilyId;
    if (o.bodyFamilyId !== requested.bodyFamilyId) return false;
    if (editedFacet === "surfaceId") return o.surfaceId === requested.surfaceId;
    if (editedFacet === "trimId") return o.trimId === requested.trimId;
    if (editedFacet === "modeId") return o.modeId === requested.modeId;
    return true;
  });
  const scored = candidates
    .map((o) => {
      const diff = differing(requested, o);
      // Prefer keeping the mode over the trim over the surface; prefer nearby price.
      const weight = diff.reduce((w, f) => w + (f === "modeId" ? 3 : f === "trimId" ? 1 : f === "surfaceId" ? 2 : 4), 0);
      return { o, diff, weight };
    })
    .sort((a, b) => a.weight - b.weight || a.o.baseUnitMinor - b.o.baseUnitMinor);

  const seen = new Set<string>();
  const proposals: Proposal[] = [];
  for (const { o } of scored) {
    if (proposals.length >= 3) break;
    const key = `${o.surfaceId}|${o.trimId}|${o.modeId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const target: Selection = { ...requested, bodyFamilyId: o.bodyFamilyId, surfaceId: o.surfaceId, trimId: o.trimId, modeId: o.modeId };
    const { selection: normalized, changes: depChanges } = normalizeDependents(target, o);
    const changes: ProposedChange[] = [];
    for (const f of ["bodyFamilyId", "surfaceId", "trimId", "modeId"] as const) {
      if (committed[f] !== normalized[f]) changes.push({ facet: f, from: committed[f], to: normalized[f], label: `${FACET_NAME[f]}: ${labelFor(f, committed[f])} → ${labelFor(f, normalized[f])}` });
    }
    changes.push(...depChanges);
    const consequences: string[] = [];
    const identityCheck = validateIdentity(normalized, o);
    if (normalized.identity.type !== "none" && identityCheck.some((r) => r.code === REASON.ZONE_UNAVAILABLE || r.code === REASON.TEXT_TOO_LONG)) {
      consequences.push(
        normalized.identity.type === "text"
          ? "Your engraving would need to be shortened or moved to another zone."
          : "Your logo zone changes on this body and must be re-checked.",
      );
    }
    if (o.bodyFamilyId !== committed.bodyFamilyId) consequences.push("Changing the body changes the grip: the grip is part of the body on every Parker pen.");
    proposals.push({
      id: `prop_${o.id}`,
      title: changes.map((c) => c.label).join("; "),
      changes,
      consequences,
      resultingOfferingId: o.id,
    });
  }
  return proposals;
}

function validateIdentity(s: Selection, o: Offering): Reason[] {
  const reasons: Reason[] = [];
  const family = familyById(o.bodyFamilyId)!;
  if (s.identity.type === "none") return reasons;
  const zoneId = s.identity.zoneId;
  const zone = family.zones.find((z) => z.id === zoneId);
  if (!zone) {
    reasons.push({ code: REASON.ZONE_UNAVAILABLE, field: "identity.zoneId", message: `${family.label} has no "${zoneId}" decoration zone.` });
    return reasons;
  }
  if (s.identity.type === "text") {
    if (!zone.processes.includes("engrave")) reasons.push({ code: REASON.ZONE_UNAVAILABLE, field: "identity.zoneId", message: `${zone.label} cannot be engraved.` });
    if (!ALLOWED_TEXT.test(s.identity.text)) reasons.push({ code: REASON.TEXT_UNSUPPORTED_GLYPH, field: "identity.text", message: "Only Latin letters, digits and basic punctuation can be engraved." });
    if (s.identity.text.length > zone.maxChars) reasons.push({ code: REASON.TEXT_TOO_LONG, field: "identity.text", message: `Up to ${zone.maxChars} characters fit on the ${zone.label.toLowerCase()}.` });
    if (s.identity.heightMm < zone.minTextHeightMm || s.identity.heightMm > zone.maxTextHeightMm)
      reasons.push({ code: REASON.TEXT_TOO_LONG, field: "identity.heightMm", message: `Text height must be ${zone.minTextHeightMm}–${zone.maxTextHeightMm} mm on the ${zone.label.toLowerCase()}.` });
    // Measured physical bounds: approximate advance width of 0.62 em per glyph.
    const widthMm = s.identity.text.length * s.identity.heightMm * 0.62;
    if (widthMm > zone.widthMm) reasons.push({ code: REASON.TEXT_TOO_LONG, field: "identity.text", message: `At ${s.identity.heightMm} mm this text is ${widthMm.toFixed(1)} mm wide; the ${zone.label.toLowerCase()} allows ${zone.widthMm} mm.` });
  }
  if (s.identity.type === "logo") {
    if (!o.padPrintable || !zone.processes.includes("pad_print")) reasons.push({ code: REASON.ZONE_UNAVAILABLE, field: "identity.zoneId", message: "This finish does not support pad printing. Choose engraving or a printable finish." });
    if (s.identity.widthMm > zone.widthMm) reasons.push({ code: REASON.ZONE_UNAVAILABLE, field: "identity.widthMm", message: `Logo width must be at most ${zone.widthMm} mm on the ${zone.label.toLowerCase()}.` });
    if (s.quantity < PAD_PRINT_RULE.moq) reasons.push({ code: REASON.MOQ_NOT_MET, field: "quantity", message: `Pad printing needs at least ${PAD_PRINT_RULE.moq} pens.` });
    else if ((s.quantity - PAD_PRINT_RULE.moq) % PAD_PRINT_RULE.packSize !== 0)
      reasons.push({ code: REASON.PACK_INCREMENT, field: "quantity", message: `Pad-printed pens ship in packs of ${PAD_PRINT_RULE.packSize}.` });
  }
  return reasons;
}

function quantityProposals(s: Selection): Proposal[] {
  if (s.identity.type !== "logo") return [];
  const { moq, packSize } = PAD_PRINT_RULE;
  if (s.quantity >= moq && (s.quantity - moq) % packSize === 0) return [];
  const up = s.quantity < moq ? moq : moq + Math.ceil((s.quantity - moq) / packSize) * packSize;
  return [
    {
      id: `prop_qty_${up}`,
      title: `Change quantity to ${up}`,
      changes: [{ facet: "quantity", from: s.quantity, to: up, label: `Quantity: ${s.quantity} → ${up}` }],
      consequences: [],
      resultingOfferingId: "",
    },
  ];
}

function facetsFor(s: Selection, o: Offering): Facet[] {
  const familyOfferings = OFFERINGS.filter((x) => x.bodyFamilyId === s.bodyFamilyId);
  const exists = (p: Partial<Pick<Offering, "surfaceId" | "trimId" | "modeId">>) =>
    familyOfferings.some((x) => (p.surfaceId ?? s.surfaceId) === x.surfaceId && (p.trimId ?? s.trimId) === x.trimId && (p.modeId ?? s.modeId) === x.modeId);

  const familyFacet: Facet = {
    id: "bodyFamilyId",
    label: "Body",
    chapter: "form",
    editable: true,
    options: FAMILIES.map((f) => ({ id: f.id, label: f.label, available: true, description: f.tagline })),
  };

  const surfaceIds = [...new Set(familyOfferings.map((x) => x.surfaceId))];
  const surfaceFacet: Facet = {
    id: "surfaceId",
    label: "Finish",
    chapter: "surface",
    editable: true,
    options: surfaceIds.map((id) => {
      const sf = surfaceById(id)!;
      const available = exists({ surfaceId: id });
      let reason: string | undefined;
      if (!available) {
        const withOtherTrim = familyOfferings.find((x) => x.surfaceId === id && x.modeId === s.modeId);
        const withOtherMode = familyOfferings.find((x) => x.surfaceId === id && x.trimId === s.trimId);
        reason = withOtherTrim ? `Requires ${trimById(withOtherTrim.trimId)?.label} trim` : withOtherMode ? `Not available as ${MODE_LABEL[s.modeId].toLowerCase()}` : "Not available with these choices";
      }
      return { id, label: sf.label, available, reason, swatch: sf.swatch, swatch2: sf.swatch2, finishKind: sf.material.kind };
    }),
  };

  const trimIds = [...new Set(familyOfferings.map((x) => x.trimId))];
  const trimFacet: Facet = {
    id: "trimId",
    label: "Trim",
    chapter: "details",
    editable: trimIds.length > 1,
    options: trimIds.map((id) => {
      const t = trimById(id)!;
      const available = exists({ trimId: id });
      const alt = !available ? familyOfferings.find((x) => x.trimId === id && x.modeId === s.modeId) : undefined;
      return { id, label: t.label, available, reason: available ? undefined : alt ? `Requires ${surfaceById(alt.surfaceId)?.label} finish` : "Not available with this finish", swatch: t.swatch };
    }),
  };

  const modeIds = [...new Set(familyOfferings.map((x) => x.modeId))];
  const modeFacet: Facet = {
    id: "modeId",
    label: "Writing mode",
    chapter: "form",
    editable: true,
    options: modeIds.map((id) => {
      const available = exists({ modeId: id });
      const alt = !available ? familyOfferings.find((x) => x.modeId === id && x.surfaceId === s.surfaceId) : undefined;
      return { id, label: MODE_LABEL[id], available, reason: available ? undefined : alt ? `Requires ${trimById(alt.trimId)?.label} trim` : "Not available in this finish" };
    }),
  };

  const nibFacet: Facet = {
    id: "nibId",
    label: "Nib",
    chapter: "details",
    editable: o.modeId === "fountain" && o.nibIds.length > 1,
    options: o.modeId === "fountain" ? NIBS.filter((n) => o.nibIds.includes(n.id)).map((n) => ({ id: n.id, label: n.label, available: true })) : [],
  };

  const inkFacet: Facet = {
    id: "inkId",
    label: "Refill",
    chapter: "details",
    editable: INKS.filter((i) => i.modes.includes(o.modeId)).length > 1,
    options: INKS.filter((i) => i.modes.includes(o.modeId)).map((i) => ({ id: i.id, label: i.label, available: true, swatch: i.swatch })),
  };

  const packagingFacet: Facet = {
    id: "packagingId",
    label: "Packaging",
    chapter: "details",
    editable: true,
    options: PACKAGING.map((p) => {
      const bulkOk = p.id !== "bulk" || s.quantity >= 25;
      return { id: p.id, label: p.label, available: bulkOk, reason: bulkOk ? undefined : "Available from 25 pens", description: p.unitMinor ? (p.unitMinor > 0 ? `+$${(p.unitMinor / 100).toFixed(2)} each` : `−$${(-p.unitMinor / 100).toFixed(2)} each`) : "Included" };
    }),
  };

  return [familyFacet, modeFacet, surfaceFacet, trimFacet, nibFacet, inkFacet, packagingFacet];
}

function resolutionFor(s: Selection, o: Offering, extra: { reasons?: Reason[]; proposals?: Proposal[]; committed?: Selection } = {}): Resolution {
  const family = familyById(o.bodyFamilyId)!;
  const surface = surfaceById(o.surfaceId)!;
  const trim = trimById(o.trimId)!;
  const identityReasons = validateIdentity(s, o);
  const reasons: Reason[] = [...(extra.reasons ?? []), ...identityReasons];
  const proposals: Proposal[] = [...(extra.proposals ?? []), ...quantityProposals(s)];
  const pricing = price(o, s);
  const ink = INKS.find((i) => i.id === s.inkId);
  const packaging = PACKAGING.find((p) => p.id === s.packagingId);

  const artwork: Resolution["artwork"] =
    s.identity.type === "none" ? "not_required" : identityReasons.length ? "rejected" : s.identity.type === "text" ? "preflight_passed" : "proof_pending";

  const route: Resolution["commerce"]["route"] = s.identity.type === "logo" ? "quote" : "variant_cart";
  const blocking = reasons.filter((r) => r.code !== REASON.QUOTE_REQUIRED);
  const eligible = blocking.length === 0 && (route === "quote" ? pricing.status === "quote_required" : pricing.status === "exact");

  const proofDays = s.identity.type === "logo" ? PAD_PRINT_RULE.proofBusinessDays : null;
  const productionDays =
    s.identity.type === "logo" ? PAD_PRINT_RULE.productionBusinessDays : o.productionBusinessDays + (s.identity.type === "text" ? ENGRAVE_RULE.productionBusinessDays : 0);

  return {
    offeringId: o.id,
    offeringLabel: `${family.label} ${surface.label}, ${trim.label} trim, ${MODE_LABEL[o.modeId].toLowerCase()}`,
    manufacturing: "compatible",
    artwork,
    availability: "confirmed",
    pricing,
    commerce: { route, eligible, reasons: blocking },
    quantityRules: s.identity.type === "logo" ? { moq: PAD_PRINT_RULE.moq, packSize: PAD_PRINT_RULE.packSize } : o.quantityRule,
    timing: {
      proofBusinessDays: proofDays,
      productionBusinessDays: productionDays,
      dispatchNote:
        s.identity.type === "logo"
          ? `Estimated dispatch ${productionDays} business days after proof approval and payment.`
          : `Estimated dispatch within ${productionDays} business days of payment. Transit calculated at checkout.`,
    },
    assetManifestVersion: manifestFor(o).version,
    assetManifest: manifestFor(o),
    facts: {
      ...family.facts,
      refill: `${MODE_LABEL[o.modeId]}${o.modeId === "fountain" && s.nibId ? `, ${NIBS.find((n) => n.id === s.nibId)?.label.toLowerCase()} nib` : ""}, ${ink?.label.toLowerCase() ?? ""}`,
      packaging: packaging?.label ?? "",
    },
    expiresAt: new Date(Date.now() + RESOLUTION_TTL_MS).toISOString(),
    reasons,
    proposedChanges: proposals,
    availableFacets: facetsFor(s, o),
    committedSelection: extra.committed ?? s,
  };
}

/**
 * Resolve a committed selection plus an optional requested edit.
 * - Edit applies cleanly → returns the edited selection resolved.
 * - Edit conflicts → returns the committed selection (still resolved and priced) with proposals.
 * - Committed selection itself invalid (retired offering, restored draft) → conflict with proposals and no price.
 */
export function resolve(req: ResolveRequest): ResolveResponse {
  const committed = req.selection;
  const requested = applyEdit(committed, req.edit ?? null);
  const requestedOffering = matchOffering(requested);

  let selection: Selection;
  let resolution: Resolution;

  if (requestedOffering) {
    const { selection: normalized, changes } = normalizeDependents(requested, requestedOffering);
    // Dependent-facet changes triggered by the edit are consequential and must be confirmed, except when the
    // edit itself was that facet or the edit merely made the facet applicable (e.g. switching to fountain adds a nib).
    // A mode change inherently swaps nib/refill (a pencil has no ink); that is not a substitution of a chosen value.
    const consequential = req.edit?.facet === "modeId" ? [] : changes.filter((c) => c.from !== null && c.facet !== req.edit?.facet);
    if (consequential.length && req.edit && req.edit.facet !== "quantity") {
      const committedOffering = matchOffering(committed);
      if (committedOffering) {
        const editChange: ProposedChange = { facet: req.edit.facet, from: committed[req.edit.facet] as string | number | null, to: requested[req.edit.facet] as string | number | null, label: `${FACET_NAME[req.edit.facet]}: ${labelFor(req.edit.facet, committed[req.edit.facet] as string)} → ${labelFor(req.edit.facet, requested[req.edit.facet] as string)}` };
        selection = committed;
        resolution = resolutionFor(committed, committedOffering, {
          proposals: [{ id: `prop_${requestedOffering.id}`, title: [editChange, ...consequential].map((c) => c.label).join("; "), changes: [editChange, ...consequential], consequences: [], resultingOfferingId: requestedOffering.id }],
        });
        return wrap(req, selection, resolution);
      }
    }
    selection = normalized;
    resolution = resolutionFor(normalized, requestedOffering);
    return wrap(req, selection, resolution);
  }

  const committedOffering = matchOffering(committed);
  const proposals = proposalsFor(committed, requested, req.edit ?? null);
  const conflictReason: Reason = {
    code: REASON.NO_APPROVED_OFFERING,
    field: req.edit?.facet,
    message: req.edit
      ? `${labelFor(req.edit.facet, String(req.edit.value))} is not made with your current ${req.edit.facet === "bodyFamilyId" ? "finish" : "choices"}.`
      : "This design is no longer available as configured.",
  };

  if (committedOffering && req.edit) {
    // Keep the committed pen and price; the client shows the proposal inline.
    resolution = resolutionFor(committed, committedOffering, { proposals, reasons: [conflictReason] });
    return wrap(req, committed, resolution);
  }

  // Nothing valid to fall back on: unresolved, unpriced, but with concrete proposals.
  const fallback = OFFERINGS.find((o) => o.bodyFamilyId === committed.bodyFamilyId) ?? OFFERINGS[0];
  const base = resolutionFor(committed, fallback, { proposals, reasons: [conflictReason], committed });
  resolution = {
    ...base,
    manufacturing: "conflict",
    availability: "unavailable",
    pricing: { ...base.pricing, status: "unavailable", merchandiseSubtotalMinor: 0, lines: [] },
    commerce: { route: "variant_cart", eligible: false, reasons: [conflictReason] },
  };
  return wrap(req, committed, resolution);
}

function wrap(req: ResolveRequest, selection: Selection, resolution: Resolution): ResolveResponse {
  return {
    schemaVersion: SCHEMA_VERSION,
    requestId: req.requestId,
    draftRevision: req.draftRevision,
    catalogVersion: CATALOG_VERSION,
    configurationRevisionId: null,
    selection,
    resolution,
  };
}

export function facetOptionLabel(o: FacetOption) {
  return o.label;
}

export { MODE_LABEL, SURFACES, TRIMS };
