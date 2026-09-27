import React, { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, DEFAULT_LOCATION } from '../config/mapbox';

/**
 * LocationPicker Component
 * Allows users to select a location on a map
 */
const LocationPicker = ({ initialLocation, onLocationSelect }) => {
  const [viewState, setViewState] = useState({
    latitude: initialLocation?.latitude || DEFAULT_LOCATION.latitude,
    longitude: initialLocation?.longitude || DEFAULT_LOCATION.longitude,
    zoom: DEFAULT_LOCATION.zoom
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.latitude || DEFAULT_LOCATION.latitude,
    longitude: initialLocation?.longitude || DEFAULT_LOCATION.longitude
  });

  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleMapClick = useCallback((event) => {
    const { lng, lat } = event.lngLat;
    setMarkerPosition({ latitude: lat, longitude: lng });
    
    // Reverse geocoding to get address
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        const addressText = data.features[0]?.place_name || 'Unknown location';
        setAddress(addressText);
        
        if (onLocationSelect) {
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: addressText
          });
        }
      })
      .catch(err => console.error('Geocoding error:', err));
  }, [onLocationSelect]);

  const handleSearchInputChange = async (value) => {
    setSearchInput(value);
    
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_TOKEN}&limit=5&autocomplete=true`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  };

  const selectSuggestion = (suggestion) => {
    const [lng, lat] = suggestion.center;
    const addressText = suggestion.place_name;
    
    setSearchInput(addressText);
    setViewState({ latitude: lat, longitude: lng, zoom: 14 });
    setMarkerPosition({ latitude: lat, longitude: lng });
    setAddress(addressText);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect({ latitude: lat, longitude: lng, address: addressText });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const addressText = data.features[0].place_name;
        
        setViewState({ latitude: lat, longitude: lng, zoom: 14 });
        setMarkerPosition({ latitude: lat, longitude: lng });
        setAddress(addressText);
        
        if (onLocationSelect) {
          onLocationSelect({ latitude: lat, longitude: lng, address: addressText });
        }
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Failed to search location');
    }
  };

  return (
    <div className="location-picker">
      {/* Address Search with Autocomplete */}
      <form onSubmit={handleSearch} className="address-search">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search address (e.g., 123 Main St, Boston, MA)"
            value={searchInput}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="search-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="suggestion-icon">📍</span>
                  <span className="suggestion-text">{suggestion.place_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="search-btn">
          🔍 Search
        </button>
      </form>
      
      <div className="map-container" style={{ height: '400px', width: '100%' }}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          
          {markerPosition && (
            <Marker
              latitude={markerPosition.latitude}
              longitude={markerPosition.longitude}
              anchor="bottom"
            >
              <div className="custom-marker">📍</div>
            </Marker>
          )}
        </Map>
      </div>
      
      {address && (
        <div className="selected-address">
          <strong>Selected Location:</strong>
          <p>{address}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
