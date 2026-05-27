# VIA Urban MicroFarm — Frontend

**Live Demo:** [urbanmicrofarm.azurewebsites.net](https://urbanmicrofarm.azurewebsites.net/)

A web application for managing and monitoring urban micro-farming environments. Users can track growing setups, monitor real-time sensor data (temperature, soil moisture, sunlight), view AI-driven predictions, and manage watering events.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Router v7 (SSR) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| HTTP Client | Axios |
| Build Tool | Vite |
| Testing | Vitest + React Testing Library |

## Project Structure

```
app/
├── api/              # Axios client with auth interceptors
├── components/       # Reusable UI components
│   ├── growingSetup/ # Setup cards and modals
│   ├── icons/        # Custom SVG icons
│   └── plant/        # Plant subpages (basic data, predictions, historical data)
├── context/          # AuthContext, AlertsContext
├── model/            # TypeScript types (plant, sensor, alerts, growingSetup)
├── mocks/            # Mock data for tests
├── routes/           # Page components (home, plant, growing-setup, alerts, account, login, register)
└── services/         # API service layer (plants, sensors, predictions, watering, alerts)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start dev server (http://localhost:5173)
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` |

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run typecheck` | Run TypeScript type checking |

## Docker

### Start the development server

```bash
docker compose up --build
```

The app will be available with hot-reloading. Stop with `CTRL+C`, or run detached with `-d`.

### Stop and remove containers

```bash
docker compose down
```

To also remove orphaned volumes:

```bash
docker compose down -v
```

### Remove the image (free disk space)

```bash
docker rmi via_urbanmicrofarm_front-frontend
```

## Testing

```bash
npx vitest
```

Tests use Vitest with React Testing Library. Mocks are located in `app/mocks/`.

## Features

- **Dashboard** — view all growing setups, add new ones by serial number
- **Plant pages** — basic plant data, AI-powered predictions chart, historical sensor data
- **Alerts** — watering event tracking and toast notifications
- **Account** — user settings and light/dark/system theme preferences
- **Authentication** — JWT login/register with auto-logout on session expiry
