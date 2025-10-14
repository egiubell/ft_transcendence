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
		this.showScreen('welcome-screen');
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

	private showScreen(screenId: string): void {
		document.querySelectorAll('.screen').forEach(screen => {
			screen.classList.remove('active');
		});
		document.getElementById(screenId)?.classList.add('active');
		this.currentScreen = screenId;
	}

	private registerPlayer(): void {
		const aliasInput = document.getElementById('player-alias') as HTMLInputElement;
		const alias = aliasInput.value.trim();

		if (alias && !this.registeredPlayers.find(p => p.alias === alias)) {
			const newPlayer: PlayerInfo = {
				alias: alias,
				id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
			};
			
			this.registeredPlayers.push(newPlayer);
			this.updatePlayerDisplay();
			aliasInput.value = '';
			
			const beginBtn = document.getElementById('begin-tournament-btn') as HTMLButtonElement;
			beginBtn.disabled = this.registeredPlayers.length < 2;
		} else if (alias && this.registeredPlayers.find(p => p.alias === alias)) {
			alert('Player alias already exists!');
		}
	}

	private updatePlayerDisplay(): void {
		const playersDiv = document.getElementById('registered-players');
		if (playersDiv) {
			playersDiv.innerHTML = this.registeredPlayers
				.map((player, index) => 
					`<span class="player-tag">${player.alias} 
					 <button onclick="this.parentElement.remove(); window.app.removePlayer('${player.id}')" class="remove-btn">×</button>
					 </span>`
				)
				.join('');
		}
	}

	public removePlayer(playerId: string): void {
		this.registeredPlayers = this.registeredPlayers.filter(p => p.id !== playerId);
		this.updatePlayerDisplay();
		const beginBtn = document.getElementById('begin-tournament-btn') as HTMLButtonElement;
		beginBtn.disabled = this.registeredPlayers.length < 2;
	}

	private startTournament(): void {
		if (this.registeredPlayers.length >= 2) {
			this.generateTournamentBracket();
			this.showScreen('tournament-bracket');
		}
	}

	private generateTournamentBracket(): void {
		const players = [...this.registeredPlayers];
		
		// Shuffle players for fair bracket
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
			firstRound.push({
				player1: currentPlayers[i],
				player2: currentPlayers[i + 1],
				matchId: `round-0-match-${i/2}`,
				round: 0
			});
		}

		this.tournamentBracket.rounds.push(firstRound);

		// If there was a bye player, add them to the next round
		if (byePlayer) {
			if (this.tournamentBracket.rounds.length === 1) {
				this.tournamentBracket.rounds.push([]);
			}
		}

		this.displayBracket();
	}

	private displayBracket(): void {
		const bracketDiv = document.getElementById('bracket-display');
		if (!bracketDiv) return;

		let html = '<div class="tournament-bracket">';
		
		// Show all rounds
		this.tournamentBracket.rounds.forEach((round, roundIndex) => {
			html += `<div class="round">
						<h3>Round ${roundIndex + 1}</h3>
						<div class="matches">`;
			
			round.forEach((match, matchIndex) => {
				const isCurrentMatch = roundIndex === this.tournamentBracket.currentRound && 
									 matchIndex === this.tournamentBracket.currentMatchIndex;
				const isCompleted = !!match.winner;
				
				html += `<div class="match ${isCurrentMatch ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
						   <div class="match-players">
							 <span class="${match.winner?.id === match.player1.id ? 'winner' : ''}">${match.player1.alias}</span>
							 <span class="vs">vs</span>
							 <span class="${match.winner?.id === match.player2.id ? 'winner' : ''}">${match.player2.alias}</span>
						   </div>
						   ${match.winner ? `<div class="match-result">Winner: ${match.winner.alias}</div>` : ''}
						 </div>`;
			});
			
			html += '</div></div>';
		});

		// Show next rounds structure (empty)
		const totalRounds = Math.ceil(Math.log2(this.registeredPlayers.length));
		for (let i = this.tournamentBracket.rounds.length; i < totalRounds; i++) {
			html += `<div class="round future">
						<h3>Round ${i + 1}</h3>
						<div class="matches">
						  <div class="match pending">TBD</div>
						</div>
					 </div>`;
		}

		html += '</div>';
		
		// Tournament status
		const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
		if (currentRound && this.tournamentBracket.currentMatchIndex < currentRound.length) {
			const nextMatch = currentRound[this.tournamentBracket.currentMatchIndex];
			html += `<div class="tournament-status">
					   <h3>Next Match:</h3>
					   <p>${nextMatch.player1.alias} vs ${nextMatch.player2.alias}</p>
					 </div>`;
		} else if (this.isTournamentComplete()) {
			const winner = this.getTournamentWinner();
			html += `<div class="tournament-status final">
					   <h2>🏆 Tournament Winner: ${winner?.alias}! 🏆</h2>
					   <button onclick="window.app.resetTournament()" class="primary-btn">New Tournament</button>
					 </div>`;
		}

		bracketDiv.innerHTML = html;

		// Update next match button
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
			// Move to next round
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
			// Tournament complete
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
					matchId: `round-${this.tournamentBracket.currentRound + 1}-match-${i/2}`,
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
		
		if (isCurrentRoundComplete && currentRound.length === 1) {
			return true; // Final match completed
		}
		
		return false;
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
		document.getElementById('player1-name')!.textContent = player1.alias;
		document.getElementById('player2-name')!.textContent = player2.alias;
		this.showScreen('game-arena');
		
		const pongGame = new PongGameEngine();
		pongGame.initialize();
		pongGame.onGameComplete = (winner: number) => {
			this.handleGameResult(winner);
		};
	}

	private handleGameResult(winnerIndex: number): void {
		if (this.currentMatch) {
			const winner = winnerIndex === 1 ? this.currentMatch.player1 : this.currentMatch.player2;
			
			// Update tournament match
			const currentRound = this.tournamentBracket.rounds[this.tournamentBracket.currentRound];
			if (currentRound) {
				const matchIndex = this.tournamentBracket.currentMatchIndex;
				if (currentRound[matchIndex]) {
					currentRound[matchIndex].winner = winner;
					this.tournamentBracket.currentMatchIndex++;
				}
				
				this.showScreen('tournament-bracket');
				this.displayBracket();
			} else {
				// Quick game
				alert(`${winner.alias} wins the game!`);
				this.showScreen('welcome-screen');
			}
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

	initialize(): void {
		this.canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
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
			keysPressed[e.key.toLowerCase()] = true;
			e.preventDefault();
		};
		
		const keyUpHandler = (e: KeyboardEvent) => {
			keysPressed[e.key.toLowerCase()] = false;
			e.preventDefault();
		};

		document.addEventListener('keydown', keyDownHandler);
		document.addEventListener('keyup', keyUpHandler);

		const updatePaddles = () => {
			if (!this.gameState.gameRunning) return;
			
			if (keysPressed['w'] && this.gameState.paddle1.y > 0) {
				this.gameState.paddle1.y -= this.gameState.paddle1.speed;
			}
			if (keysPressed['s'] && this.gameState.paddle1.y < this.canvas.height - this.gameState.paddle1.height) {
				this.gameState.paddle1.y += this.gameState.paddle1.speed;
			}
			if (keysPressed['arrowup'] && this.gameState.paddle2.y > 0) {
				this.gameState.paddle2.y -= this.gameState.paddle2.speed;
			}
			if (keysPressed['arrowdown'] && this.gameState.paddle2.y < this.canvas.height - this.gameState.paddle2.height) {
				this.gameState.paddle2.y += this.gameState.paddle2.speed;
			}
		};

		const paddleInterval = setInterval(() => {
			if (this.gameState.gameRunning) {
				updatePaddles();
			} else {
				clearInterval(paddleInterval);
				document.removeEventListener('keydown', keyDownHandler);
				document.removeEventListener('keyup', keyUpHandler);
			}
		}, 16);
	}

	private gameLoop(): void {
		if (!this.gameState.gameRunning) return;

		this.updateBall();
		this.draw();
		this.checkScore();
		
		requestAnimationFrame(() => this.gameLoop());
	}

	private updateBall(): void {
		const ball = this.gameState.ball;
		ball.x += ball.dx;
		ball.y += ball.dy;

		// Wall collision
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

		return (ball.x - ball.size <= p1.x + p1.width && 
				ball.y >= p1.y && ball.y <= p1.y + p1.height && ball.dx < 0) ||
			   (ball.x + ball.size >= p2.x && 
				ball.y >= p2.y && ball.y <= p2.y + p2.height && ball.dx > 0);
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
		document.getElementById('game-score')!.textContent = 
			`${this.gameState.score.player1} - ${this.gameState.score.player2}`;
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
	(window as any).app = app; // Make it globally accessible
});