"""Analyse de sentiment FR — v1 par lexique, interface pluggable.

L'interface publique est `analyze(text) -> (score, label)`. Le worker n'appelle
que cette fonction : remplacer le lexique par un LLM local (Qwen) ou un modèle
type DistilCamemBERT ne demande que de réécrire `analyze`, rien d'autre.
"""

from __future__ import annotations

import re
import unicodedata

# Lexique pondéré (termes normalisés, sans accents). Poids dans [-2, 2].
POSITIVE = {
    "hausse": 1.5, "bond": 1.5, "explose": 2.0, "envole": 2.0, "record": 1.5,
    "rebond": 1.2, "rallye": 1.5, "adoption": 1.2, "gain": 1.2, "progresse": 1.0,
    "optimiste": 1.2, "haussier": 1.5, "bullish": 1.5, "sommet": 1.3, "surperforme": 1.5,
    "partenariat": 1.0, "approbation": 1.3, "validation": 1.0, "croissance": 1.2,
    "opportunite": 0.8, "soutien": 0.8, "confiance": 1.0, "positif": 1.0, "flambee": 1.5,
}

NEGATIVE = {
    "baisse": -1.5, "chute": -1.8, "krach": -2.0, "effondrement": -2.0, "plonge": -1.8,
    "recul": -1.2, "correction": -1.0, "vente": -0.8, "liquidation": -1.5, "piratage": -2.0,
    "hack": -2.0, "arnaque": -2.0, "scam": -2.0, "faillite": -2.0, "interdiction": -1.8,
    "regulation": -0.8, "sanction": -1.5, "baissier": -1.5, "bearish": -1.5, "perte": -1.3,
    "risque": -0.8, "crainte": -1.2, "panique": -1.8, "inquietude": -1.2, "negatif": -1.0,
    "fraude": -2.0, "enquete": -1.0, "proces": -1.2, "chute libre": -2.0, "seffondre": -2.0,
}

NEGATIONS = {"pas", "plus", "aucun", "aucune", "sans", "ni", "non"}


def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z]+", _normalize(text))


def analyze(text: str) -> tuple[float, str]:
    """Retourne (score dans [-1, 1], label parmi positive|neutral|negative)."""
    tokens = _tokenize(text)
    if not tokens:
        return 0.0, "neutral"

    raw = 0.0
    hits = 0
    for i, tok in enumerate(tokens):
        weight = POSITIVE.get(tok, 0.0) + NEGATIVE.get(tok, 0.0)
        if weight == 0.0:
            continue
        # Négation dans les 2 mots précédents → inverse le poids.
        window = tokens[max(0, i - 2):i]
        if any(w in NEGATIONS for w in window):
            weight = -weight
        raw += weight
        hits += 1

    if hits == 0:
        return 0.0, "neutral"

    # Normalisation douce vers [-1, 1].
    score = max(-1.0, min(1.0, raw / (hits + 2)))
    if score >= 0.15:
        label = "positive"
    elif score <= -0.15:
        label = "negative"
    else:
        label = "neutral"
    return round(score, 3), label
