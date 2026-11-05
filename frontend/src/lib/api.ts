import "server-only";

/**
 * URL interne de l'API Express. Lue à l'exécution (et non au build) :
 * - en local : http://localhost:4000
 * - dans Docker Compose : http://backend:4000 (nom du service sur le réseau)
 */
export function backendUrl(path: string): string {
  const base = process.env.BACKEND_URL ?? "http://localhost:4000";
  return new URL(path, base).toString();
}

export type Session = {
  id: string;
  /** Slug de la formation. */
  discipline: string;
  title: string;
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start: string;
  end: string;
  format: string;
  level: string;
};

export async function getPlanning(): Promise<Session[] | null> {
  try {
    const res = await fetch(backendUrl("/api/planning"), {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sessions: Session[] };
    return data.sessions;
  } catch {
    return null;
  }
}
