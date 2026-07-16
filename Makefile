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
run-ingester:
	go run ./cmd/ingester

run-aggregator:
	go run ./cmd/aggregator

run-api:
	go run ./cmd/api

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
