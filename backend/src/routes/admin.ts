import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../lib/auth.js";
import { CONTACT_STATUSES, listContacts, updateContactStatus } from "../lib/contacts.js";

export const adminRouter = Router();

// Toutes les routes /api/admin/* exigent une session admin.
adminRouter.use(requireAdmin);

adminRouter.get("/contacts", async (req, res, next) => {
  const status = z.enum(CONTACT_STATUSES).optional().safeParse(req.query.status || undefined);
  if (!status.success) {
    res.status(400).json({ error: `status doit valoir : ${CONTACT_STATUSES.join(", ")}` });
    return;
  }
  try {
    res.json(await listContacts(status.data));
  } catch (err) {
    next(err);
  }
});

const patchSchema = z.object({ status: z.enum(CONTACT_STATUSES) });

adminRouter.patch("/contacts/:id", async (req, res, next) => {
  const id = z.uuid().safeParse(req.params.id);
  const body = patchSchema.safeParse(req.body ?? {});
  if (!id.success || !body.success) {
    res.status(400).json({ error: "Requête invalide" });
    return;
  }
  try {
    const contact = await updateContactStatus(id.data, body.data.status);
    if (!contact) {
      res.status(404).json({ error: "Demande introuvable" });
      return;
    }
    res.json({ contact });
  } catch (err) {
    next(err);
  }
});
