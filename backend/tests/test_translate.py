from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from main import app
from routers.translate import get_llm_service

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_translate_empty_text():
    response = client.post("/translate", json={"text": "", "source_lang": "en", "target_lang": "pt"})
    assert response.status_code == 400


def test_translate_whitespace_only():
    response = client.post("/translate", json={"text": "   ", "source_lang": "en", "target_lang": "pt"})
    assert response.status_code == 400


def test_translate_text_too_long():
    response = client.post("/translate", json={"text": "x" * 5001, "source_lang": "en", "target_lang": "pt"})
    assert response.status_code == 422


def test_translate_success():
    mock_service = AsyncMock()
    mock_service.translate.return_value = "Ola"

    app.dependency_overrides[get_llm_service] = lambda: mock_service
    response = client.post("/translate", json={"text": "Hello", "source_lang": "en", "target_lang": "pt"})
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["translated_text"] == "Ola"


def test_translate_llm_failure():
    mock_service = AsyncMock()
    mock_service.translate.side_effect = Exception("API down")

    app.dependency_overrides[get_llm_service] = lambda: mock_service
    response = client.post("/translate", json={"text": "Hello", "source_lang": "en", "target_lang": "pt"})
    app.dependency_overrides.clear()

    assert response.status_code == 502
