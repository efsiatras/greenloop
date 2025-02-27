import requests

def get_monthly_precipitation(lat, lon, start_year, end_year):
    # Construct the NASA POWER API URL for monthly precipitation data.
    url = (
        f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOT&community=SB&longitude={lon}&latitude={lat}&start={start_year}&end={end_year}&format=JSON"
    )
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    # Extract precipitation data from the JSON structure.
    return data['properties']['parameter']['PRECTOTCORR']

def aggregate_seasonal_precipitation(monthly_data):
    # Define seasons as per the Northern Hemisphere (you can adjust these for your region)
    # DJF: December, January, February
    # MAM: March, April, May
    # JJA: June, July, August
    # SON: September, October, November
    seasons = {
        "Winter": ["12", "01", "02"],
        "Spring": ["03", "04", "05"],
        "Summer": ["06", "07", "08"],
        "Fall":   ["09", "10", "11"]
    }
    
    seasonal_totals = {season: [] for season in seasons}

    # Loop through the monthly data. The keys are typically in YYYYMM format.
    for key, value in monthly_data.items():
        # Extract the month part of the key (last two characters)
        month = key[-2:]
        # For each season, if the month is in the list, add the value.
        for season, months in seasons.items():
            if month in months:
                seasonal_totals[season].append(value)
                break

    # Calculate the total rainfall for each season (e.g., summing the values).
    seasonal_rainfall = {}
    for season, values in seasonal_totals.items():
        if values:
            seasonal_rainfall[season] = sum(values)
        else:
            seasonal_rainfall[season] = None

    return seasonal_rainfall

# Example usage:
latitude = 37.98
longitude = 23.73
start_year = 2013
end_year = 2019

try:
    monthly_precip = get_monthly_precipitation(latitude, longitude, start_year, end_year)
    seasonal_rainfall = aggregate_seasonal_precipitation(monthly_precip)
    
    print("Seasonal Rainfall Totals (mm):")
    for season, total in seasonal_rainfall.items():
        print(f"{season}: {total:.2f}" if total is not None else f"{season}: Data not available")
except Exception as e:
    print("An error occurred:", e)
