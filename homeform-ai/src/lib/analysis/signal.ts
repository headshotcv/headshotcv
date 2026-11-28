/** Fill short gaps (null) by linear interpolation; leave long gaps (> maxGap samples) as null. */
export function interpolateGaps(xs: (number | null)[], maxGap = 6): (number | null)[] {
  const out = [...xs];
  let i = 0;
  while (i < out.length) {
    if (out[i] !== null) { i++; continue; }
    let j = i;
    while (j < out.length && out[j] === null) j++;
    const gap = j - i;
    const before = i > 0 ? out[i - 1] : null;
    const after = j < out.length ? out[j] : null;
    if (gap <= maxGap && before !== null && after !== null) {
      for (let k = 0; k < gap; k++) out[i + k] = before + ((after - before) * (k + 1)) / (gap + 1);
    }
    i = j;
  }
  return out;
}

/** Centred moving median (robust to landmark jitter), ignores nulls. */
export function movingMedian(xs: (number | null)[], radius = 2): (number | null)[] {
  return xs.map((x, i) => {
    if (x === null) return null;
    const win: number[] = [];
    for (let k = i - radius; k <= i + radius; k++) {
      const v = xs[k];
      if (v !== undefined && v !== null) win.push(v);
    }
    win.sort((a, b) => a - b);
    return win[Math.floor(win.length / 2)];
  });
}

/** Centred moving average, ignores nulls. */
export function movingAverage(xs: (number | null)[], radius = 1): (number | null)[] {
  return xs.map((x, i) => {
    if (x === null) return null;
    let s = 0, n = 0;
    for (let k = i - radius; k <= i + radius; k++) {
      const v = xs[k];
      if (v !== undefined && v !== null) { s += v; n++; }
    }
    return s / n;
  });
}

export function smooth(xs: (number | null)[]): (number | null)[] {
  return movingAverage(movingMedian(interpolateGaps(xs), 2), 1);
}
