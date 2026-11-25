"use server";

import type { Draft } from "@/lib/preview/draft";
import { setDraft } from "@/lib/preview/store";
import { getCurrentUser } from "@/lib/session";

/** Enregistre (en mémoire) les modifications en cours, pour l'aperçu de leur auteur uniquement. */
export async function setPreviewDraftAction(draftId: string, draft: Draft): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user === "unavailable" || user.role !== "admin" || !/^[\w-]{1,40}$/.test(draftId)) return false;
  setDraft(user.id, draftId, draft);
  return true;
}
