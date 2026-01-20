# ft_transcendence 🏓

A modern **real-time multiplayer Pong tournament web application** with user authentication, WebSocket support, and integrated chat.

**Project Status:** ✅ Fully functional with 14+ module points.

---

## 📋 Project Overview

**ft_transcendence** is a full-stack web application that brings classic Pong gameplay into the modern era with real-time multiplayer capabilities. Two players can compete online in real-time, chat during matches, track their game statistics, and participate in tournament brackets.

### ✨ Key Features

- **🎮 Real-time Multiplayer Pong**: Play 1v1 matches against other users in real-time with seamless synchronization.
- **💬 In-Match Chat**: Communicate with your opponent during gameplay.
- **🔐 Secure Authentication**: Email/password signup and login with bcrypt password hashing and JWT tokens.
- **📊 Game Statistics**: Track match history, wins/losses, and view statistics on persistent leaderboards.
- **🎯 Matchmaking Queue**: Automatic player pairing for quick online games.
- **⚙️ Game Customization**: Adjust ball speed, paddle size, maps, power-ups, and attacks.
- **🤖 AI Opponent**: Play against an intelligent AI in single-player mode.
- **🎪 Tournament System**: Bracket-based tournaments with round management.
- **📱 Responsive Design**: Works seamlessly across desktop and mobile browsers.
- **🐳 Containerized Deployment**: Single-command Docker deployment for easy setup.

---

## 🛠️ Technical Stack

### Frontend
- **TypeScript** with vanilla JavaScript
- **HTML5 Canvas** for game rendering
- **Socket.io-client** for real-time communication
- **CSS3** for responsive styling
- **No frameworks** (vanilla SPA approach)

### Backend
- **Node.js + Express.js** framework
- **PostgreSQL** database with persistent storage
- **Socket.io** for WebSocket multiplayer support
- **JWT** for stateless authentication
- **bcrypt** for secure password hashing
- **Google OAuth 2.0** integration (optional module)

### Infrastructure
- **Docker & Docker Compose** for containerization
- **nginx** as reverse proxy and static file server
- **PostgreSQL 15** with health checks and volume persistence

---

## 📦 Modules Implemented (14+ Points)

| Category | Module | Type | Points | Status |
|----------|--------|------|--------|--------|
| **Web** | WebSockets & Real-time Updates | Major | 2 | ✅ |
| **Web** | User Interaction (Chat) | Major | 2 | ✅ |
| **Gaming** | Complete 1v1 Game (Pong) | Major | 2 | ✅ |
| **Gaming** | Remote Players (Network Multiplayer) | Major | 2 | ✅ |
| **Gaming** | Tournament System | Minor | 1 | ✅ |
| **Gaming** | Game Customization | Minor | 1 | ✅ |
| **User Management** | Game Statistics & Match History | Minor | 1 | ✅ |
| **Gaming** | Advanced Chat Features | Minor | 1 | ✅ |
| | **TOTAL** | | **14** | ✅ |

---

## 🚀 Getting Started

### Prerequisites
- **Docker & Docker Compose** (latest version)
- **Git**
- Modern browser (Chrome, Firefox, Safari, Edge)

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd ft_transcendence

# 2. Create environment file from template
cp .env.example .env

# 3. (Optional) Edit .env for custom configuration
#    - DB_PASS: PostgreSQL password
#    - JWT_SECRET: JWT signing secret
#    - FRONTEND_URL: http://localhost:8080 (or your domain)
#    - GOOGLE_CLIENT_ID/SECRET: Only needed for OAuth

# 4. Build and start all services
make re

# 5. Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api
```

### Alternative Commands

```bash
# Using Docker Compose directly
docker compose down
docker compose up --build

# Or using npm (requires Node.js 18+)
cd backend && npm install && npm run build && npm start &
npm install && npm run build
# Then serve frontend from ./build directory
```

---

## 📖 Usage Guide

### Authentication
1. **Sign Up**: Create a new account with email and password
2. **Login**: Access with registered credentials
3. **Logout**: Click logout button in header or welcome screen

### Playing a Game
1. Click **"Multiplayer Quick Game"** on welcome screen
2. Wait for opponent to join (or open another browser tab with different account)
3. When both players ready, game starts automatically
4. **Controls:**
   - **Player 1 (Left)**: W/S keys to move paddle up/down
   - **Player 2 (Right)**: Arrow Up/Down keys to move paddle up/down
5. **Chat**: Type messages in the chat panel to communicate with opponent
6. **Exit Match**: Click "Exit Match" button to leave early

### Tournament Mode
1. Click **"Start New Tournament"**
2. Add player aliases (minimum 2)
3. Click **"Begin Tournament"**
4. Play matches in bracket order
5. Winners advance automatically

### Game Statistics
- Click **"Stats"** to view match history
- Local stats are saved in browser storage
- Each match records: date, players, winner, score

### Single Player
- Click **"Single Player"** to play against AI
- AI adapts difficulty based on your gameplay

### Game Settings
- Click **"Settings"** to customize:
  - Ball speed (2-12)
  - Paddle size (40-200)
  - Map size (compact/classic/extended)
  - Power-ups and attacks (toggle)
  - Simple mode (toggle)

---

## 🌐 Remote Testing (Multi-Device)

### Method 1: Same Network (LAN)
```bash
# Find your Windows/Linux host IP
ipconfig          # Windows
ip addr show      # Linux/WSL

# Access from another device on same network
http://<HOST_IP>:8080
```

### Method 2: ngrok Tunnel (Public Access)
```bash
# Install ngrok from https://ngrok.com
ngrok http 8080

