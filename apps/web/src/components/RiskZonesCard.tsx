import React, { useEffect, useState } from 'react';
import { Cloud, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Zone {
  county: string;
  farms: Array<{ name: string; rainfall: number; riskLevel: string }>;
  maxRainfall: number;
  aggregateRisk: 'Normal' | 'Watch' | 'Act Now';
}

interface ZoneSummary {
  zones: Zone[];
  totalFarms: number;
  timestamp: string;
}

export function RiskZonesCard() {
  const [data, setData] = useState<ZoneSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get('/quick/zones/risk-summary');
      setData(result as ZoneSummary);
    } catch (err) {
      setError((err as Error).message || 'Failed to load risk zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="mt-4 space-y-3">
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
        <p className="text-red-900 font-semibold">Error loading risk zones</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.zones.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="text-gray-600">No farms registered yet.</p>
      </div>
    );
  }

  // Show high-risk zones first (Act Now, then Watch)
  const highlightedZones = data.zones.filter((z) => z.aggregateRisk !== 'Normal');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Rainfall Risk Zones</h3>
        </div>
        <button
          onClick={fetchZones}
          className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
        >
          Refresh
        </button>
      </div>

      {highlightedZones.length > 0 ? (
        <div className="space-y-3">
          {highlightedZones.map((zone) => (
            <div
              key={zone.county}
              className={`p-4 rounded-lg border ${
                zone.aggregateRisk === 'Act Now'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  {zone.aggregateRisk === 'Act Now' ? (
                    <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        zone.aggregateRisk === 'Act Now'
                          ? 'text-red-900'
                          : 'text-amber-900'
                      }`}
                    >
                      {zone.county} County
                    </p>
                    <p
                      className={`text-sm ${
                        zone.aggregateRisk === 'Act Now'
                          ? 'text-red-800'
                          : 'text-amber-800'
                      }`}
                    >
                      {zone.aggregateRisk} — {zone.maxRainfall.toFixed(1)} mm expected
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {zone.farms.length} farm{zone.farms.length !== 1 ? 's' : ''} affected
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Affected farms list */}
              <div className="mt-3 pl-7 space-y-1">
                {zone.farms.slice(0, 3).map((farm) => (
                  <div key={farm.name} className="text-xs">
                    <span className="text-gray-700">{farm.name}</span>
                    <span className="text-gray-600"> — {farm.rainfall.toFixed(1)}mm</span>
                  </div>
                ))}
                {zone.farms.length > 3 && (
                  <p className="text-xs text-gray-600">+ {zone.farms.length - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">All zones normal</p>
            <p className="text-sm text-green-800">No extreme rainfall expected in registered areas.</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <p className="text-xs text-gray-600 mt-4 pt-3 border-t border-gray-200">
        Monitoring {data.totalFarms} farm{data.totalFarms !== 1 ? 's' : ''} • Updated at{' '}
        {new Date(data.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
