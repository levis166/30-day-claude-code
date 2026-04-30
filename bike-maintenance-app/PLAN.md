# Bike Maintenance App — Build Plan

## Stack
- **Frontend:** React + Tailwind CSS (Vite)
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3)
- **Strava:** Mocked for now, real API wired in later

---

## Project Structure

```
bike-maintenance-app/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── seed.js              # demo data for dev
│   └── routes/
│       ├── bikes.js
│       ├── components.js
│       ├── rides.js
│       ├── serviceLogs.js
│       └── strava.js        # mock now, real later
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BikeDetail.jsx
│   │   │   └── ServiceLog.jsx
│   │   └── components/
│   │       ├── ComponentCard.jsx
│   │       ├── HealthBar.jsx
│   │       ├── RideList.jsx
│   │       └── ServiceLogEntry.jsx
│   └── package.json
├── backend/package.json
└── README.md
```

---

## Database Schema

### bikes
| column | type |
|---|---|
| id | INTEGER PK |
| name | TEXT |
| brand | TEXT |
| model | TEXT |
| type | TEXT (road/mtb/gravel/cx) |
| strava_gear_id | TEXT (null until Strava connected) |
| created_at | TEXT |

### components
| column | type |
|---|---|
| id | INTEGER PK |
| bike_id | INTEGER FK |
| name | TEXT |
| type | TEXT |
| brand | TEXT |
| installed_km | REAL (bike odometer at install) |
| install_date | TEXT |
| replace_at_km | REAL (threshold for replacement warning) |
| service_at_km | REAL (threshold for service warning) |
| notes | TEXT |

### rides
| column | type |
|---|---|
| id | INTEGER PK |
| bike_id | INTEGER FK |
| name | TEXT |
| distance_km | REAL |
| date | TEXT |
| moving_time_s | INTEGER |
| elevation_m | REAL |
| strava_activity_id | TEXT (null until Strava connected) |

### service_logs
| column | type |
|---|---|
| id | INTEGER PK |
| component_id | INTEGER FK |
| date | TEXT |
| km_at_service | REAL |
| type | TEXT (service / replace) |
| notes | TEXT |
| cost | REAL |

---

## Standard Components (defaults when adding a bike)

| Component | Service interval | Replace interval |
|---|---|---|
| Chain | — | 2,500 km |
| Cassette | — | 12,000 km |
| Front Tyre | — | 4,000 km |
| Rear Tyre | — | 3,000 km |
| Brake Pads Front | — | 3,000 km |
| Brake Pads Rear | — | 3,000 km |
| Bar Tape | — | 5,000 km |
| Cables & Housing | — | 8,000 km |
| Bottom Bracket | 10,000 km | 20,000 km |
| Fork Service | 3,000 km | — |

---

## Features — Phase 1 (MVP)

- [ ] Add / edit / delete bikes
- [ ] Auto-populate standard components when bike is added
- [ ] Add / edit / delete components per bike
- [ ] Manual ride entry (date, distance, bike, name)
- [ ] Auto-calculate km on each component since install date
- [ ] Service log — log a service or replacement for any component
- [ ] When component is replaced, reset its km counter (new install_km)
- [ ] Component health bar — % toward replacement threshold
- [ ] Colour coding: green < 70%, amber 70–90%, red > 90%
- [ ] Dashboard — all bikes, each with component health summary

## Features — Phase 2 (Polish)

- [ ] Alerts panel — components overdue or due soon
- [ ] Ride history list per bike
- [ ] Cost tracking on service logs
- [ ] Export service history as CSV
- [ ] Responsive mobile layout

## Features — Phase 3 (Strava)

- [ ] Strava OAuth 2.0 login
- [ ] Pull all historical activities on first connect
- [ ] Map Strava gear IDs to bikes
- [ ] Webhook listener for new rides (auto-sync)
- [ ] Manual sync button

---

## API Endpoints

```
GET    /api/bikes
POST   /api/bikes
PUT    /api/bikes/:id
DELETE /api/bikes/:id

GET    /api/bikes/:id/components
POST   /api/components
PUT    /api/components/:id
DELETE /api/components/:id

GET    /api/bikes/:id/rides
POST   /api/rides
DELETE /api/rides/:id

GET    /api/components/:id/logs
POST   /api/service-logs
DELETE /api/service-logs/:id

GET    /api/bikes/:id/health      # km per component, % to threshold
```

---

## Running Locally

```bash
# Backend
cd backend && npm install && npm run dev   # port 3001

# Frontend
cd frontend && npm install && npm run dev  # port 5173
```

---

## Tomorrow's Build Order

1. Backend scaffold — Express server, SQLite schema, seed data
2. All API routes with tests via curl/REST
3. Frontend scaffold — Vite + React + Tailwind
4. Dashboard page — bike cards with health overview
5. Bike detail page — component list with health bars
6. Add/edit modals — bikes, components, rides
7. Service log page — history + log new entry
8. Alerts — overdue and due-soon components
9. Polish — mobile layout, loading states, empty states
10. README with setup instructions
