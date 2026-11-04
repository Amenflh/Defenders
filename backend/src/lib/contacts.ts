import { pool } from "../db/pool.js";
import type { ContactInput } from "../routes/contact.js";

export const CONTACT_STATUSES = ["nouveau", "contacte", "inscrit", "archive"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export type Contact = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  trainings: string[];
  availability: string;
  message: string;
  status: ContactStatus;
};

const COLUMNS = `id, created_at AS "createdAt", first_name AS "firstName", last_name AS "lastName",
  email, phone, city, profile, trainings, availability, message, status`;

/** Enregistre une demande ; userId la rattache au compte client connecté. */
export async function saveContact(input: ContactInput, userId?: number): Promise<Contact> {
  const { rows } = await pool.query<Contact>(
    `INSERT INTO contacts (first_name, last_name, email, phone, city, profile, trainings, availability, message, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${COLUMNS}`,
    [input.firstName, input.lastName, input.email, input.phone, input.city, input.profile, input.trainings, input.availability, input.message, userId ?? null],
  );
  return rows[0];
}

export async function listContactsForUser(userId: number): Promise<Contact[]> {
  const { rows } = await pool.query<Contact>(`SELECT ${COLUMNS} FROM contacts WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
  return rows;
}

export async function listContacts(status?: ContactStatus): Promise<{ contacts: Contact[]; counts: Record<string, number> }> {
  const [list, counts] = await Promise.all([
    pool.query<Contact>(
      `SELECT ${COLUMNS} FROM contacts WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC LIMIT 500`,
      [status ?? null],
    ),
    pool.query<{ status: string; count: string }>("SELECT status, count(*) FROM contacts GROUP BY status"),
  ]);
  return {
    contacts: list.rows,
    counts: Object.fromEntries(counts.rows.map((r) => [r.status, Number(r.count)])),
  };
}

export async function updateContactStatus(id: string, status: ContactStatus): Promise<Contact | null> {
  const { rows } = await pool.query<Contact>(`UPDATE contacts SET status = $2 WHERE id = $1 RETURNING ${COLUMNS}`, [id, status]);
  return rows[0] ?? null;
}
