"use client";
import { EMPTY_DATA, type AccountData, type PersonalGoal, type StoredAnalysis, type Subscription, type User, type WorkoutLog } from "./types";
import type { Profile, Program } from "@/lib/program/generate";
import { isSupabaseConfigured, LOCAL_SESSION_COOKIE } from "@/lib/supabase/config";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface Repo {
  mode: "local" | "supabase";
  currentUser(): Promise<User | null>;
  signUp(email: string, password: string): Promise<{ user: User | null; needsConfirmation?: boolean }>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  load(user: User): Promise<AccountData>;
  saveProfile(user: User, profile: Profile, program: Program): Promise<void>;
  addAnalysis(user: User, a: StoredAnalysis): Promise<void>;
  deleteAnalysis(user: User, id: string): Promise<void>;
  addLog(user: User, log: WorkoutLog): Promise<void>;
  saveGoals(user: User, goals: PersonalGoal[]): Promise<void>;
  setCoachConsent(user: User, v: boolean): Promise<void>;
  setDevSubscription(user: User, s: Subscription): Promise<void>;
  deleteAccount(user: User): Promise<void>;
}

/* ----------------------------- Local mode ------------------------------ */
// Development / preview without Supabase. Data lives in this browser only.
const LK = { users: "hf_local_users", session: "hf_local_uid", data: (id: string) => `hf_local_data_${id}` };
const lread = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const lwrite = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ } };

async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
function setCookie(v: string | null) {
  document.cookie = v ? `${LOCAL_SESSION_COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax` : `${LOCAL_SESSION_COOKIE}=; path=/; max-age=0`;
}

const localRepo: Repo = {
  mode: "local",
  async currentUser() {
    const id = lread<string | null>(LK.session, null);
    const u = lread<Record<string, { id: string; email: string; hash: string }>>(LK.users, {});
    const found = Object.values(u).find((x) => x.id === id);
    if (!found) { setCookie(null); return null; }
    setCookie(found.id);
    return { id: found.id, email: found.email };
  },
  async signUp(email, password) {
    const users = lread<Record<string, { id: string; email: string; hash: string }>>(LK.users, {});
    const key = email.trim().toLowerCase();
    if (users[key]) throw new Error("Un compte existe déjà avec cet e-mail.");
    const id = `local_${crypto.randomUUID()}`;
    users[key] = { id, email: key, hash: await sha(password + key) };
    lwrite(LK.users, users);
    lwrite(LK.session, id);
    setCookie(id);
    return { user: { id, email: key } };
  },
  async signIn(email, password) {
    const users = lread<Record<string, { id: string; email: string; hash: string }>>(LK.users, {});
    const key = email.trim().toLowerCase();
    const u = users[key];
    if (!u || u.hash !== (await sha(password + key))) throw new Error("E-mail ou mot de passe incorrect.");
    lwrite(LK.session, u.id);
    setCookie(u.id);
    return { id: u.id, email: u.email };
  },
  async signOut() { localStorage.removeItem(LK.session); setCookie(null); },
  async load(user) { return { ...EMPTY_DATA, ...lread<Partial<AccountData>>(LK.data(user.id), {}) }; },
  async saveProfile(user, profile, program) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, profile, program }); },
  async addAnalysis(user, a) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, analyses: [a, ...d.analyses.filter((x) => x.id !== a.id)] }); },
  async deleteAnalysis(user, id) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, analyses: d.analyses.filter((x) => x.id !== id) }); },
  async addLog(user, log) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, logs: [log, ...d.logs] }); },
  async saveGoals(user, goals) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, goals }); },
  async setCoachConsent(user, v) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, coachConsent: v }); },
  async setDevSubscription(user, s) { const d = await this.load(user); lwrite(LK.data(user.id), { ...d, subscription: s }); },
  async deleteAccount(user) {
    localStorage.removeItem(LK.data(user.id));
    const users = lread<Record<string, { id: string }>>(LK.users, {});
    for (const k of Object.keys(users)) if (users[k].id === user.id) delete users[k];
    lwrite(LK.users, users);
    await this.signOut();
  },
};

