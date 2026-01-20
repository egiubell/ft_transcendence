# Production Deployment Notes

## ⚠️ Pre-Production Checklist

### 1. HTTPS Configuration (MANDATORY)
Enable HTTPS for backend:

```bash
# Generate self-signed certificates (for development/testing)
mkdir -p backend/certs
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/server.key -out backend/certs/server.cert -days 365 -nodes -subj "/CN=localhost"

# Update .env
USE_HTTPS=true
SSL_KEY_PATH=/app/certs/server.key
SSL_CERT_PATH=/app/certs/server.cert
```

**For production**: Use Let's Encrypt or your certificate authority.

**Quick test (after make build && make up):**

```bash
docker logs transcendence-backend-1 | grep HTTPS
curl -k https://localhost:3000/api/health
```

Expected:
- Log contains `🔒 HTTPS enabled`
- curl returns `{ "status": "ok" }`

Browser note: self-signed certs show "connessione non sicura"; use a trusted CA in production.

### 2. Tailwind CSS Optimization (RECOMMENDED)
Current setup uses CDN (development only). For production:

**Option A: PostCSS Build (Best Performance)**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

**Option B: Tailwind CLI**
```bash
npm install -D tailwindcss
npx tailwindcss -i ./src/styles/input.css -o ./src/styles/output.css --watch
```

**Option C: Keep CDN** (acceptable but not optimal)
- Current setup works
- Console warning is informational only
- ~100KB overhead on first load

### 3. Environment Variables
Update `.env` with production values:

```env
# CRITICAL: Change all secrets!
JWT_SECRET=<generate-strong-random-key>
SESSION_SECRET=<generate-strong-random-key>
APP_SECRET=<generate-strong-random-key>
DB_PASS=<secure-database-password>

# Google OAuth (if using)
GOOGLE_CLIENT_ID=<your-production-id>
GOOGLE_CLIENT_SECRET=<your-production-secret>
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback

# Frontend URL
FRONTEND_URL=https://your-domain.com
```

### 4. Database Security
- ✅ Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens for authentication
- ✅ Input validation on frontend and backend
- ✅ Prepared statements (SQL injection protection)

### 5. CORS Configuration
Update `backend/src/index.ts` for production:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-domain.com',
  credentials: true
}));
```

### 6. Docker Production Build
Ensure multi-stage builds are optimized:
- ✅ Development dependencies excluded from production image
- ✅ TypeScript compiled to JavaScript
- ✅ Static files copied to nginx

### 7. Git Commit Standards
Before submission, ensure:
- [ ] All team members have commits
- [ ] Commit messages are clear and descriptive
- [ ] `.env` is in `.gitignore` (DO NOT commit secrets!)
- [ ] README.md has setup instructions

## Deployment Commands

```bash
# Development (HTTP)
make start

# Production (with HTTPS)
export USE_HTTPS=true
make build
make up

# Check logs
make logs

# Stop all services
make down
```

## Testing Checklist

- [ ] All pages load without console errors
- [ ] User signup/login works
- [ ] Google OAuth works (if configured)
- [ ] Game multiplayer works
- [ ] Tournament bracket generation works
- [ ] Stats page displays match history
- [ ] Privacy Policy and Terms accessible
- [ ] Responsive on mobile devices
- [ ] HTTPS certificate valid (production)

## Performance Metrics

**Target Metrics:**
- Page load: < 2s
- Time to interactive: < 3s
- Lighthouse score: > 90

**Current Setup:**
- ✅ Nginx for static file serving
- ✅ PostgreSQL with connection pooling
- ✅ WebSocket for real-time multiplayer
- ⚠️  Tailwind CDN adds ~100KB (optimize if needed)

## Security Hardening

**Already Implemented:**
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Input validation (frontend + backend)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ CORS configuration

**Additional Recommendations:**
- Add rate limiting (express-rate-limit)
- Add helmet.js for security headers
- Enable CSP headers in nginx
- Add logging and monitoring
- Regular dependency updates

## Browser Compatibility

**Tested on:**
- ✅ Google Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Required:**
- Chrome latest stable (per requirements)

## Support

For issues or questions, check:
- README.md for setup instructions
- Docker logs: `make logs`
- Database logs: `docker logs transcendence-db-1`
- Backend logs: `docker logs transcendence-backend-1`
