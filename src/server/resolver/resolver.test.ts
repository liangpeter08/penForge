import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "./index";
import { CATALOG_VERSION, DEFAULT_SELECTION, OFFERINGS, validateCatalog } from "@/server/catalog";
import { createCartIntent, createConfiguration } from "@/server/orders";
import { SCHEMA_VERSION, type Selection } from "@/shared/contracts";

const req = (selection: Selection, edit?: { facet: "bodyFamilyId" | "surfaceId" | "trimId" | "modeId" | "nibId" | "inkId" | "packagingId" | "quantity"; value: string | number }) =>
  resolve({ schemaVersion: SCHEMA_VERSION, requestId: "req_test", draftRevision: 1, selection, edit });

test("catalog publishes cleanly", () => {
  assert.deepEqual(validateCatalog(), []);
  assert.ok(OFFERINGS.length > 200);
});

test("default selection resolves to an exact-priced, cart-eligible offering", () => {
  const r = req(DEFAULT_SELECTION).resolution;
  assert.equal(r.manufacturing, "compatible");
  assert.equal(r.pricing.status, "exact");
  assert.equal(r.commerce.eligible, true);
});

test("every selectable option resolves to an approved offering (acceptance scenario, gate 2)", () => {
  for (const o of OFFERINGS) {
    const s: Selection = { ...DEFAULT_SELECTION, bodyFamilyId: o.bodyFamilyId, surfaceId: o.surfaceId, trimId: o.trimId, modeId: o.modeId, nibId: null, inkId: null };
    const r = req(s).resolution;
    assert.equal(r.manufacturing, "compatible", o.id);
    assert.ok(r.pricing.merchandiseSubtotalMinor > 0, o.id);
    for (const f of r.availableFacets) {
      for (const opt of f.options.filter((x) => x.available)) {
        if (f.id === "bodyFamilyId" || f.id === "packagingId" || f.id === "nibId" || f.id === "inkId") continue;
        const edited = req(r.committedSelection, { facet: f.id, value: opt.id });
        assert.equal(edited.resolution.proposedChanges.length, 0, `${o.id} -> ${f.id}=${opt.id}`);
      }
    }
  }
});

test("finish that requires a different trim proposes the trim change instead of applying it silently", () => {
  // Sonnet Metal & Pearl only exists with palladium; start from gold trim.
  const s: Selection = { ...DEFAULT_SELECTION, surfaceId: "black_lacquer", trimId: "gold" };
  const r = req(s, { facet: "surfaceId", value: "metal_pearl" });
  assert.equal(r.selection.surfaceId, "black_lacquer", "committed selection is retained");
  assert.ok(r.resolution.proposedChanges.length > 0);
  const p = r.resolution.proposedChanges[0];
  assert.ok(p.changes.some((c) => c.facet === "trimId" && c.to === "palladium"));
});

test("changing body proposes a valid finish for the new body and explains the fixed grip", () => {
  const r = req(DEFAULT_SELECTION, { facet: "bodyFamilyId", value: "jotter" });
  assert.ok(r.resolution.proposedChanges.length > 0);
  const p = r.resolution.proposedChanges[0];
  assert.equal(p.changes.find((c) => c.facet === "bodyFamilyId")?.to, "jotter");
  assert.ok(p.consequences.some((c) => /grip/i.test(c)));
});

test("logo below MOQ is not eligible and proposes the supported quantity", () => {
  const s: Selection = { ...DEFAULT_SELECTION, quantity: 60, intent: "team", identity: { type: "logo", zoneId: "barrel", fileName: "a.svg", fileType: "image/svg+xml", fileBytes: 100, widthMm: 20, acknowledgedPreview: true } };
  const r = req(s).resolution;
  assert.equal(r.commerce.eligible, false);
  assert.equal(r.proposedChanges[0].changes[0].to, 75);
});

test("engraving text longer than the zone is rejected with a field path", () => {
  const s: Selection = { ...DEFAULT_SELECTION, identity: { type: "text", text: "This engraving is far too long for a Sonnet barrel", fontId: "sans", zoneId: "barrel", heightMm: 3 } };
  const r = req(s).resolution;
  assert.equal(r.artwork, "rejected");
  assert.ok(r.reasons.some((x) => x.field === "identity.text"));
});

test("cart intent is idempotent and rejects tampered revisions", () => {
  const rev = createConfiguration(DEFAULT_SELECTION, { catalogVersion: CATALOG_VERSION, merchandiseSubtotalMinor: req(DEFAULT_SELECTION).resolution.pricing.merchandiseSubtotalMinor });
  const a = createCartIntent(rev, "mut_12345678");
  const b = createCartIntent(rev, "mut_12345678");
  assert.equal(a.intentId, b.intentId);
  const tampered = { ...rev, merchandiseSubtotalMinor: 1 };
  assert.throws(() => createCartIntent(tampered, "mut_12345678"));
});

test("configuration rejects a stale displayed price", () => {
  assert.throws(() => createConfiguration(DEFAULT_SELECTION, { catalogVersion: CATALOG_VERSION, merchandiseSubtotalMinor: 1 }), /price changed/i);
});

test("conflict proposals are minimal: no proposal adds changes on top of another", () => {
  const s: Selection = { ...DEFAULT_SELECTION, trimId: "gold" };
  const props = req(s, { facet: "surfaceId", value: "metal_pearl" }).resolution.proposedChanges;
  assert.ok(props.length >= 1);
  const facets = props.map((p) => new Set(p.changes.map((c) => c.facet)));
  for (const a of facets) for (const b of facets) {
    if (a !== b && a.size < b.size) assert.ok(![...a].every((f) => b.has(f)), "superset proposal offered");
  }
});

test("an unmet MOQ does not mark otherwise valid artwork as rejected", () => {
  const s: Selection = { ...DEFAULT_SELECTION, surfaceId: "black_lacquer", identity: { type: "logo", zoneId: "barrel", fileName: "logo.png", fileType: "image/png", fileBytes: 1000, widthMm: 20, acknowledgedPreview: true }, quantity: 1 };
  const r = req(s).resolution;
  assert.ok(r.reasons.some((x) => x.field === "quantity"));
  assert.equal(r.artwork, "proof_pending");
});
