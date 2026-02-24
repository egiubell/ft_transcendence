// i18n.ts - Internationalization system

type LanguageCode = 'en' | 'it' | 'fr';

interface Translations {
	[key: string]: string;
}

const enTranslations: Translations = {
  "language": "English",
  "header.logout": "Logout",
  "header.settings": "Settings",
  "header.offline": "Offline",
  "header.loggedIn": "Logged in as",
  "header.connected": "Connected to multiplayer",
  "header.inQueue": "In queue...",
  "status.connecting": "Connecting...",
  "status.disconnected": "Disconnected — attempting to reconnect...",
  "status.leftMatch": "Left match",
  "status.matchVs": "Match vs {name}",
  "status.opponentDisconnected": "Opponent disconnected (P{n}). Waiting up to 60s...",
  "status.opponentReturned": "Opponent reconnected (P{n}).",
  "auth.login.title": "Login",
  "auth.login.email": "Email",
  "auth.login.password": "Password",
  "auth.login.button": "Login",
  "auth.login.noAccount": "Don't have an account?",
  "auth.login.signup": "Sign up",
  "auth.google": "Continue with Google",
  "auth.signup.title": "Sign Up",
  "auth.signup.createAccount": "Create Account",
  "auth.signup.email": "Email",
  "auth.signup.username": "Username",
  "auth.signup.password": "Password",
  "auth.signup.confirm": "Confirm Password",
  "auth.signup.button": "Sign Up",
  "auth.signup.hasAccount": "Already have an account?",
  "auth.signup.login": "Login",
  "welcome.title": "Welcome to Pong Tournament!",
  "welcome.tournament": "Start New Tournament",
  "welcome.quickGame": "Multiplayer Quick Game",
  "welcome.singlePlayer": "Single Player",
  "welcome.stats": "Stats",
  "tournament.title": "Tournament Setup",
  "tournament.alias": "Enter your alias",
  "tournament.addPlayer": "Add Player",
  "tournament.begin": "Begin Tournament",
  "tournament.bracket": "Tournament bracket",
  "tournament.nextMatch": "Start Next Match",
  "game.waiting": "Waiting for opponent...",
  "game.reconnecting": "Reconnecting...",
  "game.disconnected": "Opponent disconnected",
  "game.paused": "Game Paused",
  "game.resume": "Resume",
  "game.quit": "Exit Match",
  "game.score": "Score",
  "game.win": "You Win!",
  "game.lose": "You Lose",
  "game.draw": "Draw",
  "game.controls": "W/S keys to move up and down",
  "game.chat": "Match Chat",
  "game.message": "Send a message",
  "game.send": "Send",
  "stats.title": "Match Statistics (Local)",
  "stats.noData": "No data yet.",
  "stats.noMatches": "No matches recorded yet.",
  "stats.clear": "Clear Local Stats",
  "settings.title": "Game Settings",
  "settings.powerups": "Enable Power-ups",
  "settings.attacks": "Enable Attacks",
  "settings.map": "Map",
  "settings.mapClassic": "Classic",
  "settings.mapCompact": "Compact",
  "settings.mapExtended": "Extended",
  "settings.ballSpeed": "Ball speed",
  "settings.paddleSize": "Paddle size",
  "settings.simpleMode": "Default (Simple) Mode",
  "settings.save": "Save",
  "settings.reset": "Reset",
  "settings.close": "Close",
  "menu.play": "Play",
  "menu.back": "Back",
  "menu.settings": "Settings",
  "menu.logout": "Logout"
};

