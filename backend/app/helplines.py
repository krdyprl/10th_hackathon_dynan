import os
import math
import requests

OVERPASS_URL = os.environ.get("OVERPASS_URL", "https://overpass-api.de/api/interpreter")


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


def find_nearby_helplines(lat: float, lon: float, radius: int = 5000):
    query = f"""
    [out:json];
    (
      node["amenity"="clinic"](around:{radius},{lat},{lon});
      node["amenity"="hospital"](around:{radius},{lat},{lon});
      node["healthcare"="psychiatrist"](around:{radius},{lat},{lon});
      node["healthcare"="psychologist"](around:{radius},{lat},{lon});
      node["amenity"="social_facility"](around:{radius},{lat},{lon});
    );
    out body;
    """

    try:
        resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            elat = element.get("lat")
            elon = element.get("lon")

            results.append({
                "name": tags.get("name", tags.get("amenity", tags.get("healthcare", "Fasilitas Kesehatan"))),
                "lat": elat,
                "lon": elon,
                "type": tags.get("amenity") or tags.get("healthcare"),
                "address": tags.get("addr:full", tags.get("addr:street", "")),
                "phone": tags.get("phone", ""),
                "opening_hours": tags.get("opening_hours", ""),
                "website": tags.get("website", ""),
                "distance_km": _haversine(lat, lon, elat, elon) if elat and elon else None,
            })

        results.sort(key=lambda r: r["distance_km"] if r["distance_km"] else 9999)
        return {"results": results[:20]}
    except Exception as e:
        return {"results": [], "error": str(e)}