# Share the public HTTPS URL with others
https://your-ngrok-url.ngrok.io
```

---

## 📁 Project Structure

```
ft_transcendence/
├── Dockerfile              # Frontend build & nginx serving
├── docker-compose.yml      # Multi-service orchestration
├── Makefile                # Convenience commands
├── nginx-config.conf       # Reverse proxy & CSP configuration
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment template
│
├── src/                    # Frontend TypeScript source
│   ├── index.html          # SPA HTML with auth/game screens
│   ├── main.ts             # App entry, game engine, WebSocket logic
│   ├── privacy-policy.html
│   ├── terms-of-service.html
│   └── styles/
│       ├── app.css         # Main styling
│       ├── auth.css        # Auth form styling
│
├── build/                  # Compiled JavaScript (generated)
│
└── backend/                # Node.js Express backend
    ├── Dockerfile          # Backend build & runtime
    ├── package.json        # Backend dependencies
    ├── tsconfig.json
    │
    ├── src/
    │   ├── index.ts        # Express server, WebSocket init
    │   ├── db/
    │   │   ├── init.ts     # Database schema initialization
    │   │   └── connection.ts
    │   ├── routes/
    │   │   ├── auth-new.ts # Auth endpoints (signup/login/verify/google)
    │   │   ├── games.ts    # Game statistics routes
    │   │   └── users.ts    # User profile routes
    │   ├── utils/
    │   │   ├── auth.ts     # JWT token generation/verification
    │   │   ├── validation.ts
    │   │   └── user.ts
    │   └── websocket/
    │       └── gameServer.ts # Socket.io game logic & matchmaking
    │
    └── build/              # Compiled JavaScript (generated)
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/verify` - Verify JWT token (protected)
- `GET /api/auth/google/url` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Google OAuth callback

### Games
- `GET /api/games/history` - Get user's match history (protected)
- `GET /api/games/stats` - Get user's game statistics (protected)

### Users
- `GET /api/users/:id` - Get user profile info

### Health
- `GET /api/health` - Backend health check

---

## 🔌 WebSocket Events

### Client → Server
- `join-queue` - Join matchmaking queue
- `paddle-move` - Send paddle Y position during match
- `chat-message` - Send message to opponent
- `leave-game` - Leave ongoing match

### Server → Client
- `queue-joined` - Confirmation + queue position
- `game-start` - Match found, game starting
- `game-update` - Game state (ball, paddles, score) 60 FPS
- `game-over` - Match ended with winner info
- `chat-message` - Receive opponent message

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt (10 rounds)
- **JWT Authentication**: Stateless token-based auth
- **Input Validation**: Both frontend and backend validation
- **CORS**: Configured for same-origin requests
- **Content Security Policy**: Strict CSP headers via nginx
- **Environment Secrets**: Sensitive data in `.env` (never committed)
- **SQL Injection Prevention**: Parameterized queries (pg)

---

## 📊 Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### game_stats
```sql
CREATE TABLE game_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### game_history
```sql
CREATE TABLE game_history (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER REFERENCES users(id),
  player2_id INTEGER REFERENCES users(id),
  winner_id INTEGER REFERENCES users(id),
  score_player1 INTEGER,
  score_player2 INTEGER,
  match_date TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Test Multiplayer Locally
```bash
# Terminal 1: Start docker stack
make re

# Terminal 2 & 3: Open two browser tabs/windows
# Ctrl+Shift+N for private/incognito windows
http://localhost:8080

# Step 1: Register/login with different accounts
# Step 2: Click "Multiplayer Quick Game" in both
# Step 3: Match starts automatically
# Step 4: Control with W/S and Arrow Up/Down
# Step 5: Chat during match
# Step 6: Game ends, stats saved
```

### Test on Different Device
```bash
# Find your host IP (see Remote Testing section)
# Open URL: http://<HOST_IP>:8080 from another device

# Or use ngrok for public testing
make re
ngrok http 8080
# Share the public URL
```

---

## 📋 Environment Variables

Create a `.env` file from `.env.example`:

```env
# Database
DB_USER=ponguser
DB_PASS=securepassword
DB_NAME=transcendence
DB_PORT=5432

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=3000
JWT_SECRET=your-secret-key-here-min-32-chars

# Frontend
FRONTEND_URL=http://localhost:8080

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9   # macOS/Linux
netstat -ano | findstr :8080    # Windows

# Or use different ports in docker-compose.yml
```

### Database Connection Error
```bash
# Check PostgreSQL container health
docker ps -a

# View logs
docker logs transcendence-db-1

# Reset database
docker compose down -v  # Removes volumes
docker compose up --build
```

### WebSocket Connection Failed
- Check browser console (F12)
- Ensure backend is running (`docker logs transcendence-backend-1`)
- Verify CSP headers allow WebSocket (`connect-src 'self' ws: wss:;`)
- For ngrok: Update `FRONTEND_URL` env variable

### Blank Page / 404
- Hard reload browser: Ctrl+Shift+R or Cmd+Shift+R
- Clear browser cache
- Check nginx logs: `docker logs transcendence-1`

---

## 👥 Team & Attribution

**Solo Developer**: [edoar](https://github.com/edoar)

---

## 📄 Legal

- [Privacy Policy](./src/privacy-policy.html) - How we handle your data
- [Terms of Service](./src/terms-of-service.html) - Usage terms and conditions

---

## 📚 References & Resources

- [MDN Web Docs - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [42 School Curriculum](https://www.42.fr/)

---

## 📝 License

This project is part of the 42 school curriculum. All rights reserved.

---

**Last Updated**: January 20, 2026  
**Status**: ✅ Production Ready

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