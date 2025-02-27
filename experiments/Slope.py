import requests
from geopy import distance

# Google Maps Elevation API Key
API_KEY = ""

# Starting point (latitude, longitude)
point1 = (39.074208, 21.824312)  # San Francisco

# Distance to move in meters (e.g., 100 meters)
move_distance = 100

# Function to calculate a new point by moving north by a given distance
def move_north(point, distance_m):
    lat, lon = point
    # Approximate change in latitude for 1 meter of movement
    delta_lat = distance_m / 111320  # 1 degree latitude ≈ 111.32 km
    new_lat = lat + delta_lat
    new_point = (new_lat, lon)
    return new_point

# Generate Point 2 by moving north
point2 = move_north(point1, move_distance)
print(f"Point 1: {point1}")
print(f"Point 2: {point2}")

# Function to get elevation from Google Maps Elevation API
def get_elevation(lat, lon):
    url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={lat},{lon}&key={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        result = response.json()
        if result['status'] == 'OK':
            elevation = result['results'][0]['elevation']
            return elevation
        else:
            print(f"Error in API response: {result['status']}")
    else:
        print("Failed to connect to the Google Maps API.")
    return None

# Get elevations for both points
elevation1 = get_elevation(*point1)
elevation2 = get_elevation(*point2)

print(f"Elevation at Point 1: {elevation1} meters")
print(f"Elevation at Point 2: {elevation2} meters")

# Calculate horizontal distance between the two points
horizontal_distance = distance.distance(point1, point2).meters  # Distance in meters
print(f"Horizontal Distance: {horizontal_distance} meters")

# Calculate slope
if elevation1 is not None and elevation2 is not None:
    delta_elevation = elevation2 - elevation1
    slope = abs((delta_elevation / horizontal_distance) * 100)  # Slope as a percentage
    print(f"Slope: {slope:.2f}%")
else:
    print("Unable to calculate slope due to missing elevation data.")
