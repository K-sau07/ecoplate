// Mapbox access token.
// Supplied at build time via VITE_MAPBOX_TOKEN — never hardcode it here, the
// value ends up in the published bundle and in git history.
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

// Boston coordinates (default location)
export const DEFAULT_LOCATION = {
  latitude: 42.3601,
  longitude: -71.0589,
  zoom: 12
};
