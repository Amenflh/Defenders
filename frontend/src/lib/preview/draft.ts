import type { Locale } from "../i18n/config";

/** Modifications pas encore enregistrées, visibles seulement dans l'aperçu de leur auteur. */
export type DraftItems = Record<string, Record<string, unknown>>;
export type Draft = {
  texts?: Partial<Record<Locale, Record<string, string>>>;
  settings?: Record<string, unknown>;
  /** Identifiant (« new » : pas encore créé) → champs modifiés. */
  formations?: DraftItems;
  history?: DraftItems;
  trainers?: DraftItems;
  cms?: DraftItems;
  media?: DraftItems;
};

type Item = Record<string, unknown> & { id: number; position?: number };
const LEVELS: Record<string, string> = { tous_niveaux: "Tous niveaux", debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };
const NEW_ID = 0;

/** Liste publique avec les modifications : éléments changés, ajoutés, masqués ou supprimés, dans le bon ordre. */
function patchList(list: Item[], drafts: DraftItems | undefined, visible: (item: Item) => boolean, order: (a: Item, b: Item) => number): Item[] {
  if (!drafts || Object.keys(drafts).length === 0) return list;
  const items = list.map((item) => ({ ...item, ...drafts[String(item.id)] }));
  const known = new Set(list.map((item) => String(item.id)));
  for (const [id, draft] of Object.entries(drafts)) if (!known.has(id)) items.push({ ...draft, id: id === "new" ? NEW_ID : Number(id) } as Item);
  return items.filter((item) => item.deleted !== true && visible(item)).sort(order);
}

const byPosition = (a: Item, b: Item) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id;
const text = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Champs attendus par la page, même pour une formation pas encore enregistrée. */
function completeFormation(f: Item): Item {
  const lists = { intro: [], objectives: [], prerequisites: [], audience: [], careers: [], modules: [], facts: [], galleryUrls: [], videos: [], media: [], sessions: [], trainers: [] };
  const base = { name: "", slug: "", headline: "", summary: "", durationLabel: null, priceTnd: null, accent: "gold", academy: "fitness", location: "", practical: "", contactPhone: "", sourceUrl: "", coverUrl: null, coverIsPoster: false, translations: {}, nextSessionDate: null, level: null, updatedAt: new Date(0).toISOString() };
  return { ...base, ...lists, ...f, levelLabel: f.level ? LEVELS[text(f.level)] ?? null : null } as Item;
}

/**
 * Réponse publique de l'API (statut, corps) modifiée par le brouillon. Une formation inconnue (404) mais présente
 * dans le brouillon est renvoyée comme si elle existait.
 */
export function applyDraft(path: string, status: number, body: unknown, draft: Draft, allTrainers: Item[] = []): { status: number; body: unknown } {
  const url = new URL(path, "http://draft");
  const query = (key: string) => url.searchParams.get(key);
  const data = (body ?? {}) as Record<string, unknown>;
  const list = (key: string) => (data[key] as Item[] | undefined) ?? [];
  const inAcademy = (item: Item) => !query("academy") || item.academy === query("academy") || item.academy === null || item.academy === undefined || item.academy === "";

  switch (true) {
    case url.pathname === "/api/content/settings/site":
      return { status, body: { value: { ...(data.value as object), ...draft.settings } } };
    case url.pathname === "/api/content/settings/texts":
      return { status, body: { value: draft.texts ?? data.value ?? {} } };
    case url.pathname.startsWith("/api/content/items/"): {
      const section = url.pathname.split("/").pop();
      return { status, body: { items: patchList(list("items"), draft.cms, (c) => c.section === section && c.active !== false, byPosition) } };
    }
    case url.pathname === "/api/formations": {
      // La formation en cours de modification est montrée même en brouillon.
      // Création : une fois enregistrée, la formation est déjà dans la liste (même adresse).
      const saved = new Set(list("formations").map((f) => f.slug));
      const items = patchList(list("formations"), draft.formations, (f) => f.id !== NEW_ID || !saved.has(f.slug), (a, b) => (a.position ?? 0) - (b.position ?? 0) || text(a.name).localeCompare(text(b.name)));
      return { status, body: { formations: items.map(completeFormation) } };
    }
    case url.pathname.startsWith("/api/formations/"): {
      const slug = decodeURIComponent(url.pathname.split("/").pop() ?? "");
      const current = data.formation as Item | undefined;
      const entry = Object.entries(draft.formations ?? {}).find(([id, f]) => (current ? String(current.id) === id : f.slug === slug));
      if (!entry) return { status, body };
      const merged = completeFormation({ ...current, ...entry[1], id: current?.id ?? (entry[0] === "new" ? NEW_ID : Number(entry[0])) } as Item);
      const ids = entry[1].trainerIds as number[] | undefined;
      if (ids) merged.trainers = allTrainers.filter((t) => ids.includes(t.id));
      return { status: 200, body: { formation: merged } };
    }
    case url.pathname === "/api/history":
      return { status, body: { entries: patchList(list("entries"), draft.history, (h) => h.active !== false && inAcademy(h), (a, b) => (a.position ?? 0) - (b.position ?? 0) || text(b.date).localeCompare(text(a.date)) || a.id - b.id) } };
    case url.pathname === "/api/trainers":
      return { status, body: { trainers: patchList(list("trainers"), draft.trainers, (t) => t.active !== false && inAcademy(t), byPosition).map((t) => ({ formations: [], ...t })) } };
    case url.pathname === "/api/media": {
      const matches = (m: Item) => inAcademy(m) && (!query("category") || m.category === query("category")) && (!query("type") || m.type === query("type"));
      return { status, body: { media: patchList(list("media"), draft.media, matches, (a, b) => (a.position ?? 0) - (b.position ?? 0)) } };
    }
    default:
      return { status, body };
  }
}
