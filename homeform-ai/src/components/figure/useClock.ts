"use client";
import { useEffect, useRef, useState } from "react";

/** Animation clock in seconds. Pauses when the element is off-screen or the tab is hidden. */
export function useClock(enabled = true, speed = 1) {
  const [t, setT] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setT(1.4); return; }
    let raf = 0, last = performance.now(), visible = true, acc = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible && !document.hidden) { acc += dt * speed; setT(acc); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [enabled, speed]);
  return { t, ref };
}
