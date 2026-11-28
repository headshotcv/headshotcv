import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Visible whenever the app runs without a real backend, so nobody mistakes it for production. */
export function LocalModeBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="border-b border-amber-300/30 bg-amber-300/[0.07] px-4 py-2 text-center text-xs text-amber-100">
      Mode local de développement : comptes et données stockés uniquement dans ce navigateur. Configure Supabase et Stripe pour la production.
    </div>
  );
}
