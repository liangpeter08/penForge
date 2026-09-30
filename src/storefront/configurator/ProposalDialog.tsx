"use client";

import { useEffect, useRef } from "react";
import type { Proposal } from "@/shared/contracts";

interface Props {
  message: string;
  proposals: Proposal[];
  onAccept: (p: Proposal) => void;
  onCancel: () => void;
}

/**
 * Deliberate conflict handling (spec §2): the committed pen and price stay until acceptance; cancel restores
 * the prior controls; an accepted proposal is one undoable transaction. Focus returns to the trigger on close.
 */
export default function ProposalDialog({ message, proposals, onAccept, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restore.current = document.activeElement as HTMLElement | null;
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => {
      d?.close();
      restore.current?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="proposal"
      aria-labelledby="proposal-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => e.target === ref.current && onCancel()}
    >
      <h2 id="proposal-title">That needs a change</h2>
      <p className="tiny">{message} Your current pen and price stay as they are until you accept.</p>
      {proposals.map((p, i) => (
        <div className="proposal__option" key={p.id}>
          <ul>
            {p.changes.map((c) => (
              <li key={String(c.facet) + String(c.to)}>{c.label}</li>
            ))}
          </ul>
          {p.consequences.map((c) => (
            <div className="proposal__consequence" key={c}>
              {c}
            </div>
          ))}
          <button type="button" className={`btn btn--sm ${i === 0 ? "btn--primary" : ""}`} onClick={() => onAccept(p)} autoFocus={i === 0}>
            {i === 0 ? "Apply these changes" : "Apply instead"}
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--ghost" onClick={onCancel}>
        Cancel, keep my pen
      </button>
    </dialog>
  );
}
