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

interface GameSettings {
	powerUps: boolean;
	attacks: boolean;
	map: string;
	ballSpeed: number; // base speed magnitude
	paddleSize: number; // paddle height
	simpleMode: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
	powerUps: false,
	attacks: false,
	map: 'classic',
	ballSpeed: 5,
	paddleSize: 100,
	simpleMode: false
};

// ============= AUTH SERVICE (INLINE) =============
const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
	private static TOKEN_KEY = 'pong_auth_token';
	private static USER_KEY = 'pong_current_user';

	static async signup(email: string, username: string, password: string) {
		const response = await fetch(`${API_BASE_URL}/auth/signup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, username, password })
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Signup failed');
		}
		const data = await response.json();
		this.saveToken(data.token);
		this.saveUser(data.user);
		return data;
	}

	static async login(email: string, password: string) {
		const response = await fetch(`${API_BASE_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Login failed');
		}
		const data = await response.json();
		this.saveToken(data.token);
		this.saveUser(data.user);
		return data;
	}

	static async logout() {
		localStorage.removeItem(this.TOKEN_KEY);
		localStorage.removeItem(this.USER_KEY);
	}

	static getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	static getUser(): any {
		const user = localStorage.getItem(this.USER_KEY);
		return user ? JSON.parse(user) : null;
	}

	static isAuthenticated(): boolean {
		return !!this.getToken() && !!this.getUser();
	}

	static saveToken(token: string) {
		localStorage.setItem(this.TOKEN_KEY, token);
	}

	static saveUser(user: any) {
		localStorage.setItem(this.USER_KEY, JSON.stringify(user));
	}

	static setSession(token: string, user: any) {
		this.saveToken(token);
		this.saveUser(user);
	}

	// Verifica il token con il backend
	static async verifyToken(): Promise<boolean> {
		const token = this.getToken();
		if (!token) return false;
		try {
			const resp = await fetch(`${API_BASE_URL}/auth/verify`, {
				method: 'GET',
				headers: { 'Authorization': `Bearer ${token}` }
			});
			return resp.ok;
		} catch (e) {
			console.error('Verify token error:', e);
			return false;
		}
	}
}

// Global toggle function for auth forms
(window as any).toggleAuthForm = () => {
	const loginForm = document.getElementById('login-form');
	const signupForm = document.getElementById('signup-form');
	if (loginForm && signupForm) {
		loginForm.classList.toggle('active');
		signupForm.classList.toggle('active');
		const loginError = document.getElementById('login-error');
		const signupError = document.getElementById('signup-error');
		if (loginError) loginError.classList.remove('show');
		if (signupError) signupError.classList.remove('show');
	}
};

class PongTournamentApp {
	private registeredPlayers: PlayerInfo[] = [];
	private currentScreen: string = 'welcome-screen';
	private tournamentBracket: TournamentBracket = {
		rounds: [],
		currentRound: 0,
		currentMatchIndex: 0
	};
	private currentMatch: GameMatch | null = null;
	private activeGame: PongGameEngine | null = null;

	constructor() {
		// Auth gate: decide initial screen based on token
		const isAuthed = AuthService.isAuthenticated();
		this.initializeEventListeners();
		this.initializeRouter();
		if (isAuthed) {
			this.updateCurrentUserDisplay();
			this.showScreen('welcome-screen', false);
		} else {
			this.showScreen('auth-screen', false);
		}
		this.bindAuthForms();
	}

