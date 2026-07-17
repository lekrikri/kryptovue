.PHONY: infra-up infra-down infra-logs run-ingester run-aggregator run-api \
        test build vet staticcheck ci docker-build prod-up prod-down

SERVICES := ingester aggregator api

# --- Infra dev (Redpanda + Console + TimescaleDB) ---
infra-up:
	docker compose -f deploy/docker-compose.dev.yml up -d

infra-down:
	docker compose -f deploy/docker-compose.dev.yml down

infra-logs:
	docker compose -f deploy/docker-compose.dev.yml logs -f

# --- Services Go (dev, sur l'hôte) ---
# En dev les 3 services tournent sur le même host → ports metrics distincts.
run-ingester:
	METRICS_ADDR=:9101 go run ./cmd/ingester

run-aggregator:
	METRICS_ADDR=:9102 go run ./cmd/aggregator

run-api:
	METRICS_ADDR=:9103 go run ./cmd/api

run-metadata:
	go run ./cmd/metadata

run-alerter:
	go run ./cmd/alerter

# Charge l'historique 1m depuis Binance (job one-shot). BACKFILL_DAYS=7 par défaut.
run-backfill:
	go run ./cmd/backfill

# --- Qualité ---
vet:
	go vet ./...

staticcheck:
	go run honnef.co/go/tools/cmd/staticcheck@2025.1 ./...

test:
	go test ./... -count=1 -race

build:
	go build ./...

ci: vet test build

# --- Stack complète en local (tout dockerisé, redémarrage auto) ---
dev-full-up:
	docker compose -f deploy/docker-compose.dev-full.yml up -d --build

dev-full-down:
	docker compose -f deploy/docker-compose.dev-full.yml down

dev-full-logs:
	docker compose -f deploy/docker-compose.dev-full.yml logs -f

# --- Docker / prod ---
docker-build:
	@for svc in $(SERVICES); do \
		echo "== build $$svc =="; \
		docker build --build-arg SERVICE=$$svc -t kryptovue-$$svc:local . ; \
	done

prod-up:
	docker compose -f deploy/docker-compose.prod.yml up -d

prod-down:
	docker compose -f deploy/docker-compose.prod.yml down
