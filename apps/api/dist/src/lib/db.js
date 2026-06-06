import { neon } from '@neondatabase/serverless';
export const DATABASE_URL = process.env.DATABASE_URL ?? null;
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
export async function initSchema() {
    if (!sql)
        return;
    try {
        await sql `
      CREATE TABLE IF NOT EXISTS farms (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        farmer      TEXT NOT NULL,
        phone       TEXT NOT NULL,
        county      TEXT NOT NULL,
        lat         DOUBLE PRECISION NOT NULL,
        lon         DOUBLE PRECISION NOT NULL,
        land_acres  DOUBLE PRECISION NOT NULL,
        crop_type   TEXT NOT NULL,
        notes       TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        bom_registered BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;
        await sql `
      CREATE TABLE IF NOT EXISTS alerts (
        id          TEXT PRIMARY KEY,
        farm_id     TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        metric      TEXT NOT NULL,
        operator    TEXT NOT NULL,
        threshold   DOUBLE PRECISION NOT NULL,
        message     TEXT NOT NULL,
        active      BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
        await sql `
      CREATE TABLE IF NOT EXISTS tree_scans (
        id            TEXT PRIMARY KEY,
        farm_id       TEXT NOT NULL,
        image_url     TEXT,
        health_score  INTEGER,
        canopy_cover  DOUBLE PRECISION,
        issues        JSONB NOT NULL DEFAULT '[]',
        recommendations JSONB NOT NULL DEFAULT '[]',
        analyzed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
        await seedIfEmpty();
    }
    catch (err) {
        console.error('initSchema failed:', err);
        throw err;
    }
}
async function seedIfEmpty() {
    if (!sql)
        return;
    const rows = await sql `SELECT COUNT(*) AS count FROM farms`;
    if (Number(rows[0].count) > 0)
        return;
    await sql `
    INSERT INTO farms (id, name, farmer, phone, county, lat, lon, land_acres, crop_type, notes, created_at, bom_registered)
    VALUES
      ('farm-001', 'Kapkimolwa Farm', 'John Kiprotich', '+254712345678', 'Bomet',
       -0.7764, 35.3466, 2.5, 'Tea',
       'Tea plantation, Block A and B active. Northern section recently pruned.',
       '2026-01-15T08:00:00.000Z', TRUE),
      ('farm-002', 'Nyahururu Dairy Plot', 'Grace Wanjiku', '+254723456789', 'Laikipia',
       0.0281, 36.3599, 5.0, 'Pasture / Napier Grass',
       'Mixed dairy farm. Feeds 12 Friesian cows. Water source from stream on western boundary.',
       '2026-02-03T09:30:00.000Z', FALSE),
      ('farm-003', 'Nakuru Maize Block', 'Samuel Mutua', '+254734567890', 'Nakuru',
       -0.3031, 36.0800, 8.0, 'Maize',
       'Two seasons per year. Currently in long-rain planting window. Sandy loam soil.',
       '2026-03-20T07:00:00.000Z', FALSE)
    ON CONFLICT (id) DO NOTHING
  `;
    await sql `
    INSERT INTO alerts (id, farm_id, metric, operator, threshold, message, created_at)
    VALUES
      ('alert-001', 'farm-001', 'rainfall', 'gt', 20,
       'Heavy rain at {farm}. Avoid fertilizer application and check drainage channels.',
       '2026-04-01T00:00:00.000Z'),
      ('alert-002', 'farm-003', 'temp_max', 'gt', 32,
       'High temperature alert for {farm}. Ensure crops are adequately irrigated.',
       '2026-04-15T00:00:00.000Z')
    ON CONFLICT (id) DO NOTHING
  `;
}
