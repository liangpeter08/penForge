import type { Pricing, PriceLine, Selection } from "@/shared/contracts";
import { ENGRAVE_RULE, PAD_PRINT_RULE, PACKAGING, PRICE_BOOK_VERSION, MERCHANT } from "@/server/catalog";
import type { Offering } from "@/server/catalog/types";

const EXPONENT = 2;

export function tierFor(offering: Offering, quantity: number) {
  return [...offering.tiers].reverse().find((t) => quantity >= t.minQty) ?? offering.tiers[0];
}

/**
 * All arithmetic in integer minor units. The browser never sends a price; it only displays this.
 */
export function price(offering: Offering, selection: Selection): Pricing {
  const qty = selection.quantity;
  const tier = tierFor(offering, qty);
  const base = offering.baseUnitMinor;
  const packaging = PACKAGING.find((p) => p.id === selection.packagingId)?.unitMinor ?? 0;

  let decorationUnit = 0;
  let setup = 0;
  let status: Pricing["status"] = "exact";
  const lines: PriceLine[] = [];

  lines.push({ label: `${qty} × pen`, amountMinor: base * qty, note: `${fmt(base)} each` });

  if (selection.identity.type === "text") {
    decorationUnit = ENGRAVE_RULE.unitMinor;
    lines.push({ label: `${qty} × laser engraving`, amountMinor: decorationUnit * qty, note: `${fmt(decorationUnit)} each` });
  } else if (selection.identity.type === "logo") {
    decorationUnit = PAD_PRINT_RULE.unitMinor;
    setup = PAD_PRINT_RULE.setupMinor;
    status = "quote_required";
    lines.push({ label: `${qty} × one-colour pad print`, amountMinor: decorationUnit * qty, note: `${fmt(decorationUnit)} each, indicative` });
    lines.push({ label: "Print setup (one-time)", amountMinor: setup, note: "Confirmed on quote" });
  }

  if (packaging !== 0) {
    lines.push({ label: `${qty} × packaging`, amountMinor: packaging * qty, note: `${fmt(packaging)} each` });
  }

  const discount = (base - tier.unitMinor) * qty;
  if (discount > 0) {
    lines.push({ label: `Quantity tier ${tier.label}`, amountMinor: -discount, note: `${fmt(tier.unitMinor)} per pen` });
  }

  const subtotal = qty * (base + decorationUnit + packaging) + setup - discount;

  return {
    status,
    currency: MERCHANT.currency,
    minorUnitExponent: EXPONENT,
    unitMinor: base,
    decorationUnitMinor: decorationUnit,
    packagingUnitMinor: packaging,
    setupMinor: setup,
    discountMinor: discount,
    merchandiseSubtotalMinor: subtotal,
    effectivePerPenMinor: Math.round(subtotal / qty),
    lines,
    tax: "checkout",
    shipping: "checkout",
    priceBookVersion: PRICE_BOOK_VERSION,
    tier,
    tiers: offering.tiers,
  };
}

function fmt(minor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: MERCHANT.currency }).format(minor / 100);
}
