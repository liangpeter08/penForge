"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAPTERS, formatMinor, type BootstrapResponse, type ChapterId, type Facet, type ResolveResponse, type Selection } from "@/shared/contracts";
import { useDraft } from "@/storefront/state/draft";
import Pen2D from "@/storefront/scene/Pen2D";
import FacetGroup from "./FacetGroup";
import ProposalDialog from "./ProposalDialog";
import IdentityPanel from "./IdentityPanel";
import ReviewPanel from "./ReviewPanel";
import PriceBreakdown from "./PriceBreakdown";
import { cue } from "./sound";

const PenScene = dynamic(() => import("@/storefront/scene/PenScene"), { ssr: false });

const CHAPTER_LABEL: Record<ChapterId, string> = { form: "Form", surface: "Surface", details: "Details", identity: "Identity", review: "Review" };

export default function Configurator({ bootstrap }: { bootstrap: BootstrapResponse }) {
  const d = useDraft(bootstrap);
  const { state } = d;
  const [resetKey, setResetKey] = useState(0);
  const [comparing, setComparing] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);
  const [sceneFailed, setSceneFailed] = useState<string | null>(null);

  // Reopen a shared design (?design=token): revalidate and explain changes before purchase.
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("design");
    if (!token) return;
    fetch(`/api/designs/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { selection: Selection; catalogChanged: boolean; stillAvailable: boolean; resolution: ResolveResponse };
        d.setSelection(data.selection, "Design restored");
        if (!data.stillAvailable) setRestoreNotice("Some of this design is no longer available. Review the suggested changes before buying.");
        else if (data.catalogChanged) setRestoreNotice("This design was saved under an earlier catalog. Prices and availability have been refreshed.");
      })
      .catch(() => setRestoreNotice("That design link is not valid. Starting from the default pen."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: Escape cancels hover preview; Z with Ctrl/Cmd undoes; C held compares.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if (e.key === "Escape") d.hover(null);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        d.undo();
      }
      if (e.key.toLowerCase() === "c" && !typing && !e.metaKey && !e.ctrlKey) setComparing(true);
    };
    const up = (e: KeyboardEvent) => e.key.toLowerCase() === "c" && setComparing(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [d]);

  const shown = comparing && state.compareTo ? state.compareTo : { selection: state.selection, resolution: state.resolution! };
  const res = shown.resolution.resolution;
  const facets = useMemo(() => Object.fromEntries(res.availableFacets.map((f) => [f.id, f])) as Record<Facet["id"], Facet>, [res.availableFacets]);

  // Hover preview only alters the manifest used for rendering; price and summary stay committed.
  const previewManifest = useMemo(() => {
    const p = state.hoverPreview;
    if (!p || comparing) return res.assetManifest;
    const m = { ...res.assetManifest };
    if (p.surfaceId) {
      const opt = facets.surfaceId?.options.find((o) => o.id === p.surfaceId);
      if (opt?.swatch) m.material = { ...m.material, color: opt.swatch, color2: opt.swatch2, kind: (opt.finishKind as typeof m.material.kind) ?? m.material.kind };
    }
    if (p.trimId) {
      const opt = facets.trimId?.options.find((o) => o.id === p.trimId);
      if (opt?.swatch) m.trim = { ...m.trim, color: opt.swatch };
    }
    return m;
  }, [state.hoverPreview, res.assetManifest, facets, comparing]);

  const commit = useCallback(
    (facet: Facet["id"], value: string, label: string) => {
      if (state.sound) cue.select();
      d.commit({ facet, value }, label);
    },
    [d, state.sound],
  );

  const fontCss = bootstrap.fonts.find((f) => f.id === (shown.selection.identity.type === "text" ? shown.selection.identity.fontId : ""))?.css ?? bootstrap.fonts[0].css;
  const pricing = res.pricing;
  const priceText = pricing.status === "exact" ? formatMinor(pricing.merchandiseSubtotalMinor, pricing.currency) : pricing.status === "unavailable" ? "Unavailable" : `${formatMinor(pricing.merchandiseSubtotalMinor, pricing.currency)} est.`;
  const use3d = state.mode3d && !sceneFailed;

  return (
    <div className="app">
      <header className="header">
        <div style={{ minWidth: 0 }}>
          <div className="header__brand">{bootstrap.merchant.name}</div>
          <div className="header__pen">Parker {res.offeringLabel}</div>
        </div>
        <div className="header__price" aria-live="off">
          {priceText}
          <small>{shown.selection.quantity > 1 ? `for ${shown.selection.quantity}` : ""}{comparing ? " (previous)" : state.unresolved ? " (unconfirmed)" : ""}</small>
        </div>
      </header>

      <div className="stage-wrap">
        {comparing && <div className="stage-badge">Previous state (hold C or the Compare button)</div>}
        {state.hoverPreview && !comparing && <div className="stage-badge">Preview — not applied</div>}
        {sceneFailed && !comparing && <div className="stage-badge stage-badge--warn">3D unavailable: {sceneFailed}. Showing the verified 2D view.</div>}
        {use3d ? (
          <PenScene
            manifest={previewManifest}
            identity={shown.selection.identity}
            fontCss={fontCss}
            chapter={state.chapter}
            reducedMotion={state.reducedMotion}
            resetKey={resetKey}
            poster={res.assetManifest.poster}
            onFail={(reason) => setSceneFailed(reason)}
          />
        ) : (
          <Pen2D manifest={previewManifest} identity={shown.selection.identity} fontCss={fontCss} />
        )}
        <div className="stage-toolbar" role="toolbar" aria-label="View controls">
          <button type="button" onClick={() => setResetKey((k) => k + 1)}>
            Reset view
          </button>
          <button
            type="button"
            aria-pressed={comparing}
            disabled={!state.compareTo}
            onPointerDown={() => setComparing(true)}
            onPointerUp={() => setComparing(false)}
            onPointerLeave={() => setComparing(false)}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setComparing(true)}
            onKeyUp={() => setComparing(false)}
            title="Hold to see the previous state"
          >
            Compare
          </button>
          <button type="button" onClick={d.undo} disabled={state.history.length === 0}>
            Undo
          </button>
          <button type="button" aria-pressed={!use3d} onClick={() => d.set({ mode3d: !state.mode3d })} disabled={!!sceneFailed}>
            2D
          </button>
          <button type="button" aria-pressed={state.reducedMotion} onClick={() => d.set({ reducedMotion: !state.reducedMotion })}>
            Reduce motion
          </button>
          <button type="button" aria-pressed={state.sound} onClick={() => d.set({ sound: !state.sound })} title="Sound cues are off by default">
            Sound {state.sound ? "on" : "off"}
          </button>
        </div>
      </div>

      <aside className="controls" aria-label="Configurator controls">
        <nav className="rail" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <button key={c} type="button" aria-current={state.chapter === c ? "step" : undefined} onClick={() => d.setChapter(c)}>
              <span className="rail__n">{i + 1}</span>
              {CHAPTER_LABEL[c]}
            </button>
          ))}
        </nav>

        <div className="panel">
          {restoreNotice && (
            <div className="notice" role="status">
              {restoreNotice}
              <div className="notice__actions">
                <button type="button" className="btn btn--sm" onClick={() => setRestoreNotice(null)}>
                  OK
                </button>
              </div>
            </div>
          )}
          {state.unresolved && (
            <div className="notice notice--err" role="status">
              We could not confirm this change with the server. You can keep editing; purchase is paused.
              <div className="notice__actions">
                <button type="button" className="btn btn--sm" onClick={d.reprice}>
                  Retry
                </button>
              </div>
            </div>
          )}
          {res.manufacturing === "conflict" && state.pendingProposal === null && res.proposedChanges.length > 0 && (
            <div className="notice notice--proposal" role="status">
              This design is not available as configured.
              <div className="notice__actions">
                {res.proposedChanges.map((p) => (
                  <button key={p.id} type="button" className="btn btn--sm" onClick={() => d.acceptProposal(p)}>
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.chapter === "form" && (
            <>
              <h2>Form</h2>
              <p className="lede">Choose the silhouette. Every Parker family has its own grip, proportions and mechanism.</p>
              <FacetGroup facet={facets.bodyFamilyId} value={shown.selection.bodyFamilyId} onCommit={(id, l) => commit("bodyFamilyId", id, l)} />
              <FacetGroup facet={facets.modeId} value={shown.selection.modeId} onCommit={(id, l) => commit("modeId", id, l)} />
              <ProductFacts facts={res.facts} />
            </>
          )}
          {state.chapter === "surface" && (
            <>
              <h2>Surface</h2>
              <p className="lede">Real finishes from the {bootstrap.families.find((f) => f.id === shown.selection.bodyFamilyId)?.label} collection. Hover to preview, select to commit.</p>
              <FacetGroup facet={facets.surfaceId} value={shown.selection.surfaceId} onCommit={(id, l) => commit("surfaceId", id, l)} onPreview={(id) => d.hover(id ? { surfaceId: id } : null)} swatches />
              <p className="tiny">Screen colour is a visual reference; it cannot certify a match to the physical finish.</p>
            </>
          )}
          {state.chapter === "details" && (
            <>
              <h2>Details</h2>
              <p className="lede">Only the parts that can actually change on this pen. Fixed parts stay inspectable.</p>
              <FacetGroup facet={facets.trimId} value={shown.selection.trimId} onCommit={(id, l) => commit("trimId", id, l)} onPreview={(id) => d.hover(id ? { trimId: id } : null)} />
              <FacetGroup facet={facets.nibId} value={shown.selection.nibId} onCommit={(id, l) => commit("nibId", id, l)} fixedNote={shown.selection.modeId === "fountain" ? "one nib size for this model" : undefined} />
              <FacetGroup facet={facets.inkId} value={shown.selection.inkId} onCommit={(id, l) => commit("inkId", id, l)} />
              <fieldset className="facet">
                <legend>
                  Grip <span className="sel">fixed</span>
                </legend>
                <div className="facet__fixed">The grip is part of the {bootstrap.families.find((f) => f.id === shown.selection.bodyFamilyId)?.label} body. Choosing another body changes it; it is not a separate option.</div>
              </fieldset>
              <FacetGroup facet={facets.packagingId} value={shown.selection.packagingId} onCommit={(id, l) => commit("packagingId", id, l)} />
            </>
          )}
          {state.chapter === "identity" && (
            <IdentityPanel
              identity={shown.selection.identity}
              zones={res.assetManifest.zones}
              fonts={bootstrap.fonts}
              reasons={res.reasons}
              padPrintable={!res.reasons.some((r) => r.field === "identity.zoneId" && /pad print/i.test(r.message))}
              logoUploads={bootstrap.featureFlags.logoUploads}
              onChange={(identity, label) => {
                if (state.sound && identity.type === "text") cue.engrave();
                d.setIdentity(identity, label);
              }}
            />
          )}
          {state.chapter === "review" && (
            <ReviewPanel
              selection={shown.selection}
              resolution={shown.resolution}
              unresolved={state.unresolved}
              resolving={state.resolving}
              onQuantity={(q) => d.commit({ facet: "quantity", value: q }, `Quantity ${q}`)}
              onAcceptQuantity={(q) => d.commit({ facet: "quantity", value: q }, `Quantity ${q}`)}
              onIntent={d.setIntent}
              onConfirmed={(kind, text) => {
                if (state.sound) cue.confirm();
                d.announce(text);
              }}
            />
          )}
        </div>

        <div className="footer">
          {state.chapter !== "review" && (
            <>
              <div className="footer__row">
                <span className="tiny">{shown.selection.quantity} × {priceText}</span>
                <details>
                  <summary className="tiny" style={{ cursor: "pointer" }}>Breakdown</summary>
                  <PriceBreakdown pricing={pricing} quantity={shown.selection.quantity} unresolved={state.unresolved} />
                </details>
              </div>
              <div className="footer__row">
                <div className="segmented" role="group" aria-label="Purchase intent">
                  <button type="button" aria-pressed={shown.selection.intent === "personal"} onClick={() => d.setIntent("personal")}>
                    Personal
                  </button>
                  <button type="button" aria-pressed={shown.selection.intent === "team"} onClick={() => d.setIntent("team")}>
                    Team
                  </button>
                </div>
                <button type="button" className="btn btn--primary" style={{ width: "auto" }} onClick={d.nextChapter}>
                  {state.chapter === "identity" ? "Review" : "Continue"}
                </button>
              </div>
            </>
          )}
          {state.chapter === "review" && (
            <div className="footer__row">
              <button type="button" className="btn btn--ghost" onClick={() => confirm("Reset the design? Personalisation and artwork will be discarded.") && d.reset()}>
                Reset design
              </button>
              <span className="tiny">Illustrative prices. Catalog {bootstrap.catalogVersion}.</span>
            </div>
          )}
        </div>
      </aside>

      {state.pendingProposal && (
        <ProposalDialog message={state.pendingProposal.message} proposals={state.pendingProposal.proposals} onAccept={(p) => { if (state.sound) cue.seat(); d.acceptProposal(p); }} onCancel={d.dismissProposal} />
      )}
      <div className="visually-hidden" aria-live="polite" role="status">
        {state.announcement}
      </div>
    </div>
  );
}

function ProductFacts({ facts }: { facts: ResolveResponse["resolution"]["facts"] }) {
  return (
    <details className="facts">
      <summary>Product facts</summary>
      <dl>
        <dt>Length</dt>
        <dd>{facts.lengthMm} mm</dd>
        <dt>Barrel diameter</dt>
        <dd>{facts.barrelDiameterMm} mm</dd>
        <dt>Weight</dt>
        <dd>{facts.weightG} g</dd>
        <dt>Mechanism</dt>
        <dd>{facts.mechanism}</dd>
        <dt>Refill</dt>
        <dd>{facts.refill}</dd>
        <dt>Material</dt>
        <dd>{facts.material}</dd>
        <dt>Packaging</dt>
        <dd>{facts.packaging}</dd>
      </dl>
      <p className="tiny">Dimensions and weights are published retail figures pending verification against physical samples.</p>
    </details>
  );
}
