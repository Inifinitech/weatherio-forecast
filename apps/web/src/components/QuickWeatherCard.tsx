import React, { useState } from 'react';
import { MapPin, RefreshCw, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { apiClient } from '@/lib/api';

interface QuickWeatherData {
  lat: number;
  lon: number;
  weather: any;
  actions: any;
  timestamp: string;
}

export function QuickWeatherCard() {
  const { coords, error: geoError, loading: geoLoading, getLocation, clearLocation } = useGeolocation();
  const [data, setData] = useState<QuickWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetWeather = async () => {
    if (!coords) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.post('/quick/forecast', {
        lat: coords.lat,
        lon: coords.lon,
      });
      setData(result as QuickWeatherData);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (coords) {
      await handleGetWeather();
    }
  };

  const handleClose = () => {
    clearLocation();
    setData(null);
  };

  if (!coords) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Quick Weather Check</h3>
              <p className="text-sm text-gray-600 mt-1">Check real-time weather and AI recommendations for your current location</p>
            </div>
          </div>
        </div>

        {geoError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {geoError}
          </div>
        )}

        <button
          onClick={getLocation}
          disabled={geoLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
        >
          {geoLoading ? 'Getting location...' : 'Enable Location'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Weather at Your Location</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {coords.lat.toFixed(3)}°, {coords.lon.toFixed(3)}°
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Weather Data */}
      {data && (
        <div className="mt-4 space-y-4">
          {/* Current Conditions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600">Temperature</p>
              <p className="text-lg font-semibold text-gray-900">{data.weather.current.temp_c}°C</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600">Condition</p>
              <p className="text-lg font-semibold text-gray-900">{data.weather.current.condition}</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600">Rainfall Today</p>
              <p className="text-lg font-semibold text-gray-900">{data.weather.current.precip_mm} mm</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-600">Humidity</p>
              <p className="text-lg font-semibold text-gray-900">{data.weather.current.humidity}%</p>
            </div>
          </div>

          {/* Risk Badge & Reason */}
          <div className={`rounded-lg p-4 ${
            data.actions.riskLevel === 'Act Now'
              ? 'bg-red-100 border border-red-300'
              : data.actions.riskLevel === 'Watch'
              ? 'bg-amber-100 border border-amber-300'
              : 'bg-green-100 border border-green-300'
          }`}>
            <div className="flex items-start gap-2">
              {data.actions.riskLevel === 'Act Now' ? (
                <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              ) : data.actions.riskLevel === 'Watch' ? (
                <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${
                  data.actions.riskLevel === 'Act Now'
                    ? 'text-red-900'
                    : data.actions.riskLevel === 'Watch'
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}>
                  {data.actions.riskLevel}
                </p>
                <p className={`text-sm ${
                  data.actions.riskLevel === 'Act Now'
                    ? 'text-red-800'
                    : data.actions.riskLevel === 'Watch'
                    ? 'text-amber-800'
                    : 'text-green-800'
                }`}>
                  {data.actions.riskReason}
                </p>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          {data.actions.actions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</p>
              <ol className="space-y-2">
                {data.actions.actions.map((action: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {!data ? (
          <button
            onClick={handleGetWeather}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
          >
            {loading ? 'Fetching...' : 'Get Weather for My Location'}
          </button>
        ) : (
          <>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-medium text-sm"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
