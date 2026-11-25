import "server-only";
import type { Draft } from "./draft";

/**
 * Brouillons d'aperçu, gardés en mémoire du serveur : un par fenêtre d'aperçu et par administrateur, jamais visibles
 * des visiteurs. Avec plusieurs serveurs Next, l'aperçu doit rester sur le même (session collante).
 */
const MAX = 60;
const holder = globalThis as typeof globalThis & { __dfaDrafts?: Map<string, Draft> };
const drafts = (holder.__dfaDrafts ??= new Map<string, Draft>());

const key = (adminId: number, draftId: string) => `${adminId}:${draftId}`;

export function setDraft(adminId: number, draftId: string, draft: Draft) {
  const id = key(adminId, draftId);
  drafts.delete(id);
  drafts.set(id, draft);
  // Les plus anciens brouillons sont oubliés en premier.
  while (drafts.size > MAX) drafts.delete(drafts.keys().next().value!);
}

export const getDraft = (adminId: number, draftId: string): Draft => drafts.get(key(adminId, draftId)) ?? {};
