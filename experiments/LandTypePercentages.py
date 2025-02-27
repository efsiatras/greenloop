import ee
import geemap
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import display

# Initialize the Earth Engine API with your project ID
project_id = 'ai-hackathon2025'  # Replace with your actual project ID
ee.Initialize(project=project_id)

print("Earth Engine initialized successfully.")

# Define the area of interest (Polygon instead of Point)
# Example: Rectangle around the original point
lat, lon = 37.074208, 21.824312

area_of_interest = ee.Geometry.Rectangle([lon - 0.0011, lat - 0.0011, lon + 0.0011, lat + 0.0011])

# Choose the Land Cover Dataset (ESA WorldCover 2020 in this example)
dataset = ee.ImageCollection('ESA/WorldCover/v100').first()

# Create a pixel area band
pixel_area = ee.Image.pixelArea().rename('Area')

# Add the pixel area band to the dataset (stack the bands)
land_cover_with_area = dataset.addBands(pixel_area)

# Reorder the bands: Area first, then Class
# Group input (class) must come AFTER the weighted input (area)
ordered_bands = land_cover_with_area.select(['Area', 'Map'])

# Group by land cover class and sum the area for each class
reducer = ee.Reducer.sum().group(groupField=1, groupName='class')
land_cover_area = ordered_bands.reduceRegion(
    reducer=reducer,
    geometry=area_of_interest,
    scale=10,
    maxPixels=1e9
)

# Extract the results
groups = land_cover_area.get('groups').getInfo()
area_by_class = {int(group['class']): group['sum'] for group in groups}

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

# Calculate total area and percentage for each category
total_area = sum(area_by_class.values())
print(f"\nTotal Area of the Selected Region: {total_area:.2f} m² ({total_area / 1e6:.2f} km²)")
percentage_by_class = {land_cover_classes[k]: (v / total_area) * 100 for k, v in area_by_class.items()}

# Display the results
print("\nLand Cover Percentage in the Area of Interest:")
for land_cover, percentage in percentage_by_class.items():
    print(f"{land_cover}: {percentage:.2f}%")


"""
# Visualize the results as a Pie Chart
labels = percentage_by_class.keys()
sizes = percentage_by_class.values()

plt.figure(figsize=(10, 7))
plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
plt.title('Land Cover Composition')
plt.show()
"""