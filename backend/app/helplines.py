import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

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
            name = tags.get("name", tags.get("amenity", tags.get("healthcare", "Fasilitas Kesehatan")))
            results.append({
                "name": name,
                "lat": element.get("lat"),
                "lon": element.get("lon"),
                "type": tags.get("amenity") or tags.get("healthcare"),
                "address": tags.get("addr:full", tags.get("addr:street", "")),
                "phone": tags.get("phone", ""),
            })

        return {"results": results[:20]}
    except Exception as e:
        return {"results": [], "error": str(e)}
