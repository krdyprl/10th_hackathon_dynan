import math

def calculate_kinematics(strokes, erase_count: int, duration_seconds: int) -> dict:
    if not strokes:
        return {
            "stroke_count": 0,
            "erase_count": erase_count,
            "duration_seconds": duration_seconds,
            "average_velocity": 0.0,
            "average_acceleration": 0.0,
            "jerk_score": 0.0,
            "pen_lifts": 0
        }

    velocities = []
    accelerations = []
    jerks = []

    for stroke in strokes:
        points = stroke.get("points", [])
        if len(points) < 2:
            continue

        for i in range(1, len(points)):
            p1 = points[i-1]
            p2 = points[i]

            dt = (p2["time"] - p1["time"]) / 1000.0  # Konversi ke detik
            if dt <= 0:
                continue

            dist = math.sqrt((p2["x"] - p1["x"])**2 + (p2["y"] - p1["y"])**2)
            v = dist / dt
            velocities.append(v)

            # Akselerasi
            if i > 1 and len(velocities) >= 2:
                dv = velocities[-1] - velocities[-2]
                a = dv / dt
                accelerations.append(a)

                # Jerk
                if len(accelerations) >= 2:
                    da = accelerations[-1] - accelerations[-2]
                    j = da / dt
                    jerks.append(j)

    avg_v = sum(velocities) / len(velocities) if velocities else 0.0
    avg_a = sum(map(abs, accelerations)) / len(accelerations) if accelerations else 0.0
    avg_j = sum(map(abs, jerks)) / len(jerks) if jerks else 0.0
    pen_lifts = max(0, len(strokes) - 1)

    return {
        "stroke_count": len(strokes),
        "erase_count": erase_count,
        "duration_seconds": duration_seconds,
        "average_velocity": round(avg_v, 4),
        "average_acceleration": round(avg_a, 4),
        "jerk_score": round(avg_j, 4),
        "pen_lifts": pen_lifts
    }
