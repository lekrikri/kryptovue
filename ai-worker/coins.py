"""Rattachement d'un texte aux cryptos suivies (nom, ticker, alias)."""

from __future__ import annotations

import re

# symbole Binance → alias reconnus dans le texte (minuscule).
COIN_ALIASES: dict[str, list[str]] = {
    "btcusdt": ["bitcoin", "btc"],
    "ethusdt": ["ethereum", "eth", "ether"],
    "solusdt": ["solana", "sol"],
    "xrpusdt": ["xrp", "ripple"],
    "adausdt": ["cardano", "ada"],
    "dogeusdt": ["dogecoin", "doge"],
    "dotusdt": ["polkadot", "dot"],
    "linkusdt": ["chainlink", "link"],
    "avaxusdt": ["avalanche", "avax"],
    "ltcusdt": ["litecoin", "ltc"],
}


def match_coins(text: str) -> list[str]:
    """Retourne les symboles mentionnés dans le texte (limites de mots)."""
    low = text.lower()
    found: list[str] = []
    for symbol, aliases in COIN_ALIASES.items():
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", low):
                found.append(symbol)
                break
    return found
