import requests

def get_solar_data(lat, lon, year):
    # Create the URL with the specified year
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=ALLSKY_SFC_SW_DWN&community=SB&longitude={lon}&latitude={lat}&start={year}&end={year}&format=JSON"
    
    try:
        # Make the API request
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP errors

        # Convert the response to JSON
        data = response.json()
        
        # Debugging: print the structure of the data response to understand it better
        # print("API Response:", data)
        
        # Extract solar irradiance data (monthly values)
        solar_data = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
        return solar_data

    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return None
    except requests.exceptions.JSONDecodeError:
        print("Error: API did not return valid JSON.")
        return None
    except KeyError:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Function to calculate the mean solar irradiance by month and the total mean for the year
def calculate_monthly_mean_and_total(lat, lon, year):
    # Fetch solar data for the given year
    solar_data = get_solar_data(lat, lon, year)
    
    if solar_data:
        # Create a list for monthly solar irradiance data
        mean_monthly_irradiance = {}

        # We loop through the solar data and map it to months
        for key, irradiance in solar_data.items():
            # Extract the month from the key (which is in the format 'YYYYMM')
            month = int(key[4:6])  # Extract the last two digits of the year-month (i.e., '01', '02', ...)
            mean_monthly_irradiance[month] = irradiance
        
        # Calculate the total mean for the year (the mean of all 12 months)
        total_mean = sum(mean_monthly_irradiance.values()) / len(mean_monthly_irradiance)
        
        # Print the mean for each month
        print(f"Monthly Solar Irradiance for {year}:")
        for month in range(1, 13):
            print(f"Month {month}: {mean_monthly_irradiance.get(month, 0):.2f} W/m²")
        
        # Print the total mean for the year
        print(f"\nTotal Mean Solar Irradiance for {year}: {total_mean:.2f} W/m²")
    else:
        print(f"Could not retrieve data for year {year}.")

# Test the function (e.g., Athens, Greece, for year 2017)
lat, lon = 37.98, 23.73
year = 2017

calculate_monthly_mean_and_total(lat, lon, year)
