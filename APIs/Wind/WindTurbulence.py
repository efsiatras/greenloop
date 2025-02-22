import requests
import statistics
from collections import defaultdict

def get_hourly_wind_data(lat, lon, start_date, end_date):
    """
    Retrieves hourly wind speed data (WS10M) from NASA POWER API.
    start_date and end_date should be in 'YYYYMMDD' format.
    """
    url = (
        f"https://power.larc.nasa.gov/api/temporal/hourly/point?"
        f"parameters=WS10M&community=SB&longitude={lon}&latitude={lat}"
        f"&start={start_date}&end={end_date}&format=JSON"
    )
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    # The wind speed data is under data['properties']['parameter']['WS10M']
    return data['properties']['parameter']['WS10M']

def calculate_daily_turbulence(wind_data):
    """
    Calculates daily turbulence intensity (TI) from hourly wind speed data.
    The wind_data keys are in 'YYYYMMDDHH' format.
    Returns a dictionary mapping day ('YYYYMMDD') to turbulence intensity (%).
    """
    # Group hourly wind speeds by day
    daily_values = defaultdict(list)
    for timestamp, wind_speed in wind_data.items():
        day = timestamp[:8]  # Extract YYYYMMDD
        daily_values[day].append(wind_speed)
    
    daily_ti = {}
    for day, speeds in daily_values.items():
        if len(speeds) > 1:
            mean_speed = statistics.mean(speeds)
            stdev_speed = statistics.stdev(speeds)
            # Calculate TI as (standard deviation / mean) * 100%
            ti = (stdev_speed / mean_speed * 100) if mean_speed != 0 else 0
            daily_ti[day] = ti
        else:
            daily_ti[day] = 0  # Not enough data points
    return daily_ti

# Example usage:
latitude = 37.98
longitude = 23.73
# Define a period (e.g., one week)
start_date = "20230101"
end_date   = "20231207"

try:
    wind_data = get_hourly_wind_data(latitude, longitude, start_date, end_date)
    daily_turbulence = calculate_daily_turbulence(wind_data)

    for day, ti in sorted(daily_turbulence.items()):
        print(f"Date: {day}, Turbulence Intensity: {ti:.2f}%")
        
    total_mean = statistics.mean(daily_turbulence.values())
    print(f"Mean Turbulence Intensity: {total_mean:.2f}%")
except Exception as e:
    print("An error occurred:", e)
