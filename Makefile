.PHONY: infra-up infra-down run-ingester run-aggregator run-api test build vet ci

# --- Infra dev (Redpanda + Console + TimescaleDB) ---
infra-up:
	docker compose -f deploy/docker-compose.dev.yml up -d

infra-down:
	docker compose -f deploy/docker-compose.dev.yml down

infra-logs:
	docker compose -f deploy/docker-compose.dev.yml logs -f

# --- Services Go (dev, sur l'hôte) ---
run-ingester:
	go run ./cmd/ingester

run-aggregator:
	go run ./cmd/aggregator

run-api:
	go run ./cmd/api

# --- Qualité ---
vet:
	go vet ./...

test:
	go test ./... -count=1

build:
	go build ./...

ci: vet test build
