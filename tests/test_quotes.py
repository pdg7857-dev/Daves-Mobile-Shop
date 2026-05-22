from app.quoting import QuoteBook


def test_known_device_known_issue_returns_confident_quote():
    q = QuoteBook().lookup("iPhone 13", "cracked screen")
    assert q.confident is True
    assert q.device == "iPhone 13"
    assert q.issue == "screen"
    assert q.price_low is not None and q.price_high is not None
    assert q.price_low <= q.price_high


def test_pro_variant_matched_before_base():
    q = QuoteBook().lookup("iPhone 13 Pro", "screen")
    assert q.device == "iPhone 13 Pro"


def test_alias_phrasing_battery():
    q = QuoteBook().lookup("Galaxy S22", "phone won't hold a charge")
    assert q.confident is True
    assert q.issue == "battery"


def test_unknown_device():
    q = QuoteBook().lookup("Nokia 3310", "screen")
    assert q.confident is False
    assert q.price_low is None


def test_known_device_unknown_issue():
    q = QuoteBook().lookup("iPhone 15", "back glass")
    # iPhone 15 in the seed data doesn't have back_glass yet.
    assert q.confident is False
    assert "iPhone 15" in q.notes


def test_loose_phrasing_device_match():
    q = QuoteBook().lookup("my iphone13 broke", "battery replacement")
    assert q.confident is True
    assert q.device == "iPhone 13"
