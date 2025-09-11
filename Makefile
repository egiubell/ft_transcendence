.PHONY: build up down logs

build:
	docker-compose -p transcendence -f docker-compose.yml build

up:
	docker-compose -p transcendence -f docker-compose.yml up -d

down:
	docker-compose -p transcendence -f docker-compose.yml down

logs:
	docker logs -f transcendence-frontend
