# Bike Maintenance App

Track component wear across all your bikes. Logs rides, calculates km on each component since install, and alerts you when service or replacement is due.

Strava sync is scaffolded in the database — wire it up when you're ready.

## Quick start

### 1. Backend

```bash
cd bike-maintenance-app/backend
npm install
node seed.js        # optional: loads 2 demo bikes with ride history
npm run dev         # starts on http://localhost:3001
```

### 2. Frontend

```bash
cd bike-maintenance-app/frontend
npm install
npm run dev         # starts on http://localhost:5173
```

Open **http://localhost:5173**

## How it works

- **Add a bike** — 10 standard components are created automatically
- **Log rides** — manually for now; Strava sync coming in Phase 3
- **Component health** — km since install tracked per component, colour-coded:
  - Green: < 70% of threshold
  - Amber: 70–90%
  - Orange: 90–100%
  - Red: overdue
- **Log a service or replacement** — replacement resets the component km counter
- **Full service history** — per bike, sorted by date

## Standard components (auto-added per bike)

| Component | Replace at | Service at |
|---|---|---|
| Chain | 2,500 km | — |
| Cassette | 12,000 km | — |
| Front Tyre | 4,000 km | — |
| Rear Tyre | 3,000 km | — |
| Brake Pads Front | 3,000 km | — |
| Brake Pads Rear | 3,000 km | — |
| Bar Tape | 5,000 km | — |
| Cables & Housing | 8,000 km | — |
| Bottom Bracket | 20,000 km | 10,000 km |
| Fork Service | — | 3,000 km |

All thresholds are editable per component.

## API

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/bikes` | List / create bikes |
| PUT/DELETE | `/api/bikes/:id` | Update / delete bike |
| GET | `/api/bikes/:id/rides` | Rides for a bike |
| GET/POST | `/api/components/bike/:id` | Components for a bike |
| PUT/DELETE | `/api/components/:id` | Update / delete component |
| POST/DELETE | `/api/rides` | Log / delete ride |
| GET/POST | `/api/service-logs/component/:id` | Logs / add log |
| GET | `/api/health/bike/:id` | Component health (km, %, status) |

## Roadmap

- [x] Manual ride logging
- [x] Component health tracking
- [x] Service + replacement logs
- [ ] Strava OAuth + ride sync
- [ ] Strava webhook (live sync)
- [ ] Cost tracking summary
- [ ] CSV export
- [ ] Mobile layout polish
