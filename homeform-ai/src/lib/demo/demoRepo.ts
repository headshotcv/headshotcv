"use client";
/**
 * Isolated demonstration store: sample data under its own key, never touching real accounts
 * or the backend. Used by /demo to film the product. Reset restores the sample data.
 */
import type { Repo } from "@/lib/store/repo";
import { EMPTY_DATA, type AccountData } from "@/lib/store/types";
import { sampleAccount } from "./sampleData";

const KEY = "hf_demo_v1";
const USER = { id: "demo", email: "demo@homeform.local" };

function read(): AccountData {
  try { const v = localStorage.getItem(KEY); if (v) return { ...EMPTY_DATA, ...JSON.parse(v) }; } catch { /* */ }
  const d = sampleAccount(new Date());
  write(d);
  return d;
}
function write(d: AccountData) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* */ } }
const upd = (f: (d: AccountData) => AccountData) => write(f(read()));

export function resetDemo(empty = false) { write(empty ? { ...EMPTY_DATA, subscription: { status: "dev" } } : sampleAccount(new Date())); }

export const demoRepo: Repo = {
  mode: "local",
  async currentUser() { return USER; },
  async signUp() { return { user: USER }; },
  async signIn() { return USER; },
  async signOut() { /* no-op */ },
  async load() { return read(); },
  async saveProfile(_u, profile, program) { upd((d) => ({ ...d, profile, program })); },
  async addAnalysis(_u, a) { upd((d) => ({ ...d, analyses: [a, ...d.analyses.filter((x) => x.id !== a.id)] })); },
  async deleteAnalysis(_u, id) { upd((d) => ({ ...d, analyses: d.analyses.filter((x) => x.id !== id) })); },
  async addLog(_u, log) { upd((d) => ({ ...d, logs: [log, ...d.logs] })); },
  async saveGoals(_u, goals) { upd((d) => ({ ...d, goals })); },
  async setCoachConsent(_u, v) { upd((d) => ({ ...d, coachConsent: v })); },
  async setDevSubscription(_u, s) { upd((d) => ({ ...d, subscription: s })); },
  async deleteAccount() { resetDemo(true); },
};
