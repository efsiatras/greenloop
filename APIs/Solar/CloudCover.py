import requests

def get_annual_mean_cloud_amount(lat, lon, start_year, end_year):
    # Construct the URL to get cloud amount data (CLOUD_AMT)
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=CLOUD_AMT&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    
    try:
        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP errors
        
        # Convert the response to JSON
        data = response.json()
        
        # Extract cloud amount data (monthly values)
        cloud_amount_data = data['properties']['parameter']['CLOUD_AMT']
        
        # Calculate the mean cloud cover for the year
        cloud_amount_values = list(cloud_amount_data.values())  # Get all monthly values
        if cloud_amount_values:
            annual_mean_cloud_cover = sum(cloud_amount_values) / len(cloud_amount_values)
        else:
            annual_mean_cloud_cover = 0.0
        
        return annual_mean_cloud_cover

    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return None
    except requests.exceptions.JSONDecodeError:
        print("Error: API did not return valid JSON.")
        return None
    except KeyError:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Example Usage
lat, lon = 37.98, 23.73  # Athens, Greece
start_year = 2017
end_year = 2017

annual_mean_cloud_cover = get_annual_mean_cloud_amount(lat, lon, start_year, end_year)

if annual_mean_cloud_cover is not None:
    print(f"Annual Mean Cloud Amount for {start_year}: {annual_mean_cloud_cover:.2f}%")
