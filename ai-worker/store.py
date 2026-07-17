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

    def market_stats(self) -> list[tuple[str, float]]:
        """(symbole, variation % sur la dernière heure) depuis les bougies 1m."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT symbol,
                       (array_agg(close ORDER BY bucket_start))[1] AS first_c,
                       (array_agg(close ORDER BY bucket_start DESC))[1] AS last_c
                FROM candles_1m
                WHERE bucket_start > now() - interval '60 minutes'
                GROUP BY symbol
                """
            )
            out = []
            for symbol, first_c, last_c in cur.fetchall():
                if first_c:
                    out.append((symbol, (last_c - first_c) / first_c * 100))
            return out

    def top_news_today(self, limit: int = 8) -> list[tuple[str, str, str]]:
        """(titre, source, label) des news les plus marquées des dernières 24 h."""
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT title, source, sentiment_label
                FROM news
                WHERE published_at > now() - interval '24 hours'
                ORDER BY abs(sentiment_score) DESC, published_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            return cur.fetchall()

    def latest_brief_age_hours(self) -> float | None:
        with self.conn.cursor() as cur:
            cur.execute("SELECT extract(epoch FROM now() - max(created_at))/3600 FROM market_brief")
            row = cur.fetchone()
            return float(row[0]) if row and row[0] is not None else None

    def insert_brief(self, content: str, model: str) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO market_brief (content, model) VALUES (%s, %s)",
                (content, model),
            )
