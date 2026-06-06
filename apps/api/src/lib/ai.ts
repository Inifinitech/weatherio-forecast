import type { WeatherResponse, Farm } from '@fieldpulse/types';

export type RiskLevel = 'Normal' | 'Watch' | 'Act Now';

export type AiActions = {
  riskLevel: RiskLevel;
  riskReason: string;
  actions: string[];
  timeframe: string;
  source: 'groq' | 'fallback';
};

const cache = new Map<string, { result: AiActions; expiresAt: number }>();

function getCached(key: string): AiActions | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.result;
}

function setCached(key: string, result: AiActions) {
  cache.set(key, { result, expiresAt: Date.now() + 15 * 60 * 1000 });
}

function computeRisk(w: WeatherResponse): { level: RiskLevel; reason: string } {
  const rain = w.current.precip_mm;
  const wind = w.current.wind_kph;
  const tomorrow = w.daily[1];
  const tomorrowRain = tomorrow?.precip_mm ?? 0;

  if (rain > 20 || tomorrowRain > 25 || wind > 50) {
    return { level: 'Act Now', reason: 'Heavy rainfall or high winds detected' };
  }
  if (rain > 8 || tomorrowRain > 12 || wind > 30) {
    return { level: 'Watch', reason: 'Elevated rain or wind — monitor closely' };
  }
  return { level: 'Normal', reason: 'Conditions within safe range' };
}

function fallbackActions(farm: Farm, w: WeatherResponse): AiActions {
  const { level, reason } = computeRisk(w);
  const rain = w.current.precip_mm;
  const tomorrow = w.daily[1];
  const tomorrowRain = tomorrow?.precip_mm ?? 0;
  const maxTemp = w.daily[0]?.max_temp_c ?? w.current.temp_c;
  const actions: string[] = [];

  if (level === 'Act Now') {
    actions.push('Inspect and clear drainage channels before the next rain event');
    actions.push('Delay any fertilizer or pesticide application by at least 24 hours');
    actions.push('Move stored harvests and equipment to elevated, covered areas');
    actions.push('Alert farm workers to avoid low-lying sections of the plot');
  } else if (level === 'Watch') {
    actions.push('Check drainage channels and clear any blockages today');
    if (tomorrowRain > 10) actions.push('Schedule any field operations for this morning, before rain arrives');
    actions.push('Keep a watch on the forecast — conditions may escalate');
  } else {
    if (maxTemp > 28) actions.push('Maintain adequate irrigation — temperatures are elevated');
    if (rain === 0 && (tomorrow?.precip_mm ?? 0) === 0) actions.push('Good window for field operations and spraying');
    actions.push('Continue regular monitoring — conditions are currently stable');
  }

  if (farm.cropType.toLowerCase().includes('tea')) {
    if (level !== 'Normal') actions.push('Tea flush quality is sensitive to waterlogging — prioritize drainage in Block rows');
  }
  if (farm.cropType.toLowerCase().includes('maize')) {
    if (level === 'Act Now') actions.push('Maize at flowering/tasseling stage is vulnerable to lodging — stake tall plants');
  }

  return {
    riskLevel: level,
    riskReason: reason,
    actions: actions.slice(0, 5),
    timeframe: 'Next 24 hours',
    source: 'fallback',
  };
}

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an agronomy and flood-risk advisor for smallholder farmers in East Africa.
Given a weather snapshot and farm context, respond ONLY with valid JSON matching this exact schema:
{
  "riskLevel": "Normal" | "Watch" | "Act Now",
  "riskReason": "one sentence explaining the risk level",
  "actions": ["action 1", "action 2", "action 3"],
  "timeframe": "Next 24 hours"
}

Rules:
- actions must be practical, specific, and executable by a farmer today
- maximum 5 actions
- no medical or legal advice
- no markdown, no explanations outside the JSON object
- crop and county context must shape the advice`;

async function callGroq(farm: Farm, w: WeatherResponse): Promise<AiActions> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');

  const today = w.daily[0];
  const tomorrow = w.daily[1];

  const userMessage = `
Farm: ${farm.name}, ${farm.county} County, Kenya
Crop: ${farm.cropType} (${farm.landAcres} acres)
Notes: ${farm.notes || 'none'}

Current conditions:
- Temperature: ${w.current.temp_c}°C
- Rainfall today: ${w.current.precip_mm} mm
- Wind: ${w.current.wind_kph} km/h
- Humidity: ${w.current.humidity}%
- Condition: ${w.current.condition}

Today forecast: high ${today?.max_temp_c}°C, rain ${today?.precip_mm}mm
Tomorrow: high ${tomorrow?.max_temp_c}°C, rain ${tomorrow?.precip_mm}mm, wind ${tomorrow?.wind_kph}km/h

What are the top field actions for this farm in the next 24 hours?`.trim();

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);

  const data = await res.json() as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content) as Partial<AiActions>;

  return {
    riskLevel: (['Normal', 'Watch', 'Act Now'].includes(parsed.riskLevel ?? '') ? parsed.riskLevel : 'Normal') as RiskLevel,
    riskReason: parsed.riskReason ?? computeRisk(w).reason,
    actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [],
    timeframe: parsed.timeframe ?? 'Next 24 hours',
    source: 'groq',
  };
}

export async function getAiActions(farm: Farm, weather: WeatherResponse): Promise<AiActions> {
  const cacheKey = `${farm.id}:${new Date().toISOString().slice(0, 13)}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  let result: AiActions;

  try {
    result = await callGroq(farm, weather);
  } catch {
    result = fallbackActions(farm, weather);
  }

  setCached(cacheKey, result);
  return result;
}
