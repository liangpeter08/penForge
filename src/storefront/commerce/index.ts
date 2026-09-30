"use client";

import { newId, type ConfigurationRevision, type ResolveResponse, type Selection } from "@/shared/contracts";

export interface CartLineView {
  variantId: string;
  sku: string;
  quantity: number;
  unitMinor: number;
  title: string;
  properties: Record<string, string>;
  privateProperties: Record<string, string>;
}

export interface CartIntentView {
  intentId: string;
  configurationRevisionId: string;
  lines: CartLineView[];
  merchandiseSubtotalMinor: number;
  expiresAt: string;
}

export interface CartState {
  lines: (CartLineView & { key: string })[];
}

/**
 * Storefront cart adapter (spec §10). The mock keeps a browser-local "theme cart" so the full
 * intent -> add -> read -> reconcile transaction runs end to end without a store.
 * The Shopify adapter targets the storefront Ajax Cart API; it is only reachable when the app is
 * mounted inside a Shopify theme (theme app extension), never from this standalone deployment.
 */
export interface CartAdapter {
  add(intent: CartIntentView): Promise<void>;
  read(): Promise<CartState>;
  cartUrl(): string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = (data as { error?: { code: string; message: string; fields?: { path: string; message: string }[] } }).error;
    throw new ApiError(res.status, e?.code ?? "INTERNAL", e?.message ?? `Request failed (${res.status})`, e?.fields);
  }
  return data as T;
}

export function createConfiguration(selection: Selection, resolution: ResolveResponse) {
  return post<ConfigurationRevision>("/api/configurations", {
    selection,
    catalogVersion: resolution.catalogVersion,
    merchandiseSubtotalMinor: resolution.resolution.pricing.merchandiseSubtotalMinor,
  });
}

export function createCartIntent(revision: ConfigurationRevision, mutationId: string) {
  return post<CartIntentView>("/api/cart-intents", { mutationId, revision });
}

export function submitQuote(revision: ConfigurationRevision, mutationId: string, contact: { name: string; email: string; company?: string }, notes?: string) {
  return post<{ requestId: string; nextAction: string; responseTarget: string | null }>("/api/quotes", { mutationId, revision, contact, notes });
}

export function createDesignToken(selection: Selection, includePersonal: boolean) {
  return post<{ token: string; url: string }>("/api/designs", { selection, includePersonal });
}

const MOCK_KEY = "penforge.mockCart";

export class MockCartAdapter implements CartAdapter {
  async add(intent: CartIntentView) {
    const cart = await this.read();
    for (const line of intent.lines) {
      // Distinct personalisations of the same variant remain distinct lines: key by variant + properties.
      const key = `${line.variantId}:${JSON.stringify(line.properties)}`;
      const existing = cart.lines.find((l) => l.key === key);
      if (existing) existing.quantity += line.quantity;
      else cart.lines.push({ ...line, key });
    }
    try {
      localStorage.setItem(MOCK_KEY, JSON.stringify(cart));
    } catch {
      throw new ApiError(500, "CART_UNAVAILABLE", "Your browser blocked cart storage.");
    }
  }
  async read(): Promise<CartState> {
    try {
      return (JSON.parse(localStorage.getItem(MOCK_KEY) ?? "null") as CartState | null) ?? { lines: [] };
    } catch {
      return { lines: [] };
    }
  }
  cartUrl() {
    return "#cart";
  }
}

/** Shopify Ajax Cart API adapter. Requires a theme context; variant ids must be numeric ids. */
export class ShopifyAjaxCartAdapter implements CartAdapter {
  private root: string;
  constructor() {
    const shopify = typeof window !== "undefined" ? (window as unknown as { Shopify?: { routes?: { root?: string } } }).Shopify : undefined;
    this.root = shopify?.routes?.root ?? "/";
  }
  async add(intent: CartIntentView) {
    const items = intent.lines.map((l) => ({
      id: Number(l.variantId.split("/").pop()),
      quantity: l.quantity,
      properties: { ...l.properties, ...l.privateProperties },
    }));
    const res = await fetch(`${this.root}cart/add.js`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    if (!res.ok) throw new ApiError(res.status, "CART_ADD_FAILED", "Shopify did not accept the item.");
  }
  async read(): Promise<CartState> {
    const res = await fetch(`${this.root}cart.js`);
    const cart = (await res.json()) as {
      items: { variant_id: number; sku: string; quantity: number; price: number; title: string; properties: Record<string, string> | null; key: string }[];
    };
    return {
      lines: cart.items.map((i) => ({
        key: i.key,
        variantId: `gid://shopify/ProductVariant/${i.variant_id}`,
        sku: i.sku,
        quantity: i.quantity,
        unitMinor: i.price,
        title: i.title,
        properties: Object.fromEntries(Object.entries(i.properties ?? {}).filter(([k]) => !k.startsWith("_"))),
        privateProperties: Object.fromEntries(Object.entries(i.properties ?? {}).filter(([k]) => k.startsWith("_"))),
      })),
    };
  }
  cartUrl() {
    return `${this.root}cart`;
  }
}

export function cartAdapter(): CartAdapter {
  return process.env.NEXT_PUBLIC_COMMERCE_ADAPTER === "shopify" ? new ShopifyAjaxCartAdapter() : new MockCartAdapter();
}

/**
 * Cart transaction (spec §10): revision -> intent -> add -> read -> reconcile. Success only after the cart
 * confirms the exact lines. A mutation id makes repeated presses return the same intent.
 */
export async function addToCart(selection: Selection, resolution: ResolveResponse, adapter: CartAdapter, mutationId = newId("mut")) {
  const revision = await createConfiguration(selection, resolution);
  const intent = await createCartIntent(revision, mutationId);
  await adapter.add(intent);
  const cart = await adapter.read();
  const find = (l: CartLineView) => cart.lines.find((c) => c.variantId === l.variantId && c.privateProperties._penforge_ref === l.privateProperties._penforge_ref);
  const missing = intent.lines.filter((l) => {
    const c = find(l);
    return !c || c.quantity < l.quantity;
  });
  if (missing.length) throw new ApiError(409, "CART_MISMATCH", "The cart does not match the accepted configuration. Nothing was charged; please review the cart.");
  const mismatch = intent.lines.find((l) => find(l)?.unitMinor !== l.unitMinor);
  if (mismatch) throw new ApiError(409, "CART_PRICE_DIFFERS", "The cart price differs from the accepted price. Review the cart before checkout.");
  return { revision, intent, cart };
}
