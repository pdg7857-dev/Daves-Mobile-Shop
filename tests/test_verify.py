import hashlib
import hmac

from app.messenger.verify import verify_signature


def test_signature_match():
    secret = "topsecret"
    body = b'{"a":1}'
    sig = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    assert verify_signature(secret, body, sig) is True


def test_signature_mismatch():
    assert verify_signature("topsecret", b"{}", "sha256=deadbeef") is False


def test_missing_header():
    assert verify_signature("topsecret", b"{}", None) is False


def test_missing_secret():
    assert verify_signature("", b"{}", "sha256=anything") is False
