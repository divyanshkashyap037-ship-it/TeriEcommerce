// Adapted from Rare UI delete-button
// (https://github.com/swamimalode07/rare-ui, components/ui/delete-button.tsx).
// Original is TypeScript + Tailwind + motion with a trash-can lid animation.
// This version is rewritten in plain JS + plain CSS for this Vite project,
// keeping the core idea: press-and-hold to confirm delete (no accidental
// deletes, no cheap window.confirm popup). Uses motion for the progress
// animation and honors prefers-reduced-motion.
// License: MIT + Commons Clause + Attribution, Copyright (c) 2026 Swami Malode.
// Visible credit to https://rareui.com is in Footer.jsx + README.md.
// Do not resell/redistribute this component itself. Keep this notice.

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const HOLD_MS = 700; // how long to hold to confirm

export default function DeleteButton({ onConfirm, label = 'Hold to delete' }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const rafRef = useRef(null);
  const startRef = useRef(0);

  function cancel() {
    setHolding(false);
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function tick() {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(elapsed / HOLD_MS, 1);
    setProgress(p);
    if (p >= 1) {
      cancel();
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function start(e) {
    e.preventDefault();
    if (reduceMotion) {
      // No hold animation for reduced motion: single click confirms.
      onConfirm();
      return;
    }
    startRef.current = Date.now();
    setHolding(true);
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => cancel, []);

  return (
    <motion.button
      type="button"
      className={holding ? 'delete-btn holding' : 'delete-btn'}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      aria-label={label}
      title={label}
    >
      <span
        className="delete-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
      <span>{holding ? 'Keep holding…' : 'Delete'}</span>
    </motion.button>
  );
}
