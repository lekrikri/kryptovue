-- Actualités crypto FR + sentiment (alimenté par ai-worker).
CREATE TABLE IF NOT EXISTS news (
    id              TEXT PRIMARY KEY,            -- hash de l'URL (idempotent)
    source          TEXT             NOT NULL,
    title           TEXT             NOT NULL,
    url             TEXT             NOT NULL,
    summary         TEXT,
    published_at    TIMESTAMPTZ      NOT NULL,
    coins           TEXT[]           NOT NULL DEFAULT '{}',
    sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    sentiment_label TEXT             NOT NULL DEFAULT 'neutral',
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_published_idx ON news (published_at DESC);
CREATE INDEX IF NOT EXISTS news_coins_idx ON news USING GIN (coins);
