import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { randomUUID } from 'crypto';

interface Player {
  id: string;
  socketId: string;
  username: string;
  paddleY: number;
  ready: boolean;
  resumeToken: string;
  disconnected?: boolean;
  reconnectTimer?: NodeJS.Timeout | null;
}

interface GameRoom {
  id: string;
  players: Player[];
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  score: {
    player1: number;
    player2: number;
  };
  gameState: 'waiting' | 'ready' | 'playing' | 'finished';
  winner?: number;
  canvasWidth: number;
  canvasHeight: number;
  lastUpdate: number;
}

export class GameServer {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private waitingPlayers: Map<string, { socket: Socket; username: string }> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private readonly RECONNECT_GRACE_MS = 60_000;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (_origin, callback) => callback(null, true), // allow all origins for LAN/ngrok tests
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupSocketHandlers();
    this.startGameLoop();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Player connected: ${socket.id}`);

      socket.on('join-queue', (data: { username: string }) => {
        this.handleJoinQueue(socket, data.username);
      });

      socket.on('paddle-move', (data: { y: number }) => {
        this.handlePaddleMove(socket, data.y);
      });

      socket.on('chat-message', (data: { message: string }) => {
        this.handleChatMessage(socket, data.message);
      });

      socket.on('leave-game', () => {
        this.handleLeaveGame(socket);
      });

      socket.on('resume-game', (data: { roomId: string; resumeToken: string }) => {
        this.handleResume(socket, data);
      });

      socket.on('disconnect', () => {
        console.log(`[WebSocket] Player disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  private handleJoinQueue(socket: Socket, username: string): void {
    // Remove from waiting if already there
    this.waitingPlayers.delete(socket.id);

    // Add to waiting queue
    this.waitingPlayers.set(socket.id, { socket, username });
    console.log(`[Queue] ${username} joined (${this.waitingPlayers.size} waiting)`);

    socket.emit('queue-joined', { position: this.waitingPlayers.size });

    // Try to match players
    this.tryMatchPlayers();
  }

  private tryMatchPlayers(): void {
    if (this.waitingPlayers.size < 2) return;

    // Get first two players
    const players = Array.from(this.waitingPlayers.entries()).slice(0, 2);
    const [p1Entry, p2Entry] = players;

    // Remove from waiting
    this.waitingPlayers.delete(p1Entry[0]);
    this.waitingPlayers.delete(p2Entry[0]);

    // Create game room
    const roomId = `game-${Date.now()}`;
    const room: GameRoom = {
      id: roomId,
      players: [
        {
          id: p1Entry[0],
          socketId: p1Entry[0],
          username: p1Entry[1].username,
          paddleY: 150,
          ready: true,
          resumeToken: randomUUID(),
          disconnected: false,
          reconnectTimer: null
        },
        {
          id: p2Entry[0],
          socketId: p2Entry[0],
          username: p2Entry[1].username,
          paddleY: 150,
          ready: true,
          resumeToken: randomUUID(),
          disconnected: false,
          reconnectTimer: null
        }
      ],
      ball: {
        x: 400,
        y: 200,
        dx: 5,
        dy: 3
      },
      score: {
        player1: 0,
        player2: 0
      },
      gameState: 'playing',
      canvasWidth: 800,
      canvasHeight: 400,
      lastUpdate: Date.now()
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(p1Entry[0], roomId);
    this.playerToRoom.set(p2Entry[0], roomId);

    // Join socket rooms
    p1Entry[1].socket.join(roomId);
    p2Entry[1].socket.join(roomId);

    // Notify players
    p1Entry[1].socket.emit('game-start', {
      roomId,
      playerNumber: 1,
      opponent: p2Entry[1].username,
      canvasWidth: room.canvasWidth,
      canvasHeight: room.canvasHeight,
      resumeToken: room.players[0].resumeToken
    });

    p2Entry[1].socket.emit('game-start', {
      roomId,
      playerNumber: 2,
      opponent: p1Entry[1].username,
      canvasWidth: room.canvasWidth,
      canvasHeight: room.canvasHeight,
      resumeToken: room.players[1].resumeToken
    });

    console.log(`[Match] Created room ${roomId}: ${p1Entry[1].username} vs ${p2Entry[1].username}`);
  }

  private handlePaddleMove(socket: Socket, y: number): void {
    const roomId = this.playerToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;

    const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
    if (playerIndex === -1) return;

    // Update paddle position (with bounds check)
    room.players[playerIndex].paddleY = Math.max(0, Math.min(room.canvasHeight - 100, y));
  }

  private handleChatMessage(socket: Socket, message: string): void {
    const roomId = this.playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = this.rooms.get(roomId);
    if (!room) return;

    const text = (message || '').toString().trim().slice(0, 300);
    if (!text) return;

    const player = room.players.find(p => p.socketId === socket.id);
    const from = player?.username || 'Player';

    this.io.to(roomId).emit('chat-message', {
      from,
      message: text,
      ts: Date.now()
    });
  }

  private handleLeaveGame(socket: Socket): void {
    const roomId = this.playerToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
    if (playerIndex === -1) return;

    // Immediate forfeit when explicitly leaving
    this.forfeitPlayer(roomId, playerIndex, 'forfeit');
  }

  private handleDisconnect(socket: Socket): void {
    // Remove from waiting queue
    this.waitingPlayers.delete(socket.id);

    const roomId = this.playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      this.playerToRoom.delete(socket.id);
      return;
    }

    const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
    if (playerIndex === -1) {
      this.playerToRoom.delete(socket.id);
      return;
    }

    // Mark disconnected and start grace timer
    const player = room.players[playerIndex];
    player.disconnected = true;
    player.socketId = '';
    if (player.reconnectTimer) {
      clearTimeout(player.reconnectTimer);
    }
    player.reconnectTimer = setTimeout(() => {
      this.forfeitPlayer(roomId, playerIndex, 'timeout');
    }, this.RECONNECT_GRACE_MS);

    this.playerToRoom.delete(socket.id);
    this.io.to(roomId).emit('player-disconnected', { playerNumber: playerIndex + 1 });
  }

