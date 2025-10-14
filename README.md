# ft_transcendence - Pong Tournament

A modern web-based Pong tournament application built with TypeScript and Docker.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd ft_transcendence

# Setup environment
make setup

# Build and run
make up

# Or use the startup script
chmod +x start.sh
./start.sh
```

## 🎮 Features

- Real-time Pong game
- Tournament system with multiple players
- Player alias registration
- Score tracking
- Single Page Application (SPA)

## 🔧 Development

```bash
# Development mode with logs
make dev

# View logs
make logs

# Clean rebuild
make re
```

## 📁 Project Structure

```
ft_transcendence/
├── src/              # TypeScript source code
│   ├── index.html    # Main HTML file
│   ├── main.ts       # Application entry point
│   └── styles/       # CSS styles
├── Dockerfile        # Container definition
├── docker-compose.yml # Service orchestration
└── Makefile         # Build automation
```

## 🎯 Controls

- **Player 1**: W/S keys
- **Player 2**: Arrow Up/Down keys

## 🏆 Tournament Mode

1. Click "Start New Tournament"
2. Add players with their aliases
3. Begin tournament when ready
4. Play matches in order
5. Winners advance automatically

Access the application at: http://localhost:8080