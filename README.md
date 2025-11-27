# Invincible Me

Invincible Me is a lightweight Express + React prototype that helps first-year university students stay anchored in their identity while navigating social pressure. The app delivers mood check-ins, reflection prompts, identity builders, healthy community discovery, simulator scenarios, and a mentor marketplace — all without needing a database.

## Tech Stack

- **API:** Node.js, Express, in-memory data store (no database required)
- **Client:** React (Vite), vanilla CSS
- **Tooling:** Nodemon for API dev, ESLint + Vite for the client

## Getting Started

```sh
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Start both apps in separate terminals
cd server && npm run dev      # API on http://localhost:4000
cd client && npm run dev      # Vite dev server on http://localhost:5173
```

Set `VITE_API_BASE` if your API runs on a non-default URL:

```sh
# client/.env
VITE_API_BASE=https://your-domain.com/api
```

## Production Build

```sh
# Build the client
cd client
npm run build

# Serve the React build with Express
cd ../server
npm install
npm run start
```

The Express server automatically serves `client/dist` when it exists, so you can deploy the `server` folder to any Node-friendly platform (or containerize it) and push the entire repo to GitHub without extra wiring.

## API Overview

| Endpoint | Purpose |
| --- | --- |
| `GET /api/summary` | aggregated stats for check-ins & influence |
| `GET/POST /api/checkins` | log emotions, triggers, pressure levels |
| `GET/POST /api/reflections` | private journaling entries |
| `GET/POST /api/identity` | track personal values, strengths, goals |
| `GET/POST /api/peer-influence` | capture pressure scenarios & impact |
| `GET /api/alerts` | smart reminders derived from recent mood data |
| `GET /api/communities` | curated healthy peer circles |
| `GET /api/mentors` | marketplace of continuing students/mentors |
| `GET /api/simulator` | practice peer-influence scenarios |

All data is stored in-memory, which keeps the prototype deployable without database provisioning.

## Project Goals

- Reduce negative peer influence for freshmen like Julianne.
- Detect stress/burnout signals early via mood trends.
- Reinforce authenticity and value-aligned decisions.
- Offer actionable mentorship and grounded communities.

Feel free to fork, adapt, or plug in a real database when you are ready for a persistent version. For now, everything is optimized to stay minimal, fast, and GitHub-ready.

