"use client";

import { useEffect, useRef } from "react";

// Shared AudioContext — must be created from a user gesture to stay unlocked
let sharedCtx: AudioContext | null = null;
let globalSoundEnabled = true;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!sharedCtx || sharedCtx.state === "closed") {
    try {
      sharedCtx = new AudioContext();
    } catch {
      return;
    }
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume();
  }
}

export function setGlobalSoundEnabled(enabled: boolean) {
  globalSoundEnabled = enabled;
  if (enabled) unlockAudio();
}

function makeSweepBeeps(ctx: AudioContext, closeWhenDone = false) {
  [440, 554, 659, 880].forEach((freq, i) => {
    const offset = i * 0.5;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + offset);
    gain.gain.setValueAtTime(0.5, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.9);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + 0.9);
    if (i === 3 && closeWhenDone) osc.onended = () => ctx.close();
  });
}

function playBeep() {
  if (!globalSoundEnabled || !sharedCtx || sharedCtx.state === "closed") return;
  makeSweepBeeps(sharedCtx, false);
}

export function playNewOrderBeep() {
  if (!globalSoundEnabled) return;
  if (!sharedCtx || sharedCtx.state === "closed") {
    try {
      const ctx = new AudioContext();
      makeSweepBeeps(ctx, true);
    } catch { /* ignore */ }
    return;
  }
  makeSweepBeeps(sharedCtx, false);
}

/**
 * Polls /api/orders/all-statuses every 5 seconds.
 * Plays a double-beep when a new order appears.
 */
export function useNewOrderSound(enabled: boolean) {
  const knownIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    async function poll() {
      try {
        const res = await fetch("/api/orders/all-statuses", { cache: "no-store" });
        if (!res.ok) return;
        const statuses: Record<string, string> = await res.json();
        const ids = Object.keys(statuses);

        if (!initialized.current) {
          knownIds.current = new Set(ids);
          initialized.current = true;
          return;
        }

        let hasNew = false;
        for (const id of ids) {
          if (!knownIds.current.has(id)) {
            hasNew = true;
            knownIds.current.add(id);
          }
        }
        if (hasNew) playNewOrderBeep();
      } catch {
        // Ignore network errors
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [enabled]);
}

/**
 * Polls /api/orders/statuses every 5 seconds.
 * Plays a beep when any order transitions to COMPLETED.
 */
export function useOrderCompletedSound(enabled: boolean) {
  // Track last known statuses
  const knownStatuses = useRef<Record<string, string>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    async function poll() {
      try {
        const res = await fetch("/api/orders/statuses", { cache: "no-store" });
        if (!res.ok) return;
        const statuses: Record<string, string> = await res.json();

        if (!initialized.current) {
          knownStatuses.current = statuses;
          initialized.current = true;
          return;
        }

        // Check if any order newly became COMPLETED
        for (const [id, status] of Object.entries(statuses)) {
          const prev = knownStatuses.current[id];
          if (status === "COMPLETED" && prev && prev !== "COMPLETED") {
            playBeep();
          }
        }

        knownStatuses.current = statuses;
      } catch {
        // Ignore network errors
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [enabled]);
}
