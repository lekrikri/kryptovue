"""Sélecteur de backend de sentiment : lexique (défaut) ou LLM local (Qwen).

Backend choisi via SENTIMENT_BACKEND=lexicon|llm. En mode llm, repli automatique
sur le lexique si le LLM est injoignable — le worker ne s'arrête jamais.
"""

from __future__ import annotations

import logging
import os

import sentiment as lexicon

log = logging.getLogger("ai-worker.analyzer")

BACKEND = os.getenv("SENTIMENT_BACKEND", "lexicon").lower()


def analyze(text: str) -> tuple[float, str]:
    if BACKEND == "llm":
        try:
            import llm

            return llm.analyze_llm(text)
        except Exception as exc:
            log.warning("LLM indisponible, repli lexique : %s", exc)
    return lexicon.analyze(text)
