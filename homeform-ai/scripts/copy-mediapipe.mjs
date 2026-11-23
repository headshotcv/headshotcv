// Copies the MediaPipe WASM runtime into /public so pose estimation runs fully on-device,
// with no third-party CDN at runtime. Runs on postinstall (locally and on Vercel).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
const src = "node_modules/@mediapipe/tasks-vision/wasm";
const dest = "public/mediapipe/wasm";
if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm"]) copyFileSync(`${src}/${f}`, `${dest}/${f}`);
  console.log("[homeform] MediaPipe wasm copied to", dest);
}
