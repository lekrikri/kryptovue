-- Résumé quotidien du marché généré par le LLM (ai-worker).
CREATE TABLE IF NOT EXISTS market_brief (
    id         BIGSERIAL PRIMARY KEY,
    content    TEXT        NOT NULL,
    model      TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS market_brief_created_idx ON market_brief (created_at DESC);
