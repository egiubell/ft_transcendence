# Quick Start Guide

**Get ft_transcendence running in 1 command.**

---

## 🚀 Single Command Deployment

```bash
make re
```

That's it. This command:
1. Builds all Docker images (frontend, backend, database)
2. Starts all containers
3. Initializes the PostgreSQL database
4. Waits for services to be ready
5. Brings up the full application

---

## 🌐 Access the Application

- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 🔒 HTTPS (backend, opzionale in dev)

```bash
bash generate-certs.sh
# in .env
USE_HTTPS=true
SSL_KEY_PATH=/app/certs/server.key
SSL_CERT_PATH=/app/certs/server.cert

make build && make up
docker logs transcendence-backend-1 | grep HTTPS
curl -k https://localhost:3000/api/health
```
Nota: self-signed → warning del browser; in produzione usa certificati validi (es. Let's Encrypt).

---

## 🎮 Quick Test: Local Multiplayer

1. Open two browser tabs to [http://localhost:8080](http://localhost:8080)
2. **Tab 1**:
   - Click "Sign Up"
   - Fill in: email, username, password
   - Click "Sign Up"
3. **Tab 2**:
   - Click "Sign Up"
   - Fill in: different email/username, password
   - Click "Sign Up"
4. **Tab 1**:
   - Click "Join Queue" (or select tournament)
5. **Tab 2**:
   - Click "Join Queue"
6. **Both tabs**: Game should start automatically
   - Move mouse to control paddle
   - First to 5 points wins
   - Type in chat during match

---

## 📊 14 Module Points Achieved

| Module | Points | Status |
|--------|--------|--------|
| WebSockets & Real-time | 2 | ✅ |
| Chat System | 2 | ✅ |
| 1v1 Pong Game | 2 | ✅ |
| Remote Players | 2 | ✅ |
| Tournament | 1 | ✅ |
| Customization | 1 | ✅ |
| Statistics | 1 | ✅ |
| Advanced Chat | 1 | ✅ |
| **TOTAL** | **14** | ✅ |

---

## 📂 Key Files

- [README.md](README.md) — Full documentation, features, testing guide
- [MODULES.md](MODULES.md) — Detailed module point breakdown
- [CONTEXT.md](CONTEXT.md) — Technical architecture and implementation details
- [PROJECT_STATUS.md](AUTH_TODO.md) — Completion checklist

---

## 🧪 Test Remote Multiplayer

### Same WiFi (LAN)

```bash
# Find your machine IP
ipconfig        # Windows
# or
ifconfig        # macOS/Linux

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
