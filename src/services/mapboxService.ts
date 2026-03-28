// Mapbox Geocoding & Search Service
// Docs: https://docs.mapbox.com/api/search/geocoding/
// Docs: https://docs.mapbox.com/api/search/search-box/

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ||
  process.env.MAPBOX_ACCESS_TOKEN ||
  "";

const GEOCODING_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const SEARCH_BOX_API = "https://api.mapbox.com/search/searchbox/v1";
export type MapboxSuggestion = {
  id: string;
  name: string;
  full_address: string;
  place_formatted?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  context?: {
    country?: { name: string; country_code: string };
    region?: { name: string; region_code: string };
    postcode?: { name: string };
    place?: { name: string };
    locality?: { name: string };
    neighborhood?: { name: string };
    address?: { street_name: string; address_number: string };
  };
};

export type MapboxPlace = {
  name: string;
  full_address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  street?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
};

/**
 * Search for address suggestions using Mapbox Geocoding API
 * @param query - Search query string
 * @param options - Search options (proximity, country, language, etc.)
 * @returns Array of suggestions
 */
export async function searchAddressSuggestions(
  query: string,
  options?: {
    proximity?: { longitude: number; latitude: number };
    country?: string; // ISO 3166 alpha-2 country code (e.g., 'py', 'ar', 'br')
    language?: string; // BCP 47 language code (e.g., 'es', 'en')
    limit?: number;
  },
): Promise<MapboxSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn("Mapbox access token is missing");
    return [];
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      language: options?.language || "es",
      limit: String(options?.limit || 5),
      types: "address,place,locality,neighborhood",
      autocomplete: "true",
    });

    // Add proximity (bias results near a location)
    if (options?.proximity) {
      params.append(
        "proximity",
        `${options.proximity.longitude},${options.proximity.latitude}`,
      );
    }

    // Add country filter
    if (options?.country) {
      params.append("country", options.country.toLowerCase());
    }

    const url = `${GEOCODING_API}/${encodeURIComponent(
      query.trim(),
    )}.json?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    return data.features.map((feature: any) => {
      const context = feature.context || [];

      const getContext = (type: string) => {
        const item = context.find((c: any) => c.id.startsWith(type));
        return item ? item.text : undefined;
      };

      return {
        id: feature.id,
        name: feature.text || feature.place_name,
        full_address: feature.place_name,
        place_formatted: feature.place_name,
        coordinates: {
          latitude: feature.center[1],
          longitude: feature.center[0],
        },
        context: {
          country: context.find((c: any) => c.id.startsWith("country"))
            ? {
                name: getContext("country") || "",
                country_code:
                  context
                    .find((c: any) => c.id.startsWith("country"))
                    ?.short_code?.toUpperCase() || "",
              }
            : undefined,
          region: getContext("region")
            ? { name: getContext("region") || "", region_code: "" }
            : undefined,
          postcode: getContext("postcode")
            ? { name: getContext("postcode") || "" }
            : undefined,
          place: getContext("place")
            ? { name: getContext("place") || "" }
            : undefined,
          locality: getContext("locality")
            ? { name: getContext("locality") || "" }
            : undefined,
          neighborhood: getContext("neighborhood")
            ? { name: getContext("neighborhood") || "" }
            : undefined,
          address:
            feature.address && feature.text
              ? {
                  street_name: feature.text,
                  address_number: feature.address,
                }
              : undefined,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching Mapbox suggestions:", error);
    return [];
  }
}

/**
 * Reverse geocoding: Get address from coordinates
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Address information
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<MapboxPlace | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn("Mapbox access token is missing");
    return null;
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      language: "es",
      types: "address,place,locality,neighborhood",
    });

    const url = `${GEOCODING_API}/${longitude},${latitude}.json?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const context = feature.context || [];

    // Extract context information
    const getContext = (type: string) => {
      const item = context.find((c: any) => c.id.startsWith(type));
      return item ? item.text : undefined;
    };

    return {
      name: feature.text || feature.place_name,
      full_address: feature.place_name,
      coordinates: {
        latitude: feature.center[1],
        longitude: feature.center[0],
      },
      street: feature.address
        ? `${feature.text} ${feature.address}`
        : feature.text,
      city: getContext("place") || getContext("locality"),
      region: getContext("region"),
      postcode: getContext("postcode"),
      country: getContext("country"),
    };
  } catch (error) {
    console.error("Error in Mapbox reverse geocoding:", error);
    return null;
  }
}

/**
 * Forward geocoding: Get coordinates from address text
 * @param address - Address string
 * @param options - Geocoding options
 * @returns Place information with coordinates
 */
export async function forwardGeocode(
  address: string,
  options?: {
    country?: string;
    proximity?: { longitude: number; latitude: number };
  },
): Promise<MapboxPlace | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn("Mapbox access token is missing");
    return null;
  }

  try {
    const params = new URLSearchParams({
      access_token: MAPBOX_ACCESS_TOKEN,
      language: "es",
      limit: "1",
    });

    if (options?.country) {
      params.append("country", options.country.toLowerCase());
    }

    if (options?.proximity) {
      params.append(
        "proximity",
        `${options.proximity.longitude},${options.proximity.latitude}`,
      );
    }

    const url = `${GEOCODING_API}/${encodeURIComponent(
      address,
    )}.json?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const context = feature.context || [];

    const getContext = (type: string) => {
      const item = context.find((c: any) => c.id.startsWith(type));
      return item ? item.text : undefined;
    };

    return {
      name: feature.text || feature.place_name,
      full_address: feature.place_name,
      coordinates: {
        latitude: feature.center[1],
        longitude: feature.center[0],
      },
      street: feature.address
        ? `${feature.text} ${feature.address}`
        : feature.text,
      city: getContext("place") || getContext("locality"),
      region: getContext("region"),
      postcode: getContext("postcode"),
      country: getContext("country"),
    };
  } catch (error) {
    console.error("Error in Mapbox forward geocoding:", error);
    return null;
  }
}

export default {
  searchAddressSuggestions,
  reverseGeocode,
  forwardGeocode,
};
