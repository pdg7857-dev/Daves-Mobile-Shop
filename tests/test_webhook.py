from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json() == {"ok": True}


def test_webhook_verify_success():
    r = client.get(
        "/webhook/messenger",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "change-me",
            "hub.challenge": "42",
        },
    )
    assert r.status_code == 200
    assert r.text == "42"


def test_webhook_verify_wrong_token():
    r = client.get(
        "/webhook/messenger",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "nope",
            "hub.challenge": "42",
        },
    )
    assert r.status_code == 403


def test_webhook_ignores_non_page_object():
    r = client.post("/webhook/messenger", json={"object": "instagram", "entry": []})
    assert r.status_code == 200 and r.json() == {"status": "ignored"}
