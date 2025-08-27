'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { MapPin, Loader2, Navigation, AlertTriangle, Map, Globe } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationCoords } from '@/types/onboarding/common';

export interface GoogleMapsLocationProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (coords: LocationCoords) => void;
  onAddressChange?: (address: string) => void;
  initialCoords?: LocationCoords;
  initialAddress?: string;
  className?: string;
  // New prop to force fallback mode
  useFallback?: boolean;
}

// Google Maps configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  version: 'weekly',
  libraries: ['places', 'geometry'] as any,
};

// Free geocoding using Nominatim (no API key required)
const geocodeWithNominatim = async (address: string): Promise<LocationCoords | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data[0]) {
      const { lat, lon, display_name } = data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        shareableLink: `https://maps.google.com/?q=${lat},${lon}`
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
};

// Reverse geocode using Nominatim
const reverseGeocodeWithNominatim = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data?.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};

// Fallback Component (No API Key Required)
const LocationFallback: React.FC<GoogleMapsLocationProps> = ({
  label = 'Location',
  placeholder = 'Search for a location or enter coordinates',
  required = false,
  disabled = false,
  onChange,
  onAddressChange,
  initialCoords,
  initialAddress = '',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [currentCoords, setCurrentCoords] = useState<LocationCoords | null>(initialCoords || null);
  const [isSearching, setIsSearching] = useState(false);
  const [manualCoords, setManualCoords] = useState({
    lat: initialCoords?.lat?.toString() || '',
    lng: initialCoords?.lng?.toString() || ''
  });
  const [showManualInput, setShowManualInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Default center (Riyadh, Saudi Arabia)
  const defaultCenter = { lat: 24.7136, lng: 46.6753 };
  const mapCenter = currentCoords || defaultCenter;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setLocationError(null);
    try {
      const coords = await geocodeWithNominatim(searchQuery);
      if (coords) {
        setCurrentCoords(coords);
        onChange?.(coords);
        onAddressChange?.(searchQuery);
        setManualCoords({
          lat: coords.lat.toString(),
          lng: coords.lng.toString()
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualCoords = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocationError(null);
      const coords: LocationCoords = {
        lat,
        lng,
        shareableLink: `https://maps.google.com/?q=${lat},${lng}`
      };
      
      setCurrentCoords(coords);
      onChange?.(coords);
      
      // Try to get address
      reverseGeocodeWithNominatim(lat, lng).then(address => {
        if (address) {
          setSearchQuery(address);
          onAddressChange?.(address);
        }
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsSearching(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: LocationCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          shareableLink: `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`
        };

        setCurrentCoords(coords);
        onChange?.(coords);
        setManualCoords({
          lat: coords.lat.toString(),
          lng: coords.lng.toString()
        });

        // Get address
        const address = await reverseGeocodeWithNominatim(coords.lat, coords.lng);
        if (address) {
          setSearchQuery(address);
          onAddressChange?.(address);
        }

        setIsSearching(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please allow location access to use this feature';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Your location is currently unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again';
            break;
          default:
            errorMessage = 'Unable to get your location. Please try again';
            break;
        }
        
        setLocationError(errorMessage);
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle map click
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isDragging) return;

    setLocationError(null);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (simplified conversion)
    // This is a basic simulation - in a real map this would use proper projection
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // Simulate a lat/lng area around the center point
    const latRange = 0.1; // ~11km range
    const lngRange = 0.1;
    
    const lat = mapCenter.lat + ((0.5 - y / mapHeight) * latRange);
    const lng = mapCenter.lng + ((x / mapWidth - 0.5) * lngRange);

    const coords: LocationCoords = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      shareableLink: `https://maps.google.com/?q=${lat},${lng}`
    };

    setCurrentCoords(coords);
    onChange?.(coords);
    setManualCoords({
      lat: coords.lat.toString(),
      lng: coords.lng.toString()
    });

    // Try to get address
    reverseGeocodeWithNominatim(coords.lat, coords.lng).then(address => {
      if (address) {
        setSearchQuery(address);
        onAddressChange?.(address);
      }
    });
  };

  // Handle marker drag
  const handleMarkerMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !mapContainerRef.current || disabled) return;

      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Keep within bounds
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      const mapWidth = rect.width;
      const mapHeight = rect.height;
      const latRange = 0.1;
      const lngRange = 0.1;
      
      const lat = mapCenter.lat + ((0.5 - y / mapHeight) * latRange);
      const lng = mapCenter.lng + ((x / mapWidth - 0.5) * lngRange);

      const coords: LocationCoords = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        shareableLink: `https://maps.google.com/?q=${lat},${lng}`
      };

      setCurrentCoords(coords);
      onChange?.(coords);
      setManualCoords({
        lat: coords.lat.toString(),
        lng: coords.lng.toString()
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Get address when drag ends
        if (currentCoords) {
          reverseGeocodeWithNominatim(currentCoords.lat, currentCoords.lng).then(address => {
            if (address) {
              setSearchQuery(address);
              onAddressChange?.(address);
            }
          });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, mapCenter, disabled, onChange, onAddressChange, currentCoords]);

  // Calculate marker position
  const getMarkerPosition = () => {
    if (!currentCoords) return { top: '50%', left: '50%' };

    const latDiff = currentCoords.lat - mapCenter.lat;
    const lngDiff = currentCoords.lng - mapCenter.lng;
    
    const latRange = 0.1;
    const lngRange = 0.1;
    
    const top = 50 - (latDiff / latRange) * 100;
    const left = 50 + (lngDiff / lngRange) * 100;
    
    return { 
      top: `${Math.max(5, Math.min(95, top))}%`, 
      left: `${Math.max(5, Math.min(95, left))}%` 
    };
  };

  const markerPosition = getMarkerPosition();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Map className="h-4 w-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSearch}
            disabled={disabled || isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={disabled || isSearching}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Location Error Message */}
        {locationError && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{locationError}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-xs"
          >
            {showManualInput ? 'Hide' : 'Enter coordinates manually'}
          </Button>
        </div>

        {showManualInput && (
          <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
            <Label className="text-sm font-medium">Manual Coordinates</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat" className="text-xs">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="24.7136"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lng" className="text-xs">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={manualCoords.lng}
                  onChange={(e) => setManualCoords(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="46.6753"
                  className="text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleManualCoords}
              size="sm"
              className="w-full"
              disabled={!manualCoords.lat || !manualCoords.lng}
            >
              Set Location
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="relative">
        <div 
          ref={mapContainerRef}
          className="h-80 w-full border-2 border-gray-400 rounded-lg relative overflow-hidden cursor-crosshair select-none bg-green-100"
          onClick={handleMapClick}
        >
          {/* Simple Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
            {/* Grid pattern */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-l border-gray-300/50"
                  style={{ left: `${(i + 1) * 5}%` }}
                />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-t border-gray-300/50"
                  style={{ top: `${(i + 1) * 6.25}%` }}
                />
              ))}
            </div>
          </div>

          {/* Map Labels */}
          <div className="absolute top-3 left-3 bg-white border border-gray-300 px-2 py-1 rounded shadow-sm">
            <div className="text-xs font-medium text-gray-700">📍 Interactive Map</div>
            <div className="text-xs text-gray-500">Click anywhere to set location</div>
          </div>

          <div className="absolute top-3 right-3 bg-white border border-gray-300 px-2 py-1 rounded shadow-sm">
            <div className="text-xs text-gray-600">
              {currentCoords ? (
                <span className="text-green-600 font-medium">✅ Location Set</span>
              ) : (
                <span className="text-gray-500">⚪ No Location</span>
              )}
            </div>
          </div>

          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-8 h-8 border-2 border-gray-400 rounded-full bg-white/50 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>

          {/* Marker */}
          {currentCoords && (
            <div
              className={`absolute transform -translate-x-1/2 -translate-y-full z-20 ${
                isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
              } transition-all duration-200`}
              style={markerPosition}
              onMouseDown={handleMarkerMouseDown}
            >
              <div className="relative flex flex-col items-center">
                {/* Pin */}
                <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {/* Pin tail */}
                <div className="w-1 h-4 bg-red-500 -mt-1"></div>
                {/* Pulse effect */}
                <div className="absolute top-0 w-6 h-6 bg-red-500/30 rounded-full animate-ping"></div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
            {currentCoords ? (
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs shadow-lg">
                {isDragging ? '↔️ Dragging...' : '🖱️ Drag pin to adjust'}
              </div>
            ) : (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs shadow-lg">
                👆 Click anywhere on the map
              </div>
            )}
          </div>

          {/* Corner indicators */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Current Location Info */}
      {currentCoords && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900">Selected Location</p>
              <p className="text-xs text-green-700">
                Latitude: {currentCoords.lat.toFixed(6)}, Longitude: {currentCoords.lng.toFixed(6)}
              </p>
              {searchQuery && (
                <p className="text-xs text-green-600 truncate mt-1">{searchQuery}</p>
              )}
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => window.open(currentCoords.shareableLink, '_blank')}
              className="text-green-600 hover:text-green-800 p-0 h-auto"
            >
              View in Google Maps
            </Button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p><strong>Interactive Mode:</strong> Click anywhere on the map or drag the pin to select location</p>
            <p>Using OpenStreetMap geocoding (no API key required)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for Google Maps integration
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        if (GOOGLE_MAPS_CONFIG.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
        }

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.apiKey,
          version: GOOGLE_MAPS_CONFIG.version,
          libraries: GOOGLE_MAPS_CONFIG.libraries,
        });

        await loader.load();
        setGoogle(window.google);
        setIsLoaded(true);
      } catch (err: any) {
        setError(err.message || 'Failed to load Google Maps');
        console.error('Google Maps loading error:', err);
      }
    };

    if (!isLoaded && !error) {
      loadGoogleMaps();
    }
  }, [isLoaded, error]);

  return { isLoaded, error, google };
};

export const GoogleMapsLocation: React.FC<GoogleMapsLocationProps> = (props) => {
  const { useFallback = false } = props;
  
  // Check if we should use fallback before trying to load Google Maps
  const shouldUseFallback = useFallback || 
    GOOGLE_MAPS_CONFIG.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY';

  // Only try to load Google Maps if we're not using fallback
  const { isLoaded, error: mapsError } = shouldUseFallback 
    ? { isLoaded: false, error: null }
    : useGoogleMaps();

  if (shouldUseFallback) {
    return <LocationFallback {...props} />;
  }

  // If Google Maps failed to load, use fallback
  if (mapsError) {
    return <LocationFallback {...props} />;
  }

  // If Google Maps is still loading, show fallback temporarily
  if (!isLoaded) {
    return <LocationFallback {...props} />;
  }

  // Full Google Maps implementation (your existing code would go here)
  // For now, return fallback since we're focusing on no-API-key solution
  return <LocationFallback {...props} />;
};

export default GoogleMapsLocation;
