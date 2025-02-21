import requests

# =====================
# API Parameters:
# =====================
# - `parameters`: Choose from ALLSKY_SFC_SW_DWN (solar radiation), T2M (temperature), etc.
# - `community`: "RE" for Renewable Energy, "AG" for Agriculture, "SB" for Sustainable Buildings
# - `latitude` & `longitude`: Geographic coordinates
# - `start` & `end`: YYYYMMDD for hourly/daily, YYYYMM for monthly, YYYY for annual
# - `format`: "JSON" or "CSV"

#Solar Parameters:

# ALLSKY_SFC_SW_DWN: All-sky surface shortwave downward irradiance (solar radiation reaching the surface).
# CLRSKY_SFC_SW_DWN: Clear-sky surface shortwave downward irradiance.
# ALLSKY_SFC_LW_DWN: All-sky surface longwave downward irradiance.
# SOLAR_TILT_SURF: Solar irradiance on tilted surfaces.

# Meteorological Parameters:

# T2M: Temperature at 2 meters above the surface.
# T2M_MAX: Maximum temperature at 2 meters.
# T2M_MIN: Minimum temperature at 2 meters.
# RH2M: Relative humidity at 2 meters.
# WS10M: Wind speed at 10 meters.
# WS50M: Wind speed at 50 meters.
# PRECTOT: Total precipitation.

# Derived Parameters:

# CLOUD_AMT: Cloud amount.
# PS: Surface pressure.
# QV2M: Specific humidity at 2 meters.
# DEGREE_DAYS_HEATING: Heating degree days.
# DEGREE_DAYS_COOLING: Cooling degree days.

def get_solar_data(lat, lon):
    url = f"https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=ALLSKY_SFC_SW_DWN&community=SB&longitude={lon}&latitude={lat}&start=2017&end=2018&format=JSON"

    response = requests.get(url)

    try:
        data = response.json()  # Convert response to JSON
        print("API Response:", data)  # Debugging step
        return data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
    
    except requests.exceptions.JSONDecodeError:
        print("Error: API did not return valid JSON.")
        return None
    except KeyError:
        print("Error: Unexpected API response structure. Check API output.")
        return None

# Test
solar = get_solar_data(37.98, 23.73)  # Athens, Greece
print("Solar Data:", solar)
