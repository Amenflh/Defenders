import { z } from "zod";
import { config } from "../../config.js";
import { loginSchema, registerSchema } from "../auth/auth.schemas.js";
import { createFormationSchema, updateFormationSchema } from "../formations/formations.schemas.js";
import { updateMediaSchema } from "../media/media.schemas.js";
import { createRegistrationSchema, updateStatusSchema } from "../registrations/registrations.schemas.js";

/**
 * Documentation OpenAPI 3.1 de l'API (issue #26), servie sur /api/docs.
 * Les schémas des corps de requête sont générés à partir des schémas Zod de validation :
 * la documentation reste alignée sur le code.
 */

type Schema = Record<string, unknown>;

/** Schéma Zod → JSON Schema (forme attendue en entrée). */
function fromZod(schema: z.ZodType): Schema {
  const { $schema: _ignored, ...json } = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Schema;
  return json;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: Schema, example?: unknown) => ({ "application/json": { schema, ...(example !== undefined ? { example } : {}) } });
const ok = (description: string, schema: Schema, example?: unknown) => ({ description, content: json(schema, example) });
const error = (description: string, example?: unknown) => ({ description, content: json(ref("Error"), example) });

const E = {
  400: error("Requête invalide", { error: "Requête invalide" }),
  401: error("Non connecté, jeton invalide, expiré ou révoqué", { error: "Authentification requise" }),
  403: error("Rôle insuffisant (réservé aux administrateurs)", { error: "Accès réservé aux administrateurs" }),
  404: error("Ressource introuvable", { error: "Formation introuvable" }),
  409: error("Conflit (doublon, suppression impossible)", { error: "Cet identifiant d'URL est déjà utilisé", errors: { slug: ["Cet identifiant d'URL est déjà utilisé par une autre formation"] } }),
  413: error("Fichier ou corps de requête trop volumineux", { error: "Fichier trop volumineux : 5 Mo maximum" }),
  422: error("Données invalides : erreurs par champ", { error: "Données invalides", errors: { email: ["Adresse e-mail invalide"] } }),
  429: error("Trop de requêtes (limite par adresse IP)", { error: "Trop de tentatives. Réessayez dans 15 minutes." }),
};

const admin = { security: [{ bearerAuth: [] }] };
const idParam = (name = "id") => ({ name, in: "path", required: true, schema: { type: "integer", minimum: 1 } });

const formationExample = {
  id: 2,
  slug: "football",
  name: "Football",
  headline: "Formation d'entraîneur de football",
  summary: "Une formation intensive pour encadrer, préparer et faire progresser des joueurs.",
  durationLabel: "4 jours intensifs",
  priceTnd: 850,
  status: "published",
  position: 2,
  level: "intermediaire",
  levelLabel: "Intermédiaire",
  intro: ["Entraîner, c'est transmettre une méthode."],
  objectives: ["Planifier une saison, un cycle et une séance d'entraînement"],
  prerequisites: [],
  audience: ["Éducateurs et entraîneurs en activité"],
  careers: ["Entraîneur ou éducateur en club"],
  modules: [{ title: "Méthodologie", text: "Objectifs, contenus et progression d'une séance." }],
  facts: [{ label: "Durée", value: "4 jours intensifs" }],
  coverUrl: null,
  updatedAt: "2026-11-05T09:00:00.000Z",
};

const sessionExample = { id: "5", discipline: "football", title: "Méthodologie de l'entraînement", day: 1, start: "14:00", end: "16:00", format: "Théorie", level: "Tous niveaux" };
const mediaExample = { id: 12, type: "image", url: "/uploads/images/3f2a9c1e-7b4d-4e2a-9f1c-2d8e6a5b4c3d.jpg", title: "Promotion 2026", category: "promotions", mimeType: "image/jpeg", sizeBytes: 248000, createdAt: "2026-11-05T09:00:00.000Z", formation: { id: 1, slug: "pilates", name: "Pilates" } };

