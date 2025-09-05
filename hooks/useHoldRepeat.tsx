import { useCallback, useEffect, useRef } from "react";

type UseHoldRepeatOptions = {
  onTrigger: () => void;        // called on each tick
  initialDelay?: number;         // delay before repeating starts (ms)
  repeatDelay?: number;          // delay between repeats (ms)
  fireImmediately?: boolean;     // fire once right away on press?
  disabled?: boolean;
};

export function useHoldRepeat({
  onTrigger,
  initialDelay = 300,
  repeatDelay = 80,
  fireImmediately = true,
  disabled = false,
}: UseHoldRepeatOptions) {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isHoldingRef.current = false;
    pointerIdRef.current = null;
  }, []);

  const start = useCallback((el: HTMLElement, pointerId?: number) => {
    if (disabled || isHoldingRef.current) return;
    isHoldingRef.current = true;

    if (pointerId != null) {
      try { el.setPointerCapture(pointerId); } catch {}
      pointerIdRef.current = pointerId;
    }

    // Optionally fire once immediately (feels snappy for +/- buttons)
    if (fireImmediately) onTrigger();

    // Then start the repeat cycle
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        if (!isHoldingRef.current) return;
        onTrigger();
      }, repeatDelay);
    }, initialDelay);
  }, [disabled, fireImmediately, initialDelay, repeatDelay, onTrigger]);

  const stop = useCallback((el?: HTMLElement) => {
    if (el && pointerIdRef.current != null) {
      try { el.releasePointerCapture(pointerIdRef.current); } catch {}
    }
    clearTimers();
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => clearTimers, [clearTimers]);

  // Return event binders (pointer + keyboard for accessibility)
  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      start(e.currentTarget, e.pointerId);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      stop(e.currentTarget);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
      stop(e.currentTarget);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      stop(e.currentTarget);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      stop(e.currentTarget);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === " " || e.key === "Enter") {
        // prevent scrolling on Space
        if (e.key === " ") e.preventDefault();
        start(e.currentTarget);
      }
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === " " || e.key === "Enter") {
        stop(e.currentTarget);
      }
    },
    // expose disabled if you want to spread it too
    "aria-disabled": disabled || undefined,
  };
}
