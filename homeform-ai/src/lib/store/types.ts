import type { AnalysisResult, ExerciseId } from "@/lib/analysis/types";
import type { Profile, Program } from "@/lib/program/generate";

export interface StoredAnalysis {
  id: string;
  exercise: ExerciseId | null;
  status: AnalysisResult["status"];
  result: AnalysisResult;
  createdAt: string;
  /** true when the video file is kept in this browser (IndexedDB) for replay */
  hasLocalVideo?: boolean;
}

export interface SetLog { target: number; done: number }
export interface WorkoutLog {
  id: string;
  sessionId: string;
  week: number;
  title: string;
  items: { exerciseId: string; unit: "reps" | "seconds"; sets: SetLog[] }[];
  durationMin: number;
  createdAt: string;
}

export interface PersonalGoal { id: string; label: string; exerciseId: string; target: number; unit: "reps" | "seconds"; createdAt: string; done?: boolean }

export interface Subscription {
  status: "none" | "active" | "trialing" | "past_due" | "canceled" | "dev";
  plan?: "monthly" | "annual";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface AccountData {
  profile: Profile | null;
  program: Program | null;
  analyses: StoredAnalysis[];
  logs: WorkoutLog[];
  goals: PersonalGoal[];
  coachConsent: boolean;
  subscription: Subscription;
}

export interface User { id: string; email: string }

export const EMPTY_DATA: AccountData = { profile: null, program: null, analyses: [], logs: [], goals: [], coachConsent: false, subscription: { status: "none" } };

export const hasAccess = (s: Subscription) => s.status === "active" || s.status === "trialing" || s.status === "dev";
