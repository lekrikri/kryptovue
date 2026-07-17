import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm import parse_sentiment  # noqa: E402


def test_parse_valid_json():
    score, label = parse_sentiment('{"score": 0.5, "label": "positive"}')
    assert score == 0.5
    assert label == "positive"


def test_parse_unquoted_label():
    # Sortie réelle de qwen2.5:3b (label non quoté = JSON invalide)
    score, label = parse_sentiment('{"score": -0.4, "label": negative}')
    assert score == -0.4
    assert label == "negative"


def test_parse_clamps_score():
    # 2.5 est clampé à 1.0 ; sans mot-clé de label, il est dérivé du score.
    score, label = parse_sentiment("score: 2.5")
    assert score == 1.0
    assert label == "positive"


def test_parse_infers_label_from_score():
    # score présent, label absent → label dérivé du score
    score, label = parse_sentiment('{"score": 0.8}')
    assert score == 0.8
    assert label == "positive"


def test_parse_garbage_is_neutral():
    score, label = parse_sentiment("réponse illisible")
    assert score == 0.0
    assert label == "neutral"
