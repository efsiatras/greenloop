import requests

def get_air_density(lat, lon, start_year, end_year):
    # NASA POWER API URL
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PS,T2M&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"

    response = requests.get(url)
    
    try:
        data = response.json()
        
        # Extract pressure (PS) and temperature (T2M)
        pressure_data = data['properties']['parameter']['PS']
        temperature_data = data['properties']['parameter']['T2M']
        
        air_density_by_month = {}
        R = 287.05  # Gas constant for dry air
        
        for month, ps_hpa in pressure_data.items():
            t_celsius = temperature_data[month]
            
            # Convert pressure from hPa to Pa and temperature from °C to K
            P = ps_hpa * 1000
            T = t_celsius + 273.15
            
            # Calculate air density
            density = P / (R * T)
            air_density_by_month[month] = round(density, 3)  # Limit to 3 decimals
        
        return air_density_by_month

    except (requests.exceptions.JSONDecodeError, KeyError) as e:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Example usage
latitude = 37.98
longitude = 23.73
start_year = 2017
end_year = 2018

air_density = get_air_density(latitude, longitude, start_year, end_year)
print("Monthly Air Density (kg/m³):", air_density)
