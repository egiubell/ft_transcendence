# ft_transcendence - Pong Tournament

A modern web-based Pong tournament application with multiplayer support, user authentication, and real-time gameplay.

**Built with:** TypeScript • Express.js • PostgreSQL • Docker • WebSockets

## 🚀 Quick Start

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