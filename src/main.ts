interface PlayerInfo {
	alias: string;
	id: string;
}

interface GameMatch {
	player1: PlayerInfo;
	player2: PlayerInfo;
	winner?: PlayerInfo;
	matchId: string;
	round: number;
}

interface TournamentBracket {
	rounds: GameMatch[][];
	currentRound: number;
	currentMatchIndex: number;
}

class PongTournamentApp {
	private registeredPlayers: PlayerInfo[] = [];
	private currentScreen: string = 'welcome-screen';
	private tournamentBracket: TournamentBracket = {
		rounds: [],
		currentRound: 0,
		currentMatchIndex: 0
	};
	private currentMatch: GameMatch | null = null;

	constructor() {
		this.initializeEventListeners();
		this.initializeRouter();
		
		// Handle initial load from URL hash
		const initialScreen = window.location.hash.slice(1) || 'welcome-screen';
		this.showScreen(initialScreen, false);
	}

	private initializeEventListeners(): void {
		document.getElementById('start-tournament-btn')?.addEventListener('click', () => {
			this.showScreen('tournament-setup');
		});

		document.getElementById('quick-game-btn')?.addEventListener('click', () => {
			this.startQuickGame();
		});

		document.getElementById('add-player-btn')?.addEventListener('click', () => {
			this.registerPlayer();
		});

		document.getElementById('begin-tournament-btn')?.addEventListener('click', () => {
			this.startTournament();
		});

		document.getElementById('next-match-btn')?.addEventListener('click', () => {
			this.proceedToNextMatch();
		});

		// Handle Enter key in alias input
		document.getElementById('player-alias')?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.registerPlayer();
			}
		});
	}

	private initializeRouter(): void {
		// Handle browser back/forward buttons
		window.addEventListener('popstate', (e) => {
			const screen = e.state?.screen || 'welcome-screen';
			this.showScreen(screen, false);
		});

		// Set initial state
		if (!history.state) {
			const initialScreen = window.location.hash.slice(1) || 'welcome-screen';
			history.replaceState({ screen: initialScreen }, this.getScreenTitle(initialScreen), `#${initialScreen}`);
		}
	}

	private showScreen(screenId: string, pushState: boolean = true): void {
		// Validate screen ID to prevent XSS
		const validScreens = ['welcome-screen', 'tournament-setup', 'game-arena', 'tournament-bracket'];
		if (!validScreens.includes(screenId)) {
			screenId = 'welcome-screen';
		}

		document.querySelectorAll('.screen').forEach(screen => {
			screen.classList.remove('active');
		});
		
		const targetScreen = document.getElementById(screenId);
		if (targetScreen) {
			targetScreen.classList.add('active');
			this.currentScreen = screenId;
		}
		
		// Update browser history for SPA navigation
		if (pushState) {
			const title = this.getScreenTitle(screenId);
			history.pushState({ screen: screenId }, title, `#${screenId}`);
			document.title = title;
		}
	}

	private getScreenTitle(screenId: string): string {
		const titles: { [key: string]: string } = {
			'welcome-screen': 'Pong Tournament - Home',
			'tournament-setup': 'Pong Tournament - Setup',
			'game-arena': 'Pong Tournament - Game',
			'tournament-bracket': 'Pong Tournament - Bracket'
		};
		return titles[screenId] || 'Pong Tournament Championship';
	}

	private sanitizeInput(input: string): string {
		// Remove HTML tags and potentially dangerous characters
		return input
			.replace(/[<>\"'&]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private validateAlias(alias: string): boolean {
		// Validate alias: 3-20 characters, alphanumeric, spaces, hyphens, underscores only
		const aliasRegex = /^[a-zA-Z0-9\s\-_]{3,20}$/;
		return aliasRegex.test(alias) && alias.length >= 3 && alias.length <= 20;
	}

	private registerPlayer(): void {
		const aliasInput = document.getElementById('player-alias') as HTMLInputElement;
		if (!aliasInput) return;

		const rawAlias = aliasInput.value;
		const sanitizedAlias = this.sanitizeInput(rawAlias);

		// Input validation
		if (!this.validateAlias(sanitizedAlias)) {
			this.showError('Invalid alias! Use only letters, numbers, spaces, hyphens, and underscores (3-20 characters).');
			return;
		}

		// Check for duplicate aliases
		if (this.registeredPlayers.find(p => p.alias.toLowerCase() === sanitizedAlias.toLowerCase())) {
			this.showError('Player alias already exists!');
			return;
		}

		// Create new player
		const newPlayer: PlayerInfo = {
			alias: sanitizedAlias,
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
		};
		
		this.registeredPlayers.push(newPlayer);
		this.updatePlayerDisplay();
		aliasInput.value = '';
		
		// Update tournament start button state
		const beginBtn = document.getElementById('begin-tournament-btn') as HTMLButtonElement;
		if (beginBtn) {
			beginBtn.disabled = this.registeredPlayers.length < 2;
		}
	}

	private showError(message: string): void {
		// Sanitize error message to prevent XSS
		const sanitizedMessage = this.sanitizeInput(message);
		alert(sanitizedMessage);
	}

	private updatePlayerDisplay(): void {
		const playersDiv = document.getElementById('registered-players');
		if (!playersDiv) return;

		// Use safe DOM manipulation instead of innerHTML
		playersDiv.innerHTML = '';
		
		this.registeredPlayers.forEach((player) => {
			const playerTag = document.createElement('span');
			playerTag.className = 'player-tag';
			
			const playerName = document.createElement('span');
			playerName.textContent = player.alias;
			
			const removeBtn = document.createElement('button');
			removeBtn.className = 'remove-btn';
			removeBtn.textContent = '×';
			removeBtn.title = `Remove ${player.alias}`;
			removeBtn.addEventListener('click', () => this.removePlayer(player.id));
			
			playerTag.appendChild(playerName);
			playerTag.appendChild(removeBtn);
			playersDiv.appendChild(playerTag);
		});
	}

	public removePlayer(playerId: string): void {
		// Sanitize player ID
		const sanitizedId = this.sanitizeInput(playerId);
		
		this.registeredPlayers = this.registeredPlayers.filter(p => p.id !== sanitizedId);
		this.updatePlayerDisplay();
		
		const beginBtn = document.getElementById('begin-tournament-btn') as HTMLButtonElement;
		if (beginBtn) {
			beginBtn.disabled = this.registeredPlayers.length < 2;
		}
	}

	private startTournament(): void {
		if (this.registeredPlayers.length >= 2) {
			this.generateTournamentBracket();
			this.showScreen('tournament-bracket');
		} else {
			this.showError('Need at least 2 players to start a tournament!');
		}
	}

	private generateTournamentBracket(): void {
		const players = [...this.registeredPlayers];
		
		// Shuffle players for fair bracket using Fisher-Yates algorithm
		for (let i = players.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[players[i], players[j]] = [players[j], players[i]];
		}

		this.tournamentBracket = {
			rounds: [],
			currentRound: 0,
			currentMatchIndex: 0
		};

		// Handle odd number of players - give bye to one player
		let currentPlayers = [...players];
		let byePlayer: PlayerInfo | null = null;
		
		if (currentPlayers.length % 2 === 1) {
			byePlayer = currentPlayers.pop()!;
		}

		// Create first round matches
		const firstRound: GameMatch[] = [];
		for (let i = 0; i < currentPlayers.length; i += 2) {
			if (i + 1 < currentPlayers.length) {
				firstRound.push({
					player1: currentPlayers[i],
					player2: currentPlayers[i + 1],
					matchId: `round-0-match-${Math.floor(i/2)}`,
					round: 0
				});
			}
		}

		this.tournamentBracket.rounds.push(firstRound);

		// Handle bye player by advancing them automatically
		if (byePlayer && firstRound.length > 0) {
			// Bye player gets added to next round
			const nextRound: GameMatch[] = [];
			this.tournamentBracket.rounds.push(nextRound);
		}

		this.displayBracket();
	}

	private displayBracket(): void {
		const bracketDiv = document.getElementById('bracket-display');
		if (!bracketDiv) return;

		// Clear previous content
		bracketDiv.innerHTML = '';

		const bracketContainer = document.createElement('div');
		bracketContainer.className = 'tournament-bracket';
		
		// Display all rounds
		this.tournamentBracket.rounds.forEach((round, roundIndex) => {
			const roundDiv = document.createElement('div');
			roundDiv.className = 'round';
			
			const roundTitle = document.createElement('h3');
			roundTitle.textContent = `Round ${roundIndex + 1}`;
			roundDiv.appendChild(roundTitle);
			
			const matchesDiv = document.createElement('div');
			matchesDiv.className = 'matches';
			
			round.forEach((match, matchIndex) => {
				const isCurrentMatch = roundIndex === this.tournamentBracket.currentRound && 
									 matchIndex === this.tournamentBracket.currentMatchIndex;
				const isCompleted = !!match.winner;
				
				const matchDiv = document.createElement('div');
				matchDiv.className = `match ${isCurrentMatch ? 'current' : ''} ${isCompleted ? 'completed' : ''}`;
				
				const playersDiv = document.createElement('div');
				playersDiv.className = 'match-players';
				
				const player1Span = document.createElement('span');
				player1Span.textContent = match.player1.alias;
				if (match.winner?.id === match.player1.id) {
					player1Span.className = 'winner';
				}
				
				const vsSpan = document.createElement('span');
				vsSpan.className = 'vs';
				vsSpan.textContent = 'vs';
				
				const player2Span = document.createElement('span');
				player2Span.textContent = match.player2.alias;
				if (match.winner?.id === match.player2.id) {
					player2Span.className = 'winner';
				}
				
				playersDiv.appendChild(player1Span);
				playersDiv.appendChild(vsSpan);
				playersDiv.appendChild(player2Span);
				matchDiv.appendChild(playersDiv);
				
				if (match.winner) {
					const resultDiv = document.createElement('div');
					resultDiv.className = 'match-result';
					resultDiv.textContent = `Winner: ${match.winner.alias}`;
					matchDiv.appendChild(resultDiv);
				}
				
				matchesDiv.appendChild(matchDiv);
			});
			
			roundDiv.appendChild(matchesDiv);
			bracketContainer.appendChild(roundDiv);
		});

		// Show future rounds structure
		const totalRounds = Math.ceil(Math.log2(this.registeredPlayers.length));
		for (let i = this.tournamentBracket.rounds.length; i < totalRounds; i++) {
			const futureRoundDiv = document.createElement('div');
			futureRoundDiv.className = 'round future';
			
			const futureTitle = document.createElement('h3');
			futureTitle.textContent = `Round ${i + 1}`;
			futureRoundDiv.appendChild(futureTitle);
			
			const futureMatches = document.createElement('div');
			futureMatches.className = 'matches';
			
			const pendingMatch = document.createElement('div');
			pendingMatch.className = 'match pending';
			pendingMatch.textContent = 'TBD';
			
			futureMatches.appendChild(pendingMatch);
			futureRoundDiv.appendChild(futureMatches);
			bracketContainer.appendChild(futureRoundDiv);
		}

		bracketDiv.appendChild(bracketContainer);

		// Add tournament status
		this.displayTournamentStatus(bracketDiv);
		this.updateNextMatchButton();
	}

	private displayTournamentStatus(parentDiv: HTMLElement): void {
		const statusDiv = document.createElement('div');
		
		if (this.isTournamentComplete()) {
			const winner = this.getTournamentWinner();
			statusDiv.className = 'tournament-status final';
			
			const winnerTitle = document.createElement('h2');
			winnerTitle.textContent = `🏆 Tournament Winner: ${winner?.alias}! 🏆`;
			statusDiv.appendChild(winnerTitle);
			
			const newTournamentBtn = document.createElement('button');
			newTournamentBtn.className = 'primary-btn';
			newTournamentBtn.textContent = 'New Tournament';
			newTournamentBtn.addEventListener('click', () => this.resetTournament());
			statusDiv.appendChild(newTournamentBtn);
		} else {
			const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
			if (currentRound && this.tournamentBracket.currentMatchIndex < currentRound.length) {
				const nextMatch = currentRound[this.tournamentBracket.currentMatchIndex];
				statusDiv.className = 'tournament-status';
				
				const nextTitle = document.createElement('h3');
				nextTitle.textContent = 'Next Match:';
				statusDiv.appendChild(nextTitle);
				
				const matchInfo = document.createElement('p');
				matchInfo.textContent = `${nextMatch.player1.alias} vs ${nextMatch.player2.alias}`;
				statusDiv.appendChild(matchInfo);
			}
		}
		
		if (statusDiv.children.length > 0) {
			parentDiv.appendChild(statusDiv);
		}
	}

	private updateNextMatchButton(): void {
		const nextMatchBtn = document.getElementById('next-match-btn') as HTMLButtonElement;
		if (nextMatchBtn) {
			if (this.isTournamentComplete()) {
				nextMatchBtn.style.display = 'none';
			} else {
				nextMatchBtn.style.display = 'block';
				nextMatchBtn.textContent = 'Start Next Match';
			}
		}
	}

	private proceedToNextMatch(): void {
		if (this.isTournamentComplete()) {
			return;
		}

		const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
		if (!currentRound || this.tournamentBracket.currentMatchIndex >= currentRound.length) {
			this.advanceToNextRound();
			return;
		}

		const nextMatch = currentRound[this.tournamentBracket.currentMatchIndex];
		this.currentMatch = nextMatch;
		this.startPongGame(nextMatch.player1, nextMatch.player2);
	}

	private advanceToNextRound(): void {
		const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
		
		// Get winners from current round
		const winners = currentRound
			.filter(match => match.winner)
			.map(match => match.winner!);

		if (winners.length <= 1) {
			this.displayBracket();
			return;
		}

		// Create next round
		const nextRound: GameMatch[] = [];
		for (let i = 0; i < winners.length; i += 2) {
			if (i + 1 < winners.length) {
				nextRound.push({
					player1: winners[i],
					player2: winners[i + 1],
					matchId: `round-${this.tournamentBracket.currentRound + 1}-match-${Math.floor(i/2)}`,
					round: this.tournamentBracket.currentRound + 1
				});
			}
		}

		if (nextRound.length > 0) {
			this.tournamentBracket.rounds.push(nextRound);
			this.tournamentBracket.currentRound++;
			this.tournamentBracket.currentMatchIndex = 0;
		}

		this.displayBracket();
	}

	private isTournamentComplete(): boolean {
		const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
		if (!currentRound) return false;
		
		const completedMatches = currentRound.filter(match => match.winner).length;
		const isCurrentRoundComplete = completedMatches === currentRound.length;
		
		return isCurrentRoundComplete && currentRound.length === 1;
	}

	private getTournamentWinner(): PlayerInfo | null {
		if (!this.isTournamentComplete()) return null;
		
		const finalRound = this.tournamentBracket.rounds[this.tournamentBracket.rounds.length - 1];
		return finalRound[0]?.winner || null;
	}

	public resetTournament(): void {
		this.registeredPlayers = [];
		this.tournamentBracket = { rounds: [], currentRound: 0, currentMatchIndex: 0 };
		this.currentMatch = null;
		this.showScreen('welcome-screen');
	}

	private startQuickGame(): void {
		const defaultPlayers: GameMatch = {
			player1: { alias: 'Player 1', id: '1' },
			player2: { alias: 'Player 2', id: '2' },
			matchId: 'quick-game',
			round: 0
		};
		this.currentMatch = defaultPlayers;
		this.startPongGame(defaultPlayers.player1, defaultPlayers.player2);
	}

	private startPongGame(player1: PlayerInfo, player2: PlayerInfo): void {
		const player1Name = document.getElementById('player1-name');
		const player2Name = document.getElementById('player2-name');
		
		if (player1Name) player1Name.textContent = player1.alias;
		if (player2Name) player2Name.textContent = player2.alias;
		
		this.showScreen('game-arena');
		
		const pongGame = new PongGameEngine();
		pongGame.initialize();
		pongGame.onGameComplete = (winner: number) => {
			this.handleGameResult(winner);
		};
	}

	private handleGameResult(winnerIndex: number): void {
		if (!this.currentMatch) return;

		const winner = winnerIndex === 1 ? this.currentMatch.player1 : this.currentMatch.player2;
		
		// Update tournament match
		const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
		if (currentRound && currentRound.length > 0) {
			const matchIndex = this.tournamentBracket.currentMatchIndex;
			if (currentRound[matchIndex]) {
				currentRound[matchIndex].winner = winner;
				this.tournamentBracket.currentMatchIndex++;
			}
			
			this.showScreen('tournament-bracket');
			this.displayBracket();
		} else {
			// Quick game
			this.showError(`${winner.alias} wins the game!`);
			this.showScreen('welcome-screen');
		}
	}
}

class PongGameEngine {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private gameState = {
		ball: { x: 400, y: 200, dx: 5, dy: 3, size: 10 },
		paddle1: { x: 10, y: 150, width: 10, height: 100, speed: 8 },
		paddle2: { x: 780, y: 150, width: 10, height: 100, speed: 8 },
		score: { player1: 0, player2: 0 },
		gameRunning: false
	};
	
	public onGameComplete?: (winner: number) => void;
	private keyHandlers: { keyDown: (e: KeyboardEvent) => void; keyUp: (e: KeyboardEvent) => void } | null = null;
	private paddleInterval: number | null = null;

	initialize(): void {
		this.canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
		if (!this.canvas) {
			console.error('Canvas element not found');
			return;
		}
		
		const context = this.canvas.getContext('2d');
		if (!context) {
			console.error('Cannot get 2D context');
			return;
		}
		
		this.ctx = context;
		this.setupControls();
		this.gameState.gameRunning = true;
		this.resetGame();
		this.gameLoop();
	}

	private resetGame(): void {
		this.gameState.score = { player1: 0, player2: 0 };
		this.resetBall();
	}

	private setupControls(): void {
		const keysPressed: { [key: string]: boolean } = {};
		
		const keyDownHandler = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			// Only handle game keys to prevent conflicts
			if (['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
				keysPressed[key] = true;
				e.preventDefault();
			}
		};
		
		const keyUpHandler = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
				keysPressed[key] = false;
				e.preventDefault();
			}
		};

		// Store handlers for cleanup
		this.keyHandlers = { keyDown: keyDownHandler, keyUp: keyUpHandler };
		
		document.addEventListener('keydown', keyDownHandler);
		document.addEventListener('keyup', keyUpHandler);

		const updatePaddles = () => {
			if (!this.gameState.gameRunning) return;
			
			// Player 1 controls (W/S)
			if (keysPressed['w'] && this.gameState.paddle1.y > 0) {
				this.gameState.paddle1.y -= this.gameState.paddle1.speed;
			}
			if (keysPressed['s'] && this.gameState.paddle1.y < this.canvas.height - this.gameState.paddle1.height) {
				this.gameState.paddle1.y += this.gameState.paddle1.speed;
			}
			
			// Player 2 controls (Arrow keys)
			if (keysPressed['arrowup'] && this.gameState.paddle2.y > 0) {
				this.gameState.paddle2.y -= this.gameState.paddle2.speed;
			}
			if (keysPressed['arrowdown'] && this.gameState.paddle2.y < this.canvas.height - this.gameState.paddle2.height) {
				this.gameState.paddle2.y += this.gameState.paddle2.speed;
			}
		};

		this.paddleInterval = window.setInterval(() => {
			if (this.gameState.gameRunning) {
				updatePaddles();
			} else {
				this.cleanup();
			}
		}, 16);
	}

	private cleanup(): void {
		if (this.paddleInterval) {
			clearInterval(this.paddleInterval);
			this.paddleInterval = null;
		}
		
		if (this.keyHandlers) {
			document.removeEventListener('keydown', this.keyHandlers.keyDown);
			document.removeEventListener('keyup', this.keyHandlers.keyUp);
			this.keyHandlers = null;
		}
	}

	private gameLoop(): void {
		if (!this.gameState.gameRunning) {
			this.cleanup();
			return;
		}

		this.updateBall();
		this.draw();
		this.checkScore();
		
		requestAnimationFrame(() => this.gameLoop());
	}

	private updateBall(): void {
		const ball = this.gameState.ball;
		ball.x += ball.dx;
		ball.y += ball.dy;

		// Wall collision (top and bottom)
		if (ball.y <= ball.size || ball.y >= this.canvas.height - ball.size) {
			ball.dy = -ball.dy;
		}

		// Paddle collision
		if (this.checkPaddleCollision()) {
			ball.dx = -ball.dx;
		}

		// Score detection
		if (ball.x <= 0) {
			this.gameState.score.player2++;
			this.resetBall();
		} else if (ball.x >= this.canvas.width) {
			this.gameState.score.player1++;
			this.resetBall();
		}
	}

	private checkPaddleCollision(): boolean {
		const ball = this.gameState.ball;
		const p1 = this.gameState.paddle1;
		const p2 = this.gameState.paddle2;

		// Left paddle collision
		const leftPaddleCollision = ball.x - ball.size <= p1.x + p1.width && 
								  ball.y >= p1.y && 
								  ball.y <= p1.y + p1.height && 
								  ball.dx < 0;

		// Right paddle collision
		const rightPaddleCollision = ball.x + ball.size >= p2.x && 
								   ball.y >= p2.y && 
								   ball.y <= p2.y + p2.height && 
								   ball.dx > 0;

		return leftPaddleCollision || rightPaddleCollision;
	}

	private resetBall(): void {
		this.gameState.ball.x = this.canvas.width / 2;
		this.gameState.ball.y = this.canvas.height / 2;
		this.gameState.ball.dx = Math.random() > 0.5 ? 5 : -5;
		this.gameState.ball.dy = (Math.random() - 0.5) * 6;
	}

	private draw(): void {
		// Clear canvas
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw center line
		this.ctx.setLineDash([5, 15]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.strokeStyle = '#fff';
		this.ctx.stroke();
		this.ctx.setLineDash([]);

		// Draw paddles
		this.ctx.fillStyle = '#fff';
		this.ctx.fillRect(this.gameState.paddle1.x, this.gameState.paddle1.y, 
						 this.gameState.paddle1.width, this.gameState.paddle1.height);
		this.ctx.fillRect(this.gameState.paddle2.x, this.gameState.paddle2.y, 
						 this.gameState.paddle2.width, this.gameState.paddle2.height);

		// Draw ball
		this.ctx.beginPath();
		this.ctx.arc(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.size, 0, Math.PI * 2);
		this.ctx.fill();

		// Update score display
		const scoreElement = document.getElementById('game-score');
		if (scoreElement) {
			scoreElement.textContent = `${this.gameState.score.player1} - ${this.gameState.score.player2}`;
		}
	}

	private checkScore(): void {
		if (this.gameState.score.player1 >= 5) {
			this.gameState.gameRunning = false;
			setTimeout(() => this.onGameComplete?.(1), 1000);
		} else if (this.gameState.score.player2 >= 5) {
			this.gameState.gameRunning = false;
			setTimeout(() => this.onGameComplete?.(2), 1000);
		}
	}
}

// Initialize application
let app: PongTournamentApp;
document.addEventListener('DOMContentLoaded', () => {
	app = new PongTournamentApp();
	(window as any).app = app; // Make it globally accessible for remove buttons
});