/* ---------------------------- Supabase mode ---------------------------- */
const sb = () => supabaseBrowser();
function check<T>(r: { data: T; error: { message: string } | null }): T { if (r.error) throw new Error(r.error.message); return r.data; }

const supabaseRepo: Repo = {
  mode: "supabase",
  async currentUser() {
    const { data } = await sb().auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  },
  async signUp(email, password) {
    const { data, error } = await sb().auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/app` } });
    if (error) throw new Error(error.message);
    if (!data.session) return { user: null, needsConfirmation: true };
    return { user: { id: data.user!.id, email: data.user!.email ?? email } };
  },
  async signIn(email, password) {
    const { data, error } = await sb().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou mot de passe incorrect." : error.message);
    return { id: data.user.id, email: data.user.email ?? email };
  },
  async signOut() { await sb().auth.signOut(); },
  async load(user) {
    const [p, a, l, g, s] = await Promise.all([
      sb().from("profiles").select("profile, program, coach_consent, goals").eq("id", user.id).maybeSingle(),
      sb().from("analyses").select("id, exercise, status, result, has_local_video, created_at").order("created_at", { ascending: false }).limit(100),
      sb().from("workout_logs").select("id, log, created_at").order("created_at", { ascending: false }).limit(500),
      Promise.resolve(null),
      sb().from("subscriptions").select("status, plan, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle(),
    ]);
    void g;
    const prof = check(p) as { profile: Profile | null; program: Program | null; coach_consent: boolean; goals: PersonalGoal[] | null } | null;
    const sub = check(s) as { status: Subscription["status"]; plan: Subscription["plan"]; current_period_end: string | null; cancel_at_period_end: boolean } | null;
    return {
      profile: prof?.profile ?? null,
      program: prof?.program ?? null,
      coachConsent: prof?.coach_consent ?? false,
      goals: prof?.goals ?? [],
      analyses: (check(a) as { id: string; exercise: StoredAnalysis["exercise"]; status: StoredAnalysis["status"]; result: StoredAnalysis["result"]; has_local_video: boolean; created_at: string }[]).map((x) => ({ id: x.id, exercise: x.exercise, status: x.status, result: x.result, createdAt: x.created_at, hasLocalVideo: x.has_local_video })),
      logs: (check(l) as { id: string; log: WorkoutLog; created_at: string }[]).map((x) => ({ ...x.log, id: x.id, createdAt: x.created_at })),
      subscription: sub ? { status: sub.status, plan: sub.plan, currentPeriodEnd: sub.current_period_end ?? undefined, cancelAtPeriodEnd: sub.cancel_at_period_end } : { status: "none" },
    };
  },
  async saveProfile(user, profile, program) { check(await sb().from("profiles").upsert({ id: user.id, profile, program, updated_at: new Date().toISOString() })); },
  async addAnalysis(user, a) { check(await sb().from("analyses").upsert({ id: a.id, user_id: user.id, exercise: a.exercise, status: a.status, result: a.result, has_local_video: !!a.hasLocalVideo, created_at: a.createdAt })); },
  async deleteAnalysis(_u, id) { check(await sb().from("analyses").delete().eq("id", id)); },
  async addLog(user, log) { check(await sb().from("workout_logs").insert({ id: log.id, user_id: user.id, log, created_at: log.createdAt })); },
  async saveGoals(user, goals) { check(await sb().from("profiles").upsert({ id: user.id, goals })); },
  async setCoachConsent(user, v) { check(await sb().from("profiles").upsert({ id: user.id, coach_consent: v })); },
  async setDevSubscription() { throw new Error("Indisponible en production."); },
  async deleteAccount() {
    const r = await fetch("/api/account", { method: "DELETE" });
    if (!r.ok) throw new Error("La suppression du compte a échoué. Contacte le support.");
    await sb().auth.signOut();
  },
};

export const repo: Repo = isSupabaseConfigured ? supabaseRepo : localRepo;
