# FieldPulse

A weather intelligence platform built for smallholder farmers in East Africa. FieldPulse gives farmers real-time weather data, AI-generated field recommendations, threshold-based alerts, and canopy health analysis — all in one place.

---

## What it does

**Weather & Forecasts**
Pulls live weather data for each registered farm — current conditions, 7-day forecasts, rainfall, temperature, humidity, and wind. Farms without a WeatherAI API key fall back to realistic mock data so development always works offline.

**AI-Powered Field Recommendations**
For each farm, an LLM (Llama 3.3 70B via Groq) reads the current weather snapshot and farm context (crop type, county, acreage, notes) and returns a risk level — *Normal*, *Watch*, or *Act Now* — along with specific, actionable steps a farmer can take in the next 24 hours. A deterministic rule-based fallback kicks in automatically if Groq is unavailable.

**Risk Zone Summary**
Aggregates weather risk across all registered farms, grouped by county. Surfaces the highest-risk zones first so operators can triage at a glance.

**Quick Forecast**
A location-only endpoint (`POST /quick/forecast`) — no farm registration needed. Takes a latitude/longitude and returns weather plus AI recommendations on the spot, useful for field scouts or guest users.

**Threshold Alerts**
Farms can have configurable alert rules (e.g. rainfall > 20mm, temperature > 32°C). Alerts are stored per farm and can be created or removed via the API.

**Tree / Canopy Analysis**
Upload a canopy image for a farm and get back a health assessment — tree count, canopy coverage percentage, species guess, health breakdown (healthy / needs care / needs replacement), observations, and recommendations. Scan history is stored per farm.

**Usage & Quota**
Exposes billing period stats (total requests, AI requests, plan limits) from the WeatherAI API.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, TanStack Query |
| Backend | Hono (Edge-compatible), deployed as a Vercel Edge Function |
| Database | Neon (serverless Postgres) — persists farms, alerts, and tree scans |
| AI | Groq API — Llama 3.3 70B Versatile |
| Weather | WeatherAI API (mock-data fallback in dev) |
| Monorepo | Turborepo + pnpm workspaces |
| Types | Shared `@fieldpulse/types` package across API and web |

---

## Project structure

```
apps/
  api/          Hono API — routes, AI, weather, DB logic
  web/          Next.js frontend
packages/
  types/        Shared TypeScript types
```

---

## Running locally

```bash
pnpm install

# apps/api/.env
WEATHER_API_KEY=your_key
GROQ_API_KEY=your_key
DATABASE_URL=postgresql://...   # optional — omit to use mock data

pnpm dev
```

API runs on `http://localhost:3001`, web on `http://localhost:3000`.

---

## Deploying

The monorepo deploys as two separate Vercel projects — one for `apps/api`, one for `apps/web`.

**API project** environment variables:
```
WEATHER_API_KEY=
GROQ_API_KEY=
DATABASE_URL=          # Neon connection string (without channel_binding)
ALLOWED_ORIGINS=       # comma-separated list of allowed frontend origins
```

**Web project** environment variables:
```
NEXT_PUBLIC_API_URL=   # URL of the deployed API project
```

The database schema and seed data are created automatically on first request.

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/farms` | List all farms |
| POST | `/farms` | Register a new farm |
| DELETE | `/farms/:id` | Remove a farm |
| GET | `/weather/farm/:farmId` | Weather + 7-day forecast for a farm |
| GET | `/alerts/:farmId` | List alerts for a farm |
| POST | `/alerts` | Create an alert |
| DELETE | `/alerts/:id` | Remove an alert |
| POST | `/ai/actions` | AI risk assessment for a farm |
| POST | `/trees/analyze` | Canopy image analysis |
| GET | `/trees/history/:farmId` | Tree scan history |
| POST | `/quick/forecast` | Weather + AI for any lat/lon |
| GET | `/quick/zones/risk-summary` | Risk summary across all farms |
| GET | `/usage` | API quota and billing stats |
