
export type Farm = {
  id: string;
  name: string;
  farmer: string;
  phone: string;
  county: string;
  lat: number;
  lon: number;
  landAcres: number;
  cropType: string;
  notes: string;
  createdAt: string;
  /** reserved for future partner programme integrations */
  bomRegistered: boolean;
};

export type CreateFarmInput = Omit<Farm, 'id' | 'createdAt' | 'bomRegistered'>;


export type CurrentConditions = {
  temp_c: number;
  humidity: number;
  wind_kph: number;
  condition: string;
  precip_mm: number;
};

export type DayForecast = {
  date: string;             // ISO date string e.g. "2026-06-07"
  max_temp_c: number;
  min_temp_c: number;
  precip_mm: number;
  humidity_avg: number;
  wind_kph: number;
  condition: string;
};

export type WeatherResponse = {
  lat: number;
  lon: number;
  timezone: string;
  current: CurrentConditions;
  daily: DayForecast[];
  ai_summary: string | null;
};


export type AlertMetric = 'rainfall' | 'temp_max' | 'temp_min' | 'humidity' | 'wind_speed';
export type AlertOperator = 'gt' | 'lt';

export type Alert = {
  id: string;
  farmId: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  /** SMS message template — {farm} is replaced with the farm name */
  message: string;
  active: boolean;
  /** WeatherAI webhook ID if successfully registered (Pro+ only) */
  webhookId?: string;
  createdAt: string;
};

export type CreateAlertInput = Omit<Alert, 'id' | 'active' | 'webhookId' | 'createdAt'>;


export type TreeHealth = {
  healthy: number;
  needs_care: number;
  needs_replacement: number;
};

export type TreeAnalysis = {
  analysis_id: string;
  timestamp: string;
  farmer_id: string | null;
  county: string | null;
  land_acres: number | null;
  total_tree_count: number;
  tree_density_per_acre: number | null;
  confidence_score: number;
  canopy_coverage_pct: number;
  tree_health: TreeHealth;
  tree_species_guess: string | null;
  observations: string[];
  recommendations: string[];
  original_image_url: string | null;
  overlay_image_url: string | null;
};

/** Stored locally — adds farmId to link the analysis to a farm */
export type StoredTreeScan = TreeAnalysis & {
  farmId: string;
};


export type UsageStats = {
  total_requests: number;
  ai_requests: number;
  plan_limit: number;
  ai_limit: number;
  billing_start: string;
  billing_end: string;
  plan: 'free' | 'pro' | 'scale';
};
