import { Router } from "express";
import { DISCIPLINES, type Discipline } from "../data/disciplines.js";
import { planning } from "../data/planning.js";

export const planningRouter = Router();

planningRouter.get("/", (req, res) => {
  const { discipline } = req.query;

  if (discipline !== undefined && !DISCIPLINES.includes(discipline as Discipline)) {
    res.status(400).json({ error: `discipline doit valoir : ${DISCIPLINES.join(", ")}` });
    return;
  }

  const sessions = planning
    .filter((s) => !discipline || s.discipline === discipline)
    .toSorted((a, b) => a.day - b.day || a.start.localeCompare(b.start));

  res.json({ sessions });
});