  private handleResume(socket: Socket, data: { roomId: string; resumeToken: string }): void {
    const { roomId, resumeToken } = data || {};
    if (!roomId || !resumeToken) {
      socket.emit('resume-failed', { reason: 'invalid-payload' });
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      socket.emit('resume-failed', { reason: 'room-not-found' });
      return;
    }

    const playerIndex = room.players.findIndex(p => p.resumeToken === resumeToken);
    if (playerIndex === -1) {
      socket.emit('resume-failed', { reason: 'invalid-token' });
      return;
    }

    const player = room.players[playerIndex];
    player.disconnected = false;
    if (player.reconnectTimer) {
      clearTimeout(player.reconnectTimer);
      player.reconnectTimer = null;
    }

    // Rebind socket
    player.socketId = socket.id;
    this.playerToRoom.set(socket.id, roomId);
    socket.join(roomId);

    // Send current state back to player
    socket.emit('game-resumed', {
      roomId,
      playerNumber: playerIndex + 1,
      opponent: room.players[playerIndex === 0 ? 1 : 0].username,
      canvasWidth: room.canvasWidth,
      canvasHeight: room.canvasHeight,
      state: {
        ball: room.ball,
        paddles: room.players.map(p => ({ y: p.paddleY })),
        score: room.score
      }
    });

    // Notify opponent
    socket.to(roomId).emit('opponent-returned', { playerNumber: playerIndex + 1 });
  }

  private startGameLoop(): void {
    setInterval(() => {
      this.rooms.forEach((room, roomId) => {
        if (room.gameState !== 'playing') return;

        this.updateGamePhysics(room);
        this.broadcastGameState(roomId, room);
      });
    }, 1000 / 60); // 60 FPS
  }

  private updateGamePhysics(room: GameRoom): void {
    const ball = room.ball;
    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballSize = 10;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom collision
    if (ball.y <= 0 || ball.y >= room.canvasHeight - ballSize) {
      ball.dy = -ball.dy;
    }

    // Paddle collision (simplified)
    const p1 = room.players[0];
    const p2 = room.players[1];

    // Left paddle (player 1)
    if (ball.x <= 20 && ball.y >= p1.paddleY && ball.y <= p1.paddleY + paddleHeight) {
      ball.dx = Math.abs(ball.dx); // Bounce right
    }

    // Right paddle (player 2)
    if (ball.x >= room.canvasWidth - 30 && ball.y >= p2.paddleY && ball.y <= p2.paddleY + paddleHeight) {
      ball.dx = -Math.abs(ball.dx); // Bounce left
    }

    // Score detection
    if (ball.x <= 0) {
      room.score.player2++;
      this.resetBall(room);
      if (room.score.player2 >= 5) {
        this.endGame(room, 2, 'score');
      }
    } else if (ball.x >= room.canvasWidth) {
      room.score.player1++;
      this.resetBall(room);
      if (room.score.player1 >= 5) {
        this.endGame(room, 1, 'score');
      }
    }
  }

  private resetBall(room: GameRoom): void {
    room.ball.x = room.canvasWidth / 2;
    room.ball.y = room.canvasHeight / 2;
    room.ball.dx = (Math.random() > 0.5 ? 5 : -5);
    room.ball.dy = (Math.random() - 0.5) * 6;
  }

  private endGame(room: GameRoom, winner: number, reason: 'score' | 'forfeit'): void {
    room.gameState = 'finished';
    room.winner = winner;

    this.io.to(room.id).emit('game-over', {
      winner,
      finalScore: room.score,
      reason
    });

    // Cleanup after 5 seconds
    setTimeout(() => {
      this.cleanupRoom(room.id);
    }, 5000);
  }

  private broadcastGameState(roomId: string, room: GameRoom): void {
    this.io.to(roomId).emit('game-update', {
      ball: room.ball,
      paddles: room.players.map(p => ({ y: p.paddleY })),
      score: room.score
    });
  }

  private forfeitPlayer(roomId: string, playerIndex: number, reason: 'forfeit' | 'timeout'): void {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players[playerIndex];
    if (player.reconnectTimer) {
      clearTimeout(player.reconnectTimer);
      player.reconnectTimer = null;
    }

    // Other player wins
    const winnerIndex = playerIndex === 0 ? 1 : 0;
    this.endGame(room, winnerIndex + 1, 'forfeit');
  }

  private cleanupRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Clear pending reconnect timers
    room.players.forEach(p => {
      if (p.reconnectTimer) {
        clearTimeout(p.reconnectTimer);
        p.reconnectTimer = null;
      }
    });

    room.players.forEach(p => {
      this.playerToRoom.delete(p.socketId);
    });

    this.rooms.delete(roomId);
    console.log(`[Cleanup] Removed room ${roomId}`);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
