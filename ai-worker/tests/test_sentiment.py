import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sentiment import analyze  # noqa: E402
from coins import match_coins  # noqa: E402


def test_positive():
    score, label = analyze("Le Bitcoin explose et signe un nouveau record historique")
    assert label == "positive"
    assert score > 0


def test_negative():
    score, label = analyze("Krach sur le marché : l'Ethereum s'effondre après un piratage")
    assert label == "negative"
    assert score < 0


def test_neutral():
    _, label = analyze("La conférence blockchain se tiendra à Paris en septembre")
    assert label == "neutral"


def test_negation_flips():
    pos, _ = analyze("Le marché est en hausse")
    neg, _ = analyze("Le marché n'est pas en hausse")
    assert neg < pos


def test_match_single():
    assert match_coins("Le Bitcoin dépasse les 60 000 dollars") == ["btcusdt"]


def test_match_multiple():
    coins = match_coins("Ethereum et Solana progressent, Ripple recule")
    assert set(coins) == {"ethusdt", "solusdt", "xrpusdt"}


def test_match_none():
    assert match_coins("Un article généraliste sans crypto citée") == []


def test_ticker_word_boundary():
    # "solaire" ne doit pas matcher "sol"
    assert "solusdt" not in match_coins("panneau solaire photovoltaique")
