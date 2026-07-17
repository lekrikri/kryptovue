"""Client LLM local (Qwen via ollama, API compatible OpenAI).

Fournit l'analyseur de sentiment LLM et la génération du résumé de marché.
Aucune dépendance externe : urllib de la lib standard.
"""

from __future__ import annotations

import json
import os
import re
import urllib.request

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "qwen2.5:3b")
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "60"))


def chat(messages: list[dict], temperature: float = 0.0, max_tokens: int = 256) -> str:
    """Appelle /chat/completions et retourne le contenu texte de la réponse."""
    payload = json.dumps(
        {
            "model": LLM_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    ).encode()
    req = urllib.request.Request(
        f"{LLM_BASE_URL}/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=LLM_TIMEOUT) as resp:
        body = json.loads(resp.read())
    return body["choices"][0]["message"]["content"].strip()


_SENTIMENT_SYS = (
    "Tu es un analyste financier crypto. On te donne un titre d'actualité en "
    "français. Réponds UNIQUEMENT par un objet JSON compact "
    '{"score": <nombre entre -1 et 1>, "label": "positive"|"neutral"|"negative"} '
    "où le score reflète le sentiment de marché (positif = haussier)."
)


def parse_sentiment(raw: str) -> tuple[float, str]:
    """Parsing tolérant de la sortie du LLM (JSON parfois imparfait)."""
    score = 0.0
    m = re.search(r'score"?\s*:\s*(-?\d*\.?\d+)', raw)
    if m:
        score = max(-1.0, min(1.0, float(m.group(1))))
    label_m = re.search(r"(positive|neutral|negative)", raw, re.IGNORECASE)
    if label_m:
        label = label_m.group(1).lower()
    else:
        label = "positive" if score >= 0.15 else "negative" if score <= -0.15 else "neutral"
    return round(score, 3), label


def analyze_llm(text: str) -> tuple[float, str]:
    """Analyse de sentiment via le LLM. Lève en cas d'échec réseau."""
    raw = chat(
        [
            {"role": "system", "content": _SENTIMENT_SYS},
            {"role": "user", "content": text[:500]},
        ],
        temperature=0.0,
        max_tokens=40,
    )
    return parse_sentiment(raw)


def generate_brief(market_lines: list[str], news_lines: list[str]) -> str:
    """Génère un résumé de marché francophone concis à partir des données du jour."""
    context = (
        "DONNÉES DE MARCHÉ (dernière heure) :\n"
        + "\n".join(market_lines)
        + "\n\nACTUALITÉS MARQUANTES :\n"
        + "\n".join(news_lines)
    )
    system = (
        "Tu es l'analyste de KryptoVue. Rédige un briefing de marché crypto en "
        "français, factuel et concis (4 à 5 phrases). Utilise UNIQUEMENT les "
        "données fournies : n'invente aucun actif ni chiffre absent du contexte, "
        "et les variations sont sur 1 heure. Mentionne les mouvements notables et "
        "le ton des actualités. STRICTEMENT informationnel : aucun conseil "
        "d'achat/vente, pas de 'opportunité'. Pas de titre, juste le texte."
    )
    return chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": context},
        ],
        temperature=0.3,
        max_tokens=320,
    )
