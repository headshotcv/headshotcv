import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { COACH_SYSTEM } from "@/lib/coach/prompt";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/auth/server";

export const runtime = "nodejs";

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) })).min(1).max(30),
  // Only sent when the user has consented to share their training data with the coach.
  context: z.string().max(6000).optional(),
});

// Best-effort per-instance rate limit (use a shared store such as Upstash in production).
const hits = new Map<string, number[]>();
function limited(key: string, max = 20, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Le coach IA n'est pas encore configuré sur ce site." }, { status: 503 });
  }
  let key = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (isSupabaseConfigured) {
    const user = await requireUser();
    if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
    const { data: sub } = await user.sb.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
    if (!sub || !["active", "trialing"].includes(sub.status)) return Response.json({ error: "Abonnement requis." }, { status: 402 });
    key = user.id;
  }
  if (limited(key)) return Response.json({ error: "Trop de messages pour le moment. Réessaie dans un moment." }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.messages[0].role !== "user") return Response.json({ error: "Requête invalide." }, { status: 400 });

  const client = new Anthropic();
  const system = parsed.data.context
    ? `${COACH_SYSTEM}\n\n<contexte_utilisateur>\n${parsed.data.context}\n</contexte_utilisateur>`
    : `${COACH_SYSTEM}\n\nL'utilisateur n'a pas partagé ses données d'entraînement : pose-lui des questions si nécessaire.`;

  const stream = client.beta.messages.stream({
    model: process.env.COACH_MODEL || "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") controller.enqueue(encoder.encode(event.delta.text));
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\nJe ne peux pas répondre à cette demande. Pose-moi une question sur ton entraînement à la maison."));
        if (final.stop_reason === "max_tokens") controller.enqueue(encoder.encode("…"));
      } catch (e) {
        const msg = e instanceof Anthropic.RateLimitError ? "Le coach est très sollicité, réessaie dans une minute." : "Le coach est momentanément indisponible.";
        controller.enqueue(encoder.encode(`\n\n[${msg}]`));
      } finally {
        controller.close();
      }
    },
    cancel() { stream.abort(); },
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
