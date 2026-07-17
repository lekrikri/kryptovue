-- Métadonnées de marché (CoinGecko) : market cap, variation 24h par actif.
CREATE TABLE IF NOT EXISTS coin_meta (
    symbol       TEXT PRIMARY KEY,
    market_cap   DOUBLE PRECISION NOT NULL DEFAULT 0,
    volume_24h   DOUBLE PRECISION NOT NULL DEFAULT 0,
    change_24h   DOUBLE PRECISION NOT NULL DEFAULT 0,
    price_usd    DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT now()
);

-- Métadonnées globales (une seule ligne, id=1).
CREATE TABLE IF NOT EXISTS global_meta (
    id                INT PRIMARY KEY DEFAULT 1,
    total_market_cap  DOUBLE PRECISION NOT NULL DEFAULT 0,
    btc_dominance     DOUBLE PRECISION NOT NULL DEFAULT 0,
    market_cap_change DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at        TIMESTAMPTZ      NOT NULL DEFAULT now(),
    CONSTRAINT global_meta_singleton CHECK (id = 1)
);
