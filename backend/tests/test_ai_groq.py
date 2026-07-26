import pytest
from unittest.mock import patch, MagicMock
from app.ai_groq import process_groq_pipeline

@patch("app.ai_groq.encode_image")
@patch("app.ai_groq.groq_client")
def test_process_groq_pipeline(mock_groq, mock_encode):
    # Mock respons encode_image
    mock_encode.return_value = "dummy_base64_string"

    # Mock respons Groq Vision OCR
    mock_ocr_resp = MagicMock()
    mock_ocr_resp.choices = [MagicMock(message=MagicMock(content="Aku sangat cemas besok ujian"))]

    # Mock respons Groq Text Analysis JSON
    mock_analysis_resp = MagicMock()
    mock_analysis_resp.choices = [MagicMock(message=MagicMock(content='''{
      "sentiment_label": "Anxious",
      "sentiment_score": 80,
      "handwriting_insights": "Tulisan menunjukkan kecemasan akademis.",
      "mood_stress_correlation": "Kurang tidur memicu stres.",
      "recommendations": "Tarik napas dalam 5 detik.",
      "stress_score": 75,
      "mood_score": 40,
      "future_mood_prediction": [45, 50, 60, 70]
    }'''))]

    mock_groq.chat.completions.create.side_effect = [mock_ocr_resp, mock_analysis_resp]

    kinematics = {
        "stroke_count": 10,
        "erase_count": 2,
        "duration_seconds": 90,
        "average_velocity": 12.5,
        "average_acceleration": 2.1,
        "jerk_score": 8.4,
        "pen_lifts": 4
    }

    result = process_groq_pipeline("path/to/mock.png", kinematics, 6.0, "no")

    assert result["ocr_text"] == "Aku sangat cemas besok ujian"
    assert result["sentiment_label"] == "Anxious"
    assert result["stress_score"] == 75
