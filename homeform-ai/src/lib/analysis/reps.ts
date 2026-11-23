import { percentile } from "./geometry.ts";

export interface RepWindow {
  start: number; // sample index
  bottom: number;
  end: number;
}

/**
 * Segment repetitions on a joint-angle signal (large = extended, small = flexed) using a
 * hysteresis state machine on the normalised signal. A rep = extended → flexed → extended.
 * Requires a minimum range of motion so that noise is not counted as reps.
 */
export function segmentReps(
  signal: (number | null)[],
  times: number[],
  opts: { minRange?: number; hi?: number; lo?: number; minRepSeconds?: number } = {},
): RepWindow[] {
  const { minRange = 30, hi = 0.8, lo = 0.55, minRepSeconds = 0.6 } = opts;
  const valid = signal.filter((x): x is number => x !== null);
  if (valid.length < 10) return [];
  const top = percentile(valid, 95);
  const bot = percentile(valid, 5);
  if (top - bot < minRange) return [];
  const norm = (v: number) => (v - bot) / (top - bot);

  const reps: RepWindow[] = [];
  let state: "seek_top" | "top" | "down" = "seek_top";
  let start = -1, bottom = -1, bottomVal = Infinity;

  for (let i = 0; i < signal.length; i++) {
    const v = signal[i];
    if (v === null) {
      // long tracking loss resets the current rep
      if (state === "down") { state = "seek_top"; }
      continue;
    }
    const n = norm(v);
    if (state === "seek_top") {
      if (n >= hi) { state = "top"; start = i; }
    } else if (state === "top") {
      if (n >= hi) start = i; // keep the latest extended sample as rep start
      if (n <= lo) { state = "down"; bottom = i; bottomVal = v; }
    } else if (state === "down") {
      if (v < bottomVal) { bottomVal = v; bottom = i; }
      if (n >= hi) {
        if (times[i] - times[start] >= minRepSeconds) reps.push({ start, bottom, end: i });
        state = "top";
        start = i;
      }
    }
  }
  return reps;
}
