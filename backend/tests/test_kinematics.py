import pytest
from app.kinematics import calculate_kinematics

def test_calculate_kinematics_valid_data():
    # Simulasi goresan satu garis lurus dengan peningkatan waktu stabil
    mock_strokes = [
        {
            "points": [
                {"x": 10.0, "y": 10.0, "time": 0},
                {"x": 20.0, "y": 10.0, "time": 100},
                {"x": 30.0, "y": 10.0, "time": 200}
            ]
        }
    ]
    erase_count = 0
    duration_seconds = 2

    result = calculate_kinematics(mock_strokes, erase_count, duration_seconds)

    assert result["stroke_count"] == 1
    assert result["erase_count"] == 0
    assert result["duration_seconds"] == 2
    assert result["average_velocity"] > 0
    assert result["average_acceleration"] == 0.0 # Kecepatan konstan
    assert result["jerk_score"] == 0.0 # Tidak ada tremor
    assert result["pen_lifts"] == 0

def test_calculate_kinematics_empty_strokes():
    result = calculate_kinematics([], 3, 10)
    assert result["stroke_count"] == 0
    assert result["erase_count"] == 3
    assert result["duration_seconds"] == 10
    assert result["average_velocity"] == 0.0
    assert result["average_acceleration"] == 0.0
    assert result["jerk_score"] == 0.0
    assert result["pen_lifts"] == 0

def test_calculate_kinematics_single_point_stroke():
    mock_strokes = [
        {
            "points": [
                {"x": 10.0, "y": 10.0, "time": 100}
            ]
        }
    ]
    result = calculate_kinematics(mock_strokes, 1, 5)
    assert result["stroke_count"] == 1
    assert result["erase_count"] == 1
    assert result["duration_seconds"] == 5
    assert result["average_velocity"] == 0.0
    assert result["average_acceleration"] == 0.0
    assert result["jerk_score"] == 0.0
    assert result["pen_lifts"] == 0

def test_calculate_kinematics_duplicate_timestamps():
    mock_strokes = [
        {
            "points": [
                {"x": 10.0, "y": 10.0, "time": 100},
                {"x": 20.0, "y": 15.0, "time": 100},
                {"x": 30.0, "y": 20.0, "time": 200}
            ]
        }
    ]
    # Interval pertama dt = 0 (diabaikan)
    # Interval kedua dt = 0.1 (dist = 10^2 + 5^2 = sqrt(125) = 11.1803) -> v = 111.803
    # Karena hanya ada 1 interval valid, velocity = [111.803], acceleration dan jerk kosong.
    result = calculate_kinematics(mock_strokes, 0, 4)
    assert result["stroke_count"] == 1
    assert result["average_velocity"] > 0
    assert result["average_acceleration"] == 0.0
    assert result["jerk_score"] == 0.0
    assert result["pen_lifts"] == 0

def test_calculate_kinematics_multiple_strokes():
    mock_strokes = [
        {
            "points": [
                {"x": 0.0, "y": 0.0, "time": 0},
                {"x": 10.0, "y": 0.0, "time": 100}
            ]
        },
        {
            "points": [
                {"x": 50.0, "y": 50.0, "time": 300},
                {"x": 60.0, "y": 50.0, "time": 400}
            ]
        }
    ]
    result = calculate_kinematics(mock_strokes, 2, 6)
    assert result["stroke_count"] == 2
    assert result["erase_count"] == 2
    assert result["duration_seconds"] == 6
    assert result["average_velocity"] == 100.0 # Kedua stroke berkecepatan 100.0
    assert result["average_acceleration"] == 0.0
    assert result["jerk_score"] == 0.0
    assert result["pen_lifts"] == 1
