import requests

latitude, longitude = 37.749, 24.3587 
radius = 1000  # 1 km radius

# Overpass API URL
overpass_url = "http://overpass-api.de/api/interpreter"

# Overpass QL query to check for power infrastructure
overpass_query = f"""
[out:json];
(
  node["power"~"substation|line|generator|pole|tower"](around:{radius},{latitude},{longitude});
  way["power"~"substation|line|generator|pole|tower"](around:{radius},{latitude},{longitude});
  relation["power"~"substation|line|generator|pole|tower"](around:{radius},{latitude},{longitude});
);
out body;
"""

def check_grid_connectivity():
    # Send the request to the Overpass API
    response = requests.post(overpass_url, data={"data": overpass_query})
    
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        elements = data.get('elements', [])
        
        # Check if any infrastructure is found
        if elements:
            print("Grid connectivity is AVAILABLE.")
            return True
        else:
            print("Grid connectivity is NOT AVAILABLE.")
            return False
    else:
        print("Failed to retrieve data. Status Code:", response.status_code)
        return False

# Run the check
grid_connectivity = check_grid_connectivity()

if grid_connectivity:
    grid_availability = 1 # Grid is available
else:
    grid_availability = 0 # Grid is not available
