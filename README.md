This project has been created as part
of the 42 curriculum by egiubell, tbardell, spiacent, rauer.

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
3. [Quick Start](#-quick-start)
4. [Usage Guide](#-usage-guide)
5. [Testing](#-testing)
7. [Configuration](#-configuration)
8. [Security](#-security)
9. [Troubleshooting](#-troubleshooting)
10. [Project Structure](#-project-structure)
11. [Database Schema](#-database-schema)
12. [Technology Stack](#-technology-stack)

---

## 📋 Team Members

- **Tbardell** (Project Owner + Developer) : Decided the vision for the webapp, choose the modules and priorities, tracked the backlog and writed the readme. Done the tournament and customization Modules and frontend.
- **Spiacent**: (Project Manager + Developer) : Managed the team and the comunication, assured the meeting and the workflow. Done the Aouth 2.0 Module.
- **Egiubell**: (Technical Lead + Developer) : Decided what technologies to use, setup docker and managed the architecture. Done the websocket Module and backend.
- **Rauer**: (Developer) : implemented the language module and helped the style of the webapp.

---

## 📊 Project Management approach
- Worked both all together in the school, with the expection of Rauer cause he live in germany, and all from home with precise different goal.

---

## 🎯 Overview

**ft_transcendence** is a full-stack web application that brings classic Pong gameplay into the modern era with real-time multiplayer capabilities. Built for the 42 school curriculum, this project implements a complete tournament system where players can compete online in real-time, chat during matches, track game statistics, participate in tournament brackets, and enjoy the interface in 3 different languages.

### Highlights

- ✅ **14/14 Module Points Complete** - All requirements met
- 🎮 **Real-time Multiplayer** - 60 FPS server-authoritative gameplay
- 🤖 **AI Opponent** - Smart single-player mode with difficulty levels
- 🔌 **Auto-Reconnection** - 60-second grace window for seamless resumption
- 🌐 **Multi-language** - English, Italian, French, German (80+ translated elements)
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
  English, Italian, French and German with automatic language switching and localStorage persistence.

- **📱 Multi-browser Support** (1 pt)
  Tested and verified on Chrome, Firefox, Edge, and Opera - fully compatible.

---

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
🌐 Frontend: https://localhost:8443 / http://localhost:8080
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
## 📖 Usage Guide

### 1. Authentication

#### Email/Password Signup

1. Open https://localhost:8443
2. Click **"Sign Up"**
3. Enter email, username, password (min 8 characters)
4. Click **"Sign Up"** → Automatically logged in

#### Google OAuth Login (on main machine)

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
├─ 🇫🇷 FR (Français)
└─ 🇩🇪 DE (Deutsch)
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
# Real-time sync, chat, stats saved
```

### Test Reconnection (60s Grace Window)

```bash
1. Start multiplayer game (2 tabs)
2. During match, CLOSE Tab 1
3. Tab 2 shows: "Waiting 60s..."
4. Reopen Tab 1 within 60 seconds
5. Game automatically resumes!
6. If >60s → Tab 2 wins by forfeit
```

### Test AI Opponent

```bash
1. Main Menu → "Single Player"
2. AI paddle responds to ball
3. Game completes when reaching 5 points
```

### Test Language Switching

```bash
1. Welcome Screen → Click "IT" (Italian)
2. All UI text switches to Italian
3. Click "FR" (French)
4. All UI text switches to French
5. Reload page
6. Language selection persists
```

---
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

## 📚 Database Schema

### **users** table
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
username        VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### **game_stats** table
```sql
user_id         INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
wins            INT DEFAULT 0
losses          INT DEFAULT 0
total_matches   INT DEFAULT 0
last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### **game_history** table
```sql
id              SERIAL PRIMARY KEY
player1_id      INT REFERENCES users(id) ON DELETE SET NULL
player2_id      INT REFERENCES users(id) ON DELETE SET NULL
winner_id       INT REFERENCES users(id) ON DELETE SET NULL
player1_score   INT DEFAULT 0
player2_score   INT DEFAULT 0
played_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 🛠️ Technology Stack

### Frontend

- **TypeScript** - Type-safe vanilla JavaScript
- **HTML5 Canvas** - 60 FPS game rendering
- **Socket.io-client** - Real-time WebSocket
- **Tailwind CSS** - Responsive UI
- **Custom i18n** - 3 languages (EN, IT, FR, DE)

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
- ✅ Test language switching (EN, IT, FR, DE)
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
