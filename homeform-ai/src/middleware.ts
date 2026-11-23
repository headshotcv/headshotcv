import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, LOCAL_SESSION_COOKIE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const PROTECTED = ["/app", "/abonnement"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const needsAuth = PROTECTED.some((p) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(`${p}/`));
  let authed = false;

  if (isSupabaseConfigured) {
    const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    const { data } = await sb.auth.getUser(); // refreshes the session cookie
    authed = !!data.user;
  } else {
    authed = !!req.cookies.get(LOCAL_SESSION_COOKIE)?.value;
  }

  if (needsAuth && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|mediapipe|models|icon.svg|api/stripe/webhook).*)"],
};
