"use client";

import { formatMinor, type Pricing } from "@/shared/contracts";

export default function PriceBreakdown({ pricing, quantity, unresolved }: { pricing: Pricing; quantity: number; unresolved: boolean }) {
  const f = (m: number) => formatMinor(m, pricing.currency, pricing.minorUnitExponent);
  if (pricing.status === "unavailable") return <div className="notice notice--err">No price: this design is not available as configured.</div>;
  return (
    <div>
      <table className="table" aria-label="Price breakdown">
        <tbody>
          {pricing.lines.map((l) => (
            <tr key={l.label}>
              <td>
                {l.label}
                {l.note && <div className="note">{l.note}</div>}
              </td>
              <td className="num">{f(l.amountMinor)}</td>
            </tr>
          ))}
          <tr className="total">
            <td>
              Merchandise subtotal
              {quantity > 1 && <div className="note">{f(pricing.effectivePerPenMinor)} effective per pen{pricing.setupMinor ? ", setup allocated" : ""}</div>}
            </td>
            <td className="num">
              {f(pricing.merchandiseSubtotalMinor)}
              {pricing.status !== "exact" && <div className="note">{pricing.status === "quote_required" ? "indicative, confirmed on quote" : "estimate"}</div>}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="tiny">Tax and shipping calculated at checkout. {unresolved ? "Price shown is the last confirmed price; the current draft is unconfirmed." : ""}</p>
      {pricing.tiers.length > 1 && (
        <table className="table" aria-label="Quantity tiers">
          <thead>
            <tr>
              <th>Quantity</th>
              <th className="num">Per pen</th>
            </tr>
          </thead>
          <tbody>
            {pricing.tiers.map((t) => (
              <tr key={t.minQty} aria-current={pricing.tier?.minQty === t.minQty ? "true" : undefined}>
                <td>{t.label}</td>
                <td className="num">{f(t.unitMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
