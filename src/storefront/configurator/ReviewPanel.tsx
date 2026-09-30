"use client";

import { useState } from "react";
import { newId, type ResolveResponse, type Selection } from "@/shared/contracts";
import { ApiError, addToCart, cartAdapter, createConfiguration, createDesignToken, submitQuote } from "@/storefront/commerce";
import PriceBreakdown from "./PriceBreakdown";

interface Props {
  selection: Selection;
  resolution: ResolveResponse;
  unresolved: boolean;
  resolving: boolean;
  onQuantity: (q: number) => void;
  onAcceptQuantity: (q: number) => void;
  onIntent: (i: Selection["intent"]) => void;
  onConfirmed: (kind: "cart" | "quote", text: string) => void;
}

type Outcome = { kind: "ok" | "err"; text: string; detail?: string } | null;

export default function ReviewPanel({ selection, resolution, unresolved, resolving, onQuantity, onAcceptQuantity, onIntent, onConfirmed }: Props) {
  const r = resolution.resolution;
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [mutationId] = useState(() => newId("mut"));
  const [contact, setContact] = useState({ name: "", email: "", company: "" });
  const [share, setShare] = useState<string | null>(null);
  const qtyProposal = r.proposedChanges.find((p) => p.changes[0]?.facet === "quantity");
  const canAct = r.commerce.eligible && !unresolved && !resolving && r.manufacturing === "compatible";

  const doCart = async () => {
    setBusy(true);
    setOutcome(null);
    try {
      const { cart } = await addToCart(selection, resolution, cartAdapter(), mutationId);
      const count = cart.lines.reduce((n, l) => n + l.quantity, 0);
      setOutcome({ kind: "ok", text: `Added to cart. Your cart now has ${count} item${count === 1 ? "" : "s"}.` });
      onConfirmed("cart", "Added to cart.");
    } catch (e) {
      const err = e as ApiError;
      setOutcome({ kind: "err", text: err.message ?? "Could not add to cart.", detail: err.code === "PRICE_EXPIRED" || err.code === "CATALOG_VERSION_CHANGED" ? "Re-price the design and try again." : undefined });
    } finally {
      setBusy(false);
    }
  };

  const doQuote = async () => {
    setBusy(true);
    setOutcome(null);
    try {
      const rev = await createConfiguration(selection, resolution);
      const receipt = await submitQuote(rev, mutationId, { name: contact.name, email: contact.email, company: contact.company || undefined });
      setOutcome({ kind: "ok", text: `Quote request ${receipt.requestId} received. ${receipt.nextAction}`, detail: "This is not a paid order and does not guarantee a delivery date." });
      onConfirmed("quote", "Quote request submitted.");
    } catch (e) {
      const err = e as ApiError;
      setOutcome({ kind: "err", text: err.message ?? "Could not submit the quote.", detail: err.fields?.map((f) => `${f.path}: ${f.message}`).join("; ") });
    } finally {
      setBusy(false);
    }
  };

  const doShare = async (includePersonal: boolean) => {
    try {
      const { url } = await createDesignToken(selection, includePersonal);
      const full = `${location.origin}${url}`;
      setShare(full);
      await navigator.clipboard?.writeText(full).catch(() => undefined);
    } catch {
      setShare(null);
    }
  };

  const chip = (label: string, ok: boolean | null, text: string) => (
    <span className={`chip ${ok === null ? "" : ok ? "chip--ok" : "chip--warn"}`}>
      {label}: {text}
    </span>
  );

  return (
    <div>
      <h2>Review</h2>
      <p className="lede">{r.offeringLabel}</p>

      <div className="field">
        <label htmlFor="qty">Quantity</label>
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => onQuantity(Math.max(1, selection.quantity - 1))}>
            −
          </button>
          <input id="qty" type="number" min={1} value={selection.quantity} onChange={(e) => onQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))} aria-invalid={!!r.reasons.find((x) => x.field === "quantity")} />
          <button type="button" aria-label="Increase quantity" onClick={() => onQuantity(selection.quantity + 1)}>
            +
          </button>
          <div className="segmented" role="group" aria-label="Purchase intent">
            <button type="button" aria-pressed={selection.intent === "personal"} onClick={() => onIntent("personal")}>
              Personal
            </button>
            <button type="button" aria-pressed={selection.intent === "team"} onClick={() => onIntent("team")}>
              Team
            </button>
          </div>
        </div>
        {r.reasons.find((x) => x.field === "quantity") && <span className="error">{r.reasons.find((x) => x.field === "quantity")?.message}</span>}
        {selection.quantity >= 25 && selection.intent === "personal" && <span className="hint">Ordering for a team? Team mode shows artwork and bulk packaging. Your design is kept either way.</span>}
      </div>
      {qtyProposal && (
        <div className="notice notice--proposal">
          Quantity rule: {r.reasons.find((x) => x.field === "quantity")?.message} Nothing is rounded automatically.
          <div className="notice__actions">
            <button type="button" className="btn btn--sm btn--primary" style={{ width: "auto" }} onClick={() => onAcceptQuantity(Number(qtyProposal.changes[0].to))}>
              {qtyProposal.title}
            </button>
          </div>
        </div>
      )}

      <div className="status" aria-label="Readiness">
        {chip("Manufacturing", r.manufacturing === "compatible", r.manufacturing)}
        {chip("Price", r.pricing.status === "exact", r.pricing.status.replace("_", " "))}
        {chip("Artwork", r.artwork === "not_required" || r.artwork === "preflight_passed", r.artwork.replace("_", " "))}
        {chip("Availability", r.availability === "confirmed", r.availability)}
        {chip("Checkout", r.commerce.eligible, r.commerce.eligible ? (r.commerce.route === "quote" ? "quote ready" : "eligible") : "not yet")}
      </div>

      <dl className="spec">
        <dt>Specification</dt>
        <dd>{r.offeringLabel}</dd>
        <dt>Refill</dt>
        <dd>{r.facts.refill}</dd>
        <dt>Packaging</dt>
        <dd>{r.facts.packaging}</dd>
        <dt>Personalisation</dt>
        <dd>
          {selection.identity.type === "none" && "None"}
          {selection.identity.type === "text" && `Engraved “${selection.identity.text}” on the ${selection.identity.zoneId}, ${selection.identity.heightMm} mm`}
          {selection.identity.type === "logo" && `Logo ${selection.identity.fileName || "(no file yet)"}, ${selection.identity.widthMm} mm wide, one-colour pad print`}
        </dd>
        <dt>Timing</dt>
        <dd>
          {r.timing.dispatchNote}
          {r.timing.proofBusinessDays ? ` Proof within ${r.timing.proofBusinessDays} business days.` : ""}
        </dd>
      </dl>

      <PriceBreakdown pricing={r.pricing} quantity={selection.quantity} unresolved={unresolved} />

      {r.commerce.reasons.length > 0 && (
        <div className="notice">
          Before you can {r.commerce.route === "quote" ? "request a quote" : "add to cart"}:
          <ul>
            {r.commerce.reasons.map((x) => (
              <li key={x.code + x.field}>{x.message}</li>
            ))}
          </ul>
        </div>
      )}

      {r.commerce.route === "quote" && (
        <div>
          <div className="field">
            <label htmlFor="q-name">Your name</label>
            <input id="q-name" type="text" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="q-email">Email</label>
            <input id="q-email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="q-company">Company (optional)</label>
            <input id="q-company" type="text" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} autoComplete="organization" />
          </div>
        </div>
      )}

      {outcome && (
        <div className={`notice ${outcome.kind === "ok" ? "notice--ok" : "notice--err"}`} role="status">
          {outcome.text}
          {outcome.detail && <div className="tiny">{outcome.detail}</div>}
        </div>
      )}

      {r.commerce.route === "quote" ? (
        <button type="button" className="btn btn--primary" disabled={!canAct || busy || !contact.email || !contact.name} onClick={doQuote}>
          {busy ? "Submitting…" : "Request a quote"}
        </button>
      ) : (
        <button type="button" className="btn btn--primary" disabled={!canAct || busy} onClick={doCart}>
          {busy ? "Adding…" : resolving ? "Checking price…" : unresolved ? "Price unconfirmed" : "Add to cart"}
        </button>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" className="btn btn--sm" onClick={() => doShare(false)}>
          Copy share link
        </button>
        {selection.identity.type !== "none" && (
          <button type="button" className="btn btn--sm" onClick={() => doShare(true)}>
            Share including personalisation
          </button>
        )}
      </div>
      {share && (
        <p className="tiny" style={{ wordBreak: "break-all" }}>
          Link copied: {share}
          <br />
          Personal text and artwork are excluded unless you chose to include them. Reopening revalidates the design before purchase.
        </p>
      )}
    </div>
  );
}
