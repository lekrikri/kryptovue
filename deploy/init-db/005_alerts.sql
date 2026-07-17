-- Règles d'alerte utilisateur (évaluées par cmd/alerter, notifiées via Telegram).
CREATE TABLE IF NOT EXISTS alerts (
    id             BIGSERIAL PRIMARY KEY,
    target_type    TEXT             NOT NULL DEFAULT 'telegram', -- telegram | log
    target_addr    TEXT             NOT NULL,                    -- chat_id Telegram
    symbol         TEXT             NOT NULL,
    rule_type      TEXT             NOT NULL,   -- price_above|price_below|change_above|anomaly
    threshold      DOUBLE PRECISION NOT NULL DEFAULT 0,
    active         BOOLEAN          NOT NULL DEFAULT TRUE,
    last_triggered TIMESTAMPTZ,
    created_at     TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alerts_active_idx ON alerts (active) WHERE active;