function uploadBody(kind: "image" | "video") {
  const formats = kind === "image" ? "JPG, PNG ou WebP" : "MP4 ou WebM";
  const max = kind === "image" ? config.uploads.maxImageMb : config.uploads.maxVideoMb;
  return {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          required: ["file"],
          properties: {
            file: { type: "string", format: "binary", description: `${formats}, ${max} Mo maximum. Le contenu réel du fichier est vérifié.` },
            title: { type: "string", maxLength: 120, description: "Titre affiché (par défaut : nom du fichier)" },
            category: { type: "string", maxLength: 40, description: "Catégorie de galerie (ex. promotions, terrain)" },
            formationId: { type: "integer", description: "Formation associée (facultatif)" },
          },
        },
      },
    },
  };
}

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "API Defenders Fitness Academy",
      version: "1.0.0",
      description: [
        "API du site Defenders Fitness Academy : formations, planning, inscriptions, médias et comptes.",
        "",
        "**Authentification** : `POST /api/auth/login` renvoie un **JWT** (HS256) à envoyer dans l'en-tête",
        "`Authorization: Bearer <jeton>`. Le jeton expire après " + config.sessionTtlHours + " h et est révoqué par `POST /api/auth/logout`.",
        "Cliquez sur **Authorize** pour tester les routes protégées.",
        "",
        "**Erreurs** : toujours `{ \"error\": \"message\", \"errors\": { \"champ\": [\"…\"] } }` (`errors` seulement en cas de validation).",
      ].join("\n"),
    },
    servers: [{ url: "/", description: "Ce serveur" }],
    tags: [
      { name: "Santé" },
      { name: "Authentification", description: "Comptes clients et administrateurs, jetons JWT" },
      { name: "Formations", description: "Lecture publique des formations publiées" },
      { name: "Planning", description: "Créneaux (sessions) de formation" },
      { name: "Inscriptions", description: "Demandes d'inscription (formulaire de contact)" },
      { name: "Médias", description: "Galerie d'images et de vidéos" },
      { name: "Admin · Formations" },
      { name: "Admin · Inscriptions" },
      { name: "Admin · Médias" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Jeton obtenu par POST /api/auth/login" },
      },
      schemas: {
        Error: {
          type: "object",
          required: ["error"],
          properties: { error: { type: "string" }, errors: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } } },
        },
        User: {
          type: "object",
          properties: { id: { type: "integer" }, email: { type: "string" }, name: { type: "string" }, phone: { type: "string" }, role: { type: "string", enum: ["admin", "client"] } },
        },
        Session: {
          type: "object",
          properties: { token: { type: "string", description: "JWT signé" }, expiresAt: { type: "string", format: "date-time" }, user: ref("User") },
        },
        Formation: { type: "object", description: "Formation et son contenu détaillé", example: formationExample },
        FormationDetail: {
          allOf: [
            ref("Formation"),
            {
              type: "object",
              properties: {
                trainers: { type: "array", items: { type: "object" } },
                media: { type: "array", items: ref("Media") },
                sessions: { type: "array", items: ref("PlanningSession") },
              },
            },
          ],
        },
        PlanningSession: { type: "object", example: sessionExample },
        Media: { type: "object", example: mediaExample },
        Registration: { type: "object" },
        LoginInput: fromZod(loginSchema),
        RegisterInput: fromZod(registerSchema),
        FormationInput: fromZod(createFormationSchema),
        FormationUpdate: fromZod(updateFormationSchema),
        RegistrationInput: fromZod(createRegistrationSchema),
        RegistrationStatusUpdate: fromZod(updateStatusSchema),
        MediaUpdate: fromZod(updateMediaSchema),
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Santé"],
          summary: "État du service et de la base PostgreSQL",
          responses: {
            200: ok("Service opérationnel", { type: "object" }, { status: "ok", uptime: 120, database: { status: "up", name: "defenders_dev", version: "17.11", latencyMs: 1 } }),
            503: ok("Base de données indisponible", { type: "object" }, { status: "degraded", uptime: 120, database: { status: "down" } }),
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentification"],
          summary: "Connexion (admin ou client)",
          description: "Limité à 5 échecs / 15 min / IP. Message volontairement générique en cas d'échec.",
          requestBody: { required: true, content: json(ref("LoginInput"), { email: "admin@exemple.tn", password: "MotDePasse123" }) },
          responses: { 200: ok("Connecté : JWT et utilisateur", ref("Session")), 400: E[400], 401: error("Identifiants incorrects", { error: "Identifiants incorrects" }), 429: E[429] },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Authentification"],
          summary: "Création d'un compte client",
          description: "Ne peut jamais créer d'administrateur. Limité à 10 comptes / heure / IP.",
          requestBody: { required: true, content: json(ref("RegisterInput"), { name: "Sami Ben Ali", email: "sami@exemple.tn", phone: "+216 22 123 456", password: "MotDePasse123" }) },
          responses: { 201: ok("Compte créé et connecté", ref("Session")), 409: E[409], 422: E[422], 429: E[429] },
        },
      },
      "/api/auth/me": {
        get: { tags: ["Authentification"], summary: "Utilisateur connecté", ...admin, responses: { 200: ok("Utilisateur", { type: "object", properties: { user: ref("User") } }), 401: E[401] } },
      },
      "/api/auth/logout": {
        post: { tags: ["Authentification"], summary: "Déconnexion : révoque le jeton", ...admin, responses: { 204: { description: "Session révoquée" } } },
      },

      "/api/formations": {
        get: {
          tags: ["Formations"],
          summary: "Formations publiées",
          responses: { 200: ok("Liste ordonnée", { type: "object", properties: { formations: { type: "array", items: ref("Formation") } } }) },
        },
      },
      "/api/formations/{slug}": {
        get: {
          tags: ["Formations"],
          summary: "Détail d'une formation publiée",
          description: "Contenu, formateurs, médias associés et créneaux de la période en cours.",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" }, example: "football" }],
          responses: { 200: ok("Formation", { type: "object", properties: { formation: ref("FormationDetail") } }), 404: E[404] },
        },
      },

      "/api/planning": {
        get: {
          tags: ["Planning"],
          summary: "Créneaux hebdomadaires de la période en cours",
          parameters: [{ name: "discipline", in: "query", schema: { type: "string" }, description: "Slug d'une formation publiée", example: "pilates" }],
          responses: { 200: ok("Créneaux triés par jour et heure", { type: "object", properties: { sessions: { type: "array", items: ref("PlanningSession") } } }), 400: E[400] },
        },
      },

      "/api/contact": {
        post: {
          tags: ["Inscriptions"],
          summary: "Envoyer une demande d'inscription",
          description:
            "Enregistre la demande (rattachée au compte si un client est connecté), puis envoie un e-mail à l'équipe et un accusé de réception au candidat. " +
            "Pièce jointe facultative en base64 (PDF, JPG, PNG — 5 Mo). Limité à 10 envois / 15 min / IP.",
          requestBody: {
            required: true,
            content: json(ref("RegistrationInput"), {
              firstName: "Sami",
              lastName: "Ben Ali",
              email: "sami@exemple.tn",
              phone: "+216 22 123 456",
              city: "Nabeul",
              profile: "jeune-diplome",
              trainings: ["pilates"],
              availability: "intensif",
              message: "Quelles sont les prochaines dates ?",
              consent: true,
            }),
          },
          responses: { 201: ok("Demande enregistrée", { type: "object" }, { ok: true, id: "3f2a9c1e-7b4d-4e2a-9f1c-2d8e6a5b4c3d" }), 413: E[413], 422: E[422], 429: E[429] },
        },
      },
      "/api/me/inscriptions": {
        get: { tags: ["Inscriptions"], summary: "Mes demandes d'inscription (client connecté)", ...admin, responses: { 200: ok("Demandes", { type: "object" }), 401: E[401] } },
      },

      "/api/media": {
        get: {
          tags: ["Médias"],
          summary: "Galerie publique",
          parameters: [
            { name: "type", in: "query", schema: { type: "string", enum: ["image", "video"] } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "formation", in: "query", schema: { type: "string" }, description: "Slug de formation" },
          ],
          responses: { 200: ok("Médias, du plus récent au plus ancien", { type: "object", properties: { media: { type: "array", items: ref("Media") } } }), 400: E[400] },
        },
      },

      "/api/admin/formations": {
        get: {
          tags: ["Admin · Formations"],
          summary: "Toutes les formations (tous statuts)",
          ...admin,
          parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } }],
          responses: { 200: ok("Formations avec nombre d'inscriptions et de créneaux", { type: "object" }), 401: E[401], 403: E[403] },
        },
        post: {
          tags: ["Admin · Formations"],
          summary: "Créer une formation",
          description: "Seuls `slug` et `name` sont obligatoires. Une nouvelle formation est un brouillon (`draft`) par défaut.",
          ...admin,
          requestBody: { required: true, content: json(ref("FormationInput"), { slug: "preparation-physique", name: "Préparation physique", headline: "Devenez préparateur physique", objectives: ["Planifier une préparation"], level: "intermediaire", priceTnd: 850 }) },
          responses: { 201: ok("Formation créée", { type: "object", properties: { formation: ref("Formation") } }), 401: E[401], 403: E[403], 409: E[409], 422: E[422] },
        },
      },
      "/api/admin/formations/{id}": {
        parameters: [idParam()],
        get: { tags: ["Admin · Formations"], summary: "Détail (tous statuts)", ...admin, responses: { 200: ok("Formation", { type: "object", properties: { formation: ref("Formation") } }), 401: E[401], 403: E[403], 404: E[404] } },
        patch: {
          tags: ["Admin · Formations"],
          summary: "Modifier une formation (partiel)",
          description: "Seuls les champs envoyés sont modifiés. Archiver : `{ \"status\": \"archived\" }`.",
          ...admin,
          requestBody: { required: true, content: json(ref("FormationUpdate"), { status: "published", summary: "Nouveau résumé" }) },
          responses: { 200: ok("Formation modifiée", { type: "object", properties: { formation: ref("Formation") } }), 401: E[401], 403: E[403], 404: E[404], 409: E[409], 422: E[422] },
        },
        delete: {
          tags: ["Admin · Formations"],
          summary: "Supprimer une formation",
          description: "Refusé (409) si des demandes d'inscription y font référence : l'archiver à la place.",
          ...admin,
          responses: { 204: { description: "Supprimée" }, 401: E[401], 403: E[403], 404: E[404], 409: E[409] },
        },
      },

      "/api/admin/contacts": {
        get: {
          tags: ["Admin · Inscriptions"],
          summary: "Demandes d'inscription",
          ...admin,
          parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["nouveau", "contacte", "inscrit", "archive"] } }],
          responses: { 200: ok("Demandes et compteurs par statut", { type: "object" }), 400: E[400], 401: E[401], 403: E[403] },
        },
      },
      "/api/admin/contacts/{id}": {
        patch: {
          tags: ["Admin · Inscriptions"],
          summary: "Changer le statut d'une demande",
          ...admin,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: { required: true, content: json(ref("RegistrationStatusUpdate"), { status: "contacte" }) },
          responses: { 200: ok("Demande modifiée", { type: "object" }), 400: E[400], 401: E[401], 403: E[403], 404: E[404] },
        },
      },

      "/api/admin/media": {
        get: { tags: ["Admin · Médias"], summary: "Tous les médias", ...admin, responses: { 200: ok("Médias", { type: "object" }), 401: E[401], 403: E[403] } },
      },
      "/api/admin/media/images": {
        post: {
          tags: ["Admin · Médias"],
          summary: "Téléverser une image",
          ...admin,
          requestBody: uploadBody("image"),
          responses: { 201: ok("Image enregistrée", { type: "object", properties: { media: ref("Media") } }, { media: mediaExample }), 401: E[401], 403: E[403], 413: E[413], 422: E[422] },
        },
      },
      "/api/admin/media/videos": {
        post: {
          tags: ["Admin · Médias"],
          summary: "Téléverser une vidéo",
          ...admin,
          requestBody: uploadBody("video"),
          responses: { 201: ok("Vidéo enregistrée", { type: "object", properties: { media: ref("Media") } }), 401: E[401], 403: E[403], 413: E[413], 422: E[422] },
        },
      },
      "/api/admin/media/{id}": {
        parameters: [idParam()],
        patch: {
          tags: ["Admin · Médias"],
          summary: "Modifier titre, catégorie ou formation",
          ...admin,
          requestBody: { required: true, content: json(ref("MediaUpdate"), { title: "Promotion 2026", category: "promotions", formationId: 1 }) },
          responses: { 200: ok("Média modifié", { type: "object", properties: { media: ref("Media") } }), 401: E[401], 403: E[403], 404: E[404], 422: E[422] },
        },
        delete: { tags: ["Admin · Médias"], summary: "Supprimer un média et son fichier", ...admin, responses: { 204: { description: "Supprimé" }, 401: E[401], 403: E[403], 404: E[404] } },
      },
    },
  };
}
