# Description: This script uses the Google Maps Geocoding API to get the latitude and longitude of a place.

import requests

API_KEY = "AIzaSyC1cMCt9bc2xu2sgUx4Z1pdfZHdm1yEoeE"

# Place to search for
place = "Ohi, Greece"

# Construct request URL
url = f"https://maps.googleapis.com/maps/api/geocode/json?address={place}&key={API_KEY}"

# Make request
response = requests.get(url)
data = response.json()

# Parse response
if data["status"] == "OK":
    lat = data["results"][0]["geometry"]["location"]["lat"]
    lon = data["results"][0]["geometry"]["location"]["lng"]
    print(f"Latitude: {lat}, Longitude: {lon}")
else:
    print("Error:", data["status"])
