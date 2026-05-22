from app.intents import Intent, classify


def test_repair_keywords():
    assert classify("How much to fix a cracked screen on iPhone 13?") == Intent.REPAIR_QUOTE


def test_buy_keywords():
    assert classify("Do you have any iPhone 12 for sale?") == Intent.BUY_DEVICE


def test_sell_keywords():
    assert classify("I want to sell my Galaxy S22") == Intent.SELL_DEVICE


def test_hours_keywords():
    assert classify("what are your hours today?") == Intent.HOURS_LOCATION


def test_other_fallback():
    assert classify("hi") == Intent.OTHER
