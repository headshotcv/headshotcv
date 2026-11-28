"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { repo as defaultRepo, type Repo } from "./repo";
import { EMPTY_DATA, type AccountData, type User } from "./types";

interface Ctx {
  user: User | null;
  data: AccountData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  repo: Repo;
  /** "/app" for real accounts, "/demo" for the isolated demonstration */
  base: string;
  demo: boolean;
}
const AccountCtx = createContext<Ctx | null>(null);

export function AccountProvider({ children, repo = defaultRepo, base = "/app", demo = false }: { children: React.ReactNode; repo?: Repo; base?: string; demo?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AccountData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const u = await repo.currentUser();
      setUser(u);
      setData(u ? await repo.load(u) : EMPTY_DATA);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [repo]);
  useEffect(() => { refresh(); }, [refresh]);
  return <AccountCtx.Provider value={{ user, data, loading, error, refresh, repo, base, demo }}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const c = useContext(AccountCtx);
  if (!c) throw new Error("useAccount must be used within AccountProvider");
  return c;
}
