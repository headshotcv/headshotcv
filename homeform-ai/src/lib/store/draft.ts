"use client";
/** Anonymous funnel state, kept in this browser until the visitor creates an account. */
import type { Profile } from "@/lib/program/generate";
import type { AnalysisResult } from "@/lib/analysis/types";

const K = { profile: "hf_draft_profile", analysis: "hf_pending_analysis" };

function read<T>(k: string): T | null {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
function write(k: string, v: unknown) {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ }
}

export const saveDraftProfile = (p: Profile) => write(K.profile, p);
export const getDraftProfile = () => read<Profile>(K.profile);
export const savePendingAnalysis = (a: { id: string; result: AnalysisResult; hasLocalVideo: boolean }) => write(K.analysis, a);
export const getPendingAnalysis = () => read<{ id: string; result: AnalysisResult; hasLocalVideo: boolean }>(K.analysis);
export const clearDraft = () => { write(K.profile, null); write(K.analysis, null); };