	private initializeEventListeners(): void {
		// Auth: logout button (both welcome-screen and header)
		const handleLogout = async () => {
			await AuthService.logout();
			this.showScreen('auth-screen');
			this.updateCurrentUserDisplay();
			// Hide header user info
			const headerDisplay = document.getElementById('current-user-display-header');
			const headerLogout = document.getElementById('logout-btn-header');
			if (headerDisplay) headerDisplay.style.display = 'none';
			if (headerLogout) headerLogout.style.display = 'none';
		};
		
		document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
		document.getElementById('logout-btn-header')?.addEventListener('click', handleLogout);

		const googleBtn = document.getElementById('google-login-btn') as HTMLButtonElement | null;
		if (googleBtn) {
			googleBtn.addEventListener('click', async () => {
				googleBtn.disabled = true;
				googleBtn.textContent = 'Connessione a Google...';
				try {
					const resp = await fetch('http://localhost:3000/api/auth/google/url');
					if (!resp.ok) {
						const msg = await resp.text();
						throw new Error(`Backend ha risposto ${resp.status}: ${msg}`);
					}
					const data = await resp.json();
					if (data.url) {
						window.location.href = data.url;
					} else {
						throw new Error('Nessun URL Google ricevuto');
					}
				} catch (e: any) {
					console.error('Google OAuth init failed', e);
					alert(`Errore avvio Google OAuth: ${e?.message || e}`);
					googleBtn.disabled = false;
					googleBtn.textContent = 'Continua con Google';
				}
			});
		}
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

		// Ensure settings button exists and has its handler
		this.ensureSettingsButtonExists();

		// Stats & single player
		document.getElementById('single-player-btn')?.addEventListener('click', () => {
			this.startSinglePlayer();
		});

		document.getElementById('stats-btn')?.addEventListener('click', () => {
			this.showScreen('stats-screen');
			this.renderStatsScreen();
		});

		// Settings panel actions
		document.getElementById('save-settings')?.addEventListener('click', () => {
			const settings = this.collectSettingsFromUI();
			this.saveSettings(settings);
			this.closeSettingsPanel();
		});

		document.getElementById('reset-settings')?.addEventListener('click', () => {
			this.resetSettings();
		});

		document.getElementById('close-settings')?.addEventListener('click', () => {
			this.closeSettingsPanel();
		});

		// Exit match button (allow leaving an ongoing match)
		document.getElementById('exit-match-btn')?.addEventListener('click', () => {
			this.exitCurrentMatch();
		});

		document.getElementById('clear-stats')?.addEventListener('click', () => {
			localStorage.removeItem('pong_match_history');
			this.renderStatsScreen();
		});

		// Handle Enter key in alias input
		document.getElementById('player-alias')?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.registerPlayer();
			}
		});
	}

	private bindAuthForms(): void {
		const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
		const signupForm = document.getElementById('signup-form') as HTMLFormElement | null;
		const loginError = document.getElementById('login-error');
		const signupError = document.getElementById('signup-error');

		const showLoginSuccess = (msg: string) => {
			if (loginError) {
				loginError.textContent = msg;
				loginError.classList.add('show', 'success');
			}
		};

		const clearLoginError = () => {
			if (loginError) {
				loginError.classList.remove('show', 'success');
				loginError.textContent = '';
			}
		};

		const clearSignupError = () => {
			if (signupError) {
				signupError.classList.remove('show');
				signupError.textContent = '';
			}
		};

		// Client-side validation helpers
		const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
		const isValidUsername = (u: string) => /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/.test(u);
		const isStrongPassword = (p: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);

		if (loginForm) {
			loginForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const email = (document.getElementById('login-email') as HTMLInputElement)?.value || '';
				const password = (document.getElementById('login-password') as HTMLInputElement)?.value || '';
				clearLoginError();
				if (!isValidEmail(email)) {
					if (loginError) {
						loginError.textContent = 'Invalid email format';
						loginError.classList.add('show');
						loginError.classList.remove('success');
					}
					return;
				}
				try {
					await AuthService.login(email, password);
					this.updateCurrentUserDisplay();
					this.showScreen('welcome-screen');
					clearLoginError();
				} catch (err: any) {
					if (loginError) {
						loginError.textContent = err?.message || 'Login fallito';
						loginError.classList.add('show');
						loginError.classList.remove('success');
					}
				}
			});
		}

		if (signupForm) {
			signupForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const email = (document.getElementById('signup-email') as HTMLInputElement)?.value || '';
				const username = (document.getElementById('signup-username') as HTMLInputElement)?.value || '';
				const password = (document.getElementById('signup-password') as HTMLInputElement)?.value || '';
				const confirm = (document.getElementById('signup-confirm') as HTMLInputElement)?.value || '';

				clearSignupError();
				clearLoginError();

				if (!isValidEmail(email)) {
					if (signupError) {
						signupError.textContent = 'Invalid email format';
						signupError.classList.add('show');
					}
					return;
				}

				if (!isValidUsername(username)) {
					if (signupError) {
						signupError.textContent = 'Invalid username. 3-20 chars, start with a letter, only letters, numbers, _ or -';
						signupError.classList.add('show');
					}
					return;
				}

				if (password !== confirm) {
					if (signupError) {
						signupError.textContent = 'Passwords do not match';
						signupError.classList.add('show');
					}
					return;
				}

				if (!isStrongPassword(password)) {
					if (signupError) {
						signupError.textContent = 'Weak password. Min 8 chars, include upper, lower and a digit';
						signupError.classList.add('show');
					}
					return;
				}

				try {
					await AuthService.signup(email, username, password);
					clearSignupError();
					const loginFormEl = document.getElementById('login-form');
					const signupFormEl = document.getElementById('signup-form');
					loginFormEl?.classList.add('active');
					signupFormEl?.classList.remove('active');
					this.showScreen('auth-screen');
					showLoginSuccess('Account creato, ora effettua il login');
				} catch (err: any) {
					if (signupError) {
						signupError.textContent = err?.message || 'Signup failed';
						signupError.classList.add('show');
					}
				}
			});
		}
	}

	private updateCurrentUserDisplay(): void {
		const el = document.getElementById('current-user-display');
		const headerDisplay = document.getElementById('current-user-display-header');
		const headerLogout = document.getElementById('logout-btn-header');
		const user = AuthService.getUser();
		if (user) {
			const username = `Logged in as ${user.username}`;
			if (el) el.textContent = username;
			if (headerDisplay) {
				headerDisplay.textContent = username;
				headerDisplay.style.display = 'inline';
			}
			if (headerLogout) headerLogout.style.display = 'inline-block';
		} else {
			if (el) el.textContent = 'Not logged in';
			if (headerDisplay) headerDisplay.style.display = 'none';
			if (headerLogout) headerLogout.style.display = 'none';
		}
	}


	private initializeRouter(): void {
		// Handle browser back/forward buttons
		window.addEventListener('popstate', (e) => {
			const route = e.state?.route || 'welcome-screen';
			this.handleRoute(route, false);
		});

		// Handle footer policy links
		document.addEventListener('click', (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('footer-link')) {
				const href = target.getAttribute('href');
				if (href === '#privacy-policy') {
					e.preventDefault();
					this.showPolicyPage('privacy-policy');
				} else if (href === '#terms-of-service') {
					e.preventDefault();
					this.showPolicyPage('terms-of-service');
				}
			}
		});

		// Set initial state
		if (!history.state) {
			const initialScreen = window.location.hash.slice(1) || 'welcome-screen';
			history.replaceState({ route: initialScreen }, this.getScreenTitle(initialScreen), `#${initialScreen}`);
		}
	}

	private handleRoute(route: string, pushState: boolean = true): void {
		if (route === 'privacy-policy' || route === 'terms-of-service') {
			this.showPolicyPage(route as 'privacy-policy' | 'terms-of-service');
		} else {
			this.showScreen(route, pushState);
		}
	}


		private showPolicyPage(policy: 'privacy-policy' | 'terms-of-service'): void {
			const appContainer = document.getElementById('app-container');
			if (!appContainer) return;

			const filename = policy === 'privacy-policy' ? 'privacy-policy.html' : 'terms-of-service.html';
		
			// Fetch and display the policy page
			fetch(filename)
				.then(response => {
					if (!response.ok) throw new Error(`Failed to load ${filename}`);
					return response.text();
				})
				.then(html => {
					// Create a temporary container for the policy page
					const tempDiv = document.createElement('div');
					tempDiv.innerHTML = html;
				
					// Extract the main content
					const policyContainer = tempDiv.querySelector('.policy-container');
					if (!policyContainer) throw new Error('Policy content not found');

					const token = AuthService.getToken();
					const user = AuthService.getUser();
					// Hide all screens
					document.querySelectorAll('.screen').forEach(screen => {
						screen.classList.remove('active');
					});
				const settingsBtn = document.getElementById('settings-btn');
				if (settingsBtn && settingsBtn.parentElement) {
					settingsBtn.parentElement.removeChild(settingsBtn);
				}

				// Create a container for the policy page
				let policyScreen = document.getElementById(`${policy}-screen`);
				if (!policyScreen) {
					policyScreen = document.createElement('div');
					policyScreen.id = `${policy}-screen`;
					policyScreen.className = 'screen policy-screen';
					document.getElementById('content-area')?.appendChild(policyScreen);
				}

				// Clear and add content
				policyScreen.innerHTML = '';
				policyScreen.appendChild(policyContainer.cloneNode(true));
				policyScreen.classList.add('active');

				// Update browser history
				const title = policy === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service';
				history.pushState({ route: policy }, title, `#${policy}`);
				document.title = `${title} - Pong Tournament`;
			})
			.catch(error => {
				console.error('Error loading policy page:', error);
				alert('Failed to load page. Please try again.');
				this.showScreen('welcome-screen');
			});
	}

	private showScreen(screenId: string, pushState: boolean = true): void {
		// Validate screen ID to prevent XSS
		const validScreens = ['auth-screen', 'welcome-screen', 'tournament-setup', 'game-arena', 'tournament-bracket', 'stats-screen'];
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

		// Remove the settings button from the DOM while in the game screen; recreate otherwise
		const settingsBtn = document.getElementById('settings-btn');
		if (screenId === 'game-arena') {
			if (settingsBtn && settingsBtn.parentElement) settingsBtn.parentElement.removeChild(settingsBtn);
		} else {
			this.ensureSettingsButtonExists();
		}
		
		// Update browser history for SPA navigation
		if (pushState) {
			const title = this.getScreenTitle(screenId);
			history.pushState({ route: screenId }, title, `#${screenId}`);
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

	private startSinglePlayer(): void {
		// Usa un alias dal profilo; chiedi nome solo se non loggato o senza alias
		const user = AuthService.getUser();
		const userAlias = user?.username || user?.name || (user?.email ? user.email.split('@')[0] : '') || '';
		let playerAlias = userAlias || 'Player';
		if (!userAlias) {
			const name = window.prompt('Inserisci il tuo nome per la modalità single player (Annulla per uscire):', playerAlias);
			if (name === null) return; // user cancelled
			playerAlias = name.trim() || 'Player';
		}
		const player: PlayerInfo = { alias: playerAlias, id: user ? String(user.id ?? '1') : '1' };
		const ai: PlayerInfo = { alias: 'AI Bot', id: 'AI' };
		const match: GameMatch = { player1: player, player2: ai, matchId: 'single-' + Date.now(), round: 0 };
		this.currentMatch = match;
		this.startPongGame(player, ai);
	}

	private startPongGame(player1: PlayerInfo, player2: PlayerInfo): void {
		const player1Name = document.getElementById('player1-name');
		const player2Name = document.getElementById('player2-name');
		
		if (player1Name) player1Name.textContent = player1.alias;
		if (player2Name) player2Name.textContent = player2.alias;
		
		this.showScreen('game-arena');
		
		const pongGame = new PongGameEngine();
		// Keep reference so we can stop the match early
		this.activeGame = pongGame;
		// Disable settings while match is running
		document.getElementById('settings-btn')?.setAttribute('disabled', 'true');
		// Prefer current UI settings if user has changed them but not saved
		let settings: GameSettings;
		try {
			// if the settings controls are present, read them to apply immediately
			const mapEl = document.getElementById('opt-map') as HTMLSelectElement | null;
			if (mapEl) settings = this.collectSettingsFromUI(); else settings = this.loadSettings();
		} catch (e) {
			settings = this.loadSettings();
		}
		pongGame.applySettings(settings);
		// enable AI if player2 is AI
		if (player2.id === 'AI') pongGame.enableAI(true);
		pongGame.initialize();
		pongGame.onGameComplete = (winner: number) => {
			// Re-enable settings when game ends
			this.activeGame = null;
			document.getElementById('settings-btn')?.removeAttribute('disabled');
			this.handleGameResult(winner);
		};
	}

	// Settings persistence and UI helpers
	private loadSettings(): GameSettings {
		try {
			const raw = localStorage.getItem('pong_settings');
			if (!raw) return DEFAULT_SETTINGS;
			const parsed = JSON.parse(raw) as Partial<GameSettings>;
			return { ...DEFAULT_SETTINGS, ...parsed };
		} catch (e) {
			console.warn('Failed to load settings, using defaults', e);
			return DEFAULT_SETTINGS;
		}
	}

	private saveSettings(settings: GameSettings): void {
		try {
			localStorage.setItem('pong_settings', JSON.stringify(settings));
			// Optionally notify user
		} catch (e) {
			console.warn('Failed to save settings', e);
		}
	}

	private renderSettingsUI(): void {
		const settings = this.loadSettings();
		const elPower = document.getElementById('opt-powerups') as HTMLInputElement | null;
		const elAtt = document.getElementById('opt-attacks') as HTMLInputElement | null;
		const elMap = document.getElementById('opt-map');
		const elBall = document.getElementById('opt-ball-speed') as HTMLInputElement | null;
		const elPaddle = document.getElementById('opt-paddle-size') as HTMLInputElement | null;
		const elSimple = document.getElementById('opt-simple') as HTMLInputElement | null;

		if (elPower) elPower.checked = settings.powerUps;
		if (elAtt) elAtt.checked = settings.attacks;
		if (elMap && elMap instanceof HTMLSelectElement) elMap.value = settings.map;
		if (elBall) elBall.value = String(settings.ballSpeed);
		if (elPaddle) elPaddle.value = String(settings.paddleSize);
		if (elSimple) elSimple.checked = settings.simpleMode;
	}

	private collectSettingsFromUI(): GameSettings {
		const get = (id: string) => document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
		const powerUps = (get('opt-powerups') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.powerUps;
		const attacks = (get('opt-attacks') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.attacks;
		const map = (get('opt-map') as HTMLSelectElement)?.value ?? DEFAULT_SETTINGS.map;
		const ballSpeed = Number((get('opt-ball-speed') as HTMLInputElement)?.value) || DEFAULT_SETTINGS.ballSpeed;
		const paddleSize = Number((get('opt-paddle-size') as HTMLInputElement)?.value) || DEFAULT_SETTINGS.paddleSize;
		const simpleMode = (get('opt-simple') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.simpleMode;
		return { powerUps, attacks, map, ballSpeed, paddleSize, simpleMode };
	}

	private openSettingsPanel(): void {
		document.getElementById('settings-panel')?.classList.add('active');
		document.getElementById('settings-panel')?.setAttribute('aria-hidden', 'false');
	}

	private closeSettingsPanel(): void {
		document.getElementById('settings-panel')?.classList.remove('active');
		document.getElementById('settings-panel')?.setAttribute('aria-hidden', 'true');
	}

	/** Reset settings to defaults and update UI */
	private resetSettings(): void {
		this.saveSettings(DEFAULT_SETTINGS);
		this.renderSettingsUI();
		this.showToast('Settings reset to defaults', 1400);
	}

	/** Ensure the settings button exists in the navigation and wire its handler */
	private ensureSettingsButtonExists(): void {
		const nav = document.getElementById('navigation-menu');
		if (!nav) return;
		let btn = document.getElementById('settings-btn') as HTMLButtonElement | null;
		if (!btn) {
			btn = document.createElement('button');
			btn.id = 'settings-btn';
			btn.className = 'secondary-btn';
			btn.title = 'Settings';
			btn.textContent = 'Settings';
			nav.appendChild(btn);
		}

		// Attach handler if not already attached (use data attr to avoid dupes)
		if (!(btn.dataset && btn.dataset.handler === '1')) {
			btn.addEventListener('click', () => {
				this.renderSettingsUI();
				this.openSettingsPanel();
			});
			btn.dataset.handler = '1';
		}
	}

	/** Show a small toast message */
	private showToast(message: string, duration: number = 1500): void {
		const toast = document.createElement('div');
		toast.className = 'app-toast';
		toast.textContent = message;
		document.body.appendChild(toast);
		setTimeout(() => {
			toast.classList.add('visible');
		}, 10);
		setTimeout(() => {
			toast.classList.remove('visible');
			setTimeout(() => toast.remove(), 350);
		}, duration);
	}

	/** Exit current match early and return to main menu */
	public exitCurrentMatch(): void {
		if (this.activeGame) {
			try {
				this.activeGame.stop();
			} catch (e) {
				console.warn('Error stopping active game', e);
			}
			this.activeGame = null;
		}
		// Re-enable settings and show menu
		document.getElementById('settings-btn')?.removeAttribute('disabled');
		this.showScreen('welcome-screen');
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
			// persist match result locally
			this.saveMatchResult({
				date: new Date().toISOString(),
				player1: this.currentMatch.player1.alias,
				player2: this.currentMatch.player2.alias,
				winner: winner.alias,
				score: (document.getElementById('game-score')?.textContent || '')
			});
			this.showScreen('welcome-screen');
		}
	}

	// Stats persistence
	private saveMatchResult(record: { date: string; player1: string; player2: string; winner: string; score: string }): void {
		try {
			const raw = localStorage.getItem('pong_match_history');
			const arr = raw ? JSON.parse(raw) as any[] : [];
			arr.unshift(record);
			// keep last 200
			if (arr.length > 200) arr.length = 200;
			localStorage.setItem('pong_match_history', JSON.stringify(arr));
		} catch (e) {
			console.warn('Failed to save match', e);
		}
	}

	private renderStatsScreen(): void {
		const container = document.getElementById('stats-container');
		if (!container) return;
		const raw = localStorage.getItem('pong_match_history');
		const arr = raw ? JSON.parse(raw) as any[] : [];
		container.innerHTML = '';
		if (!arr || arr.length === 0) {
			container.innerHTML = '<p>No matches recorded yet.</p>';
			return;
		}
		const table = document.createElement('table');
		table.className = 'stats-table';
		const thead = document.createElement('thead');
		thead.innerHTML = '<tr><th>Date</th><th>Player 1</th><th>Player 2</th><th>Winner</th><th>Score</th></tr>';
		table.appendChild(thead);
		const tbody = document.createElement('tbody');
		arr.forEach(r => {
			const tr = document.createElement('tr');
			tr.innerHTML = `<td>${new Date(r.date).toLocaleString()}</td><td>${r.player1}</td><td>${r.player2}</td><td>${r.winner}</td><td>${r.score}</td>`;
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		container.appendChild(table);
	}
}

class PongGameEngine {
	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	// base paddle speed used to scale AI difficulty
	private basePaddleSpeed: number = 8;

	private gameState = {
		ball: { x: 400, y: 200, dx: 5, dy: 3, size: 10 },
		paddle1: { x: 10, y: 150, width: 10, height: 100, speed: this.basePaddleSpeed },
		paddle2: { x: 0, y: 150, width: 10, height: 100, speed: this.basePaddleSpeed },
		score: { player1: 0, player2: 0 },
		gameRunning: false
	};
	
	public onGameComplete?: (winner: number) => void;
	private options: GameSettings = DEFAULT_SETTINGS;
	private keyHandlers: { keyDown: (e: KeyboardEvent) => void; keyUp: (e: KeyboardEvent) => void } | null = null;
	private paddleInterval: number | null = null;

	// Power-up system
	private powerUps: Array<{ x: number; y: number; type: string; ttl: number }> = [];
	private powerUpSpawnTimer: number | null = null;
	private activeEffects: Array<{ type: string; expiresAt: number; target: 'p1' | 'p2' }> = [];

	// Power-up timings (ms)
	private readonly POWERUP_TTL_MS = 8000; // how long a spawned power-up stays on field
	private readonly EFFECT_DURATION_MS = 6000; // how long effect lasts after pickup

	private readonly PICKUP_RADIUS = 18; // pickup detection radius

	// AI
	private aiEnabled: boolean = false;
	private aiInterval: number | null = null;
	private aiTargetY: number | null = null;

	/** Apply settings (called before initialize) */
	public applySettings(settings: GameSettings): void {
		this.options = settings;
		// Apply paddle size immediately
		this.gameState.paddle1.height = settings.paddleSize;
		this.gameState.paddle2.height = settings.paddleSize;
		// Apply base ball speed (direction set on resetBall)
		this.gameState.ball.dx = (Math.random() > 0.5 ? 1 : -1) * Math.abs(settings.ballSpeed);
		this.gameState.ball.dy = (Math.random() - 0.5) * (settings.ballSpeed + 1);
		// Power-ups/attacks are kept in options for future mechanics
	}

	/** Stop the running game immediately and cleanup resources */
	public stop(): void {
		this.gameState.gameRunning = false;
		this.cleanup();
		this.stopAI();
		this.stopPowerUpSpawner();
		this.powerUps = [];
		this.activeEffects = [];
		// Remove any active indicators when stopping the game
		this.removeEffectIndicator('p1');
		this.removeEffectIndicator('p2');
	}

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
		// Set canvas size based on options map
		if (this.options.map === 'compact') {
			this.canvas.width = 640; this.canvas.height = 320;
		} else if (this.options.map === 'extended') {
			this.canvas.width = 1000; this.canvas.height = 500;
		} else {
			this.canvas.width = 800; this.canvas.height = 400;
		}
		// Re-apply paddle heights based on canvas in case sizes changed
		this.gameState.paddle1.height = this.options.paddleSize;
		this.gameState.paddle2.height = this.options.paddleSize;

		// Position paddles relative to canvas size (fix map placement issues)
		this.gameState.paddle1.x = 10;
		this.gameState.paddle1.y = (this.canvas.height - this.gameState.paddle1.height) / 2;
		this.gameState.paddle2.x = this.canvas.width - 10 - this.gameState.paddle2.width;
		this.gameState.paddle2.y = (this.canvas.height - this.gameState.paddle2.height) / 2;
		// Clear any leftover state from previous games
		this.powerUps = [];
		this.activeEffects = [];
		this.removeEffectIndicator('p1');
		this.removeEffectIndicator('p2');
		this.stopPowerUpSpawner();

		// Start power-up spawning if enabled
		if (this.options.powerUps) this.startPowerUpSpawner();
		// Start AI if enabled
		if (this.aiEnabled) this.startAI();
		this.gameState.gameRunning = true;
		this.resetGame();
		this.gameLoop();
	}

	/** Enable or disable AI control for player2 */
	public enableAI(on: boolean): void {
		this.aiEnabled = on;
		if (on) {
			// slow down AI paddle to make it less perfect
			this.gameState.paddle2.speed = Math.max(2, Math.floor(this.basePaddleSpeed * 0.55));
			this.startAI();
		} else {
			this.gameState.paddle2.speed = this.basePaddleSpeed;
			this.stopAI();
		}
	}

	private startAI(): void {
		if (this.aiInterval) return;
		// Only update target once per second; movement happens smoothly in updatePaddles
		this.aiInterval = window.setInterval(() => {
			this.aiTargetY = this.gameState.ball.y;
		}, 1000);
	}

	private stopAI(): void {
		if (this.aiInterval) {
			clearInterval(this.aiInterval);
			this.aiInterval = null;
		}
	}

	private startPowerUpSpawner(): void {
		if (this.powerUpSpawnTimer) return;
		// spawn power-ups along the vertical axis of either player (left or right)
		this.powerUpSpawnTimer = window.setInterval(() => {
			const side = Math.random() < 0.5 ? 'left' : 'right';
			// compute paddle reference fresh
			const leftP = this.gameState.paddle1;
			const rightP = this.gameState.paddle2;
			let x = this.canvas.width / 2;
			if (side === 'left') {
				// a little to the right of left paddle center
				x = Math.min(this.canvas.width - 30, leftP.x + Math.floor(leftP.width / 2) + 12);
			} else {
				// a little to the left of right paddle center
				x = Math.max(30, rightP.x + Math.floor(rightP.width / 2) - 12);
			}
			// place power-up above or below the paddle vertically so it's reachable
			const paddle = side === 'left' ? leftP : rightP;
			const placeAbove = Math.random() < 0.5;
			let y = 0;
			if (placeAbove) {
				y = Math.max(20, paddle.y - (8 + Math.random() * 50));
			} else {
				y = Math.min(this.canvas.height - 20, paddle.y + paddle.height + (8 + Math.random() * 50));
			}
			const types = ['enlarge', 'shrink', 'slow', 'fast'];
			const type = types[Math.floor(Math.random() * types.length)];
			this.powerUps.push({ x, y, type, ttl: Date.now() + this.POWERUP_TTL_MS });
		}, 6000 + Math.random() * 6000);
	}

	private stopPowerUpSpawner(): void {
		if (this.powerUpSpawnTimer) { clearInterval(this.powerUpSpawnTimer); this.powerUpSpawnTimer = null; }
	}

	private applyPowerUpTo(target: 'p1' | 'p2', type: string): void {
		const now = Date.now();
		this.activeEffects.push({ type, expiresAt: now + this.EFFECT_DURATION_MS, target });
		// Immediate effect
		switch (type) {
			case 'enlarge':
				if (target === 'p1') this.gameState.paddle1.height = Math.min(this.canvas.height, this.gameState.paddle1.height * 1.5);
				else this.gameState.paddle2.height = Math.min(this.canvas.height, this.gameState.paddle2.height * 1.5);
				break;
			case 'shrink':
				if (target === 'p1') this.gameState.paddle1.height = Math.max(20, this.gameState.paddle1.height * 0.6);
				else this.gameState.paddle2.height = Math.max(20, this.gameState.paddle2.height * 0.6);
				break;
			case 'slow':
				this.gameState.ball.dx *= 0.7; this.gameState.ball.dy *= 0.7; break;
			case 'fast':
				this.gameState.ball.dx *= 1.3; this.gameState.ball.dy *= 1.3; break;
		}
		// Show indicator at the side under player name
		this.showEffectIndicator(target, type);
	}

	private revertExpiredEffects(): void {
		const now = Date.now();
		let changed = false;
		this.activeEffects = this.activeEffects.filter(e => {
			if (e.expiresAt <= now) {
				// revert
				switch (e.type) {
					case 'enlarge':
						if (e.target === 'p1') this.gameState.paddle1.height = this.options.paddleSize;
						else this.gameState.paddle2.height = this.options.paddleSize;
						break;
					case 'shrink':
						if (e.target === 'p1') this.gameState.paddle1.height = this.options.paddleSize;
						else this.gameState.paddle2.height = this.options.paddleSize;
						break;
					case 'slow':
					case 'fast':
						// On ball speed effects we reset by normalizing to default ball speed magnitude
						const signX = Math.sign(this.gameState.ball.dx) || 1;
						this.gameState.ball.dx = signX * Math.abs(this.options.ballSpeed);
						this.gameState.ball.dy = (Math.random() - 0.5) * (this.options.ballSpeed + 1);
						break;
				}
				changed = true;
				return false; // remove expired
			}
			return true;
		});
		// After filtering, update visual indicators: remove if no active effects remain for a target
		const p1Has = this.activeEffects.some(a => a.target === 'p1');
		const p2Has = this.activeEffects.some(a => a.target === 'p2');
		if (!p1Has) this.removeEffectIndicator('p1');
		if (!p2Has) this.removeEffectIndicator('p2');
		if (changed) {
			// nothing specific for now
		}
	}

	private drawPowerUps(): void {
		const now = Date.now();
		this.powerUps = this.powerUps.filter(p => p.ttl > now);
		this.powerUps.forEach(p => {
			this.ctx.beginPath();
			switch (p.type) {
				case 'enlarge': this.ctx.fillStyle = '#4caf50'; break;
				case 'shrink': this.ctx.fillStyle = '#ff7043'; break;
				case 'slow': this.ctx.fillStyle = '#29b6f6'; break;
				case 'fast': this.ctx.fillStyle = '#ffd54f'; break;
				default: this.ctx.fillStyle = '#ccc';
			}
			this.ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
			this.ctx.fill();
		});
	}

	/** Show a small text indicator under the player's name showing the active power-up */
	private showEffectIndicator(target: 'p1' | 'p2', type: string): void {
		// Place indicator inside the game area, under the player's name, without shifting layout
		const gameArea = document.getElementById('game-arena');
		const nameId = target === 'p1' ? 'player1-name' : 'player2-name';
		const id = target === 'p1' ? 'player1-powerup-indicator' : 'player2-powerup-indicator';
		let indicator = document.getElementById(id) as HTMLElement | null;
		const nameEl = document.getElementById(nameId);
		const container = document.getElementById('app-container') || document.body;
		if (!nameEl || !container) return;
		// create indicator if missing
		if (!indicator) {
			indicator = document.createElement('div');
			indicator.id = id;
			indicator.className = 'player-powerup side';
			indicator.setAttribute('aria-hidden', 'true');
			// position absolute inside container
			container.appendChild(indicator);
		}
		indicator.textContent = type.toUpperCase();
		indicator.classList.add('active');

		// Position the indicator under the player's name inside the game area
		// Compute offsets relative to container
		const containerRect = container.getBoundingClientRect();
		const nameRect = nameEl.getBoundingClientRect();
		const left = nameRect.left - containerRect.left;
		const top = nameRect.bottom - containerRect.top + 6; // a little below the name
		indicator.style.left = `${Math.max(8, left)}px`;
		indicator.style.top = `${top}px`;
		// ensure it is visible
		indicator.style.position = 'absolute';
		indicator.style.pointerEvents = 'none';
	}

	private removeEffectIndicator(target: 'p1' | 'p2'): void {
		const id = target === 'p1' ? 'player1-powerup-indicator' : 'player2-powerup-indicator';
		const el = document.getElementById(id) as HTMLElement | null;
		if (el) {
			el.classList.remove('active');
			setTimeout(() => el.remove(), 300);
		}
	}

	private checkPowerUpPickup(): void {
		// Use rectangle overlap with radius to detect pickup robustly
		const r = this.PICKUP_RADIUS; // pickup radius (configurable)
		this.powerUps = this.powerUps.filter(p => {
			const p1 = this.gameState.paddle1;
			const p2 = this.gameState.paddle2;
			const hitP1 = (p.x + r >= p1.x && p.x - r <= p1.x + p1.width && p.y + r >= p1.y && p.y - r <= p1.y + p1.height);
			const hitP2 = (p.x + r >= p2.x && p.x - r <= p2.x + p2.width && p.y + r >= p2.y && p.y - r <= p2.y + p2.height);
			if (hitP1) { this.applyPowerUpTo('p1', p.type); return false; }
			if (hitP2) { this.applyPowerUpTo('p2', p.type); return false; }
			return true;
		});
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

			// AI movement: smooth movement towards target, updated once per second
			if (this.aiEnabled && this.aiTargetY !== null) {
				const targetCenter = this.aiTargetY - this.gameState.paddle2.height / 2;
				if (this.gameState.paddle2.y + 1 < targetCenter) {
					this.gameState.paddle2.y = Math.min(this.canvas.height - this.gameState.paddle2.height, this.gameState.paddle2.y + this.gameState.paddle2.speed);
				} else if (this.gameState.paddle2.y - 1 > targetCenter) {
					this.gameState.paddle2.y = Math.max(0, this.gameState.paddle2.y - this.gameState.paddle2.speed);
				}
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
		// power-ups pickup and effect expiry
		if (this.options.powerUps) {
			this.checkPowerUpPickup();
			this.revertExpiredEffects();
		}
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
		const speed = Math.abs(this.options.ballSpeed) || 5;
		this.gameState.ball.dx = (Math.random() > 0.5 ? 1 : -1) * speed;
		this.gameState.ball.dy = (Math.random() - 0.5) * (speed + 1);
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

		// Draw power-ups
		if (this.options.powerUps) this.drawPowerUps();

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

function consumeGoogleLoginFromHash(): void {
	const hash = window.location.hash || '';
	if (!hash.includes('google_token=')) return;
	const params = new URLSearchParams(hash.replace(/^#/, ''));
	const token = params.get('google_token');
	const userEncoded = params.get('google_user');
	if (token && userEncoded) {
		try {
			const userJson = atob(userEncoded);
			const user = JSON.parse(userJson);
			AuthService.setSession(token, user);
			// Puliamo l'hash per evitare ricarichi indesiderati
			history.replaceState({}, document.title, '#welcome-screen');
		} catch (e) {
			console.error('Errore nel parsing dei dati Google', e);
		}
	}
}

// Initialize application
let app: PongTournamentApp;
document.addEventListener('DOMContentLoaded', () => {
	consumeGoogleLoginFromHash();
	app = new PongTournamentApp();
	(window as any).app = app; // Make it globally accessible for remove buttons
});