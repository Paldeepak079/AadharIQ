import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Language, AadhaarData } from '../types';
import { INDIA_STATES_DATA } from '../data/realData';
import { MapPin, ArrowLeft, ZoomIn, Globe, Layers, Activity } from 'lucide-react';
import Plot from 'react-plotly.js';
import { API_BASE_URL } from '../src/config';

interface DistrictData {
  lat: number;
  lng: number;
  offices: number;
  enrollments: number;
  updates: number;
  child_enrollments: number;
  density: number;
  anomaly_score: number;
}

interface AllDistrictData {
  [state: string]: {
    [district: string]: DistrictData;
  };
}

interface StateCentroid {
  lat: number;
  lng: number;
  bounds: {
    latMin: number;
    latMax: number;
    lngMin: number;
    lngMax: number;
  };
  zoomScale: number;
}

interface StateCoordinates {
  [state: string]: StateCentroid;
}

interface MapProps {
  lang: Language;
  onSelect: (state: string) => void;
}

const GeospatialMap: React.FC<MapProps> = ({ lang, onSelect }) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'states' | 'districts'>('states');
  const [districtData, setDistrictData] = useState<AllDistrictData>({});
  const [stateCoordinates, setStateCoordinates] = useState<StateCoordinates>({});
  const [currentStateForDistricts, setCurrentStateForDistricts] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'activity' | 'saturation'>('activity');
  const [saturationData, setSaturationData] = useState<any[]>([]);

  // Load district data and state centroids
  useEffect(() => {
    // Load state centroids
    fetch('/assets/state_centroids.json')
      .then(res => res.json())
      .then(setStateCoordinates)
      .catch(err => console.error('Failed to load state centroids:', err));

    // Load district data
    fetch('/assets/district_data.json')
      .then(res => res.json())
      .then(setDistrictData)
      .catch(err => console.error('Failed to load district data:', err));

    // Load saturation data
    fetch(`${API_BASE_URL}/api/ml/saturation`)
      .then(res => res.json())
      .then(setSaturationData)
      .catch(err => console.error('Failed to load saturation data:', err));
  }, []);

  const handleBackToStates = () => {
    setViewMode('states');
    setCurrentStateForDistricts(null);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const stateMapData = INDIA_STATES_DATA.map(state => {
    const coords = stateCoordinates[state.state.toUpperCase()] || { lat: 22, lng: 82, bounds: { latMin: 0, latMax: 0, lngMin: 0, lngMax: 0 }, zoomScale: 2 };
    return {
      ...state,
      lat: coords.lat,
      lng: coords.lng
    };
  });

  const districtMapData = currentStateForDistricts && districtData[currentStateForDistricts.toUpperCase()]
    ? Object.entries(districtData[currentStateForDistricts.toUpperCase()]).map(([name, data]: [string, any]) => ({
      name,
      lat: (data as DistrictData).lat,
      lng: (data as DistrictData).lng,
      offices: (data as DistrictData).offices,
      enrollments: (data as DistrictData).enrollments,
      updates: (data as DistrictData).updates,
      child_enrollments: (data as DistrictData).child_enrollments,
      density: (data as DistrictData).density,
      anomaly_score: (data as DistrictData).anomaly_score
    }))
    : [];

  const getStateTrace = () => {
    if (mapMode === 'saturation') {
      return {
        type: 'scattergeo',
        lon: stateMapData.map(s => s.lng),
        lat: stateMapData.map(s => s.lat),
        text: stateMapData.map(s => s.state.split(' ')[0]),
        customdata: stateMapData.map(s => {
          const sat = saturationData.find(sd => sd.state.toLowerCase() === s.state.toLowerCase());
          return {
            fullName: s.state,
            saturation: sat?.saturation || 95,
            gap: sat?.gap || 5,
            status: sat?.status || 'HEALTHY',
            pop: sat?.population_target || 'N/A'
          };
        }),
        marker: {
          size: stateMapData.map(s => 25),
          color: stateMapData.map(s => {
            const sat = saturationData.find(sd => sd.state.toLowerCase() === s.state.toLowerCase());
            if (!sat) return 'rgba(34, 197, 94, 0.9)';
            if (sat.gap > 10) return 'rgba(239, 68, 68, 0.9)'; // Critical Gap
            if (sat.gap > 5) return 'rgba(249, 115, 22, 0.9)'; // Mid Gap
            return 'rgba(34, 197, 94, 0.9)'; // Saturated
          }),
          line: { color: '#fff', width: 1 },
          opacity: 0.9
        },
        mode: 'markers+text',
        textposition: 'middle center',
        textfont: { size: 9, color: '#000', weight: 900 },
        hovertemplate: '<b style="font-size:14px; color:#ff9933">%{customdata.fullName}</b><br><br>' +
          '<span style="color:#94a3b8">Saturation:</span> <b style="color:#22c55e">%{customdata.saturation}%</b><br>' +
          '<span style="color:#94a3b8">Gap (Dark Zone):</span> <b style="color:#ef4444">%{customdata.gap}%</b><br>' +
          '<span style="color:#94a3b8">Population Target:</span> <b style="color:#fff">%{customdata.pop}</b><br>' +
          '<span style="color:#94a3b8">Status:</span> <b style="color:#f97316">%{customdata.status}</b>' +
          '<extra></extra>'
      };
    }

    return {
      type: 'scattergeo',
      lon: stateMapData.map(s => s.lng),
      lat: stateMapData.map(s => s.lat),
      text: stateMapData.map(s => s.state.split(' ')[0]),
      customdata: stateMapData.map(s => ({
        fullName: s.state,
        enrollments: s.enrolments,
        updates: s.updates,
        childEnrollments: s.childEnrolments,
        anomalyScore: s.anomalyScore
      })),
      marker: {
        size: stateMapData.map(s => Math.sqrt(s.enrolments) / 40),
        color: stateMapData.map(s => s.anomalyScore > 0.5 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(249, 115, 22, 0.9)'),
        line: {
          color: stateMapData.map(s => s.anomalyScore > 0.5 ? '#fee2e2' : '#ffedd5'),
          width: 2
        },
        sizemode: 'diameter',
        opacity: 0.85
      },
      mode: 'markers+text',
      textposition: 'middle center',
      textfont: {
        size: 9,
        color: '#ffffff',
        family: 'Inter, sans-serif',
        weight: 700
      },
      hovertemplate: '<b style="font-size:14px; color:#ff9933">%{customdata.fullName}</b><br><br>' +
        '<span style="color:#94a3b8">Enrollments:</span> <b style="color:#fff">%{customdata.enrollments:,.0f}</b><br>' +
        '<span style="color:#94a3b8">Updates:</span> <b style="color:#60a5fa">%{customdata.updates:,.0f}</b><br>' +
        '<span style="color:#94a3b8">Child Enrollments:</span> <b style="color:#22c55e">%{customdata.childEnrollments:,.0f}</b><br>' +
        '<span style="color:#94a3b8">Anomaly Score:</span> <b style="color:#f97316">%{customdata.anomalyScore:.1%}</b>' +
        '<extra></extra>'
    };
  };

  const getDistrictTrace = () => ({
    type: 'scattergeo',
    lon: districtMapData.map(d => d.lng),
    lat: districtMapData.map(d => d.lat),
    text: districtMapData.map(d => d.name.substring(0, 8)),
    customdata: districtMapData.map(d => ({
      fullName: d.name,
      enrollments: d.enrollments,
      updates: d.updates,
      childEnrollments: d.child_enrollments,
      anomalyScore: d.anomaly_score,
      density: d.density,
      offices: d.offices
    })),
    marker: {
      size: districtMapData.map(d => Math.min(Math.max(d.density * 0.8, 8), 30)),
      color: districtMapData.map(d => {
        if (d.density > 50) return 'rgba(239, 68, 68, 0.9)';
        if (d.density > 20) return 'rgba(249, 115, 22, 0.9)';
        if (d.density > 10) return 'rgba(34, 197, 94, 0.9)';
        return 'rgba(59, 130, 246, 0.9)';
      }),
      line: {
        color: '#ffffff',
        width: 2
      },
      opacity: 0.85
    },
    mode: 'markers',
    hovertemplate: '<b style="font-size:14px; color:#ff9933">%{customdata.fullName}</b><br><br>' +
      '<span style="color:#94a3b8">Enrollments:</span> <b style="color:#fff">%{customdata.enrollments:,.0f}</b><br>' +
      '<span style="color:#94a3b8">Updates:</span> <b style="color:#60a5fa">%{customdata.updates:,.0f}</b><br>' +
      '<span style="color:#94a3b8">Child Enrollments:</span> <b style="color:#22c55e">%{customdata.childEnrollments:,.0f}</b><br>' +
      '<span style="color:#94a3b8">Density:</span> <b style="color:#f97316">%{customdata.density:.1f}/office</b><br>' +
      '<span style="color:#94a3b8">Offices:</span> <b style="color:#a78bfa">%{customdata.offices}</b><br>' +
      '<span style="color:#94a3b8">Anomaly Score:</span> <b style="color:#fb923c">%{customdata.anomalyScore:.1%}</b>' +
      '<extra></extra>'
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      {/* Premium Header */}
      <div className="glass-panel p-6 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-orange-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {viewMode === 'districts' && (
              <button
                onClick={handleBackToStates}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-orange-500/30 rounded-xl text-white text-sm font-bold hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to States
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30">
                <Globe className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 bg-clip-text text-transparent">
                  {viewMode === 'states' ? 'Geographic Distribution' : currentStateForDistricts}
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {viewMode === 'states' ? 'State-Level Enrollment Visualization' : 'District-Level Granularity'}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Legend & Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            {viewMode === 'states' && (
              <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
                <button
                  onClick={() => setMapMode('activity')}
                  className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-2 ${mapMode === 'activity' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Activity className="w-3 h-3" />
                  ACTIVITY
                </button>
                <button
                  onClick={() => setMapMode('saturation')}
                  className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center gap-2 ${mapMode === 'saturation' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Layers className="w-3 h-3" />
                  SATURATION GAP
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {viewMode === 'states' ? (
                mapMode === 'activity' ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-red-500/30 rounded-xl">
                      <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50" />
                      <span className="text-xs text-gray-300 font-bold">High Anomaly</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-orange-500/30 rounded-xl">
                      <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50" />
                      <span className="text-xs text-gray-300 font-bold">Normal</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-red-500/30 rounded-xl">
                      <div className="w-3 h-3 bg-red-600 rounded-full" />
                      <span className="text-xs text-gray-300 font-bold">Dark Zone (&gt;10% Gap)</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-green-500/30 rounded-xl">
                      <div className="w-3 h-3 bg-green-600 rounded-full" />
                      <span className="text-xs text-gray-300 font-bold">Saturated (&lt;5% Gap)</span>
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-red-500/30 rounded-lg">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                    <span className="text-[10px] text-gray-300 font-bold">&gt;50</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-orange-500/30 rounded-lg">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
                    <span className="text-[10px] text-gray-300 font-bold">20-50</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-green-500/30 rounded-lg">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                    <span className="text-[10px] text-gray-300 font-bold">10-20</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 border border-blue-500/30 rounded-lg">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                    <span className="text-[10px] text-gray-300 font-bold">&lt;10</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Premium Map Container */}
        <div className="glass-panel p-1 rounded-3xl border border-orange-500/10 bg-gradient-to-br from-gray-900/50 via-black/30 to-gray-900/50 shadow-2xl shadow-orange-500/5 overflow-hidden relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative bg-black/40 rounded-3xl p-4 backdrop-blur-sm">
            <Plot
              data={[viewMode === 'states' ? getStateTrace() : getDistrictTrace()]}
              layout={{
                geo: {
                  scope: 'asia',
                  center: viewMode === 'districts' && currentStateForDistricts && stateCoordinates[currentStateForDistricts.toUpperCase()]
                    ? { lat: stateCoordinates[currentStateForDistricts.toUpperCase()].lat, lon: stateCoordinates[currentStateForDistricts.toUpperCase()].lng }
                    : { lat: 22, lon: 82 },
                  projection: {
                    type: 'mercator',
                    scale: viewMode === 'districts' && currentStateForDistricts && stateCoordinates[currentStateForDistricts.toUpperCase()]
                      ? stateCoordinates[currentStateForDistricts.toUpperCase()].zoomScale
                      : 2.2
                  },
                  showland: true,
                  landcolor: 'rgb(17, 24, 39)',
                  showlakes: true,
                  lakecolor: 'rgb(15, 23, 42)',
                  showcountries: true,
                  countrycolor: 'rgb(249, 115, 22, 0.5)',
                  countrywidth: 3,
                  subunitcolor: 'rgb(75, 85, 99, 0.3)',
                  subunitwidth: 1,
                  bgcolor: 'rgba(0,0,0,0)',
                  lonaxis: {
                    showgrid: false,
                    gridcolor: 'rgb(55, 65, 81, 0.2)'
                  },
                  lataxis: {
                    showgrid: false,
                    gridcolor: 'rgb(55, 65, 81, 0.2)'
                  }
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                margin: { l: 0, r: 0, b: 0, t: 0 },
                height: 650,
                autosize: true,
                showlegend: false,
                hovermode: 'closest',
                hoverlabel: {
                  bgcolor: 'rgba(17, 24, 39, 0.98)',
                  bordercolor: 'rgba(249, 115, 22, 0.3)',
                  font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#ffffff'
                  }
                }
              }}
              config={{
                displayModeBar: false,
                responsive: true
              }}
              onClick={(event: any) => {
                if (viewMode === 'states' && event.points && event.points[0]) {
                  const stateName = event.points[0].customdata.fullName;
                  const normalizedStateName = stateName.toUpperCase();

                  if (districtData[normalizedStateName]) {
                    setCurrentStateForDistricts(stateName);
                    setViewMode('districts');
                  }
                }
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Premium Info Panel for Districts */}
        {viewMode === 'districts' && (
          <div className="glass-panel p-6 rounded-2xl border border-orange-500/10 bg-gradient-to-br from-gray-900/50 to-gray-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
              <p className="text-sm text-gray-300 uppercase font-bold tracking-wider">Enrollment Density Scale</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50" />
                <div>
                  <span className="text-xs text-gray-400">Low Density</span>
                  <p className="text-white font-bold text-sm">&lt;10/office</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-green-500/20 rounded-xl hover:border-green-500/50 transition-colors">
                <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50" />
                <div>
                  <span className="text-xs text-gray-400">Medium</span>
                  <p className="text-white font-bold text-sm">10-20/office</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-colors">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/50" />
                <div>
                  <span className="text-xs text-gray-400">High</span>
                  <p className="text-white font-bold text-sm">20-50/office</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-red-500/20 rounded-xl hover:border-red-500/50 transition-colors">
                <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/50" />
                <div>
                  <span className="text-xs text-gray-400">Very High</span>
                  <p className="text-white font-bold text-sm">&gt;50/office</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeospatialMap;
