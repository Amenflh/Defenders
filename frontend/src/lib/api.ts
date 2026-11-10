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
