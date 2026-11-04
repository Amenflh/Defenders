/**
 * Erreurs HTTP de l'application (issue #24).
 * Lancées depuis les services / contrôleurs, converties en réponse JSON par le middleware d'erreurs.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Erreurs par champ, renvoyées telles quelles au client (formulaires). */
    readonly fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requête invalide") {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentification requise") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Accès refusé") {
    super(403, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Ressource introuvable") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(409, message, fieldErrors);
  }
}

export class ValidationError extends HttpError {
  constructor(fieldErrors: Record<string, string[] | undefined>, message = "Données invalides") {
    super(422, message, fieldErrors);
  }
}
