import express from 'express';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init';
import authRoutes from './routes/auth-new';
import gameRoutes from './routes/games';
import userRoutes from './routes/users';
import { GameServer } from './websocket/gameServer';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '3000', 10);
const HOST = process.env.BACKEND_HOST || 'localhost';
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Create server (HTTPS in production, HTTP for development)
let httpServer;
if (USE_HTTPS) {
  try {
    const httpsOptions = {
      key: readFileSync(process.env.SSL_KEY_PATH || join(__dirname, '../certs/server.key')),
      cert: readFileSync(process.env.SSL_CERT_PATH || join(__dirname, '../certs/server.cert'))
    };
    httpServer = createHttpsServer(httpsOptions, app);
    console.log('🔒 HTTPS enabled');
  } catch (error) {
    console.warn('⚠️  SSL certificates not found, falling back to HTTP');
    httpServer = createServer(app);
  }
} else {
  httpServer = createServer(app);
  console.log('⚠️  Running in HTTP mode (development only)');
}

// Middleware
app.use(cors({
  origin: (_origin, callback) => callback(null, true), // allow all origins (works for LAN/ngrok)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Pong Tournament Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Initialize WebSocket game server
const gameServer = new GameServer(httpServer);
console.log('🎮 WebSocket game server initialized');

// Start server
const protocol = USE_HTTPS ? 'https' : 'http';
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running on ${protocol}://${HOST}:${PORT}`);
  console.log(`📝 API available at ${protocol}://${HOST}:${PORT}/api`);
  console.log(`🔌 WebSocket ready for multiplayer games`);
});

export default app;
