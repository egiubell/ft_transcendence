import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/init';
import authRoutes from './routes/auth-new';
import gameRoutes from './routes/games';
import userRoutes from './routes/users';
import { GameServer } from './websocket/gameServer';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.BACKEND_PORT || '3000', 10);
const HOST = process.env.BACKEND_HOST || 'localhost';

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
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
  console.log(`📝 API available at http://${HOST}:${PORT}/api`);
  console.log(`🔌 WebSocket ready for multiplayer games`);
});

export default app;
