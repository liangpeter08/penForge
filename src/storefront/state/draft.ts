"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  CHAPTERS,
  SCHEMA_VERSION,
  newId,
  type BootstrapResponse,
  type ChapterId,
  type Edit,
  type Identity,
  type Proposal,
  type ResolveResponse,
  type Selection,
} from "@/shared/contracts";

/**
 * Four kinds of state (spec §11): presentation (browser), editable draft (browser), resolution (server),
 * submitted revision (server, immutable). This store owns the first two and mirrors the third.
 */

export interface HistoryEntry {
  selection: Selection;
  resolution: ResolveResponse;
  label: string;
}

export interface DraftState {
  // Editable draft
  selection: Selection;
  draftRevision: number;
  // Mirror of the latest applied resolution
  resolution: ResolveResponse | null;
  resolving: boolean;
  unresolved: boolean; // timed out / failed: last confirmed render stays, purchase disabled
  // Presentation
  chapter: ChapterId;
  pendingProposal: { proposals: Proposal[]; edit: Edit; message: string } | null;
  history: HistoryEntry[]; // undo stack, most recent last
  compareTo: HistoryEntry | null; // previous committed state for press-and-hold compare
  hoverPreview: Partial<Selection> | null;
  mode3d: boolean;
  reducedMotion: boolean;
  sound: boolean;
  announcement: string;
}

type Action =
  | { type: "bootstrap"; bootstrap: BootstrapResponse; selection?: Selection; resolution?: ResolveResponse }
  | { type: "request"; draftRevision: number }
  | { type: "applied"; response: ResolveResponse; edit: Edit; label: string; draftRevision: number }
  | { type: "failed"; draftRevision: number }
  | { type: "chapter"; chapter: ChapterId }
  | { type: "dismissProposal" }
  | { type: "undo" }
  | { type: "hover"; preview: Partial<Selection> | null }
  | { type: "set"; patch: Partial<Pick<DraftState, "mode3d" | "reducedMotion" | "sound">> }
  | { type: "announce"; text: string }
  | { type: "reset"; selection: Selection; resolution: ResolveResponse };

const MAX_HISTORY = 20;

function reducer(state: DraftState, a: Action): DraftState {
  switch (a.type) {
    case "bootstrap":
      return {
        ...state,
        selection: a.selection ?? a.bootstrap.defaultSelection,
        resolution: a.resolution ?? a.bootstrap.defaultResolution,
        draftRevision: 1,
      };
    case "request":
      return { ...state, resolving: true, draftRevision: a.draftRevision };
    case "applied": {
      if (a.draftRevision !== state.draftRevision) return state; // stale response: ignore
      const res = a.response.resolution;
      const changed = JSON.stringify(a.response.selection) !== JSON.stringify(state.selection);
      const entry: HistoryEntry | null = changed && state.resolution ? { selection: state.selection, resolution: state.resolution, label: a.label } : null;
      const conflict = res.reasons.some((r) => r.code === "NO_APPROVED_OFFERING");
      const facetProposals = res.proposedChanges.filter((p) => p.resultingOfferingId !== "");
      if (facetProposals.length && !changed && a.edit && a.edit.facet !== "quantity") {
        // Conflict or consequential dependent change: keep the committed pen and ask first.
        return {
          ...state,
          resolving: false,
          unresolved: false,
          pendingProposal: { proposals: facetProposals, edit: a.edit, message: conflict ? res.reasons[0].message : "This change affects another choice." },
        };
      }
      return {
        ...state,
        resolving: false,
        unresolved: false,
        selection: a.response.selection,
        resolution: a.response,
        history: entry ? [...state.history, entry].slice(-MAX_HISTORY) : state.history,
        compareTo: entry ?? state.compareTo,
        pendingProposal: null,
        announcement: changed ? `${a.label}. ${describePrice(a.response)}` : state.announcement,
      };
    }
    case "failed":
      return a.draftRevision === state.draftRevision
        ? { ...state, resolving: false, unresolved: true, announcement: "Price could not be confirmed. You can keep editing; purchase is paused." }
        : state;
    case "chapter":
      return { ...state, chapter: a.chapter };
    case "dismissProposal":
      return { ...state, pendingProposal: null, announcement: "Change cancelled. Your pen is unchanged." };
    case "undo": {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return {
        ...state,
        selection: prev.selection,
        resolution: prev.resolution,
        history: state.history.slice(0, -1),
        compareTo: state.history[state.history.length - 2] ?? null,
        pendingProposal: null,
        announcement: `Undid: ${prev.label}.`,
      };
    }
    case "hover":
      return { ...state, hoverPreview: a.preview };
    case "set":
      return { ...state, ...a.patch };
    case "announce":
      return { ...state, announcement: a.text };
    case "reset":
      return { ...state, selection: a.selection, resolution: a.resolution, history: [], compareTo: null, pendingProposal: null, chapter: "form", announcement: "Design reset." };
    default:
      return state;
  }
}

function describePrice(r: ResolveResponse) {
  const p = r.resolution.pricing;
  if (p.status !== "exact") return `Price ${p.status.replace("_", " ")}.`;
  return `Total ${(p.merchandiseSubtotalMinor / 100).toLocaleString("en-US", { style: "currency", currency: p.currency })}.`;
}

