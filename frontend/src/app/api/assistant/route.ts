import { answer, type Turn } from "@/lib/assistant/engine";
import { getLocale } from "@/lib/i18n/server";

/**
 * Assistant de recherche du site (sans IA, sans service externe) : la réponse est extraite
 * des contenus du site et du catalogue publié, voir lib/assistant/engine.ts.
 */

const MAX_TURNS = 12;
const MAX_CHARS = 1200;
/** Limite par adresse IP (mémoire du processus) : 60 questions par tranche de 10 minutes. */
const RATE_LIMIT = { max: 60, windowMs: 10 * 60_000 };
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);
  const limited = recent.length >= RATE_LIMIT.max;
  if (!limited) recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(ip, recent);
  return limited;
}

/** Historique valide : rôles connus, textes non vides, dernière entrée = question du visiteur. */
function parseTurns(body: unknown): Turn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: Turn[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const { role, content } = (item ?? {}) as Partial<Turn>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    if (role === "user" && content.length > MAX_CHARS) return null;
    const text = content.trim().slice(0, MAX_CHARS * 4);
    if (text) turns.push({ role, content: text });
  }
  return turns.at(-1)?.role === "user" ? turns : null;
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) return Response.json({ error: "rate_limited" }, { status: 429 });

  let turns: Turn[] | null = null;
  try {
    turns = parseTurns(await request.json());
  } catch {
    turns = null;
  }
  if (!turns) return Response.json({ error: "invalid" }, { status: 400 });

  try {
    const text = await answer(turns, await getLocale());
    return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[assistant]", error);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
