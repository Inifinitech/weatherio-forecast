import { useState, useCallback } from 'react';

export interface GeolocationCoords {
  lat: number;
  lon: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to get location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setCoords(null);
    setError(null);
  }, []);

  return { coords, error, loading, getLocation, clearLocation };
}
