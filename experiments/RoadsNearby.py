import requests
import pandas as pd

# Google API key
API_KEY = ""

# Location Coordinates (Example: Athens, Greece)
latitude, longitude = 38.563210, 22.616250

# Search Parameters
radius = 3000  # Search within 3 km radius

def get_nearby_places(place_type):
    url = (
        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={latitude},{longitude}"
        f"&radius={radius}"
        f"&type={place_type}"
        f"&key={API_KEY}"
    )
    response = requests.get(url)
    if response.status_code == 200:
        places = response.json().get('results', [])
        return places
    else:
        print("Failed to retrieve data:", response.status_code)
        return []

# Find Nearby Roads (Google Places does not directly support roads, use 'route' as a type)
roads = get_nearby_places('route')
substations = get_nearby_places('electric_substation')

# Function to create a DataFrame
def create_dataframe(places, place_type):
    data = []
    for place in places:
        name = place.get('name', 'N/A')
        address = place.get('vicinity', 'N/A')
        lat = place['geometry']['location']['lat']
        lng = place['geometry']['location']['lng']
        data.append({'Name': name, 'Address': address, 'Latitude': lat, 'Longitude': lng, 'Type': place_type})
    return pd.DataFrame(data)

# Create DataFrames for roads and substations
df_roads = create_dataframe(roads, 'Road')
df_substations = create_dataframe(substations, 'Substation')

# Combine DataFrames
df_all = pd.concat([df_roads, df_substations], ignore_index=True)

# Display the results
print(df_all)

if df_all.empty:
    print("No places found.")
    score = 0 # No roads nearby
else:
    score = 1 # Roads nearby

print(score)