const itTranslations: Translations = {
  "language": "Italiano",
  "header.logout": "Esci",
  "header.settings": "Impostazioni",
  "header.offline": "Offline",
  "header.loggedIn": "Connesso come",
  "header.connected": "Connesso al multiplayer",
  "header.inQueue": "In coda...",
  "status.connecting": "Connessione...",
  "status.disconnected": "Disconnesso — tentativo di riconnessione...",
  "status.leftMatch": "Partita abbandonata",
  "status.matchVs": "Partita contro {name}",
  "status.opponentDisconnected": "Avversario disconnesso (P{n}). Attesa fino a 60s...",
  "status.opponentReturned": "Avversario riconnesso (P{n}).",
  "auth.login.title": "Accesso",
  "auth.login.email": "Email",
  "auth.login.password": "Password",
  "auth.login.button": "Accedi",
  "auth.login.noAccount": "Non hai un account?",
  "auth.login.signup": "Iscriviti",
  "auth.google": "Continua con Google",
  "auth.signup.title": "Registrazione",
  "auth.signup.createAccount": "Crea Account",
  "auth.signup.email": "Email",
  "auth.signup.username": "Nome utente",
  "auth.signup.password": "Password",
  "auth.signup.confirm": "Conferma Password",
  "auth.signup.button": "Iscriviti",
  "auth.signup.hasAccount": "Hai già un account?",
  "auth.signup.login": "Accedi",
  "welcome.title": "Benvenuto al Torneo di Pong!",
  "welcome.tournament": "Inizia Nuovo Torneo",
  "welcome.quickGame": "Partita Rapida Multiplayer",
  "welcome.singlePlayer": "Giocatore Singolo",
  "welcome.stats": "Statistiche",
  "tournament.title": "Configurazione Torneo",
  "tournament.alias": "Inserisci il tuo nickname",
  "tournament.addPlayer": "Aggiungi Giocatore",
  "tournament.begin": "Inizia Torneo",
  "tournament.bracket": "Bracket Torneo",
  "tournament.nextMatch": "Inizia Prossima Partita",
  "game.waiting": "In attesa dell'avversario...",
  "game.reconnecting": "Riconnessione...",
  "game.disconnected": "L'avversario si è disconnesso",
  "game.paused": "Gioco in pausa",
  "game.resume": "Riprendi",
  "game.quit": "Esci Dalla Partita",
  "game.score": "Punteggio",
  "game.win": "Hai vinto!",
  "game.lose": "Hai perso",
  "game.draw": "Pareggio",
  "game.controls": "Tasti W/S per muoverti su e giù",
  "game.chat": "Chat Partita",
  "game.message": "Invia un messaggio",
  "game.send": "Invia",
  "stats.title": "Statistiche Partite (Locale)",
  "stats.noData": "Nessun dato ancora.",
  "stats.noMatches": "Nessuna partita registrata ancora.",
  "stats.clear": "Cancella Statistiche Locali",
  "settings.title": "Impostazioni Gioco",
  "settings.powerups": "Abilita Power-up",
  "settings.attacks": "Abilita Attacchi",
  "settings.map": "Mappa",
  "settings.mapClassic": "Classica",
  "settings.mapCompact": "Compatta",
  "settings.mapExtended": "Estesa",
  "settings.ballSpeed": "Velocità Palla",
  "settings.paddleSize": "Dimensione Racchetta",
  "settings.simpleMode": "Modalità Semplice",
  "settings.save": "Salva",
  "settings.reset": "Ripristina",
  "settings.close": "Chiudi",
  "menu.play": "Gioca",
  "menu.back": "Indietro",
  "menu.settings": "Impostazioni",
  "menu.logout": "Esci"
};

