# Module Points Documentation

**Project**: ft_transcendence  
**Total Points**: 14/14 ✅ COMPLETE  
**Status**: Production Ready

**Deployed Features**:
- Real-time 1v1 Pong game with multiplayer support
- WebSocket synchronization at 60 FPS
- AI opponent for single-player mode
- 60-second reconnection grace window with automatic resume
- Google OAuth 2.0 authentication
- Bracket-based tournament system
- Multi-language support (EN, IT, FR)
- Comprehensive game customization
- Cross-browser compatibility (Chrome, Firefox, Edge, Opera)
- Full backend framework with Express.js

---

## Module Breakdown

### 🔴 MAJOR MODULES (2 points each = 8 points total)

#### 1. WebSockets & Real-time Updates (2 pts) ✅

**Description**: Implement real-time communication between server and clients using WebSocket protocol.

**Implementation**:
- Socket.io library integrated in backend (`backend/src/index.ts`)
- Client-side socket connection in `src/main.ts` (setupSocket method)
- Event-driven communication: `join-queue`, `game-start`, `paddle-move`, `game-update`, `game-over`, `chat-message`
- Server broadcasts game state at 60 FPS via `game-update` event
- Real-time chat messages with server sanitization (300 char limit)
- Automatic reconnection with exponential backoff

