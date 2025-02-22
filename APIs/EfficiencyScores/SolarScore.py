import requests
import numpy as np
from geopy import distance

API_KEY = "AIzaSyC1cMCt9bc2xu2sgUx4Z1pdfZHdm1yEoeE"

lat, lon = 38.122636, 21.682841

# Function to get data from NASA POWER API
def get_nasa_power_data(lat, lon, start_date, end_date, parameters):
    base_url = "https://power.larc.nasa.gov/api/temporal/monthly/point"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start": start_date,
        "end": end_date,
        "parameters": ",".join(parameters),
        "community": "RE",
        "format": "JSON"
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get data: {response.status_code}")
        return None

# Function to calculate the efficiency score
def calculate_efficiency(temp, cloud, solar, elevation, slope):
    # Adjust weights as needed
    temp_weight = 0.23
    cloud_weight = 0.34
    solar_weight = 0.43
    # elevation_weight = 0.1

    # Normalize the parameters
    temp_norm = 1/(1+0.1*((temp-25)**2))  # Assuming optimal temp ~ 25°C
    cloud_norm = (100 - cloud) / 100  # Lower cloud = better
    solar_norm = solar / 1000  # Max solar radiance ~ 1000 W/m²
    # elevation_norm = (elevation + 500) / 1000 if elevation<=500 else 1 # Higher elevation generally better

    # Efficiency score calculation
    efficiency_score = (
        (temp_norm * temp_weight) +
        (cloud_norm * cloud_weight) +
        (solar_norm * solar_weight) 
        # (elevation_norm * elevation_weight)
    ) * 100  # Convert to percentage
    
    if slope>20:
        efficiency_score = efficiency_score - 20
    elif slope>15:
        efficiency_score = efficiency_score - 10
    return max(0, min(100, efficiency_score))  # Clamp between 0 and 100

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



# Function to calculate a new point by moving north by a given distance
def move_north(point, distance_m):
    lat, lon = point
    # Approximate change in latitude for 1 meter of movement
    delta_lat = distance_m / 111320  # 1 degree latitude ≈ 111.32 km
    new_lat = lat + delta_lat
    new_point = (new_lat, lon)
    return new_point

# Distance to move in meters (e.g., 100 meters)
move_distance = 100

def get_slope(lat, lon, move_distance):
    # Generate Point 2 by moving north
    point1 = (lat, lon) 
    point2 = move_north(point1, move_distance)

    lat, lon = 38.122636, 21.682841

    elevation1 = get_elevation(*point1)
    elevation2 = get_elevation(*point2)

    # Calculate horizontal distance between the two points
    horizontal_distance = distance.distance(point1, point2).meters  # Distance in meters
    # print(f"Horizontal Distance: {horizontal_distance} meters")

    # Calculate slope
    if elevation1 is not None and elevation2 is not None:
        delta_elevation = elevation2 - elevation1
        slope = abs((delta_elevation / horizontal_distance) * 100)  # Slope as a percentage
        print(f"Slope: {slope:.2f}%")
        return slope
    else:
        print("Unable to calculate slope due to missing elevation data.")
        return None

# Date calculations for past 3 years
start_date = 2020
end_date = 2022

# Parameters to retrieve
parameters = [
    "T2M",       # Mean temperature
    "CLOUD_AMT",    # Cloud coverage
    "ALLSKY_SFC_SW_DWN",  # Solar radiance
]

# Get data from NASA POWER API
data = get_nasa_power_data(lat, lon, start_date, end_date, parameters)

if data:
    # Extracting required data
    temp_data = np.array([float(v) for v in data['properties']['parameter']['T2M'].values()])
    cloud_data = np.array([float(v) for v in data['properties']['parameter']['CLOUD_AMT'].values()])
    solar_data = np.array([float(v) for v in data['properties']['parameter']['ALLSKY_SFC_SW_DWN'].values()])
    elevation = get_elevation(lat, lon)
    slope = get_slope(lat, lon, move_distance)

    # Calculate means
    mean_temp = np.mean(temp_data)
    mean_cloud = np.mean(cloud_data)
    mean_solar = np.mean(solar_data)

    # Calculate efficiency score
    efficiency_score = calculate_efficiency(mean_temp, mean_cloud, mean_solar, elevation, slope)

    # Output results
    print("\n--- Solar Panel Efficiency Report ---")
    print(f"Mean Temperature: {mean_temp:.2f} °C")
    print(f"Mean Cloud Coverage: {mean_cloud:.2f} %")
    print(f"Mean Solar Radiance: {mean_solar:.2f} W/m²")
    print(f"Slope: {slope:.2f}%")   
    # print(f"Elevation: {elevation:.2f} m")
    print(f"Estimated Solar Panel Efficiency: {efficiency_score:.2f} %")