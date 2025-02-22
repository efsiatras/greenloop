# Description: This script retrieves the monthly and total mean wind speed at 10m and 50m from NASA POWER API.

import requests

# Function to get the monthly and total mean wind speed at 10m from NASA POWER API
def get_wind_speed_10m(lat, lon, start_year, end_year):
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=WS10M&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    
    response = requests.get(url)
    
    try:
        data = response.json()
        
        # Ensure the API response contains the expected structure
        if 'properties' not in data or 'parameter' not in data['properties']:
            print("Error: API response does not contain expected data. Full Response:", data)
            return None

        # Extract wind speed at 10m
        ws10m_data = data['properties']['parameter'].get('WS10M', {})

        if not ws10m_data:
            print("Error: No wind speed data found. Check API response.")
            return None

        # Organize valid months (1-12) into a dictionary
        monthly_ws10m = {month: [] for month in range(1, 13)}

        for key, value in ws10m_data.items():
            year = key[:4]  # Extract year (YYYY)
            month = int(key[-2:])  # Extract month (MM)
            
            # Ignore invalid "month 13" values
            if 1 <= month <= 12:
                monthly_ws10m[month].append(value)

        # Compute the mean for each valid month
        mean_ws10m = {month: round((sum(values) / len(values)),3) if values else 0 for month, values in monthly_ws10m.items()}

        # Compute the overall mean across all months and years
        total_mean_ws10m = sum(ws10m_data.values()) / len(ws10m_data) if ws10m_data else 0

        return mean_ws10m, total_mean_ws10m
    

    
    except requests.exceptions.JSONDecodeError:
        print("Error: API did not return valid JSON.")
        return None
    except KeyError:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Function to get the monthly and total mean wind speed at 50m from NASA POWER API
def get_wind_speed_50m(lat, lon, start_year, end_year):
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=WS50M&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    
    response = requests.get(url)
    
    try:
        data = response.json()
        
        # Ensure the API response contains the expected structure
        if 'properties' not in data or 'parameter' not in data['properties']:
            print("Error: API response does not contain expected data. Full Response:", data)
            return None

        # Extract wind speed at 50m
        ws50m_data = data['properties']['parameter'].get('WS50M', {})

        if not ws50m_data:
            print("Error: No wind speed data found. Check API response.")
            return None

        # Organize valid months (1-12) into a dictionary
        monthly_ws50m = {month: [] for month in range(1, 13)}

        for key, value in ws50m_data.items():
            year = key[:4]  # Extract year (YYYY)
            month = int(key[-2:])  # Extract month (MM)
            
            # Ignore invalid "month 13" values
            if 1 <= month <= 12:
                monthly_ws50m[month].append(value)

        # Compute the mean for each valid month
        mean_ws50m = {month: round((sum(values) / len(values)),3) if values else 0 for month, values in monthly_ws50m.items()}

        # Compute the overall mean across all months and years
        total_mean_ws50m = sum(ws50m_data.values()) / len(ws50m_data) if ws50m_data else 0

        return mean_ws50m, total_mean_ws50m
    

    
    except requests.exceptions.JSONDecodeError:
        print("Error: API did not return valid JSON.")
        return None
    except KeyError:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Example: Get wind speed at 10m for Athens, Greece (37.98°N, 23.73°E) from 2017 to 2023
latitude = 37.98
longitude = 23.73
start_year = 2017
end_year = 2023

result = get_wind_speed_10m(latitude, longitude, start_year, end_year)

if result:
    ws10m_monthly, total_ws10m = result
    print("✅ Monthly Mean Wind Speed at 10m:", ws10m_monthly)
    print(f"🌍 Total Mean Wind Speed at 10m: {total_ws10m:.2f} m/s")

# Example: Get wind speed at 50m for Athens, Greece (37.98°N, 23.73°E) from 2017 to 2023
latitude = 37.98
longitude = 23.73
start_year = 2017
end_year = 2023

result = get_wind_speed_50m(latitude, longitude, start_year, end_year)

if result:
    ws50m_monthly, total_ws50m = result
    print("✅ Monthly Mean Wind Speed at 50m:", ws50m_monthly)
    print(f"🌍 Total Mean Wind Speed at 50m: {total_ws50m:.2f} m/s")