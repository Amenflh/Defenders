import type { RequestHandler } from "express";
import { z } from "zod";
import { type HttpError, ValidationError } from "../lib/errors.js";

type Part = "params" | "query" | "body";
type Schemas = Partial<Record<Part, z.ZodType>>;

declare module "express-serve-static-core" {
  interface Request {
    /** Données validées par le middleware `validate` (à typer avec z.infer dans le contrôleur). */
    valid: Partial<Record<Part, unknown>>;
  }
}

/**
 * Valide params / query / body avec des schémas Zod réutilisables (issue #25).
 * Échec → 422 avec les erreurs par champ. Succès → valeurs nettoyées dans `req.valid`.
 */
export function validate(schemas: Schemas, onError?: () => HttpError): RequestHandler {
  return (req, _res, next) => {
    const valid: Partial<Record<Part, unknown>> = {};
    const errors: Record<string, string[] | undefined> = {};

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part] ?? {});
      if (result.success) valid[part] = result.data;
      else Object.assign(errors, z.flattenError(result.error).fieldErrors);
    }

    if (Object.keys(errors).length > 0) return next(onError ? onError() : new ValidationError(errors));
    req.valid = valid;
    next();
  };
}
