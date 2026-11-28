"use client";
import { repo } from "./repo";
import { clearDraft, getDraftProfile, getPendingAnalysis } from "./draft";
import { generateProgram } from "@/lib/program/generate";
import type { User } from "./types";

/** Attach what the visitor did before signing up (profile, last analysis) to their account. */
export async function claimDraft(user: User) {
  const profile = getDraftProfile();
  const pending = getPendingAnalysis();
  const data = await repo.load(user);
  if (profile && !data.program) await repo.saveProfile(user, profile, generateProgram(profile));
  if (pending) await repo.addAnalysis(user, { id: pending.id, exercise: pending.result.exercise, status: pending.result.status, result: pending.result, createdAt: pending.result.createdAt, hasLocalVideo: pending.hasLocalVideo });
  clearDraft();
}
