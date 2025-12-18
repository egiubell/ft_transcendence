# ft_transcendence – Project Context for Copilot

## Stato attuale (2025-12-18)
- Frontend: TypeScript SPA (no bundler), build via `npm run compile` → `build/main.js`, served by nginx.
- Backend: Node/Express + PostgreSQL, JWT auth, bcrypt hashing. Entrypoint `backend/src/index.ts`.
- Docker: Multi-service (`frontend nginx`, `backend node`, `db postgres`) via `docker-compose.yml`.
- CSP: Nginx config allows `connect-src 'self' http://localhost:3000`.
- Auth: JWT stored in localStorage; auth logic inlined in `src/main.ts`. Login/signup forms in `src/index.html`. Logout buttons in header and welcome screen.
- Legal pages: `src/privacy-policy.html`, `src/terms-of-service.html`.

## Directory e file chiave
- `/Dockerfile` (frontend build + nginx runtime)
- `/nginx-config.conf` (CSP, SPA routing)
- `/docker-compose.yml` (frontend/back/db services)
- `/src/index.html` (SPA, auth screen, header logout)
- `/src/main.ts` (app + AuthService inline)
- `/src/styles/app.css`, `/src/styles/auth.css`
- `/backend/src/index.ts` (Express server mount routes)
- `/backend/src/routes/auth-new.ts` (auth endpoints: signup/login/verify)
- `/backend/src/routes/users.ts`, `/backend/src/routes/games.ts`
- `/backend/src/db/init.ts` (schema: users, games, game_stats)
- `/backend/src/utils/auth.ts` (JWT helpers), `/utils/validation.ts`
- `.env.example` (vars for db/backend/JWT)

## Cose completate
- Backend scaffolding Express + PostgreSQL
- Schema DB (users, games, game_stats)
- Auth JWT (signup/login/verify) + bcrypt hashing
- Privacy Policy & Terms of Service pages
- Frontend auth UI funzionante; CSP sistemato
- Pulizia: rimossi file duplicati `src/auth.ts` e `backend/src/routes/auth.ts`

## To do (dalla lista corrente)
- Aggiungere CSS framework (Tailwind)
- Implementare form validation (frontend+backend)
- Configurare HTTPS/TLS per backend
- Implementare multi-user WebSocket support
- Aggiungere .env per credentials e secrets
- Testare Chrome compatibility + console errors
- Aggiungere responsiveness/accessibility
- Verificare commit history + team attribution

## Note operative
- Per buildare e avviare:
  - `docker compose -p transcendence build --no-cache`
  - `docker compose -p transcendence up -d`
- Se CSP blocca richieste: controllare `nginx-config.conf` `connect-src`.
- AuthService è inline in `src/main.ts`; non serve `src/auth.ts` (già rimosso).

## Possibili piccoli miglioramenti futuri
- Rinominare `backend/src/routes/auth-new.ts` in `auth.ts` (uniformità)
- Introdurre `src/components/` e `src/types/` se si cresce lato frontend
- Rimuovere `src/content-area.html` se inutilizzato
- Aggiungere `.env` reale (non solo example) per sviluppo locale
