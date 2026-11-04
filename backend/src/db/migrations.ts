import { pool } from "./pool.js";

/**
 * Migrations SQL versionnées, appliquées une seule fois et dans l'ordre.
 * Ne jamais modifier une migration déjà appliquée : en ajouter une nouvelle.
 */
const migrations: { id: string; sql: string }[] = [
  {
    id: "001_initial",
    sql: `
      CREATE TABLE admins (
        id            SERIAL PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_login_at TIMESTAMPTZ
      );

      CREATE TABLE sessions (
        token_hash TEXT PRIMARY KEY,
        admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

      CREATE TABLE contacts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        first_name   TEXT NOT NULL,
        last_name    TEXT NOT NULL,
        email        TEXT NOT NULL,
        phone        TEXT NOT NULL,
        city         TEXT NOT NULL DEFAULT '',
        profile      TEXT NOT NULL,
        trainings    TEXT[] NOT NULL,
        availability TEXT NOT NULL,
        message      TEXT NOT NULL DEFAULT '',
        status       TEXT NOT NULL DEFAULT 'nouveau'
                     CHECK (status IN ('nouveau', 'contacte', 'inscrit', 'archive'))
      );
      CREATE INDEX contacts_created_at_idx ON contacts (created_at DESC);
      CREATE INDEX contacts_status_idx ON contacts (status);
    `,
  },
  {
    // Comptes avec rôles : les admins existants deviennent des utilisateurs « admin »,
    // les visiteurs peuvent créer un compte « client » et suivre leurs inscriptions.
    id: "002_users_roles",
    sql: `
      ALTER TABLE admins RENAME TO users;
      ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client'));
      UPDATE users SET role = 'admin';
      ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT '';

      ALTER TABLE sessions RENAME COLUMN admin_id TO user_id;

      ALTER TABLE contacts ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      CREATE INDEX contacts_user_id_idx ON contacts (user_id);
    `,
  },
];

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    // Verrou : si plusieurs instances démarrent en même temps, une seule migre.
    await client.query("SELECT pg_advisory_lock(424242)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id         TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const { rows } = await client.query<{ id: string }>("SELECT id FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.id));

    for (const m of migrations) {
      if (applied.has(m.id)) continue;
      await client.query("BEGIN");
      try {
        await client.query(m.sql);
        await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [m.id]);
        await client.query("COMMIT");
        console.info(`[db] migration appliquée : ${m.id}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(424242)").catch(() => undefined);
    client.release();
  }
}
