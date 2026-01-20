# Quick Start Guide

**Get ft_transcendence running in 1 command with HTTPS.**

---

## 🚀 Single Command Deployment

```bash
make re
```

This command:
1. Builds all Docker images (frontend, backend, database)
2. Generates self-signed HTTPS certificates (one-time)
3. Starts all containers
4. Initializes the PostgreSQL database
5. Waits for services to be ready
6. Brings up the full application with HTTPS

---

## 🌐 Access the Application

### Frontend (HTTPS Required)
```
https://localhost:8443  ← Main application (nginx reverse proxy)
```

**Note**: Browser will show "Not secure" warning for self-signed certificate.
- Click "Advanced" 
- Click "Proceed to localhost (unsafe)" or similar
- This is normal for development self-signed certs

### Backend API (Internal)
```
https://localhost:3000/api              ← Backend API (Express)
https://localhost:3000/api/health       ← Health check endpoint
HTTP redirects:  http://localhost:8080 → https://localhost:8443
```

### Architecture
```
User Browser
    ↓
http://localhost:8080 (HTTP listener)
    ↓ (redirects)
nginx reverse proxy
    ↓ (HTTPS port 8443)
    ├─→ /api/* → https://backend:3000 (with SSL verification off for self-signed)
    ├─→ /socket.io/* → https://backend:3000 (WebSocket upgrade)
    └─→ /* → static files (frontend build)
```

---

## 🎮 Quick Test: Local Multiplayer (2 Tabs)

```bash
1. Open browser to https://localhost:8443
   (Accept self-signed certificate warning)

2. TAB 1: Sign Up
   - Click "Sign Up"
   - Email: player1@example.com
   - Username: Player1
   - Password: any password
   - Click "Sign Up"

3. TAB 2: Sign Up (different account)
   - Click "Sign Up"
   - Email: player2@example.com
   - Username: Player2
   - Password: any password
   - Click "Sign Up"

4. TAB 1: Queue Up
   - Select language (EN/IT/FR) if desired
   - Click "Multiplayer Quick Game"
   - You're now in queue (position shown)

5. TAB 2: Queue Up
   - Select language (EN/IT/FR) if desired
   - Click "Multiplayer Quick Game"
   - When both players in queue → AUTO-MATCHMAKING

6. GAME STARTS AUTOMATICALLY
   - Player 1 (left paddle): W/S keys
   - Player 2 (right paddle): Arrow Up/Down keys
   - Chat: Type in chat panel to message opponent
   - First to 5 points wins
   - Match ends and stats saved

7. POST-MATCH
   - View stats on Stats screen
   - Replay or try other modes
```

---

## 🌍 Language Switching

Before or after login, click language buttons:
- **EN** → English
- **IT** → Italiano
- **FR** → Français

All UI translates instantly. Your choice persists in browser.

---

## 🔌 Test Reconnection (60-second grace window)

```bash
1. Start multiplayer game (2 players/tabs)
2. Game is running normally
3. CLOSE TAB 1 (disconnect one player)
   - Tab 2 shows "waiting 60s..." status
   - Opponent cannot control paddle
   - Game is paused
4. REOPEN TAB 1 within 60 seconds
   - Reload page or restore tab
   - Game auto-resumes with state preserved
   - Both players can continue playing
5. If >60s passes
   - Opponent auto-wins by forfeit
```

---

## 📊 14 Module Points Achieved ✅

| # | Module | Type | Points | Status | Feature |
|---|--------|------|--------|--------|---------|
| 1 | WebSockets & Real-time | Major | 2 | ✅ | 60 FPS multiplayer sync |
| 2 | Multiplayer Game | Major | 2 | ✅ | Pong 1v1 online |
| 3 | AI Opponent | Major | 2 | ✅ | Single-player mode |
| 4 | Reconnection | Major | 2 | ✅ | 60s grace window |
| 5 | Backend Framework | Minor | 1 | ✅ | Express.js |
| 6 | OAuth 2.0 | Minor | 1 | ✅ | Google login |
| 7 | Tournament | Minor | 1 | ✅ | Bracket system |
| 8 | Customization | Minor | 1 | ✅ | Game settings |
| 9 | Multi-browser | Minor | 1 | ✅ | Chrome/Firefox/Edge/Opera |
| 10 | Internationalization | Minor | 1 | ✅ | EN/IT/FR (3 languages) |
| | **TOTAL** | | **14** | **✅** | **Production Ready** |