const frTranslations: Translations = {
  "language": "Français",
  "header.logout": "Déconnexion",
  "header.settings": "Paramètres",
  "header.offline": "Hors ligne",
  "header.loggedIn": "Connecté en tant que",
  "header.connected": "Connecté au multijoueur",
  "header.inQueue": "En attente...",
  "status.connecting": "Connexion...",
  "status.disconnected": "Déconnecté — tentative de reconnexion...",
  "status.leftMatch": "Match quitté",
  "status.matchVs": "Match contre {name}",
  "status.opponentDisconnected": "Adversaire déconnecté (P{n}). Attente jusqu'à 60s...",
  "status.opponentReturned": "Adversaire reconnecté (P{n}).",
  "auth.login.title": "Connexion",
  "auth.login.email": "Email",
  "auth.login.password": "Mot de passe",
  "auth.login.button": "Se connecter",
  "auth.login.noAccount": "Vous n'avez pas de compte?",
  "auth.login.signup": "S'inscrire",
  "auth.google": "Continuer avec Google",
  "auth.signup.title": "Inscription",
  "auth.signup.createAccount": "Créer un compte",
  "auth.signup.email": "Email",
  "auth.signup.username": "Nom d'utilisateur",
  "auth.signup.password": "Mot de passe",
  "auth.signup.confirm": "Confirmer le mot de passe",
  "auth.signup.button": "S'inscrire",
  "auth.signup.hasAccount": "Vous avez déjà un compte?",
  "auth.signup.login": "Se connecter",
  "welcome.title": "Bienvenue au Tournoi Pong!",
  "welcome.tournament": "Démarrer un nouveau tournoi",
  "welcome.quickGame": "Jeu rapide multijoueur",
  "welcome.singlePlayer": "Joueur unique",
  "welcome.stats": "Statistiques",
  "tournament.title": "Configuration du tournoi",
  "tournament.alias": "Entrez votre pseudo",
  "tournament.addPlayer": "Ajouter un joueur",
  "tournament.begin": "Commencer le tournoi",
  "tournament.bracket": "Bracket du tournoi",
  "tournament.nextMatch": "Commencer le prochain match",
  "game.waiting": "En attente d'un adversaire...",
  "game.reconnecting": "Reconnexion...",
  "game.disconnected": "L'adversaire s'est déconnecté",
  "game.paused": "Jeu en pause",
  "game.resume": "Reprendre",
  "game.quit": "Quitter la partie",
  "game.score": "Score",
  "game.win": "Vous avez gagné!",
  "game.lose": "Vous avez perdu",
  "game.draw": "Égalité",
  "game.controls": "Touches W/S pour vous déplacer haut et bas",
  "game.chat": "Chat de la partie",
  "game.message": "Envoyer un message",
  "game.send": "Envoyer",
  "stats.title": "Statistiques des matches (Local)",
  "stats.noData": "Aucune donnée pour le moment.",
  "stats.noMatches": "Aucun match enregistré pour le moment.",
  "stats.clear": "Effacer les statistiques locales",
  "settings.title": "Paramètres du jeu",
  "settings.powerups": "Activer les Power-ups",
  "settings.attacks": "Activer les attaques",
  "settings.map": "Carte",
  "settings.mapClassic": "Classique",
  "settings.mapCompact": "Compacte",
  "settings.mapExtended": "Étendue",
  "settings.ballSpeed": "Vitesse de la balle",
  "settings.paddleSize": "Taille de la raquette",
  "settings.simpleMode": "Mode simple",
  "settings.save": "Enregistrer",
  "settings.reset": "Réinitialiser",
  "settings.close": "Fermer",
  "menu.play": "Jouer",
  "menu.back": "Retour",
  "menu.settings": "Paramètres",
  "menu.logout": "Déconnexion"
};

class I18n {
	private currentLanguage: LanguageCode;
	private translations: { [key in LanguageCode]: Translations } = {
		en: enTranslations,
		it: itTranslations,
		fr: frTranslations
	};

	constructor() {
		// Load language from localStorage or default to 'en'
		const saved = localStorage.getItem('app_language') as LanguageCode;
		this.currentLanguage = (saved && this.isValidLanguage(saved)) ? saved : 'en';
	}

	private isValidLanguage(lang: string): lang is LanguageCode {
		return ['en', 'it', 'fr'].includes(lang);
	}

	/**
	 * Get translated string by key
	 */
	public t(key: string): string {
		const translation = this.translations[this.currentLanguage][key];
		return translation || key; // Fallback to key if translation missing
	}

	/**
	 * Change language and reload page
	 */
	public setLanguage(lang: LanguageCode) {
		if (!this.isValidLanguage(lang)) return;
		
		this.currentLanguage = lang;
		localStorage.setItem('app_language', lang);
		
		// Reload page to apply new language
		window.location.reload();
	}

	/**
	 * Get current language
	 */
	public getLanguage(): LanguageCode {
		return this.currentLanguage;
	}

	/**
	 * Get list of available languages
	 */
	public getAvailableLanguages(): Array<{ code: LanguageCode; name: string }> {
		return [
			{ code: 'en', name: 'English' },
			{ code: 'it', name: 'Italiano' },
			{ code: 'fr', name: 'Français' }
		];
	}
}

// Export singleton instance
export const i18n = new I18n();
