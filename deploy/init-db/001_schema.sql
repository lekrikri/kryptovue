CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Bougies 1 minute (source de vérité, alimentée par cmd/aggregator)
CREATE TABLE IF NOT EXISTS candles_1m (
    symbol       TEXT             NOT NULL,
    bucket_start TIMESTAMPTZ      NOT NULL,
    open         DOUBLE PRECISION NOT NULL,
    high         DOUBLE PRECISION NOT NULL,
    low          DOUBLE PRECISION NOT NULL,
    close        DOUBLE PRECISION NOT NULL,
    volume       DOUBLE PRECISION NOT NULL DEFAULT 0,
    trade_count  INTEGER          NOT NULL DEFAULT 0,
    PRIMARY KEY (symbol, bucket_start)
);

SELECT create_hypertable('candles_1m', 'bucket_start', if_not_exists => TRUE);

-- Dernier prix connu par symbole (lecture rapide pour /api/v1/prices)
CREATE TABLE IF NOT EXISTS latest_prices (
    symbol     TEXT PRIMARY KEY,
    price      DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMPTZ      NOT NULL
);

-- Agrégats continus : 1 heure
CREATE MATERIALIZED VIEW IF NOT EXISTS candles_1h
WITH (timescaledb.continuous) AS
SELECT symbol,
       time_bucket('1 hour', bucket_start) AS bucket_start,
       first(open, bucket_start)  AS open,
       max(high)                  AS high,
       min(low)                   AS low,
       last(close, bucket_start)  AS close,
       sum(volume)                AS volume,
       sum(trade_count)::int      AS trade_count
FROM candles_1m
GROUP BY symbol, time_bucket('1 hour', bucket_start)
WITH NO DATA;

-- Agrégats continus : 1 jour
CREATE MATERIALIZED VIEW IF NOT EXISTS candles_1d
WITH (timescaledb.continuous) AS
SELECT symbol,
       time_bucket('1 day', bucket_start) AS bucket_start,
       first(open, bucket_start)  AS open,
       max(high)                  AS high,
       min(low)                   AS low,
       last(close, bucket_start)  AS close,
       sum(volume)                AS volume,
       sum(trade_count)::int      AS trade_count
FROM candles_1m
GROUP BY symbol, time_bucket('1 day', bucket_start)
WITH NO DATA;

-- Rafraîchissement automatique des agrégats
SELECT add_continuous_aggregate_policy('candles_1h',
    start_offset => INTERVAL '3 hours',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '5 minutes',
    if_not_exists => TRUE);

SELECT add_continuous_aggregate_policy('candles_1d',
    start_offset => INTERVAL '3 days',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Compression + rétention des candles 1m (constitution : 1m = 90 jours)
ALTER TABLE candles_1m SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'symbol'
);
SELECT add_compression_policy('candles_1m', INTERVAL '7 days', if_not_exists => TRUE);
SELECT add_retention_policy('candles_1m', INTERVAL '90 days', if_not_exists => TRUE);
