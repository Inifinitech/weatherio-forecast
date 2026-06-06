import type { Farm, Alert, StoredTreeScan } from '@fieldpulse/types';
import { sql } from './db.js';

function rowToFarm(r: Record<string, unknown>): Farm {
  return {
    id: r.id as string,
    name: r.name as string,
    farmer: r.farmer as string,
    phone: r.phone as string,
    county: r.county as string,
    lat: Number(r.lat),
    lon: Number(r.lon),
    landAcres: Number(r.land_acres),
    cropType: r.crop_type as string,
    notes: r.notes as string,
    createdAt: (r.created_at as Date).toISOString(),
    bomRegistered: r.bom_registered as boolean,
  };
}

function rowToAlert(r: Record<string, unknown>): Alert {
  return {
    id: r.id as string,
    farmId: r.farm_id as string,
    metric: r.metric as import('@fieldpulse/types').AlertMetric,
    operator: r.operator as import('@fieldpulse/types').AlertOperator,
    threshold: Number(r.threshold),
    message: r.message as string,
    active: r.active as boolean,
    createdAt: (r.created_at as Date).toISOString(),
  };
}

function rowToScan(r: Record<string, unknown>): StoredTreeScan {
  return r as unknown as StoredTreeScan;
}

export async function getFarms(): Promise<Farm[]> {
  const rows = await sql`SELECT * FROM farms ORDER BY created_at DESC`;
  return rows.map(rowToFarm);
}

export async function getFarmById(id: string): Promise<Farm | null> {
  const rows = await sql`SELECT * FROM farms WHERE id = ${id}`;
  return rows[0] ? rowToFarm(rows[0]) : null;
}

export async function createFarm(farm: Farm): Promise<Farm> {
  await sql`
    INSERT INTO farms (id, name, farmer, phone, county, lat, lon, land_acres, crop_type, notes, created_at, bom_registered)
    VALUES (${farm.id}, ${farm.name}, ${farm.farmer}, ${farm.phone}, ${farm.county},
            ${farm.lat}, ${farm.lon}, ${farm.landAcres}, ${farm.cropType}, ${farm.notes},
            ${farm.createdAt}, ${farm.bomRegistered})
  `;
  return farm;
}

export async function deleteFarm(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM farms WHERE id = ${id}`;
  return (result as unknown as { rowCount: number }).rowCount > 0;
}

export async function getAlertsByFarm(farmId: string): Promise<Alert[]> {
  const rows = await sql`SELECT * FROM alerts WHERE farm_id = ${farmId} ORDER BY created_at DESC`;
  return rows.map(rowToAlert);
}

export async function createAlert(alert: Alert): Promise<Alert> {
  await sql`
    INSERT INTO alerts (id, farm_id, metric, operator, threshold, message, active, created_at)
    VALUES (${alert.id}, ${alert.farmId}, ${alert.metric}, ${alert.operator},
            ${alert.threshold}, ${alert.message}, ${alert.active}, ${alert.createdAt})
  `;
  return alert;
}

export async function deleteAlert(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM alerts WHERE id = ${id}`;
  return (result as unknown as { rowCount: number }).rowCount > 0;
}

export async function getTreeScans(farmId?: string): Promise<StoredTreeScan[]> {
  const rows = farmId
    ? await sql`SELECT * FROM tree_scans WHERE farm_id = ${farmId} ORDER BY analyzed_at DESC`
    : await sql`SELECT * FROM tree_scans ORDER BY analyzed_at DESC`;
  return rows.map(rowToScan);
}

export async function createTreeScan(scan: StoredTreeScan): Promise<StoredTreeScan> {
  await sql`
    INSERT INTO tree_scans (id, farm_id, image_url, health_score, canopy_cover, issues, recommendations, analyzed_at)
    VALUES (${scan.analysis_id}, ${scan.farmId}, ${scan.original_image_url ?? null},
            ${scan.confidence_score}, ${scan.canopy_coverage_pct},
            ${JSON.stringify(scan.observations)}, ${JSON.stringify(scan.recommendations)},
            ${scan.timestamp})
  `;
  return scan;
}


