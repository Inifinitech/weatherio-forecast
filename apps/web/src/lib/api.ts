import type { Farm, WeatherResponse, Alert, CreateAlertInput, CreateFarmInput, StoredTreeScan, UsageStats } from '@fieldpulse/types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';


async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}


export const farmApi = {
  list: () =>
    request<Farm[]>('/farms'),

  get: (id: string) =>
    request<Farm>(`/farms/${id}`),

  create: (data: CreateFarmInput) =>
    request<Farm>('/farms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/farms/${id}`, { method: 'DELETE' }),
};


export const weatherApi = {
  forFarm: (farmId: string, days = 7) =>
    request<WeatherResponse>(`/weather/farm/${farmId}?days=${days}`),
};


export const alertsApi = {
  list: (farmId: string) =>
    request<Alert[]>(`/alerts/${farmId}`),

  create: (data: CreateAlertInput) =>
    request<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/alerts/${id}`, { method: 'DELETE' }),
};


export const treesApi = {
  analyze: async (formData: FormData): Promise<StoredTreeScan> => {
    const res = await fetch(`${API}/trees/analyze`, {
      method: 'POST',
      body: formData,
      // No Content-Type header — browser sets it with the multipart boundary
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error((payload as { error?: string }).error ?? `Analysis failed (${res.status})`);
    }
    return res.json() as Promise<StoredTreeScan>;
  },

  history: (farmId: string) =>
    request<StoredTreeScan[]>(`/trees/history/${farmId}`),
};


export const usageApi = {
  get: () => request<UsageStats>('/usage'),
};


export type RiskLevel = 'Normal' | 'Watch' | 'Act Now';

export type AiActionsResult = {
  farmId: string;
  farmName: string;
  riskLevel: RiskLevel;
  riskReason: string;
  actions: string[];
  timeframe: string;
  source: 'groq' | 'fallback';
};

export const aiApi = {
  actions: (farmId: string) =>
    request<AiActionsResult>('/ai/actions', {
      method: 'POST',
      body: JSON.stringify({ farmId }),
    }),
};


export const quickApi = {
  forecast: (lat: number, lon: number) =>
    request<{
      lat: number;
      lon: number;
      weather: WeatherResponse;
      actions: AiActionsResult;
      timestamp: string;
    }>('/quick/forecast', {
      method: 'POST',
      body: JSON.stringify({ lat, lon }),
    }),

  riskZones: () =>
    request<{
      zones: Array<{
        county: string;
        farms: Array<{ name: string; rainfall: number; riskLevel: string }>;
        maxRainfall: number;
        aggregateRisk: 'Normal' | 'Watch' | 'Act Now';
      }>;
      totalFarms: number;
      timestamp: string;
    }>('/quick/zones/risk-summary'),
};


export const apiClient = {
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  get: <T>(path: string): Promise<T> =>
    request<T>(path, { method: 'GET' }),

  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string): Promise<T> =>
    request<T>(path, { method: 'DELETE' }),
};
