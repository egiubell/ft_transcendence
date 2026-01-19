# ft_transcendence

*This project has been created as part of the 42 curriculum by [edoar](https://profile.intra.42.fr/)*

## Description

**ft_transcendence** is a modern web-based Pong tournament application featuring:
- **Real-time gameplay** with local and tournament modes
- **User authentication** with email/password and Google OAuth 2.0
- **Persistent game statistics** and leaderboards
- **AI opponent** with intelligent decision-making
- **Game customization** (ball speed, paddle size, power-ups, maps)
- **Fully containerized** deployment with Docker

The project demonstrates full-stack web development with TypeScript, Express.js, PostgreSQL, and vanilla JavaScript game engine on canvas.

### Key Technologies
- **Frontend**: TypeScript, vanilla JavaScript, HTML5 Canvas (Pong engine)
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT (local) + Google OAuth 2.0
- **Infrastructure**: Docker Compose, nginx, PostgreSQL with persistent volumes
- **Security**: bcrypt password hashing, environment-based secrets, CORS, input validation

---

## Instructions

### Prerequisites
- Docker & Docker Compose installed
- Git
- (Optional) Node.js 18+ and npm for local development

### Compilation & Installation

```bash
# Clone repository
git clone <repository-url>
cd ft_transcendence

# Copy environment template and configure
cp .env.example .env
# Edit .env with your values:
# - DB_PASS: PostgreSQL password
# - JWT_SECRET: JWT signing secret
# - GOOGLE_CLIENT_ID: Google OAuth client ID
# - GOOGLE_CLIENT_SECRET: Google OAuth secret
# - GOOGLE_REDIRECT_URI: Google OAuth callback URL
# - FRONTEND_URL: Frontend public URL
# - BACKEND_URL: Backend public URL
```

### Execution

```bash
# Start all services with one command
make start

# This will:
# 1. Build Docker images
# 2. Create and initialize PostgreSQL database
# 3. Start frontend (http://localhost:8080)
# 4. Start backend API (http://localhost:3000)
# 5. Expose database (port 5432)

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api
```

### Development

```bash
# Development mode with auto-reload
make dev

# View logs in real-time
make logs

# Stop all services
make down

# Database shell access
make db-shell

# List all users
make list-users

# Reset database
make db-reset
```

---

## Resources

### References & Documentation
- [42 School Curriculum](https://www.42.fr/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

### AI Usage Disclosure
This project was developed by the team with assistance from AI tools (Claude, GitHub Copilot) for:
- Code review and optimization suggestions
- Architecture consultation
- Documentation writing
- Debugging support

All code has been reviewed and verified by the team.

---

## Project Structure

```
ft_transcendence/
├── backend/                          # Express.js Backend
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── db/
│   │   │   ├── connection.ts         # PostgreSQL connection pool
│   │   │   └── init.ts               # Database schema initialization
│   │   ├── routes/
│   │   │   ├── auth-new.ts           # Auth endpoints (signup, login, Google OAuth)
│   │   │   ├── games.ts              # Game endpoints
│   │   │   └── users.ts              # User endpoints
│   │   └── utils/
│   │       ├── auth.ts               # JWT verification, middleware
│   │       ├── user.ts               # User queries and helpers
│   │       └── validation.ts         # Input validation
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── src/                              # Frontend Application
│   ├── index.html                    # Main HTML file (SPA root)
│   ├── main.ts                       # Application entry point
│   │                                 # - AuthService (JWT, signup, login, logout)
│   │                                 # - PongTournamentApp (router, screens, game logic)
│   │                                 # - PongGameEngine (canvas rendering, AI, physics)
│   ├── privacy-policy.html           # Privacy Policy page
│   ├── terms-of-service.html         # Terms of Service page
│   └── styles/
│       ├── app.css                   # Main application styles
│       └── auth.css                  # Authentication form styles
├── docker-compose.yml                # Service orchestration
├── Dockerfile                        # Frontend container (nginx)
├── nginx-config.conf                 # nginx configuration (SPA routing, CSP)
├── Makefile                          # Build automation
├── .env.example                      # Environment variables template
├── .env                              # Environment variables (gitignored)
└── README.md                         # This file
```

---

## Team Information

### Project Scope
This is a **team project** developed collaboratively with clear task distribution and git history showing contributions from all members.

**Team Members**: [Add your names and roles here]
- Member 1: [Role/Responsibilities]
- Member 2: [Role/Responsibilities]
- (etc.)

### Git Workflow & Commits
- All team members have contributed with meaningful commits
- Feature branches are used for development
- Commits follow conventional commit format (feat:, fix:, docs:, etc.)
- Clear commit messages describe changes and their impact
- Project history shows balanced work distribution

---

## Technical Stack & Architecture

### Frontend
- **Language**: TypeScript (compiled to JavaScript)
- **Architecture**: Single-page application (SPA) with client-side routing
- **Styling**: Vanilla CSS with responsive design
- **Game Engine**: Custom canvas-based Pong engine with physics simulation
- **Authentication**: JWT stored in localStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database Driver**: pg (PostgreSQL client)
- **Authentication**: JWT + Google OAuth 2.0
- **Security**: bcrypt for password hashing, CORS configuration

### Database
- **System**: PostgreSQL (relational)
- **Initialization**: Idempotent schema creation (IF NOT EXISTS)
- **Persistence**: Docker volume (postgres_data)
- **Relationships**: Foreign keys for referential integrity

### Infrastructure
- **Containerization**: Docker Compose (3 services)
- **Reverse Proxy**: nginx (frontend, SPA routing, CSP headers)
- **Network**: Internal Docker network with service discovery
- **Environment**: .env-based configuration for secrets

---

## Database Schema

### users table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Relationships**:
- User → Games (as player1_id, player2_id)
- User → GameStats (one-to-one)
- User → Google account (optional, for OAuth)

### games table
```sql
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL REFERENCES users(id),
    player2_id INTEGER NOT NULL REFERENCES users(id),
    winner_id INTEGER REFERENCES users(id),
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Statuses**: pending, in_progress, finished  
**Keys**: Enforces referential integrity via foreign keys

### game_stats table
```sql
CREATE TABLE game_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose**: Denormalized statistics for performance (avoids N+1 queries)

---

## Features

### ✅ Implemented Features

**Authentication & Users**
- ✅ Local signup/login with email and password (bcrypt-hashed)
- ✅ Google OAuth 2.0 integration (account linking)
- ✅ JWT-based session management
- ✅ User profile with game statistics
- ✅ Default avatar fallback

**Game & Gameplay**
- ✅ Real-time Pong game engine (canvas-based, 2D)
- ✅ Single-player vs AI opponent (adjustable difficulty)
- ✅ Local multiplayer (keyboard sharing on same machine)
- ✅ Tournament system with bracket logic
- ✅ AI pathfinding and decision-making

**Game Customization**
- ✅ Ball speed adjustment (slow, normal, fast)
- ✅ Paddle size modification (small, normal, large)
- ✅ Power-ups system (ball-speed, paddle-size buffs)
- ✅ Map selection (compact, extended layouts)
- ✅ Settings persistence per game

**Backend**
- ✅ Express.js REST API
- ✅ PostgreSQL persistent storage
- ✅ Game statistics tracking
- ✅ CORS security
- ✅ Input validation (email format, username length, password strength)

**Infrastructure**
- ✅ Docker containerization (frontend + backend + database)
- ✅ Single-command deployment (make start)
- ✅ nginx reverse proxy with SPA routing
- ✅ Persistent database volumes
- ✅ Environment variable configuration

**Legal**
- ✅ Privacy Policy page (accessible from footer)
- ✅ Terms of Service page (accessible from footer)

### 🔄 Future Enhancements (Not Yet Implemented)
- [ ] WebSocket real-time multiplayer (remote players)
- [ ] Multi-player support (3+ simultaneous players)
- [ ] Chat system with user messaging
- [ ] Friends list and online status
- [ ] Advanced leaderboard with filtering
- [ ] Spectator mode for ongoing games
- [ ] Notification system (game invites, match results)
- [ ] Avatar upload system (custom user images)

---

## Modules

### Scoring Breakdown

The project earns **10 points** toward the required **14-point minimum** through the following modules:

#### MAJOR Modules (2 points each)

| Module | Points | Status | Justification |
|--------|--------|--------|----------------|
| **Web: Use frameworks (frontend + backend)** | 2 | ✅ Implemented | Express.js backend + TypeScript frontend with structured architecture |
| **Gaming: Complete web-based game** | 2 | ✅ Implemented | Fully functional Pong game with canvas rendering, physics, AI opponent |
| **User Management: Standard auth + profile** | 2 | ✅ Implemented | Email/password signup, login, JWT, user profiles with stats, Google OAuth |
| **AI: AI Opponent for games** | 2 | ✅ Implemented | Intelligent Pong AI with pathfinding, ball prediction, adjustable difficulty |

**MAJOR Subtotal: 8 points**

#### MINOR Modules (1 point each)

| Module | Points | Status | Justification |
|--------|--------|--------|----------------|
| **Gaming: Tournament system** | 1 | ✅ Implemented | Bracket logic, matchup ordering, tournament registration and management |
| **Gaming: Game customization** | 1 | ✅ Implemented | Power-ups, ball speed, paddle size, map selection, persistent game settings |

**MINOR Subtotal: 2 points**

#### Gap Analysis (4 points remaining)

To reach the 14-point requirement, **4 additional points** need to be earned. Options:
1. **WebSocket real-time multiplayer** (MAJOR: 2 pts) + **Chat system** (MAJOR: 2 pts) = 4 pts
2. **Remote players** (MAJOR: 2 pts) + **Leaderboard/stats dashboard** (MINOR: 1 pt) + **Notification system** (MINOR: 1 pt) = 4 pts
3. **Add second game** (MAJOR: 2 pts) + **Spectator mode** (MINOR: 1 pt) + **Gamification** (MINOR: 1 pt) = 4 pts

**Current Total: 10/14 points** — Partial completion, see below for next steps.

---

## Individual Contributions

### Team Member 1: [Name]
**Role**: [Frontend/Backend/DevOps/etc.]

**Responsibilities & Achievements**:
- [Specific features implemented]
- [Key technical decisions]
- [Challenges overcome]
- [Code quality improvements]

**Lines of Code**: [Frontend/Backend totals]

### Team Member 2: [Name]
**Role**: [Frontend/Backend/DevOps/etc.]

**Responsibilities & Achievements**:
- [Specific features implemented]
- [Key technical decisions]
- [Challenges overcome]
- [Code quality improvements]

**Lines of Code**: [Frontend/Backend totals]

### Collaboration Notes
- [How tasks were divided]
- [Major architectural decisions made together]
- [Challenges resolved as a team]
- [Code review process]

---

## Setup & Deployment

### Local Development Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd ft_transcendence

# 2. Install dependencies (optional, Docker handles this)
cd backend && npm install
cd ../src && npm install

# 3. Create and configure environment file
cp .env.example .env
# Edit .env with your local values

# 4. Start with Docker
make start

# 5. Access the application
# Frontend: http://localhost:8080
# Backend: http://localhost:3000/api
```

### API Endpoints

**Authentication**
- `POST /api/auth/signup` — Register new user (email, username, password)
- `POST /api/auth/login` — Login with credentials, returns JWT
- `GET /api/auth/verify` — Verify JWT token validity
- `GET /api/auth/google/url` — Get Google OAuth authorization URL
- `GET /api/auth/google/callback?code=...` — Handle Google OAuth callback

**Users**
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user profile with stats
- `GET /api/users/leaderboard/top` — Get top 10 players by wins

**Games**
- `GET /api/games` — List recent games
- `POST /api/games` — Create new game
- `GET /api/games/:id` — Get game details
- `PUT /api/games/:id/finish` — Mark game as finished, update stats

---

## Security Considerations

### Implemented Security Measures
- ✅ **Password Security**: bcrypt hashing with automatic salt (10 rounds)
- ✅ **JWT Authentication**: Stateless session management with HS256 signature
- ✅ **CORS**: Configured to only accept frontend origin
- ✅ **Environment Secrets**: Database password, JWT secret, OAuth credentials in .env (gitignored)
- ✅ **Input Validation**: Email format, username length, password strength (frontend + backend)
- ✅ **SQL Injection Prevention**: Parameterized queries (pg library prepared statements)
- ✅ **Docker Security**: Non-root user in containers, volume permissions

### .env File Security
**IMPORTANT**: Never commit `.env` to version control!
- `.env` is in `.gitignore`
- Use `.env.example` as template
- Update values for local development and production
- Rotate secrets periodically in production
- Use strong, random values (especially DB_PASS and JWT_SECRET)

### Recommended Production Hardening
- [ ] Enable HTTPS/TLS in nginx (use Let's Encrypt)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add request size limits
- [ ] Enable security headers (helmet.js or nginx)
- [ ] Set up log monitoring and alerting
- [ ] Regular security updates for dependencies
- [ ] SQL injection testing (OWASP ZAP)
- [ ] Penetration testing before launch

---

## Troubleshooting

### Application Won't Start
```bash
# Check Docker is running
docker ps

# View logs
make logs

# Check .env file exists and has correct values
cat .env

# Rebuild from scratch
make clean
make start
```

### Database Connection Errors
```bash
# Check database is running
make db-shell

# Reset database to fresh state
make db-reset

# View database logs
make db-logs
```

### Frontend Not Loading
```bash
# Check nginx is serving files
docker exec ft_transcendence-frontend ls /usr/share/nginx/html

# Check browser console for errors (F12)
# Check CORS headers in Network tab

# Rebuild frontend
make rebuild
```

### Google OAuth Not Working
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Check GOOGLE_REDIRECT_URI matches Google Console configuration
- Ensure FRONTEND_URL and BACKEND_URL are correct in .env
- Check browser console for auth errors

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: describe changes"

# Push to remote
git push origin feature/feature-name

# Create pull request for code review
```

### Commit Message Format
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` code restructuring
- `test:` test additions
- `chore:` dependencies, config

---

## Performance & Optimization

### Current Implementation
- Canvas rendering optimized for 60 FPS
- Database queries use indexes on primary/foreign keys
- JWT stateless authentication (no session storage needed)
- Docker volume persistence for database
- nginx gzip compression for assets

### Future Optimizations
- [ ] Implement caching headers for static assets
- [ ] Add database query optimization (EXPLAIN ANALYZE)
- [ ] Compress game assets (minify JS/CSS)
- [ ] Implement lazy loading for images
- [ ] Add CDN for static content

---

## License

MIT License - See LICENSE file for details

---

## Support & Contact

For questions or issues:
1. Check browser console (F12) for errors
2. View application logs: `make logs`
3. Check backend logs: `make backend-logs`
4. Access database shell: `make db-shell`
5. Review GitHub issues and pull requests

**Last Updated**: January 2026  
**Project Version**: 1.0.0

```bash
# Clone and setup
git clone <your-repo>
cd ft_transcendence

# Copy environment template
cp .env.example .env

# Update .env with your values (especially database password)
# DB_PASS=your-secure-password-here
# JWT_SECRET=your-jwt-secret-here

# Start everything with one command
make start
```

## 🎮 Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api
- **Database**: PostgreSQL (port 5432)

## 📋 Available Commands

```bash
# Start everything
make start

# Start in development mode with logs
make dev

# View logs
make logs
make backend-logs
make db-logs

# Stop the application
make down

# Open database shell
make db-shell

# Clean rebuild
make re

# Full help
make help
```

## 📁 Project Structure

```
ft_transcendence/
├── backend/                  # Node.js Express Backend
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── db/
│   │   │   ├── connection.ts # PostgreSQL connection
│   │   │   └── init.ts       # Database initialization & schema
│   │   ├── routes/
│   │   │   ├── auth.ts       # Authentication endpoints
│   │   │   ├── games.ts      # Game endpoints
│   │   │   └── users.ts      # User endpoints
│   │   └── utils/
│   │       └── validation.ts # Input validation
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── src/                      # Frontend TypeScript
│   ├── index.html            # Main HTML file
│   ├── main.ts               # Application entry point & game engine
│   └── styles/
│       └── app.css           # Styling
├── docker-compose.yml        # Orchestration (frontend + backend + database)
├── Dockerfile                # Frontend container (nginx)
├── Makefile                  # Build automation
├── .env.example              # Environment template (copy to .env)
└── README.md                 # This file
```

## 🎯 Features

### Current Implementation
- ✅ Real-time Pong game (2 players, same keyboard)
- ✅ Express.js backend with REST API
- ✅ PostgreSQL database for persistence
- ✅ User authentication (signup/login with hashed passwords)
- ✅ Match history and game statistics
- ✅ User profiles with stats
- ✅ Docker containerization for easy deployment
- ✅ TypeScript for type safety

### In Progress / Planned
- 🔄 WebSocket support for real-time multiplayer
- 🔄 Multi-player game support (3+ players)
- 🔄 Tournament system with AI opponents
- 🔄 User profiles with avatars and friends
- 🔄 Leaderboard
- 🔄 Chat system
- 🔄 Game customization options

## 🔧 Development

### Setup for Development

```bash
# Copy .env.example to .env and update values
cp .env.example .env

# Start development environment (auto-rebuild on changes)
make dev-up

# Watch TypeScript compilation
cd frontend && npm run watch

# Backend development server
cd backend && npm run dev
```

### API Endpoints

**Authentication**
- `POST /api/auth/signup` — Create new user account
- `POST /api/auth/login` — Login with credentials

**Users**
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user with stats
- `GET /api/users/:id/stats` — Get user game statistics
- `GET /api/users/leaderboard/top` — Get top players leaderboard

**Games**
- `GET /api/games` — Get recent games
- `POST /api/games` — Create new game
- `GET /api/games/:id` — Get game details
- `PUT /api/games/:id/finish` — Mark game as finished and update stats

**Health Check**
- `GET /api/health` — Backend health status

## 🔐 Security

- ✅ Passwords hashed with bcrypt (salted)
- ✅ Environment variables for secrets (.env)
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configured for frontend origin
- ✅ Input validation on both frontend and backend
- ✅ Non-root Docker user (security)

### .env File Security
- **DO NOT** commit `.env` file to git
- Copy `.env.example` → `.env` and update with real values
- Use strong passwords and secrets in production
- Rotate secrets regularly

## 🎮 Game Controls

- **Player 1**: W (up) / S (down)
- **Player 2**: Arrow Up / Arrow Down

## 🗄️ Database Schema

**users table**
- id (PK)
- email (unique)
- username (unique)
- password_hash (bcrypt)
- avatar_url
- created_at
- updated_at

**games table**
- id (PK)
- player1_id (FK → users)
- player2_id (FK → users)
- winner_id (FK → users)
- player1_score
- player2_score
- status (pending/in_progress/finished)
- started_at / ended_at / created_at

**game_stats table**
- id (PK)
- user_id (FK → users)
- total_games
- wins
- losses
- updated_at

## 🚢 Production Deployment

1. Build Docker images: `make build`
2. Update `.env` with production values
3. Run: `docker compose up -d`
4. Initialize database: `docker compose exec backend npm run migrate`
5. Access at configured domain

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: describe your changes"

# Push and create pull request
git push origin feature/your-feature
```

## 📞 Support

For issues or questions, check:
- Console browser dev tools (F12) for frontend errors
- `make backend-logs` for API issues
- `make db-logs` for database issues

## 📄 License

MIT