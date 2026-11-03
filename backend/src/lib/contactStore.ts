import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import type { ContactInput } from "../routes/contact.js";

const file = path.join(config.dataDir, "contacts.jsonl");

/** Les écritures sont sérialisées pour éviter que deux demandes s'entremêlent dans le fichier. */
let queue: Promise<unknown> = Promise.resolve();

export type StoredContact = ContactInput & { id: string; receivedAt: string };

export function saveContact(input: ContactInput): Promise<StoredContact> {
  const record: StoredContact = { id: randomUUID(), receivedAt: new Date().toISOString(), ...input };
  const task = queue.then(async () => {
    await mkdir(config.dataDir, { recursive: true });
    await appendFile(file, JSON.stringify(record) + "\n", "utf8");
    return record;
  });
  queue = task.catch(() => undefined);
  return task;
}
