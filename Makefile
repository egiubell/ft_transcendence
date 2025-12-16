.PHONY: help build up down restart logs clean fclean re dev prod status shell volumes network

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[0;37m
NC = \033[0m # No Color

# Project configuration
PROJECT_NAME = transcendence
COMPOSE_FILE = docker-compose.yml
DOCKERFILE = Dockerfile

# Default target
help: ## Show this help message
	@echo "$(CYAN)ft_transcendence - Pong Tournament Application$(NC)"
	@echo "$(YELLOW)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

start: ## Quick start with checks
	@echo "$(BLUE)🎮 Starting ft_transcendence Pong Tournament...$(NC)"
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)❌ Docker is not running. Please start Docker first.$(NC)"; \
		exit 1; \
	fi
	@make build
	@make up
	@echo "$(GREEN)✅ Application started successfully!$(NC)"
	@echo "$(CYAN)🌐 Frontend: http://localhost:8080$(NC)"
	@echo "$(CYAN)🔧 Backend API: http://localhost:3000/api$(NC)"
	@echo "$(CYAN)📊 Database: PostgreSQL on port 5432$(NC)"

# Build targets
build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)Build completed!$(NC)"

up: ## Start the application
	@echo "$(BLUE)Starting ft_transcendence application...$(NC)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Application started!$(NC)"
	@echo "$(CYAN)Waiting for backend to be ready...$(NC)"
	@sleep 3
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec -T backend npm run migrate 2>/dev/null || true
	@echo "$(CYAN)🌐 Frontend: http://localhost:8080$(NC)"
	@echo "$(CYAN)🔧 Backend API: http://localhost:3000/api$(NC)"

down: ## Stop the application
	@echo "$(BLUE)Stopping ft_transcendence application...$(NC)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Application stopped!$(NC)"

backend-logs: ## Show backend logs
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f backend

db-logs: ## Show database logs
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f db

db-shell: ## Open PostgreSQL shell
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) exec db psql -U ponguser -d transcendence

dev: ## Start in development mode with logs
	@echo "$(BLUE)Starting in development mode...$(NC)"
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up --build

dev-up: ## Start development stack (dev compose) with cleanup
	@echo "$(BLUE)Starting development stack (dev compose)...$(NC)"
	@docker compose -p $(PROJECT_NAME)_dev -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
	@docker compose -p $(PROJECT_NAME)_dev -f docker-compose.dev.yml up --build

dev-down: ## Stop development stack (dev compose)
	@echo "$(BLUE)Stopping development stack...$(NC)"
	@docker compose -p $(PROJECT_NAME)_dev -f docker-compose.dev.yml down

dev-logs: ## Follow development stack logs
	@echo "$(BLUE)Following development logs...$(NC)"
	@docker compose -p $(PROJECT_NAME)_dev -f docker-compose.dev.yml logs -f

logs: ## Show application logs
	@echo "$(BLUE)Showing logs (Ctrl+C to exit)...$(NC)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

clean: ## Remove containers and images
	@echo "$(YELLOW)Cleaning containers...$(NC)"
	docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down --remove-orphans
	docker images | grep $(PROJECT_NAME) | awk '{print $$3}' | xargs -r docker rmi -f
	@echo "$(GREEN)Clean completed!$(NC)"

re: clean build up ## Rebuild everything from scratch

.DEFAULT_GOAL := help