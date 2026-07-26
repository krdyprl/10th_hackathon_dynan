import pytest
import io
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

def _mock_user():
    return MagicMock(id="test-user-id", email="test@test.com")

@pytest.fixture(autouse=True)
def override_deps():
    from app.main import get_current_user
    app.dependency_overrides[get_current_user] = _mock_user
    yield
    app.dependency_overrides.clear()

@patch("app.main.calculate_kinematics")
@patch("app.main.process_groq_pipeline")
def test_analyze_endpoint(mock_groq, mock_kinematic):
    mock_kinematic.return_value = {"stroke_count": 1}
    mock_groq.return_value = {
        "ocr_text": "Aku lelah",
        "sentiment_label": "Sad",
        "stress_score": 60,
        "mood_score": 40
    }

    import app.main as m
    m.supabase = None

    file_data = {"file": ("canvas.png", io.BytesIO(b"dummyimagebytes"), "image/png")}

    data = {
        "strokes_json": json.dumps([{"points": []}]),
        "sleep_hours": 7.0,
        "erase_count": 0,
        "duration_seconds": 45,
        "exercise_status": "yes"
    }

    response = client.post("/api/analyze", files=file_data, data=data)

    assert response.status_code == 200
    assert response.json()["sentiment_label"] == "Sad"
    assert response.json()["ocr_text"] == "Aku lelah"
