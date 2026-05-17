# Travel Ranchi

Online ticket booking platform for buses, agents, and fleet operations.

## Project Layout

- `frontend/` - Vite React app.
- `backend/` - Spring Boot API, MySQL, and Docker Compose production stack.

## Local Production-Style Run

```sh
cd frontend
npm install
npm run build

cd ../backend
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml up -d --build
```

Open `http://localhost`.

See `backend/DEPLOYMENT.md` for server deployment steps.
