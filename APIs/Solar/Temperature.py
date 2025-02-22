import requests

def get_temperature_data(lat, lon, start_year, end_year):
    # Construct the URL to get temperature data (T2M - 2-meter air temperature)
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    
    try:
        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP errors
        
        # Convert the response to JSON
        data = response.json()
        
        # Extract temperature data (monthly values)
        temperature_data = data['properties']['parameter']['T2M']
        
        return temperature_data

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
start_year = 2020
end_year = 2020

temperature = get_temperature_data(lat, lon, start_year, end_year)

if temperature:
    print("Temperature Data:", temperature)

def calculate_annual_mean_temperature(temperature_data):
    # Extract the temperature values (e.g., from the dictionary)
    temperature_values = list(temperature_data.values())
    
    # Calculate the mean temperature for the year
    if temperature_values:
        annual_mean_temp = sum(temperature_values) / len(temperature_values)
        return annual_mean_temp
    else:
        return None

# Example Usage
if temperature:
    annual_mean_temp = calculate_annual_mean_temperature(temperature)
    if annual_mean_temp is not None:
        print(f"Annual Mean Temperature: {annual_mean_temp:.2f} °C")
    else:
        print("No temperature data available.")

# save_to_csv function
import csv

def save_to_csv(temperature_data, filename='temperature_data.csv'):
    # Open a file to write
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Write the header
        writer.writerow(["Date", "Temperature (°C)"])
        
        # Write each key-value pair
        for date, temp in temperature_data.items():
            writer.writerow([date, temp])
    
    print(f"Data saved to {filename}")

if temperature:
    save_to_csv(temperature)

# save_to_json function
"""
import json

def save_to_json(temperature_data, filename='temperature_data.json'):
    with open(filename, 'w') as file:
        json.dump(temperature_data, file, indent=4)
    print(f"Data saved to {filename}")

if temperature:
    save_to_json(temperature)
"""