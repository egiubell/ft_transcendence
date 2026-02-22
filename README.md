# ft_transcendence 🏓

**A modern real-time multiplayer Pong tournament web application**

[![Project Status](https://img.shields.io/badge/Status-Production_Ready-success)]()
[![Module Points](https://img.shields.io/badge/Module_Points-14%2F14-brightgreen)]()
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)]()
[![HTTPS](https://img.shields.io/badge/HTTPS-Enabled-green)]()

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Module Points (14/14)](#-module-points-1414-)
4. [Quick Start](#-quick-start)
5. [Complete Setup Guide](#-complete-setup-guide)
6. [Usage Guide](#-usage-guide)
7. [Testing](#-testing)
8. [API Reference](#-api-reference)
9. [Configuration](#-configuration)
10. [Security](#-security)
11. [Troubleshooting](#-troubleshooting)
12. [Project Structure](#-project-structure)
13. [Technology Stack](#-technology-stack)

---

## 🎯 Overview

**ft_transcendence** is a full-stack web application that brings classic Pong gameplay into the modern era with real-time multiplayer capabilities. Built for the 42 school curriculum, this project implements a complete tournament system where players can compete online in real-time, chat during matches, track game statistics, participate in tournament brackets, and enjoy the interface in 3 different languages.

### Highlights

- ✅ **14/14 Module Points Complete** - All requirements met
- 🎮 **Real-time Multiplayer** - 60 FPS server-authoritative gameplay
- 🤖 **AI Opponent** - Smart single-player mode with difficulty levels
- 🔌 **Auto-Reconnection** - 60-second grace window for seamless resumption
- 🌐 **Multi-language** - English, Italian, French (80+ translated elements)
- 🔐 **OAuth 2.0** - Google authentication + email/password
- 🏆 **Tournament System** - Bracket-based competitions (2-8 players)
- 🐳 **Single-Command Deploy** - Docker Compose with HTTPS

---

## ✨ Key Features

### Major Features (8 points)

- **🎮 Real-time Multiplayer Pong** (2 pts)  
  Play 1v1 matches against other users with 60 FPS server-author itative physics and seamless synchronization.

- **💬 Real-time WebSockets** (2 pts)  
  Socket.io integration for instant communication, game state updates, and in-match chat.

- **🤖 AI Opponent** (2 pts)  
  Intelligent AI with predictive paddle movement and configurable difficulty (Easy/Medium/Hard).

- **🔌 Automatic Reconnection** (2 pts)  
  60-second grace window for automatic match resumption without data loss. Resume tokens and state persistence.

### Minor Features (6 points)

- **🔐 OAuth 2.0 Authentication** (1 pt)  
  Secure email/password signup and Google login with JWT tokens.

- **📊 Backend Framework** (1 pt)  
  Express.js with full REST API, type safety, middleware, and database integration.

- **🎪 Tournament System** (1 pt)  
  Bracket-based tournaments for 2-8 players with automatic progression and winner tracking.

- **⚙️ Game Customization** (1 pt)  
  Adjust ball speed, paddle size, maps, power-ups, attacks, and AI difficulty.

- **🌐 Multi-language Support** (1 pt)  
  English, Italian, and French with automatic language switching and localStorage persistence.

- **📱 Multi-browser Support** (1 pt)  
  Tested and verified on Chrome, Firefox, Edge, and Opera - fully compatible.

---

## 📦 Module Points (14/14 ✅)

### Major Modules (2 points each = 8 points)

| # | Module | Status | Implementation |
|---|--------|--------|----------------|
| 1 | **WebSockets & Real-time** | ✅ | Socket.io 60 FPS game state broadcast |
| 2 | **Web-based Multiplayer Game** | ✅ | Pong 1v1 with server-authoritative physics |
| 3 | **AI Opponent** | ✅ | Predict ive paddle AI with difficulty levels |
| 4 | **Disconnect/Reconnection** | ✅ | 60-second grace window with automatic resume |

### Minor Modules (1 point each = 6 points)

| # | Module | Status | Implementation |
|---|--------|--------|----------------|
| 5 | **Backend Framework** | ✅ | Express.js with full REST API |
| 6 | **OAuth 2.0 Authentication** | ✅ | Google OAuth 2.0 integration |
| 7 | **Tournament System** | ✅ | Bracket-based (2-8 players) |
| 8 | **Game Customization** | ✅ | Settings, sliders, difficulty levels |
| 9 | **Multi-browser Support** | ✅ | Chrome, Firefox, Edge, Opera tested |
| 10 | **Internationalization (i18n)** | ✅ | 3 languages (EN, IT, FR) with 80+ keys |

**TOTAL: 14/14 Points ✅**

For detailed module documentation, see [MODULES.md](MODULES.md).
For technical architecture, see [CONTEXT.md](CONTEXT.md).

---

## 🚀 Quick Start

**Get the application running in under 5 minutes:**

### Prerequisites

- Docker & Docker Compose (v2.0+)
- Git
- Modern web browser

### One-Command Deployment

```bash
# Clone repository
git clone <repository-url>
cd ft_transcendence

# Create environment file
cp .env.example .env

# Generate SSL certificates (one-time setup)
bash generate-certs.sh

# Build and start everything
make start
```

### Access the Application

```
🌐 Frontend: https://localhost:8443
🔧 Backend API: https://localhost:3000/api
📊 Database: PostgreSQL on port 5432
```

**⚠️ SSL Certificate Warning**: Your browser will show a security warning because the certificate is self-signed. Click "Advanced" → "Proceed to localhost (unsafe)" - this is normal for development.

### Quick Test (2 Browser Tabs)

```bash
# Tab 1: Sign up as Player 1
Email: player1@test.com, Username: Player1

# Tab 2: Sign up as Player 2
Email: player2@test.com, Username: Player2

# Both tabs: Click "Multiplayer Quick Game"
# → Automatic matchmaking pairs you
# → Game starts with real-time sync!

# Controls:
# Player 1 (left): W/S keys
# Player 2 (right): Arrow Up/Down
# Chat: Type messages in the chat panel
```

---

## 📖 Complete Setup Guide

### Step 1: Prerequisites

Verify you have all required tools installed:

```bash
docker --version        # Should show Docker 20.10+
docker compose version  # Should show Compose 2.0+
git --version          # Any recent version
openssl version        # For certificate generation
```

### Step 2: Clone Repository

```bash
git clone <repository-url>
cd ft_transcendence

# Verify directory structure
ls -la
# You should see: docker-compose.yml, Makefile, Dockerfile, etc.
```

### Step 3: Environment Configuration

The application requires a `.env` file for configuration.

```bash
# Create from template
cp .env.example .env

# Edit if needed (optional)
nano .env
```

**Default `.env` configuration:**

```dotenv
# Frontend
FRONTEND_URL=https://localhost:8443

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=3000
USE_HTTPS=true
SSL_KEY_PATH=/app/certs/server.key
SSL_CERT_PATH=/app/certs/server.cert

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=transcendence
DB_USER=ponguser
DB_PASS=DBpassword

# Security (change for production!)
JWT_SECRET=<auto-generated>
SESSION_SECRET=<auto-generated>
APP_SECRET=<auto-generated>

# Google OAuth (optional - see next section)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://localhost:8443/api/auth/google/callback
```

**⚠️ For production**: Generate new secure secrets:

```bash
# Generate random secrets
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 32  # Use for SESSION_SECRET
openssl rand -hex 32  # Use for APP_SECRET
openssl rand -hex 32  # Use for DB_PASS
```

### Step 4: Google OAuth Setup (Optional)

**Skip this if you only want email/password authentication.**

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → Enable "Google OAuth API"
3. Create OAuth 2.0 Client ID credentials:
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add `https://localhost:8443/api/auth/google/callback`
4. Copy **Client ID** and **Client Secret**

#### Update .env

```bash
nano .env

# Update these lines:
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-secret>
GOOGLE_REDIRECT_URI=https://localhost:8443/api/auth/google/callback
```

**Note**: The redirect URI must match exactly what you registered in Google Cloud.

### Step 5: Generate SSL Certificates

```bash
bash generate-certs.sh
```

Expected output:
```
🔐 Generating self-signed SSL certificates...
✅ Certificates generated:
   Key:  backend/certs/server.key
   Cert: backend/certs/server.cert
```

### Step 6: Build and Start

```bash
# Quick start (recommended)
make start

# OR: Clean rebuild from scratch
make re

# OR: Development mode with live logs
make dev
```

The `make start` command will:
1. Check Docker is running
2. Build all images (frontend, backend, database)
3. Start all containers
4. Run database migrations
5. Show access URLs

### Step 7: Access Application

Open your browser to:

```
https://localhost:8443
```

**Accept the SSL certificate warning** (this is normal for self-signed certificates):

- **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Safari**: Click "Show Details" → "Visit this website"

You should see the **Welcome Screen** with login/signup options.

---

## 📖 Usage Guide

### 1. Authentication

#### Email/Password Signup

1. Open https://localhost:8443
2. Click **"Sign Up"**
3. Enter email, username, password (min 8 characters)
4. Click **"Sign Up"** → Automatically logged in

#### Google OAuth Login (if configured)

1. Click **"Continue with Google"**
2. Select your Google account
3. Grant permissions → Automatically logged in

### 2. Single Player (vs AI)

```
Main Menu → Click "Single Player"
├─ Game starts immediately
├─ You control LEFT paddle: W/S keys
├─ AI controls RIGHT paddle: automatic
├─ First to 5 points wins
└─ AI difficulty: Adjustable in Settings
```

### 3. Multiplayer (Real-time 1v1)

```
Main Menu → Click "Multiplayer Quick Game"
├─ Enter matchmaking queue
├─ Wait for opponent
├─ When 2 players ready → GAME STARTS
│
├─ Controls:
│  └─ Movement: W/S keys
│
├─ Chat: Type messages, press Enter
└─ First to 5 points wins

Player 2 → launch "hostname -I | awk '{print $1}'" on main pc
├─ insert "https://ip:8443"
├─ Enter matchmaking queue
├─ Wait for opponent
├─ When 2 players ready → GAME STARTS
└─ First to 5 points wins
```

### 4. Tournament Mode

```
Main Menu → Click "Start New Tournament"
├─ Add 2-8 players (enter aliases)
├─ Click "Begin Tournament"
├─ Play bracket matches
├─ Winners advance automatically
└─ Final match determines champion
```

### 5. Statistics

```
Main Menu → Click "Stats"
├─ Total Wins/Losses/Win Rate
└─ Match History (last 10 games)
```

### 6. Settings

```
Click "Settings" icon → Adjust:
├─ Ball Speed (1-10)
├─ Paddle Size (50-200px)
├─ AI Difficulty (Easy/Medium/Hard)
├─ Map (Classic/Neon/Retro)
├─ Power-ups (ON/OFF)
└─ Attacks (ON/OFF)
```

### 7. Language Selection

```
Welcome Screen → Language buttons:
├─ 🇬🇧 EN (English)
├─ 🇮🇹 IT (Italiano)
└─ 🇫🇷 FR (Français)
```

---

## 🧪 Testing

### Test Multiplayer Locally (2 Tabs)

```bash
# Tab 1: Player 1
1. Sign up: player1@test.com / Player1
2. Click "Multiplayer Quick Game"
3. Wait in queue

# Tab 2: Player 2 (Incognito window)
1. Sign up: player2@test.com / Player2
2. Click "Multiplayer Quick Game"
3. Game auto-starts!

# Both: Play to 5 points
# ✅ Real-time sync, chat, stats saved
```

### Test Reconnection (60s Grace Window)

```bash
1. Start multiplayer game (2 tabs)
2. During match, CLOSE Tab 1
3. Tab 2 shows: "Waiting 60s..."
4. Reopen Tab 1 within 60 seconds
5. ✅ Game automatically resumes!
6. If >60s → Tab 2 wins by forfeit
```

### Test AI Opponent

```bash
1. Main Menu → "Single Player"
2. ✅ AI paddle responds to ball
3. ✅ AI difficulty adjustable in Settings
4. ✅ Game completes when reaching 5 points
```

### Test Language Switching

```bash
1. Welcome Screen → Click "IT" (Italian)
2. ✅ All UI text switches to Italian
3. Click "FR" (French)
4. ✅ All UI text switches to French
5. Reload page
6. ✅ Language selection persists
```

---

## 🔌 API Reference

### REST Endpoints

#### Authentication

```http
POST   /api/auth/signup         # Register new user
POST   /api/auth/login          # Login with email/password
GET    /api/auth/verify         # Verify JWT token (protected)
GET    /api/auth/google/url     # Get Google OAuth URL
GET    /api/auth/google/callback  # Google OAuth callback
```

#### Games

```http
GET    /api/games/history       # Get match history (protected)
GET    /api/games/stats         # Get user statistics (protected)
```

#### Users

```http
GET    /api/users/:id           # Get user profile
```

#### Health

```http
GET    /api/health              # Backend health check
```

### WebSocket Events

#### Client → Server

- `join-queue` - Join matchmaking
- `paddle-move` - Update paddle position
- `chat-message` - Send chat message
- `leave-game` - Leave current match
- `resume-game` - Resume disconnected match

#### Server → Client

- `queue-joined` - Queue confirmation
- `game-start` - Match found, game starting
- `game-update` - Game state (60 FPS)
- `game-over` - Match ended
- `chat-message` - Incoming chat
- `player-disconnected` - Opponent disconnected
- `opponent-returned` - Opponent reconnected
- `game-resumed` - Match resumed
- `resume-failed` - Resume attempt failed

For detailed API documentation, see [CONTEXT.md](CONTEXT.md).

---

## ⚙️ Configuration

### Makefile Commands

```bash
make start         # Quick start with checks
make build         # Build Docker images
make up            # Start containers
make down          # Stop containers
make logs          # View all logs
make backend-logs  # Backend logs only
make db-logs       # Database logs only
make clean         # Remove containers and images
make db-reset      # Reset database (⚠️ destroys data)
make re            # Complete rebuild
make dev           # Development mode with live logs
```

### Environment Variables

All configuration is done via `.env` file. See `.env.example` for template.

**Required Variables**:
```dotenv
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
JWT_SECRET, SESSION_SECRET, APP_SECRET
FRONTEND_URL, BACKEND_HOST, BACKEND_PORT
USE_HTTPS, SSL_KEY_PATH, SSL_CERT_PATH
```

**Optional Variables** (for Google OAuth):
```dotenv
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
```

### Database Schema

```sql
-- users table
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

-- game_stats table
CREATE TABLE game_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- game_history table
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

## 🔒 Security

### Implemented Security Measures

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Stateless tokens with HS256 signing
- **Input Validation**: Frontend and backend validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: HTML escaping, no innerHTML for user content
- **CORS**: Configured for same-origin
- **Content Security Policy**: Strict CSP headers via nginx
- **HTTPS Everywhere**: All traffic encrypted
- **Environment Secrets**: Sensitive data in `.env` (never committed)

### Security Headers (nginx)

```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "...";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### Production Best Practices

⚠️ **Before deploying to production**:

1. Generate strong secrets (`openssl rand -hex 32`)
2. Use real SSL certificates (Let's Encrypt)
3. Restrict CORS to specific domain
4. Enable rate limiting
5. Use strong unique database password
6. Enable logging and monitoring
7. Never commit `.env` to git

---

## 🔍 Troubleshooting

### Common Issues

#### "Cannot connect to Docker daemon"

```bash
# Start Docker
sudo systemctl start docker  # Linux
# OR open Docker Desktop     # Mac/Windows
```

#### "Port already in use (8443)"

```bash
# Find what's using the port
sudo lsof -i :8443       # Mac/Linux
netstat -ano | findstr :8443  # Windows

# Change port in .env or stop conflicting service
```

#### "502 Bad Gateway"

```bash
# Check backend status
docker compose -p transcendence ps
make backend-logs

# Reset if needed
make db-reset
```

#### "WebSocket connection failed"

```bash
# Verify HTTPS is enabled
docker compose logs backend | grep HTTPS
# Should see: "🔒 HTTPS enabled"

# Rebuild if needed
make re
```

#### "Google OAuth not working"

```bash
# Check credentials in .env
cat .env | grep GOOGLE

# Verify redirect URI matches Google Cloud Console
# Rebuild after changes
make re
```

#### "Database connection failed"

```bash
# Password mismatch - reset database
make db-reset  # ⚠️ Destroys all data
```

#### "Can't access from another PC"

```bash
# Get local IP
hostname -I | awk '{print $1}'

# Allow firewall
sudo ufw allow 8443/tcp  # Linux

# Access: https://<your-ip>:8443
# Note: Google OAuth won't work with IP
```

### Still Having Issues?

```bash
# Check logs
make logs           # All services
make backend-logs   # Backend only
make db-logs        # Database only
```

---

## 📁 Project Structure

```
ft_transcendence/
├── Dockerfile              # Frontend build (nginx)
├── docker-compose.yml      # Multi-service orchestration
├── Makefile                # Deployment commands
├── generate-certs.sh       # SSL certificate generation
├── nginx-config.conf       # Reverse proxy + CSP
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript config
├── .env.example            # Environment template
│
├── README.md               # This file (complete docs)
├── MODULES.md              # Module points breakdown
├── CONTEXT.md              # Technical architecture
│
├── src/                    # Frontend TypeScript
│   ├── index.html          # SPA root
│   ├── main.ts             # App logic (~2000 lines)
│   ├── i18n.ts             # Internationalization
│   ├── i18n/               # Translation files (EN/IT/FR)
│   └── styles/             # CSS files
│
└── backend/                # Node.js backend
    ├── Dockerfile
    ├── package.json
    ├── certs/              # SSL certificates
    └── src/
        ├── index.ts        # Express server
        ├── db/             # Database schema
        ├── routes/         # API endpoints
        ├── utils/          # Helpers
        └── websocket/      # Socket.io game server
```

---

## 🛠️ Technology Stack

### Frontend

- **TypeScript** - Type-safe vanilla JavaScript
- **HTML5 Canvas** - 60 FPS game rendering
- **Socket.io-client** - Real-time WebSocket
- **Tailwind CSS** - Responsive UI
- **Custom i18n** - 3 languages (EN, IT, FR)

### Backend

- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL 15** - Relational database
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Google OAuth 2.0** - Social auth

### Infrastructure

- **Docker & Docker Compose** - Containerization
- **nginx** - Reverse proxy with HTTPS
- **Self-signed SSL** - Development certificates

---

## 🎉 Success!

If you've completed the setup, your **ft_transcendence** application is now running!

**What's next?**:
- ✅ Try all 3 game modes (Single, Multi, Tournament)
- ✅ Test language switching (EN, IT, FR)
- ✅ Explore game customization
- ✅ Check statistics
- ✅ Test reconnection (close/reopen tab)
- ✅ Invite friends to play!

**For evaluation**:
- All 14 module points implemented and testable
- See [MODULES.md](MODULES.md) for detailed verification
- See [CONTEXT.md](CONTEXT.md) for technical deep-dive

---

**Happy Ponging! 🏓**
