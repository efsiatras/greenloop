import requests

def get_satellite_image(lat, lon, zoom=12, size="600x600", api_key="api"):

    url = f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lon}&zoom={zoom}&size={size}&maptype=satellite&key={api_key}"
    
    response = requests.get(url)

    if response.status_code == 200:
        # Save the image to a file
        with open("satellite_image.png", "wb") as file:
            file.write(response.content)
        print("Satellite image saved successfully!")
    else:
        print(f"Error: {response.status_code}")

# Example Usage
API_KEY = "AIzaSyC1cMCt9bc2xu2sgUx4Z1pdfZHdm1yEoeE"
get_satellite_image(37.074208, 21.824312, zoom=17, size="600x600", api_key=API_KEY)
