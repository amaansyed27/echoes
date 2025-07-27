// Geocoding service for converting location names to coordinates
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

// Using OpenStreetMap Nominatim (free alternative to Google Geocoding)
export const geocodeLocation = async (
  locationName: string,
  city?: string
): Promise<GeocodingResult | null> => {
  try {
    const query = city ? `${locationName}, ${city}` : locationName;
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    const result = data[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Batch geocode multiple locations
export const geocodeMultipleLocations = async (
  locations: Array<{ name: string; city?: string }>
): Promise<Array<GeocodingResult | null>> => {
  const results: Array<GeocodingResult | null> = [];
  
  // Add small delay between requests to respect rate limits
  for (const location of locations) {
    const result = await geocodeLocation(location.name, location.city);
    results.push(result);
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Get city center coordinates
export const getCityCenter = async (cityName: string): Promise<GeocodingResult | null> => {
  try {
    const encodedCity = encodeURIComponent(cityName);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedCity}&limit=1&addressdetails=1&featuretype=city`
    );
    
    if (!response.ok) {
      throw new Error('City geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }
    
    const result = data[0];
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name
    };
  } catch (error) {
    console.error('City geocoding error:', error);
    return null;
  }
};
