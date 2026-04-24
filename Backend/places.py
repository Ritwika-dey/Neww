import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

def search_businesses(location: str, business_type: str = "restaurant"):
    """
    Searches for businesses using OpenStreetMap (Nominatim).
    No API key required, but follows Nominatim's Usage Policy.
    """
    print(f"\nSearching OpenStreetMap for: {business_type} in {location}")

    # Nominatim requires a descriptive User-Agent
    headers = {
        "User-Agent": "BusinessLeadAgent/1.0 (educational_project)"
    }

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{business_type} in {location}",
        "format": "json",
        "limit": 5,
        "addressdetails": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Debug print
        # print("🔍 Raw API response:", data)

        if not data:
            print(f"⚠️ No results found for {business_type} in {location}")
            return []

        print(f"Done: Found {len(data)} results")

        businesses = []

        for place in data:
            # Nominatim doesn't have a single 'name' field always clearly separated, 
            # but usually the first part of display_name is the name.
            # If addressdetails=1 is used, we can often find the specific amenity name.
            
            address_info = place.get("address", {})
            name = (
                address_info.get(place.get("type", ""), "") or 
                address_info.get("name", "") or 
                place.get("display_name", "").split(",")[0]
            )

            business = {
                "name": name,
                "address": place.get("display_name", "Address not available"),
                "rating": "N/A",  # OSM doesn't provide ratings
                "categories": [place.get("type", "business"), place.get("class", "amenity")],
                "website": ""  # OSM might have this in 'extratags', but keeping it empty for the pipeline check
            }

            businesses.append(business)
            print(f"   - {business['name']}")

        return businesses

    except Exception as e:
        print("ERROR calling OpenStreetMap:", e)
        return []