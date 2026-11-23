/**
 * Original, illustrated apartment set (no stock imagery): back wall lit by a window,
 * skirting board, wooden floor in perspective and a training mat. Rendered as SVG so
 * it stays sharp and light on mobile.
 */
export function Room({ w, h, floorY, mat = true, window: win = true, variant = "living" }: { w: number; h: number; floorY: number; mat?: boolean; window?: boolean; variant?: "living" | "bedroom" | "garden" }) {
  const wall = variant === "bedroom" ? ["#1b1a18", "#0e0e0d"] : variant === "garden" ? ["#161a14", "#0b0d0a"] : ["#1c1d1a", "#0d0e0c"];
  return (
    <g>
      <defs>
        <linearGradient id={`wall-${variant}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor={wall[0]} />
          <stop offset="1" stopColor={wall[1]} />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1714" />
          <stop offset="1" stopColor="#0a0908" />
        </linearGradient>
        <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgb(242 239 232 / 0.16)" />
          <stop offset="1" stopColor="rgb(242 239 232 / 0)" />
        </radialGradient>
        <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(255 246 225 / 0.2)" />
          <stop offset="1" stopColor="rgb(255 246 225 / 0)" />
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation={w * 0.01} /></filter>
      </defs>
      <rect width={w} height={h} fill={`url(#wall-${variant})`} />
      {win && (
        <g>
          {/* window frame */}
          <rect x={w * 0.07} y={h * 0.1} width={w * 0.2} height={floorY - h * 0.22} fill="rgb(232 226 210 / 0.07)" />
          <rect x={w * 0.07} y={h * 0.1} width={w * 0.2} height={floorY - h * 0.22} fill="none" stroke="rgb(242 239 232 / 0.08)" strokeWidth={w * 0.004} />
          <line x1={w * 0.17} y1={h * 0.1} x2={w * 0.17} y2={floorY - h * 0.12} stroke="rgb(242 239 232 / 0.08)" strokeWidth={w * 0.004} />
          {/* light shaft on wall & floor */}
          <polygon points={`${w * 0.27},${h * 0.1} ${w * 0.75},${h * 0.32} ${w * 0.92},${floorY + (h - floorY) * 0.9} ${w * 0.27},${floorY - h * 0.12}`} fill="url(#shaft)" filter="url(#soft)" />
        </g>
      )}
      {variant === "living" && (
        // sofa silhouette, right
        <g fill="#121210">
          <rect x={w * 0.8} y={floorY - h * 0.2} width={w * 0.3} height={h * 0.2} rx={w * 0.012} />
          <rect x={w * 0.78} y={floorY - h * 0.12} width={w * 0.05} height={h * 0.12} rx={w * 0.01} />
        </g>
      )}
      {variant === "bedroom" && (
        <g fill="#141311">
          <rect x={w * -0.05} y={floorY - h * 0.14} width={w * 0.3} height={h * 0.14} />
          <rect x={w * -0.05} y={floorY - h * 0.24} width={w * 0.04} height={h * 0.24} />
        </g>
      )}
      {variant === "garden" && (
        <g fill="#0f130d">
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={w * (0.65 + i * 0.05)} cy={floorY - h * (0.1 + (i % 3) * 0.04)} rx={w * 0.05} ry={h * 0.12} />
          ))}
        </g>
      )}
      {/* plant, left */}
      {variant !== "garden" && (
        <g>
          <rect x={w * 0.03} y={floorY - h * 0.09} width={w * 0.04} height={h * 0.09} fill="#151412" />
          {[-40, -15, 10, 35, -60, 60].map((a, i) => (
            <ellipse key={i} cx={w * 0.05} cy={floorY - h * 0.17} rx={w * 0.008} ry={h * 0.09} fill="#10130f" transform={`rotate(${a} ${w * 0.05} ${floorY - h * 0.09})`} />
          ))}
        </g>
      )}
      {/* skirting + floor */}
      <rect x={0} y={floorY} width={w} height={h - floorY} fill={variant === "garden" ? "#0c0f0a" : "url(#floor)"} />
      <rect x={0} y={floorY - h * 0.008} width={w} height={h * 0.008} fill="#22221f" />
      {variant !== "garden" && Array.from({ length: 14 }).map((_, i) => {
        const x = (i / 13) * w;
        return <line key={i} x1={w / 2 + (x - w / 2) * 0.55} y1={floorY} x2={w / 2 + (x - w / 2) * 1.6} y2={h} stroke="rgb(0 0 0 / 0.35)" strokeWidth={1} />;
      })}
      <ellipse cx={w * 0.55} cy={floorY + (h - floorY) * 0.5} rx={w * 0.35} ry={(h - floorY) * 0.6} fill="url(#pool)" />
      {mat && (
        <polygon
          points={`${w * 0.3},${floorY + (h - floorY) * 0.25} ${w * 0.78},${floorY + (h - floorY) * 0.25} ${w * 0.86},${floorY + (h - floorY) * 0.72} ${w * 0.22},${floorY + (h - floorY) * 0.72}`}
          fill="#1f2a1c"
          opacity={0.9}
        />
      )}
    </g>
  );
}