const initial: DraftState = {
  selection: null as unknown as Selection,
  draftRevision: 0,
  resolution: null,
  resolving: false,
  unresolved: false,
  chapter: "form",
  pendingProposal: null,
  history: [],
  compareTo: null,
  hoverPreview: null,
  mode3d: true,
  reducedMotion: false,
  sound: false,
  announcement: "",
};

export function useDraft(bootstrap: BootstrapResponse, restored?: { selection: Selection; resolution: ResolveResponse } | null) {
  const [state, dispatch] = useReducer(reducer, initial, (s) => reducer(s, { type: "bootstrap", bootstrap, selection: restored?.selection, resolution: restored?.resolution }));
  const stateRef = useRef(state);
  stateRef.current = state;
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saved = JSON.parse(localStorage.getItem("penforge.prefs") ?? "{}") as Partial<DraftState>;
      dispatch({ type: "set", patch: { reducedMotion: saved.reducedMotion ?? rm, sound: saved.sound ?? false, mode3d: saved.mode3d ?? true } });
    } catch {
      /* private mode: defaults apply */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("penforge.prefs", JSON.stringify({ reducedMotion: state.reducedMotion, sound: state.sound, mode3d: state.mode3d }));
    } catch {
      /* ignore */
    }
  }, [state.reducedMotion, state.sound, state.mode3d]);

  /** Send the committed selection plus an edit to the server; apply only if still the latest draft. */
  const resolveWith = useCallback(
    async (selection: Selection, edit: Edit, label: string) => {
      const draftRevision = stateRef.current.draftRevision + 1;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      dispatch({ type: "request", draftRevision });
      const body = { schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision, catalogVersion: bootstrap.catalogVersion, selection, edit };
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        ctrl.abort();
      }, 8000);
      try {
        const res = await fetch("/api/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
        if (!res.ok) throw new Error(`resolve ${res.status}`);
        const data = (await res.json()) as ResolveResponse;
        dispatch({ type: "applied", response: data, edit, label, draftRevision });
      } catch (e) {
        // A superseded request is aborted deliberately; only a timeout or a real failure marks the draft unresolved.
        if ((e as Error).name !== "AbortError" || timedOut) dispatch({ type: "failed", draftRevision });
      } finally {
        clearTimeout(timeout);
      }
    },
    [bootstrap.catalogVersion],
  );

  const commit = useCallback(
    (edit: NonNullable<Edit>, label: string) => {
      void resolveWith(stateRef.current.selection, edit, label);
    },
    [resolveWith],
  );

  /** Apply an accepted proposal as one transaction. */
  const acceptProposal = useCallback(
    (p: Proposal) => {
      const next: Selection = { ...stateRef.current.selection };
      for (const c of p.changes) {
        (next as unknown as Record<string, unknown>)[c.facet] = c.to;
      }
      dispatch({ type: "dismissProposal" });
      void resolveWith(next, null, p.title);
    },
    [resolveWith],
  );

  const setIdentity = useCallback(
    (identity: Identity, label = "Personalisation updated") => {
      void resolveWith({ ...stateRef.current.selection, identity }, null, label);
    },
    [resolveWith],
  );

  const setIntent = useCallback(
    (intent: Selection["intent"]) => {
      const s = stateRef.current.selection;
      void resolveWith({ ...s, intent, packagingId: intent === "personal" && s.packagingId === "bulk" ? "gift_box" : s.packagingId }, null, intent === "team" ? "Team order" : "Personal order");
    },
    [resolveWith],
  );

  const setSelection = useCallback((selection: Selection, label: string) => void resolveWith(selection, null, label), [resolveWith]);
  const reprice = useCallback(() => void resolveWith(stateRef.current.selection, null, "Repriced"), [resolveWith]);

  const api = useMemo(
    () => ({
      commit,
      acceptProposal,
      setIdentity,
      setIntent,
      setSelection,
      reprice,
      undo: () => dispatch({ type: "undo" }),
      dismissProposal: () => dispatch({ type: "dismissProposal" }),
      setChapter: (chapter: ChapterId) => dispatch({ type: "chapter", chapter }),
      nextChapter: () => {
        const i = CHAPTERS.indexOf(stateRef.current.chapter);
        if (i < CHAPTERS.length - 1) dispatch({ type: "chapter", chapter: CHAPTERS[i + 1] });
      },
      hover: (preview: Partial<Selection> | null) => dispatch({ type: "hover", preview }),
      set: (patch: Partial<Pick<DraftState, "mode3d" | "reducedMotion" | "sound">>) => dispatch({ type: "set", patch }),
      announce: (text: string) => dispatch({ type: "announce", text }),
      reset: () => dispatch({ type: "reset", selection: bootstrap.defaultSelection, resolution: bootstrap.defaultResolution }),
    }),
    [commit, acceptProposal, setIdentity, setIntent, setSelection, reprice, bootstrap],
  );

  return { state, ...api };
}

export type DraftApi = ReturnType<typeof useDraft>;
