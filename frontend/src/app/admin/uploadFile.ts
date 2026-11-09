/**
 * Envoi d'un fichier du tableau de bord vers l'API (/api/admin/uploads), depuis le navigateur.
 * Passe par la route en flux continu /admin/medias/upload : pas de limite de taille des Server Actions
 * (6 Mo) ni de délai de 8 s, contrairement à un envoi par Server Action.
 */
export async function uploadFile(file: File): Promise<{ ok: boolean; file?: { url: string; type: string }; error?: string }> {
  const formData = new FormData();
  formData.set("file", file);
  try {
    const res = await fetch("/admin/medias/upload?type=cms", { method: "POST", body: formData });
    const data = (await res.json().catch(() => ({}))) as { file?: { url: string; type: string }; error?: string; errors?: Record<string, string[]> };
    if (!res.ok) return { ok: false, error: Object.values(data.errors ?? {})[0]?.[0] ?? data.error };
    return { ok: true, file: data.file };
  } catch {
    return { ok: false, error: "Connexion interrompue pendant l'envoi." };
  }
}
