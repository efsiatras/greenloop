import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function geocodeLocation(location: string) {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Geocoding is only available in browser' };
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key not found in environment variables');
    return { success: false, error: 'Google Maps API key not configured' };
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      const formattedAddress = data.results[0].formatted_address;
      return { success: true, lat, lng, formattedAddress };
    } else {
      return { success: false, error: 'Location not found' };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return { success: false, error: 'Failed to geocode location' };
  }
}

