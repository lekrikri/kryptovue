"""Couche de persistance (psycopg 3) pour les actualités."""

from __future__ import annotations

import psycopg


class Store:
    def __init__(self, dsn: str):
        self.conn = psycopg.connect(dsn, autocommit=True)

    def close(self) -> None:
        self.conn.close()

    def upsert_news(self, item: dict) -> bool:
        """Insère une news (idempotent sur l'id). Retourne True si nouvelle."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO news (id, source, title, url, summary, published_at,
                                  coins, sentiment_score, sentiment_label)
                VALUES (%(id)s, %(source)s, %(title)s, %(url)s, %(summary)s,
                        %(published_at)s, %(coins)s, %(score)s, %(label)s)
                ON CONFLICT (id) DO UPDATE SET
                    coins = EXCLUDED.coins,
                    sentiment_score = EXCLUDED.sentiment_score,
                    sentiment_label = EXCLUDED.sentiment_label
                RETURNING (xmax = 0) AS inserted
                """,
                item,
            )
            row = cur.fetchone()
            return bool(row[0]) if row else False
