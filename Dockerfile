# Multi-stage build partagé par les 3 services Go.
# Sélection du binaire via --build-arg SERVICE=ingester|aggregator|api
FROM golang:1.25-alpine AS build

WORKDIR /src

# Cache des dépendances (couche invalidée seulement si go.mod/go.sum changent)
COPY go.mod go.sum ./
RUN go mod download

COPY . .

ARG SERVICE
RUN test -n "$SERVICE" || (echo "build-arg SERVICE requis" && exit 1)
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" \
    -o /out/app ./cmd/${SERVICE}

# Image finale minimale (~2 Mo + binaire), non-root, avec certifs CA pour le WS TLS Binance.
FROM gcr.io/distroless/static-debian12:nonroot AS runtime

COPY --from=build /out/app /app

USER nonroot:nonroot
ENTRYPOINT ["/app"]
