"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CLIPS, clipPoster, clipSrc, type ClipKey } from "./clips";
import { cn } from "@/lib/cn";

export interface VideoLoopProps {
  clip: ClipKey;
  className?: string;
  /** start playing immediately (hero) instead of waiting to be visible */
  eager?: boolean;
  objectPosition?: string;
  loop?: boolean;
  onTime?: (t: number) => void;
  rate?: number;
}

/**
 * Muted, looping, inline video that only plays while visible, honours reduced motion
 * (poster only) and never blocks first paint.
 */
export const VideoLoop = forwardRef<HTMLVideoElement | null, VideoLoopProps>(function VideoLoop({ clip, className, eager, objectPosition, loop = true, onTime, rate = 1 }, ref) {
  const v = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  useImperativeHandle(ref, () => v.current as HTMLVideoElement);

  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm) return;
    el.playbackRate = rate;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (el.preload !== "auto") el.preload = "auto"; el.play().catch(() => {}); }
      else el.pause();
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [rate]);

  useEffect(() => {
    if (!onTime) return;
    let raf = 0;
    const loopFn = () => { if (v.current) onTime(v.current.currentTime); raf = requestAnimationFrame(loopFn); };
    raf = requestAnimationFrame(loopFn);
    return () => cancelAnimationFrame(raf);
  }, [onTime]);

  return (
    <video
      ref={v}
      className={cn("h-full w-full object-cover", className)}
      style={objectPosition ? { objectPosition } : undefined}
      src={clipSrc(clip)}
      poster={clipPoster(clip)}
      muted
      playsInline
      loop={loop}
      autoPlay={eager && !reduced}
      preload={eager ? "auto" : "metadata"}
      aria-label={CLIPS[clip].alt}
      disablePictureInPicture
    />
  );
});
