"""ai-worker : RSS FR → sentiment → TimescaleDB, en continu.

Boucle : pour chaque flux, parse les articles, rattache les cryptos, calcule le
sentiment (module pluggable) et upsert en base. Attend puis recommence.
"""

from __future__ import annotations

import hashlib
import html
import logging
import os
import re
import time
from datetime import datetime, timezone

import feedparser

from coins import match_coins
from feeds import FEEDS
from sentiment import analyze
from store import Store

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ai-worker")

POLL_SECONDS = int(os.getenv("POLL_SECONDS", "600"))
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgres://kryptovue:kryptovue@localhost:5434/kryptovue"
)

_TAG_RE = re.compile(r"<[^>]+>")


def clean(text: str) -> str:
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


def entry_time(entry) -> datetime:
    parsed = getattr(entry, "published_parsed", None) or getattr(
        entry, "updated_parsed", None
    )
    if parsed:
        return datetime(*parsed[:6], tzinfo=timezone.utc)
    return datetime.now(timezone.utc)


def process_feed(store: Store, source: str, url: str) -> tuple[int, int]:
    feed = feedparser.parse(url)
    seen = new = 0
    for entry in feed.entries:
        link = getattr(entry, "link", "")
        title = clean(getattr(entry, "title", ""))
        if not link or not title:
            continue
        summary = clean(getattr(entry, "summary", ""))[:600]
        text = f"{title}. {summary}"
        coins = match_coins(text)
        score, label = analyze(text)
        item = {
            "id": hashlib.sha1(link.encode()).hexdigest(),
            "source": source,
            "title": title[:500],
            "url": link,
            "summary": summary,
            "published_at": entry_time(entry),
            "coins": coins,
            "score": score,
            "label": label,
        }
        try:
            if store.upsert_news(item):
                new += 1
            seen += 1
        except Exception as exc:  # une news ne doit pas casser la boucle
            log.warning("upsert échoué (%s): %s", link, exc)
    return seen, new


def run_once(store: Store) -> None:
    for source, url in FEEDS:
        try:
            seen, new = process_feed(store, source, url)
            log.info("%s : %d articles (%d nouveaux)", source, seen, new)
        except Exception as exc:
            log.error("flux %s en erreur : %s", source, exc)


def main() -> None:
    log.info("ai-worker démarré — poll toutes les %ds", POLL_SECONDS)
    store = Store(DATABASE_URL)
    try:
        while True:
            run_once(store)
            time.sleep(POLL_SECONDS)
    except KeyboardInterrupt:
        log.info("arrêt demandé")
    finally:
        store.close()


if __name__ == "__main__":
    main()
