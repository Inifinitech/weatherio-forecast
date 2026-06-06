import { Hono } from 'hono';
import { getFarms } from '../lib/store.js';
import { getWeather } from '../lib/weather.js';
import { getAiActions } from '../lib/ai.js';
import type { Farm } from '@fieldpulse/types';

const router = new Hono();

// POST /quick/forecast
// Body: { lat: number, lon: number }
// Returns weather + AI actions for a specific location (no farm required).
router.post('/forecast', async (c) => {
  const { lat, lon } = await c.req.json<{ lat: number; lon: number }>();

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return c.json({ error: 'lat and lon must be numbers' }, 400);
  }

  try {
    const weather = await getWeather(lat, lon, 3);

    // Create a synthetic "generic farm" for this location to pass to AI
    const syntheticFarm: Farm = {
      id: `location-${lat}-${lon}`,
      name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
      farmer: 'User',
      phone: '',
      county: 'Unknown',
      lat,
      lon,
      landAcres: 1,
      cropType: 'Mixed crops',
      notes: 'Quick location check',
      createdAt: new Date().toISOString(),
      bomRegistered: false,
    };

    const actions = await getAiActions(syntheticFarm, weather);

    return c.json({
      lat,
      lon,
      weather,
      actions,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ error: `Forecast failed: ${(err as Error).message}` }, 502);
  }
});

// GET /quick/zones/risk-summary
// Returns aggregated risk zones across all registered farms.
// Groups by county and rainfall risk level.
router.get('/zones/risk-summary', async (c) => {
  try {
    const allFarms = await getFarms();
    const zoneData: Record<
      string,
      { county: string; farms: { name: string; rainfall: number; riskLevel: 'Normal' | 'Watch' | 'Act Now' }[]; maxRainfall: number; aggregateRisk: 'Normal' | 'Watch' | 'Act Now' }
    > = {};

    for (const farm of allFarms) {
      const weather = await getWeather(farm.lat, farm.lon, 1);
      const todayRain = weather.daily[0]?.precip_mm ?? 0;

      // Determine risk level based on rainfall
      let riskLevel: 'Normal' | 'Watch' | 'Act Now';
      if (todayRain > 20) {
        riskLevel = 'Act Now';
      } else if (todayRain > 8) {
        riskLevel = 'Watch';
      } else {
        riskLevel = 'Normal';
      }

      // Group by county
      const county = farm.county;
      if (!zoneData[county]) {
        zoneData[county] = {
          county,
          farms: [],
          maxRainfall: 0,
          aggregateRisk: 'Normal',
        };
      }

      zoneData[county].farms.push({
        name: farm.name,
        rainfall: todayRain,
        riskLevel,
      });

      // Update max rainfall and aggregate risk for the zone
      if (todayRain > zoneData[county].maxRainfall) {
        zoneData[county].maxRainfall = todayRain;
      }
      if (riskLevel === 'Act Now') {
        zoneData[county].aggregateRisk = 'Act Now';
      } else if (riskLevel === 'Watch' && zoneData[county].aggregateRisk !== 'Act Now') {
        zoneData[county].aggregateRisk = 'Watch';
      }
    }

    // Convert to array and sort by risk level (Act Now first), then by rainfall
    const zones = Object.values(zoneData).sort((a, b) => {
      const riskOrder = { 'Act Now': 0, Watch: 1, Normal: 2 };
      const riskDiff = riskOrder[a.aggregateRisk] - riskOrder[b.aggregateRisk];
      if (riskDiff !== 0) return riskDiff;
      return b.maxRainfall - a.maxRainfall;
    });

    return c.json({
      zones,
      totalFarms: allFarms.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return c.json({ error: `Zone summary failed: ${(err as Error).message}` }, 502);
  }
});

export default router;
