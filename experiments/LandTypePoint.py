import ee
import geemap
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display

# Initialize the Earth Engine API with your project ID
project_id = 'ai-hackathon2025'  # Replace with your actual project ID
ee.Initialize(project=project_id)

print("Earth Engine initialized successfully.")
# Run this once to authenticate
ee.Authenticate()

# Define the point of interest
lat, lon = 38.455713, 23.335872

point = ee.Geometry.Point(lon, lat)

# Choose the Land Cover Dataset (ESA WorldCover 2020 in this example)
dataset = ee.ImageCollection('ESA/WorldCover/v100').first()

# Get the land cover class at the specified point
land_cover = dataset.sample(point, scale=10).first().get('Map').getInfo()
print(f"Land Cover Class at Point ({lat}, {lon}): {land_cover}")

# Land Cover Classification Legend for ESA WorldCover
land_cover_classes = {
    10: 'Trees',                  # Areas with tall trees (>5m), including natural forests and plantations.
    20: 'Shrubland',              # Low woody plants (<5m), found in semi-arid regions like deserts and Mediterranean areas.
    30: 'Grassland',              # Dominated by grasses and herbs, used for grazing or natural vegetation cover.
    40: 'Cropland',               # Agricultural areas used for growing crops, including irrigated and rainfed fields.
    50: 'Built-up',               # Human settlements and infrastructure, including urban areas, roads, and industrial sites.
    60: 'Bare / Sparse vegetation', # Areas with minimal or no vegetation, like deserts, rocky terrains, and salt flats.
    70: 'Snow and Ice',           # Perennial snow cover or glaciers, typically in polar or high-altitude regions.
    80: 'Permanent Water Bodies', # Oceans, lakes, rivers, and reservoirs with water present throughout the year.
    90: 'Herbaceous Wetland',     # Wetlands with herbaceous vegetation, seasonally or permanently waterlogged.
    95: 'Mangroves',              # Coastal wetlands with salt-tolerant trees, found along tropical and subtropical shorelines.
    100: 'Moss and Lichen'        # Areas dominated by mosses and lichens, common in tundra or boreal environments.
}

# Display the land cover type
land_cover_type = land_cover_classes.get(land_cover, 'Unknown')
print(f"Land Cover Type: {land_cover_type}")


"""
from ipywidgets import HTML

# Create an HTML widget for the popup
popup_html = HTML(value=f"<b>Land Cover:</b> {land_cover_type}")

# Display the map with land cover layer
Map = geemap.Map(center=(lat, lon), zoom=12)
Map.addLayer(dataset, {}, 'ESA WorldCover 2020')
Map.add_marker(location=(lat, lon), popup=popup_html)  # Use the HTML widget here
Map.add_legend(builtin_legend='ESA_WorldCover')
display(Map)
"""