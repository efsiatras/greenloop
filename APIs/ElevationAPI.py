# Description: This script uses the Google Elevation API to get the elevation of a specific location.

import requests

API_KEY = "AIzaSyC1cMCt9bc2xu2sgUx4Z1pdfZHdm1yEoeE"
latitude = 39.074208
longitude = 21.824312
url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={latitude},{longitude}&key={API_KEY}"

response = requests.get(url)
data = response.json()

if data["status"] == "OK":
    elevation = data["results"][0]["elevation"]
    print(f"Elevation: {elevation} meters")
else:
    print("Error:", data["status"])