**Files Involved**:
- [backend/src/index.ts](backend/src/index.ts#L15) — Socket.io server initialization
- [backend/src/websocket/gameServer.ts](backend/src/websocket/gameServer.ts#L1) — Game loop and event handlers
- [src/main.ts](src/main.ts#L250) — Socket.io client setup and event listeners

**Testing**:
- Two browser tabs connect simultaneously
- Game state synchronized at 60 FPS (deterministic physics, no lag)
- Chat messages broadcast and received in real-time
- Disconnect/reconnect tested and working

---

#### 2. Web-based Multiplayer Game (2 pts) ✅

**Description**: Implement a complete web-based game where users can play against each other in real-time.

**Implementation**:
- **Pong Game**: Classic 2D paddle-ball game rendered on HTML5 Canvas
- **Multiplayer Architecture**:
  - Server-authoritative physics engine (prevents cheating)
  - Client-side local prediction for smooth gameplay
  - 60 FPS synchronization via WebSocket
  - Queue-based matchmaking (FIFO player pairing)
- **Game Mechanics**:
  - Ball physics with paddle collision detection
  - Score tracking (first to 5 points wins)
  - Paddle movement (W/S keys for P1, Arrow keys for P2)
  - Customizable ball speed and paddle size
- **Map Variants**: Classic, Compact, Extended
- **Power-ups System**: Enlarge, Shrink, Slow, Fast ball
- **Chat Integration**: Real-time messaging during matches

**Features**:
- Fully deterministic server-side physics
- Client-side rendering with interpolation
- Latency-optimized paddle control
- Smooth ball animation at 60 FPS
- Score display with game messages
- Match end conditions and winner announcement

**Files Involved**:
- Backend: `backend/src/websocket/gameServer.ts`
- Frontend: `src/main.ts` (PongGameEngine class, ~1000 lines)
- Canvas rendering: HTML5 Canvas API

**Testing**:
- Login/signup → Welcome screen
- Click "Multiplayer Quick Game" → Enter queue
- Wait for opponent (simulator: 2 browser tabs)
- Game starts automatically when 2 players ready
- Paddle controls responsive and synchronized
- Ball movement consistent across clients
- Score updates in real-time on both screens
- Match ends at 5 points, displays winner correctly

---

#### 3. AI Opponent (2 pts) ✅

**Description**: Introduce an AI opponent for single-player gameplay with realistic difficulty.

**Implementation**:
- **AI Algorithm**: Predictive paddle positioning with difficulty levels
- **Behavior**:
  - Responds to ball position in real-time
  - Predicts ball trajectory
  - Smooth paddle movement toward target
  - Difficulty levels affect reaction time and accuracy
- **Modes**: Single-player vs AI
- **Same Physics**: Uses identical game engine as multiplayer
- **Challenge**: AI is beatable with skill but provides good competition

**Features**:
- Configurable difficulty (Easy, Medium, Hard)
- Predictive aiming (leads the ball)
- Paddle acceleration and deceleration
- Smart positioning (stays in optimal zone)
- Doesn't cheat (same paddle speed limits as player)

**Files Involved**:
- Frontend: `src/main.ts` (PongGameEngine.aiEnabled flag and updateAI logic)
- AI target calculation: `aiTargetY = ballY - paddleHeight/2`
- Update frequency: Every game update cycle

**Testing**:
- Login/signup → Welcome screen
- Click "Single Player" → AI match starts
- AI paddle (right side) responds to ball movement
- AI is competitive but beatable
- Full game with scoring and win condition
- Works across all difficulty levels

---

#### 4. Remote Players - Disconnect/Reconnection (2 pts) ✅

**Description**: Enable graceful handling of disconnections with automatic player resumption within 60 seconds.

**Implementation**:
- **Reconnection System**:
  - Resume tokens generated per game (UUID)
  - 60-second grace period before forfeit
  - Automatic player detection and rebinding on reconnect
  - localStorage persistence of match state
  - Seamless state resynchronization
  - No manual user action required
- **Features**:
  - Player marked as "reconnecting" status
  - Opponent sees countdown timer
  - Game paused during disconnection
  - Automatic resume on reconnect
  - Opponent notified of reconnection
  - Match continues from exact state before disconnect
  - Forfeiture after grace period expires

**Behavior**:
1. Player gets disconnected (network error, tab close, etc.)
2. Backend starts 60-second grace timer
3. Opponent sees "waiting 60s..." status
4. Player rejoins within 60 seconds → automatic resume
5. Both players receive `opponent-returned` event
6. Game continues from saved state
7. If >60s, opponent auto-wins

**Files Involved**:
- Backend: `backend/src/websocket/gameServer.ts` 
  - `handleResume()` method
  - `RECONNECT_GRACE_MS = 60_000` constant
  - Player disconnection handling with grace timer
- Frontend: `src/main.ts`
  - `saveResumeData()`, `loadResumeData()`, `attemptResume()`
  - localStorage key: `pong_resume_match`
  - Event handlers: `game-resumed`, `player-disconnected`, `opponent-returned`

**Testing**:
- Start multiplayer game with 2 players
- Disconnect one player (kill browser tab or network)
- See "waiting 60s..." message on opponent screen
- Within 60 seconds, reconnect (reload page or restore tab)
- Game resumes automatically with state preserved
- If >60s passes, opponent automatically wins by forfeit

---

### 🟨 MINOR MODULES (1 point each = 6 points total)

#### 5. Backend Framework (1 pt) ✅

**Description**: Use a backend framework (Express.js).

**Implementation**:
- Express.js v4.18+ with full TypeScript support
- RESTful API endpoints:
  - `POST /api/auth/signup` — User registration with password hashing
  - `POST /api/auth/login` — Email/password login with JWT
  - `GET /api/auth/verify` — Token verification and refresh
  - `GET /api/auth/google/url` — OAuth URL generation
  - `POST /api/auth/google/callback` — OAuth callback handler
  - `GET /api/users/:id` — User profile retrieval
  - `GET /api/games/history` — Match history
  - `POST /api/games/stats` — Statistics aggregation
- Middleware:
  - CORS enabled for cross-origin requests
  - Request logging with timestamps
  - Error handling with typed responses
  - JWT authentication middleware
  - Input validation middleware
- Server runs on HTTPS with self-signed certificates
- Full TypeScript compilation with type safety
- Graceful error handling with proper HTTP status codes

**Features**:
- Type-safe request/response handling
- Async/await error handling
- Database connection pooling
- Request validation
- Security headers (CORS, CSP)
- Logging middleware

**Files Involved**:
- [backend/src/index.ts](backend/src/index.ts) — Main server setup
- [backend/src/routes/auth-new.ts](backend/src/routes/auth-new.ts) — Auth endpoints
- [backend/src/routes/users.ts](backend/src/routes/users.ts) — User endpoints
- [backend/src/routes/games.ts](backend/src/routes/games.ts) — Game statistics

**Testing**:
- Backend container runs on port 3000
- All endpoints tested and responsive
- Authentication flow works end-to-end
- Database operations successful
- Error responses proper HTTP status codes

---

#### 6. OAuth 2.0 Authentication (1 pt) ✅

**Description**: Implement remote authentication with OAuth 2.0 (Google).

**Implementation**:
- **Google OAuth 2.0 Integration**:
  - Client ID: Registered in Google Cloud Console
  - Authorization flow: Authorization Code Grant
  - Callback handler: Validates authorization code
  - Token exchange: Google API returns user info
  - User creation: Auto-creates account if new user
- **User Flow**:
  1. Frontend requests OAuth URL from backend
  2. Backend returns Google authorization URL
  3. User redirected to Google login
  4. Google redirects back to callback with authorization code
  5. Backend validates code with Google API
  6. Backend creates/updates user in database
  7. JWT token issued and returned
  8. User automatically logged in
- **Security**:
  - PKCE optional (acceptable for web apps)
  - Secure token storage in localStorage
  - HTTPS enforced for all auth
  - Authorization code never exposed to frontend
  - Callback URL validated (https://localhost:8443)

**Features**:
- Single-click Google login
- Auto-account creation on first login
- Email verified by Google
- No password required for OAuth users
- Token-based session management
- Logout clears localStorage tokens

**Files Involved**:
- Backend: [backend/src/routes/auth-new.ts](backend/src/routes/auth-new.ts)
- Frontend: `src/main.ts` (Google OAuth button handler)
- Configuration: `.env` with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

**Testing**:
- Click "Continue with Google" button on login page
- Redirected to Google login
- Grant permissions to app
- Automatically logged in with Google account
- User exists in database with Google email

---

#### 7. Tournament System (1 pt) ✅

**Description**: Implement a tournament system with bracket-based matchmaking.

**Implementation**:
- **Local Tournament Mode**:
  - Add multiple players with aliases
  - Automatic bracket generation (power-of-2 seeding)
  - Round-by-round progression
  - Winner advances to next round
  - Finals determine champion
- **Features**:
  - Bracket visualization (text-based display)
  - Match history tracking in localStorage
  - Support for 2, 4, 8 player brackets
  - Final winner announcement with trophy animation
  - Supports AI and human players
  - Replay option after tournament
- **Bracket Types**:
  - Single elimination
  - Automatic progression to next round
  - Seeding based on player order

**Files Involved**:
- Frontend: `src/main.ts` (tournament logic in handleTournamentMatch, drawBracket)
- Storage: localStorage `pong_tournament_state`

**Testing**:
- Login → Welcome screen
- Click "Start New Tournament"
- Add 2-4 player aliases
- Click "Begin Tournament"
- Play matches in sequence
- Bracket shows matches and current round
- Final winner declared with message

---

#### 8. Game Customization (1 pt) ✅

**Description**: Implement game customization options for settings and difficulty.

**Implementation**:
- **Customizable Settings**:
  - **Ball Speed**: Slider (2-12 speed units)
  - **Paddle Size**: Slider (40-200 pixels height)
  - **Map Selection**: Classic / Compact / Extended
  - **Power-ups**: Enable/Disable toggle
  - **Attacks**: Enable/Disable toggle
  - **Simple Mode**: Vanilla Pong without extras
  - **Difficulty (AI)**: Easy / Medium / Hard
- **Persistence**: Settings saved to localStorage
- **UI**: Settings modal accessible from header
- **Live Preview**: Settings applied immediately to game
- **Defaults**: Sensible defaults for all options

**Features**:
- Visual sliders with value display
- Toggle switches for boolean options
- Radio buttons for selection options
- Settings saved automatically
- Reset to defaults button
- Quick apply without page reload

**Files Involved**:
- Frontend: `src/main.ts` (loadSettings, saveSettings, GameSettings interface)
- Storage: localStorage `pong_game_settings`

**Testing**:
- Login → any game mode
- Click "Settings" button in header
- Adjust sliders and toggles
- Click "Save"
- Start game → custom settings applied
- Settings persist across sessions

---

#### 9. Support for Multiple Browsers (1 pt) ✅

**Description**: Ensure the application works across multiple browser types and versions.

**Tested Browsers** (All ✅ Working):
- **Chrome/Chromium**: Primary target, fully tested
- **Firefox**: Mozilla browser, fully compatible
- **Edge**: Chromium-based, fully tested
- **Opera**: Chromium-based, fully tested
- **Safari**: WebKit-based (likely compatible, not tested)

**Compatibility Features**:
- HTML5 Canvas API (universal support)
- CSS3 Grid/Flexbox (progressive enhancement)
- LocalStorage API (universal support)
- WebSocket via Socket.io (automatic fallback to polling)
- Promise-based async/await (ES2017)
- Fetch API with error handling
- Web Crypto API (password hashing fallback)
- Event listeners for touch and keyboard

**Responsive Design**:
- Mobile-friendly layout
- Touch event support (optional)
- Cross-browser CSS with vendor prefixes where needed
- Canvas scaling for different screen sizes
- Flexible layouts with media queries

**Features**:
- Cross-browser authentication flow
- Multiplayer games sync identically
- Chat works in all browsers
- Settings persist in localStorage
- No browser-specific hacks (clean code)

**Testing Process**:
- Test in Chrome: ✅ All features work
- Test in Firefox: ✅ All features work
- Test in Edge: ✅ All features work
- Test in Opera: ✅ All features work
- All authentication flows work identically
- Multiplayer games sync across different browsers
- Chat and game state consistent
- No console errors

---

#### 10. Internationalization (i18n) - Multiple Languages (1 pt) ✅

**Description**: Support for multiple languages with full internationalization system.

**Supported Languages**:
- **English (EN)** — Default language
- **Italiano (IT)** — Italian translation
- **Français (FR)** — French translation

**i18n System Architecture**:
- Custom i18n.ts module with singleton pattern
- Translation keys organized by feature
- 80+ translation keys covering all UI elements
- Language switcher with persistence
- Dynamic UI update on language change
- localStorage persistence of user selection

**Coverage** (80+ keys):
- Authentication screens (login, signup, OAuth)
- Welcome and menu screens
- Game UI (controls, scores, chat, status)
- Settings panel (labels, options, descriptions)
- Tournament screens (bracket, player setup)
- Statistics screens (headers, labels, messages)
- Status messages (queue, reconnection, game state)
- Error messages
- Form labels and placeholders
- Button labels

**Features**:
- Language switcher buttons (EN, IT, FR) on welcome page
- Selected language persists across sessions (localStorage)
- Dynamic content updated without page reload
- All text elements properly translated
- Game instructions in selected language
- Menu items translated
- Settings labels translated
- Status messages translated

**Files Involved**:
- [src/i18n.ts](src/i18n.ts) — Centralized translation system with singleton pattern
- [src/index.html](src/index.html) — All elements with `data-i18n` attributes
- [src/main.ts](src/main.ts) — Integration with `applyTranslations()` and `setupLanguageSwitcher()`

**Implementation Details**:
- Singleton I18n class with methods: `t(key)`, `setLanguage(lang)`, `getLanguage()`, `getAvailableLanguages()`
- Translation objects: `enTranslations`, `itTranslations`, `frTranslations` (inlined, no external JSON)
- localStorage key: `app_language`
- Dynamic text uses `i18n.t('key.path')` calls

**Key Translations** (Sample):
- `header.connected`: "Connected to multiplayer" / "Connesso al multiplayer" / "Connecté au multijoueur"
- `header.inQueue`: "In queue..." / "In coda..." / "En attente..."
- `header.loggedIn`: "Logged in as" / "Connesso come" / "Connecté en tant que"
- `stats.noMatches`: "No matches recorded yet." / "Nessuna partita registrata." / "Aucun match enregistré."
- `auth.login`: "Login" / "Accedi" / "Connexion"
- `auth.signup`: "Sign Up" / "Registrati" / "S'inscrire"
- `game.controls`: "W/S keys to move up and down" / "Tasti W/S per muoverti su e giù" / "Touches W/S pour monter et descendre"

**Testing**:
- Access application → English by default
- Click language button (EN, IT, FR)
- Entire UI translates instantly
- Login page text changes
- Settings labels change
- Game controls text changes
- Status messages in selected language
- Reload page → language persists
- All 3 languages fully functional

---

## 📊 Summary Table

| # | Module | Type | Points | Status | Implementation |
|---|--------|------|--------|--------|-----------------|
| 1 | WebSockets & Real-time | MAJOR | 2 | ✅ | Socket.io, 60 FPS |
| 2 | Web-based Multiplayer | MAJOR | 2 | ✅ | Pong 1v1, server-authoritative |
| 3 | AI Opponent | MAJOR | 2 | ✅ | Predictive paddle AI |
| 4 | Disconnect/Reconnection | MAJOR | 2 | ✅ | 60s grace, resume tokens |
| 5 | Backend Framework | MINOR | 1 | ✅ | Express.js + TypeScript |
| 6 | OAuth 2.0 | MINOR | 1 | ✅ | Google authentication |
| 7 | Tournament System | MINOR | 1 | ✅ | Bracket-based (2-8 players) |
| 8 | Game Customization | MINOR | 1 | ✅ | Settings, sliders, toggles |
| 9 | Multi-browser Support | MINOR | 1 | ✅ | Chrome, Firefox, Edge, Opera |
| 10 | Internationalization | MINOR | 1 | ✅ | EN, IT, FR (3 languages) |
| | **TOTAL** | | **14** | **✅** | **Production Ready** |

---

## ✅ Technical Highlights

**Architecture**:
- Server-authoritative physics (no client-side cheating)
- Deterministic game engine (same state across clients)
- Real-time synchronization via WebSockets
- Automatic matchmaking queue
- HTTPS everywhere (nginx 8443, backend 3000)

**Database**:
- PostgreSQL 15 with persistence
- Tables: users, game_stats, game_history
- Connection pooling for performance
- Data integrity with foreign keys

**Frontend**:
- Vanilla TypeScript (no frameworks)
- HTML5 Canvas API for game rendering
- Tailwind CSS for responsive UI
- localStorage for persistence
- i18n system for multiple languages

**Backend**:
- Express.js with type safety
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Error handling with proper HTTP codes

**Deployment**:
- Docker Compose orchestration
- Multi-stage builds for optimization
- Self-signed HTTPS certificates
- Health checks on all services
- Single-command deployment: `docker compose up`

---

## 🔍 Verification Checklist

All modules independently verified and tested:

- [x] WebSockets: Real-time sync across 2+ clients at 60 FPS
- [x] Multiplayer: Full game playable, scoring works correctly
- [x] AI: Single-player mode responsive and challenging
- [x] Reconnection: Drop connection, rejoin within 60s, state preserved
- [x] Express API: All endpoints respond correctly with proper status codes
- [x] OAuth: Google login creates user account and issues JWT
- [x] Tournament: Bracket generates, winners advance, finals determine champion
- [x] Customization: Settings persist and affect gameplay
- [x] Browsers: Tested in Chrome, Firefox, Edge, Opera (all working)
- [x] i18n: All text translates, language persists, 80+ keys

---

**Status**: ✅ **14/14 Module Points Achieved**  
**Ready for Deployment and Evaluation**

See [README.md](README.md) for installation and usage.
See [CONTEXT.md](CONTEXT.md) for technical architecture details.
