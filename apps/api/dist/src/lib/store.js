import { sql } from './db.js';
function rowToFarm(r) {
    return {
        id: r.id,
        name: r.name,
        farmer: r.farmer,
        phone: r.phone,
        county: r.county,
        lat: Number(r.lat),
        lon: Number(r.lon),
        landAcres: Number(r.land_acres),
        cropType: r.crop_type,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        bomRegistered: r.bom_registered,
    };
}
function rowToAlert(r) {
    return {
        id: r.id,
        farmId: r.farm_id,
        metric: r.metric,
        operator: r.operator,
        threshold: Number(r.threshold),
        message: r.message,
        active: r.active,
        createdAt: r.created_at.toISOString(),
    };
}
function rowToScan(r) {
    return r;
}
export async function getFarms() {
    const rows = await sql `SELECT * FROM farms ORDER BY created_at DESC`;
    return rows.map(rowToFarm);
}
export async function getFarmById(id) {
    const rows = await sql `SELECT * FROM farms WHERE id = ${id}`;
    return rows[0] ? rowToFarm(rows[0]) : null;
}
export async function createFarm(farm) {
    await sql `
    INSERT INTO farms (id, name, farmer, phone, county, lat, lon, land_acres, crop_type, notes, created_at, bom_registered)
    VALUES (${farm.id}, ${farm.name}, ${farm.farmer}, ${farm.phone}, ${farm.county},
            ${farm.lat}, ${farm.lon}, ${farm.landAcres}, ${farm.cropType}, ${farm.notes},
            ${farm.createdAt}, ${farm.bomRegistered})
  `;
    return farm;
}
export async function deleteFarm(id) {
    const result = await sql `DELETE FROM farms WHERE id = ${id}`;
    return result.rowCount > 0;
}
export async function getAlertsByFarm(farmId) {
    const rows = await sql `SELECT * FROM alerts WHERE farm_id = ${farmId} ORDER BY created_at DESC`;
    return rows.map(rowToAlert);
}
export async function createAlert(alert) {
    await sql `
    INSERT INTO alerts (id, farm_id, metric, operator, threshold, message, active, created_at)
    VALUES (${alert.id}, ${alert.farmId}, ${alert.metric}, ${alert.operator},
            ${alert.threshold}, ${alert.message}, ${alert.active}, ${alert.createdAt})
  `;
    return alert;
}
export async function deleteAlert(id) {
    const result = await sql `DELETE FROM alerts WHERE id = ${id}`;
    return result.rowCount > 0;
}
export async function getTreeScans(farmId) {
    const rows = farmId
        ? await sql `SELECT * FROM tree_scans WHERE farm_id = ${farmId} ORDER BY analyzed_at DESC`
        : await sql `SELECT * FROM tree_scans ORDER BY analyzed_at DESC`;
    return rows.map(rowToScan);
}
export async function createTreeScan(scan) {
    await sql `
    INSERT INTO tree_scans (id, farm_id, image_url, health_score, canopy_cover, issues, recommendations, analyzed_at)
    VALUES (${scan.analysis_id}, ${scan.farmId}, ${scan.original_image_url ?? null},
            ${scan.confidence_score}, ${scan.canopy_coverage_pct},
            ${JSON.stringify(scan.observations)}, ${JSON.stringify(scan.recommendations)},
            ${scan.timestamp})
  `;
    return scan;
}
