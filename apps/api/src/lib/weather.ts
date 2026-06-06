import type { WeatherResponse, UsageStats, TreeAnalysis } from '@fieldpulse/types';

const BASE = 'https://api.weather-ai.co/v1';

function isMockMode(): boolean {
  const key = process.env.WEATHER_API_KEY;
  return !key || key === 'wai_your_key_here';
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.WEATHER_API_KEY}` };
}

function toNum(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function conditionFromCode(code: unknown): string {
  const key = String(code ?? '');
  const map: Record<string, string> = {
    '0': 'Clear',
    '1': 'Mainly Clear',
    '2': 'Partly Cloudy',
    '3': 'Overcast',
    '45': 'Fog',
    '48': 'Fog',
    '51': 'Light Drizzle',
    '53': 'Drizzle',
    '55': 'Heavy Drizzle',
    '61': 'Light Rain',
    '63': 'Rain',
    '65': 'Heavy Rain',
    '71': 'Light Snow',
    '73': 'Snow',
    '75': 'Heavy Snow',
    '80': 'Light Showers',
    '81': 'Showers',
    '82': 'Heavy Showers',
    '95': 'Thunderstorm',
  };
  return map[key] ?? 'Unknown';
}

function normalizeLiveWeather(
  raw: {
    location?: { lat?: number; lon?: number; timezone?: string };
    current?: { temperature?: number; wind_speed?: number; condition_code?: string | number };
    hourly?: Array<{ humidity?: number }>;
    daily?: Array<{
      date?: string;
      temp_max?: number;
      temp_min?: number;
      precipitation_sum?: number;
      precipitation_probability?: number;
      wind_max?: number;
      condition_code?: string | number;
    }>;
    ai_summary?: string | null;
  },
  fallbackLat: number,
  fallbackLon: number,
): WeatherResponse {
  const hourly = raw.hourly ?? [];
  const daily = raw.daily ?? [];

  const avgHumidity =
    hourly.length > 0
      ? Math.round(
          hourly.reduce((sum, h) => sum + toNum(h.humidity, 0), 0) / hourly.length,
        )
      : 0;

  const todayPrecip = toNum(daily[0]?.precipitation_sum, 0);

  return {
    lat: toNum(raw.location?.lat, fallbackLat),
    lon: toNum(raw.location?.lon, fallbackLon),
    timezone: raw.location?.timezone ?? 'UTC',
    current: {
      temp_c: toNum(raw.current?.temperature, 0),
      humidity: avgHumidity,
      wind_kph: toNum(raw.current?.wind_speed, 0),
      condition: conditionFromCode(raw.current?.condition_code),
      precip_mm: todayPrecip,
    },
    daily: daily.map((day) => ({
      date: day.date ?? new Date().toISOString().slice(0, 10),
      max_temp_c: toNum(day.temp_max, 0),
      min_temp_c: toNum(day.temp_min, 0),
      precip_mm: toNum(day.precipitation_sum, 0),
      humidity_avg: toNum(day.precipitation_probability, 0),
      wind_kph: toNum(day.wind_max, 0),
      condition: conditionFromCode(day.condition_code),
    })),
    ai_summary: raw.ai_summary ?? null,
  };
}


function mockWeather(lat: number, lon: number): WeatherResponse {
  // Vary temperature slightly by latitude so different farms look different
  const tempOffset = Math.round(lat * 0.5);

  return {
    lat,
    lon,
    timezone: 'Africa/Nairobi',
    current: {
      temp_c: 22 + tempOffset,
      humidity: 78,
      wind_kph: 14,
      condition: 'Partly Cloudy',
      precip_mm: 3.2,
    },
    daily: [
      { date: '2026-06-06', max_temp_c: 24 + tempOffset, min_temp_c: 15, precip_mm: 3.2, humidity_avg: 78, wind_kph: 14, condition: 'Partly Cloudy' },
      { date: '2026-06-07', max_temp_c: 21 + tempOffset, min_temp_c: 13, precip_mm: 18.5, humidity_avg: 88, wind_kph: 22, condition: 'Heavy Rain' },
      { date: '2026-06-08', max_temp_c: 19 + tempOffset, min_temp_c: 12, precip_mm: 8.0, humidity_avg: 92, wind_kph: 18, condition: 'Rain' },
      { date: '2026-06-09', max_temp_c: 23 + tempOffset, min_temp_c: 14, precip_mm: 0, humidity_avg: 72, wind_kph: 10, condition: 'Sunny' },
      { date: '2026-06-10', max_temp_c: 25 + tempOffset, min_temp_c: 16, precip_mm: 0, humidity_avg: 65, wind_kph: 8, condition: 'Clear' },
      { date: '2026-06-11', max_temp_c: 22 + tempOffset, min_temp_c: 14, precip_mm: 5.5, humidity_avg: 80, wind_kph: 15, condition: 'Light Rain' },
      { date: '2026-06-12', max_temp_c: 20 + tempOffset, min_temp_c: 13, precip_mm: 12.0, humidity_avg: 85, wind_kph: 20, condition: 'Rain' },
    ],
    ai_summary:
      'Expect wet conditions through the week. Heavy rain Sunday and Tuesday creates waterlogging risk for low-lying fields. Plan harvest windows around dry periods Wednesday through Friday. Monitor drainage channels before each rain event.',
  };
}

function mockUsage(): UsageStats {
  return {
    total_requests: 231,
    ai_requests: 48,
    plan_limit: 1000,
    ai_limit: 200,
    billing_start: '2026-06-01T00:00:00.000Z',
    billing_end: '2026-06-30T23:59:59.000Z',
    plan: 'free',
  };
}

function mockTreeAnalysis(): TreeAnalysis {
  return {
    analysis_id: `MOCK-${Date.now()}`,
    timestamp: new Date().toISOString(),
    farmer_id: null,
    county: null,
    land_acres: null,
    total_tree_count: 84,
    tree_density_per_acre: 33.6,
    confidence_score: 0.87,
    canopy_coverage_pct: 41.2,
    tree_health: { healthy: 68, needs_care: 12, needs_replacement: 4 },
    tree_species_guess: 'Tea (Camellia sinensis)',
    observations: [
      'Dense canopy in northern quadrant — possible over-crowding',
      '3 trees near water source show yellowing — likely waterlogging stress',
      'Southern block shows uniform, healthy growth pattern',
    ],
    recommendations: [
      'Thin the northern section to improve light penetration and air circulation',
      'Improve drainage around the water source — install French drains if needed',
      'Schedule foliar feeding for yellowing trees within the next 14 days',
    ],
    original_image_url: null,
    overlay_image_url: null,
  };
}


export async function getWeather(lat: number, lon: number, days = 7): Promise<WeatherResponse> {
  if (isMockMode()) return mockWeather(lat, lon);

  const url = new URL(`${BASE}/weather`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('days', String(days));

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`WeatherAI ${res.status}: ${await res.text()}`);

  const raw = await res.json() as {
    location?: { lat?: number; lon?: number; timezone?: string };
    current?: { temperature?: number; wind_speed?: number; condition_code?: string | number };
    hourly?: Array<{ humidity?: number }>;
    daily?: Array<{
      date?: string;
      temp_max?: number;
      temp_min?: number;
      precipitation_sum?: number;
      precipitation_probability?: number;
      wind_max?: number;
      condition_code?: string | number;
    }>;
    ai_summary?: string | null;
  };

  return normalizeLiveWeather(raw, lat, lon);
}

export async function getUsage(): Promise<UsageStats> {
  if (isMockMode()) return mockUsage();

  const res = await fetch(`${BASE}/usage`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`WeatherAI ${res.status}: ${await res.text()}`);

  // Normalize the live API shape to our internal UsageStats shape
  const raw = await res.json() as {
    plan: 'free' | 'pro' | 'scale';
    period: { start: string; end: string; requestCount: number; aiRequestCount: number };
    limits: { requests: number; aiRequests: number };
  };

  return {
    plan: raw.plan,
    total_requests: raw.period.requestCount,
    ai_requests: raw.period.aiRequestCount,
    plan_limit: raw.limits.requests,
    ai_limit: raw.limits.aiRequests,
    billing_start: raw.period.start,
    billing_end: raw.period.end,
  };
}

export async function analyzeTreeImage(formData: FormData): Promise<TreeAnalysis> {
  if (isMockMode()) {
    // Simulate processing time
    await new Promise((r) => setTimeout(r, 800));
    return mockTreeAnalysis();
  }

  const res = await fetch(`${BASE}/trees/analyze`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type — fetch sets it with boundary for FormData
    body: formData,
  });
  if (!res.ok) throw new Error(`WeatherAI ${res.status}: ${await res.text()}`);
  
  const raw = await res.json() as Record<string, unknown>;
  
  // Normalize live API response to our TreeAnalysis schema
  return {
    analysis_id: String(raw.analysis_id ?? raw.id ?? ''),
    timestamp: String(raw.timestamp ?? new Date().toISOString()),
    farmer_id: (raw.farmer_id as string | null) ?? null,
    county: (raw.county as string | null) ?? null,
    land_acres: typeof raw.land_acres === 'number' ? raw.land_acres : null,
    total_tree_count: Number(raw.total_tree_count ?? 0),
    tree_density_per_acre: Number(raw.tree_density_per_acre ?? 0),
    confidence_score: Number(raw.confidence_score ?? 0),
    canopy_coverage_pct: Number(raw.canopy_coverage_pct ?? 0),
    tree_health: {
      healthy: Number((raw.tree_health as any)?.healthy ?? 0),
      needs_care: Number((raw.tree_health as any)?.needs_care ?? 0),
      needs_replacement: Number((raw.tree_health as any)?.needs_replacement ?? 0),
    },
    tree_species_guess: (raw.tree_species_guess as string | null) ?? null,
    observations: Array.isArray(raw.observations) ? (raw.observations as string[]) : [],
    recommendations: Array.isArray(raw.recommendations) ? (raw.recommendations as string[]) : [],
    original_image_url: (raw.original_image_url as string | null) ?? null,
    overlay_image_url: (raw.overlay_image_url as string | null) ?? null,
  };
}