---

## 📂 Documentation

- [README.md](README.md) — Full documentation (45 min read)
- [MODULES.md](MODULES.md) — Detailed module breakdown (20 min read)
- [CONTEXT.md](CONTEXT.md) — Technical architecture (30 min read)
- [INDEX.md](INDEX.md) — Documentation navigation
- [AUTH_TODO.md](AUTH_TODO.md) — Completion checklist

---

## 🧪 Test on Different Browsers

```bash
# All tested and working:
Chrome:  https://localhost:8443 ✅
Firefox: https://localhost:8443 ✅
Edge:    https://localhost:8443 ✅
Opera:   https://localhost:8443 ✅

# All support:
✅ Multiplayer games
✅ AI single-player
✅ OAuth login
✅ Tournament mode
✅ Language switching (EN/IT/FR)
✅ Game customization
✅ Reconnection
```

---

## 🧪 Test Other Game Modes

```bash
SINGLE PLAYER (vs AI)
├─ Click "Single Player"
├─ Choose difficulty (Easy/Medium/Hard)
└─ Play against AI

TOURNAMENT
├─ Click "Start New Tournament"
├─ Add 2-4 player aliases
├─ Click "Begin Tournament"
├─ Play bracket matches
└─ Final winner crowned

STATISTICS
├─ Click "Stats"
├─ View match history
└─ See wins/losses

SETTINGS
├─ Click "Settings"
├─ Adjust:
│  ├─ Ball speed (2-12)
│  ├─ Paddle size (40-200)
│  ├─ Map (Classic/Compact/Extended)
│  ├─ Power-ups (On/Off)
│  └─ AI difficulty (Easy/Medium/Hard)
└─ Save and play
```

---

## 🔗 Optional: Google OAuth Setup

Only needed if you want to test "Continue with Google" button:

1. Create Google Cloud project: https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web application)
3. Set Authorized redirect URI: `https://localhost:8443/api/auth/google/callback`
4. Copy Client ID and Client Secret
5. Add to .env:
   ```bash
   GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   ```
6. Restart: `make re`
7. "Continue with Google" button now works

Without this, email/password signup still works fine.

# On remote device, use: http://<YOUR_IP>:8080
```

### Public URL (ngrok)

```bash
# Terminal 1: Start application
make re

# Terminal 2: Tunnel frontend
ngrok http 8080

# Share the HTTPS URL with anyone; works globally
```

---

## 🛠️ Common Commands

```bash
# Build and start everything
make re

# Stop containers
docker-compose down

# View backend logs
docker logs <backend_container_id>

# View database logs
docker logs <db_container_id>

# Rebuild without cache (if stuck)
docker-compose build --no-cache
docker-compose up -d

# Access database shell
docker exec -it <db_container_id> psql -U user -d pong
```

---

## 🔍 Troubleshooting

**Q: Socket connection fails**
- A: Ensure backend is running: `docker logs <backend_container_id>`
- Check nginx proxy: `curl http://localhost:3000/api/health`

**Q: Chat messages not appearing**
- A: Ensure both players are in-game (not just in queue)
- Check browser console for errors (F12)

**Q: Can't find opponent**
- A: Use 2 browser tabs or 2 devices on same WiFi
- Ensure both players join queue

**Q: Stats not saving**
- A: Stats currently stored in localStorage (browser)
- Check browser DevTools → Application → LocalStorage

**Q: Port 8080 already in use**
- A: Stop other services: `docker-compose down`
- Or modify docker-compose.yml ports section

---

## 📚 Full Documentation

For comprehensive documentation, see:
- **Features & Usage**: [README.md](README.md)
- **Module Breakdown**: [MODULES.md](MODULES.md)
- **Technical Details**: [CONTEXT.md](CONTEXT.md)
- **API Reference**: See [README.md](README.md#-api-endpoints)
- **Completion Status**: [PROJECT_STATUS.md](AUTH_TODO.md)

---

## 🎓 What You Get

✅ Real-time multiplayer Pong game  
✅ In-match chat system  
✅ Tournament bracket  
✅ Game statistics & match history  
✅ Customizable game settings  
✅ AI single-player opponent  
✅ Secure authentication (JWT + bcrypt)  
✅ Persistent database (PostgreSQL)  
✅ Responsive design (mobile + desktop)  
✅ Docker deployment (portable & reproducible)  

---

**Ready to play? Run `make re` and enjoy! 🎮**
