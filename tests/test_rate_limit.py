from app.rate_limit import RateLimiter


def test_allows_under_limit():
    rl = RateLimiter(max_events=3, window_seconds=10)
    assert rl.allow("u") is True
    assert rl.allow("u") is True
    assert rl.allow("u") is True


def test_blocks_over_limit():
    rl = RateLimiter(max_events=2, window_seconds=10)
    assert rl.allow("u") is True
    assert rl.allow("u") is True
    assert rl.allow("u") is False


def test_window_slides():
    rl = RateLimiter(max_events=2, window_seconds=10)
    assert rl.allow("u", now=100.0) is True
    assert rl.allow("u", now=101.0) is True
    assert rl.allow("u", now=102.0) is False
    # 10s later the early events fall off
    assert rl.allow("u", now=112.0) is True


def test_per_sender_isolation():
    rl = RateLimiter(max_events=1, window_seconds=10)
    assert rl.allow("a") is True
    assert rl.allow("b") is True  # different sender, unaffected
    assert rl.allow("a") is False


def test_notify_throttles():
    rl = RateLimiter()
    assert rl.should_notify("u", cooldown=60, now=0) is True
    assert rl.should_notify("u", cooldown=60, now=30) is False
    assert rl.should_notify("u", cooldown=60, now=120) is True
