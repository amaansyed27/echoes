
import { useState, useEffect } from 'react';
import type { GeoLocation } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setError(null);
    };

    const errorHandler = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setError('Location access denied. Please enable it in your browser settings to use navigation features.');
      } else {
        setError('Unable to retrieve your location.');
      }
    };

    const watcherId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  return { location, error };
};
