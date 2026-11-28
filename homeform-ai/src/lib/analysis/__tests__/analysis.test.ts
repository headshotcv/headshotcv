import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../analyze.ts";
import { syntheticSequence } from "../synthetic.ts";

const ids = (r: ReturnType<typeof analyze>) => r.observations.map((o) => o.id);

test("deep squat: recognised, 5 reps, good depth", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 5 });
  const r = analyze({ ...s, requestedExercise: "squat" });
  assert.equal(r.rejection, undefined, JSON.stringify(r.rejection));
  assert.equal(r.exercise, "squat");
  assert.equal(r.summary.repCount, 5);
  assert.equal(r.view, "profil");
  assert.ok(ids(r).includes("squat_depth_good"), ids(r).join());
  assert.ok(Math.abs(r.summary.avgMinAngle! - 85) < 8, String(r.summary.avgMinAngle));
});

test("shallow squat: partial depth flagged", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 4, squat: { kneeMin: 130, leanMax: 20, shinMax: 15 } });
  const r = analyze(s);
  assert.equal(r.summary.repCount, 4);
  assert.ok(ids(r).includes("squat_depth_partial"), ids(r).join());
});

test("irregular squat depth flagged", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 5, depthPerRep: [80, 120, 85, 125, 82] });
  const r = analyze(s);
  assert.equal(r.summary.repCount, 5);
  assert.ok(ids(r).includes("consistency_depth"), ids(r).join());
});

test("push-up: recognised, reps counted, aligned body", () => {
  const s = syntheticSequence({ exercise: "pushup", reps: 6 });
  const r = analyze({ ...s, requestedExercise: "pushup" });
  assert.equal(r.rejection, undefined, JSON.stringify(r.rejection));
  assert.equal(r.exercise, "pushup");
  assert.equal(r.summary.repCount, 6);
  assert.ok(ids(r).includes("pushup_line_ok"), ids(r).join());
  assert.ok(ids(r).includes("pushup_depth_good"), ids(r).join());
});

test("push-up with sagging hips flagged", () => {
  const s = syntheticSequence({ exercise: "pushup", reps: 5, pushup: { sag: 30 } });
  const r = analyze(s);
  assert.ok(ids(r).includes("pushup_sag"), ids(r).join());
});

test("partial push-ups flagged", () => {
  const s = syntheticSequence({ exercise: "pushup", reps: 5, pushup: { elbowMin: 125 } });
  const r = analyze(s);
  assert.equal(r.summary.repCount, 5);
  assert.ok(ids(r).includes("pushup_depth_partial"), ids(r).join());
});

test("exercise mismatch is rejected, not guessed", () => {
  const s = syntheticSequence({ exercise: "pushup", reps: 4 });
  const r = analyze({ ...s, requestedExercise: "squat" });
  assert.equal(r.status, "rejected");
  assert.equal(r.rejection?.code, "exercise_mismatch");
});

test("no person detected → rejected", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 4 });
  const frames = s.frames.map((f, i) => ({ ...f, landmarks: i % 3 === 0 ? f.landmarks : null }));
  const r = analyze({ frames, meta: s.meta });
  assert.equal(r.rejection?.code, "no_person");
});

test("dark video with poor detection → too_dark", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 4, luma: 20 });
  const frames = s.frames.map((f, i) => ({ ...f, landmarks: i % 2 === 0 ? f.landmarks : null }));
  const r = analyze({ frames, meta: s.meta });
  assert.equal(r.rejection?.code, "too_dark");
});

test("body out of frame → rejected", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 4 });
  const frames = s.frames.map((f) => ({ ...f, landmarks: f.landmarks!.map((l) => ({ ...l, y: l.y + 0.2 })) }));
  const r = analyze({ frames, meta: s.meta });
  assert.equal(r.rejection?.code, "body_out_of_frame");
});

test("standing still → no reps, no fake feedback", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 0 });
  const long = { frames: s.frames, meta: s.meta };
  // stretch to 5 s of standing
  const frames = Array.from({ length: 75 }, (_, i) => ({ ...s.frames[0], t: i / 15 }));
  const r = analyze({ frames, meta: { ...long.meta, duration: 5 } });
  assert.equal(r.rejection?.code, "no_reps");
  assert.equal(r.observations.length, 0);
});

test("too short video → rejected", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 1 });
  const r = analyze({ frames: s.frames.slice(0, 20), meta: { ...s.meta, duration: 1.3 } });
  assert.equal(r.rejection?.code, "video_too_short");
});

test("split stance (lunge) in profile is not reported as a squat", () => {
  const s = syntheticSequence({ exercise: "squat", reps: 4 });
  const frames = s.frames.map((f) => ({ ...f, landmarks: f.landmarks!.map((l, i) => ([28, 30, 32].includes(i) ? { ...l, x: l.x - 0.2 } : l)) }));
  const r = analyze({ frames, meta: s.meta });
  assert.equal(r.rejection?.code, "exercise_not_recognized");
});
