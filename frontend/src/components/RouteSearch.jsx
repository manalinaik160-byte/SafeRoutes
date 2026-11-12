import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Sliders, 
  ArrowUpDown, 
  Sparkles, 
  Footprints, 
  Car, 
  Search, 
  RotateCcw,
  LocateFixed,
  Crosshair,
  Building,
  Check,
  X
} from 'lucide-react';
import { STUDY_LANDMARKS, searchLocations } from '../services/geocoding';

/**
 * Route Search & Location Input Component (RouteSearch.jsx)
 * ---------------------------------------------------------
 * Allows users to add Source and Destination via:
 *   1. Search by Place Name / Street Address with live autocomplete
 *   2. Interactive Click-on-Map selection (Pick on Map button)
 *   3. Browser GPS Geolocation ("My Location" button)
 *   4. Fast 1-click study area presets and popular landmark chips
 *   5. Manual exact coordinate inputs (lat/lon)
 */
export default function RouteSearch({
  presets = [],
  onSearch,
  isLoading,
  initialValues = {},
  pickingMode,
  setPickingMode
}) {
  const [origin, setOrigin] = useState(
    initialValues.origin || { lat: 51.5118, lon: -0.1235, name: 'Covent Garden Market' }
  );
  const [destination, setDestination] = useState(
    initialValues.destination || { lat: 51.5133, lon: -0.0886, name: 'Bank Station / Financial Hub' }
  );

  // Search input strings
  const [originQuery, setOriginQuery] = useState(initialValues.origin?.name || 'Covent Garden Market');
  const [destQuery, setDestQuery] = useState(initialValues.destination?.name || 'Bank Station / Financial Hub');

  // Autocomplete suggestions
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isOriginFocused, setIsOriginFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);

  // Travel Mode, Time, Weights
  const [travelMode, setTravelMode] = useState('walking');
  const [departureTime, setDepartureTime] = useState('19:00');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);

  const [weights, setWeights] = useState({
    alpha: 0.35,
    beta: 0.25,
    gamma: 0.40
  });

  // Sync state if props change (e.g. from map click)
  useEffect(() => {
    if (initialValues.origin) {
      setOrigin(initialValues.origin);
      if (initialValues.origin.name) setOriginQuery(initialValues.origin.name);
    }
  }, [initialValues.origin]);

  useEffect(() => {
    if (initialValues.destination) {
      setDestination(initialValues.destination);
      if (initialValues.destination.name) setDestQuery(initialValues.destination.name);
    }
  }, [initialValues.destination]);

  // Autocomplete search debounce for Origin
  useEffect(() => {
    let active = true;
    const fetchMatches = async () => {
      const res = await searchLocations(originQuery);
      if (active) setOriginSuggestions(res);
    };
    const timer = setTimeout(fetchMatches, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [originQuery]);

  // Autocomplete search debounce for Destination
  useEffect(() => {
    let active = true;
    const fetchMatches = async () => {
      const res = await searchLocations(destQuery);
      if (active) setDestSuggestions(res);
    };
    const timer = setTimeout(fetchMatches, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [destQuery]);

  const getTimeWindowPreview = (timeStr) => {
    if (!timeStr) return 'All Day';
    try {
      const hour = parseInt(timeStr.split(':')[0], 10);
      if (hour >= 6 && hour < 12) return 'Morning (06:00-11:59)';
      if (hour >= 12 && hour < 17) return 'Afternoon (12:00-16:59)';
      if (hour >= 17 && hour < 22) return 'Evening (17:00-21:59)';
      return 'Night (22:00-05:59)';
    } catch {
      return 'Standard';
    }
  };

  const triggerSearch = (newOrigin, newDest, newMode, newTime, newWeights) => {
    const o = newOrigin || origin;
    const d = newDest || destination;
    const m = newMode || travelMode;
    const t = newTime || departureTime;
    const w = newWeights || weights;

    if (onSearch) {
      onSearch({
        origin: { lat: parseFloat(o.lat), lon: parseFloat(o.lon), name: o.name },
        destination: { lat: parseFloat(d.lat), lon: parseFloat(d.lon), name: d.name },
        travel_mode: m,
        departure_time: t,
        weights: {
          alpha: parseFloat(w.alpha),
          beta: parseFloat(w.beta),
          gamma: parseFloat(w.gamma)
        }
      });
    }
  };

  // Select a suggestion for Origin
  const handleSelectOrigin = (item) => {
    const newOrigin = { lat: item.lat, lon: item.lon, name: item.name };
    setOrigin(newOrigin);
    setOriginQuery(item.name);
    setIsOriginFocused(false);
    triggerSearch(newOrigin, destination, travelMode, departureTime, weights);
  };

  // Select a suggestion for Destination
  const handleSelectDest = (item) => {
    const newDest = { lat: item.lat, lon: item.lon, name: item.name };
    setDestination(newDest);
    setDestQuery(item.name);
    setIsDestFocused(false);
    triggerSearch(origin, newDest, travelMode, departureTime, weights);
  };

  // Preset Click: Instantly apply coordinates AND recalculate routes
  const handleApplyPreset = (preset) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
    setOriginQuery(preset.origin.name || 'Origin');
    setDestQuery(preset.destination.name || 'Destination');
    triggerSearch(preset.origin, preset.destination, travelMode, departureTime, weights);
  };

  // Swap: Instantly swap coordinates AND recalculate routes
  const handleSwap = () => {
    const tempOrigin = { ...origin };
    const tempOriginQ = originQuery;

    const newOrigin = { ...destination };
    const newDest = tempOrigin;

    setOrigin(newOrigin);
    setDestination(newDest);
    setOriginQuery(destQuery);
    setDestQuery(tempOriginQ);

    triggerSearch(newOrigin, newDest, travelMode, departureTime, weights);
  };

  // GPS Current Location for Source
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userOrigin = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lon: parseFloat(pos.coords.longitude.toFixed(6)),
          name: "My Current Location"
        };
        setOrigin(userOrigin);
        setOriginQuery("My Current Location");
        triggerSearch(userOrigin, destination, travelMode, departureTime, weights);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        // Fallback to Covent Garden center if denied
        const userOrigin = { lat: 51.5118, lon: -0.1235, name: "Covent Garden (GPS Center)" };
        setOrigin(userOrigin);
        setOriginQuery("Covent Garden (GPS Center)");
        triggerSearch(userOrigin, destination, travelMode, departureTime, weights);
      },
      { timeout: 6000 }
    );
  };

  const handleModeChange = (mode) => {
    setTravelMode(mode);
    triggerSearch(origin, destination, mode, departureTime, weights);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setDepartureTime(newTime);
    triggerSearch(origin, destination, travelMode, newTime, weights);
  };

  const handleWeightChange = (key, val) => {
    const newWeights = { ...weights, [key]: parseFloat(val) };
    setWeights(newWeights);
    triggerSearch(origin, destination, travelMode, departureTime, newWeights);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSearch(origin, destination, travelMode, departureTime, weights);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 transition-all">
      
      {/* Preset Corridor Chips for Quick 1-Click Testing */}
      {presets.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Corridor Presets</span>
            </span>
            <span className="text-[11px] text-cyan-600 font-semibold">1-Click Test</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {presets.map((p) => {
              const isActive =
                Math.abs(origin.lat - p.origin.lat) < 0.001 &&
                Math.abs(destination.lat - p.destination.lat) < 0.001;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs ring-1 ring-cyan-500/30'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Source (Origin) & Destination Input Cards */}
        <div className="relative space-y-3">
          
          {/* Source (Origin) Input */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/90 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                <span>Source Location (Origin A)</span>
              </label>
              
              {/* Quick Action Buttons for Source */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPickingMode(pickingMode === 'origin' ? null : 'origin')}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    pickingMode === 'origin'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs animate-pulse'
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                  title="Click anywhere on the map to set Source location"
                >
                  <Crosshair className="h-3 w-3" />
                  <span>{pickingMode === 'origin' ? 'Click Map...' : 'Pick on Map'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="p-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Use My Current GPS Location"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Place Name Autocomplete Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="h-4 w-4 text-emerald-600 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  onFocus={() => setIsOriginFocused(true)}
                  placeholder="Type place name, street, or landmark..."
                  className="w-full text-xs sm:text-sm bg-white border border-emerald-300/80 rounded-xl pl-9 pr-8 py-2 font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs"
                  required
                />
                {originQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginQuery('');
                      setIsOriginFocused(true);
                    }}
                    className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isOriginFocused && originSuggestions.length > 0 && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsOriginFocused(false)} 
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Suggested Landmarks & Locations
                    </div>
                    {originSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOrigin(item)}
                        className="w-full text-left p-2.5 hover:bg-emerald-50 flex items-start gap-2 text-xs transition-colors cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.category} &bull; {item.lat.toFixed(4)}, {item.lon.toFixed(4)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-emerald-700/80 font-mono">
              <span>Coordinates: {origin.lat.toFixed(4)}, {origin.lon.toFixed(4)}</span>
              {origin.name && <span className="font-sans font-medium text-slate-500 truncate max-w-[180px]">{origin.name}</span>}
            </div>
          </div>

          {/* Swap Button - Fully Active */}
          <div className="absolute right-5 top-[48%] -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-white border border-slate-300 shadow-md hover:bg-slate-50 text-slate-700 transition-all active:scale-90 cursor-pointer"
              title="Click to Swap Source and Destination"
            >
              <ArrowUpDown className="h-4 w-4 text-cyan-600" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/90 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                <span>Destination (Target B)</span>
              </label>

              {/* Pick on Map Button for Destination */}
              <button
                type="button"
                onClick={() => setPickingMode(pickingMode === 'destination' ? null : 'destination')}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                  pickingMode === 'destination'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs animate-pulse'
                    : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                }`}
                title="Click anywhere on the map to set Destination location"
              >
                <Crosshair className="h-3 w-3" />
                <span>{pickingMode === 'destination' ? 'Click Map...' : 'Pick on Map'}</span>
              </button>
            </div>

            {/* Place Name Autocomplete Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="h-4 w-4 text-rose-600 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  onFocus={() => setIsDestFocused(true)}
                  placeholder="Type place name, street, or destination..."
                  className="w-full text-xs sm:text-sm bg-white border border-rose-300/80 rounded-xl pl-9 pr-8 py-2 font-medium text-slate-800 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xs"
                  required
                />
                {destQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestQuery('');
                      setIsDestFocused(true);
                    }}
                    className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isDestFocused && destSuggestions.length > 0 && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsDestFocused(false)} 
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Suggested Landmarks & Locations
                    </div>
                    {destSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDest(item)}
                        className="w-full text-left p-2.5 hover:bg-rose-50 flex items-start gap-2 text-xs transition-colors cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.category} &bull; {item.lat.toFixed(4)}, {item.lon.toFixed(4)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Coordinates Badge */}
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-rose-700/80 font-mono">
              <span>Coordinates: {destination.lat.toFixed(4)}, {destination.lon.toFixed(4)}</span>
              {destination.name && <span className="font-sans font-medium text-slate-500 truncate max-w-[180px]">{destination.name}</span>}
            </div>
          </div>

        </div>

        {/* Popular Study Landmarks Quick Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Landmark Selection
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STUDY_LANDMARKS.slice(0, 8).map((lm, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  // If picking destination, set destination, else set source
                  handleSelectDest(lm);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 hover:border-cyan-300 text-slate-700 transition-colors font-medium cursor-pointer"
              >
                + {lm.name.split('/')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Mode & Departure Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Travel Mode Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Travel Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('walking')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  travelMode === 'walking'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs ring-1 ring-cyan-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Footprints className="h-4 w-4 text-cyan-600" />
                <span>Walking</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('driving')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  travelMode === 'driving'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs ring-1 ring-cyan-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Car className="h-4 w-4 text-cyan-600" />
                <span>Driving</span>
              </button>
            </div>
          </div>

          {/* Departure Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Departure Time</span>
              </label>
              <span className="text-[11px] text-cyan-700 font-medium">
                {getTimeWindowPreview(departureTime)}
              </span>
            </div>
            <input
              type="time"
              value={departureTime}
              onChange={handleTimeChange}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-hidden focus:border-cyan-500 focus:bg-white transition-colors cursor-pointer"
            />
          </div>

        </div>

        {/* Collapsible Exact Coordinate Manual Inputs */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowManualCoords(!showManualCoords)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showManualCoords ? '▲ Hide Exact Coordinate Numbers' : '▼ Fine-tune Exact Coordinates (Lat/Lon)'}</span>
          </button>

          {showManualCoords && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs animate-in fade-in">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium">Source Lat</label>
                <input
                  type="number"
                  step="any"
                  value={origin.lat}
                  onChange={(e) => {
                    const newO = { ...origin, lat: parseFloat(e.target.value) || 0 };
                    setOrigin(newO);
                    triggerSearch(newO, destination, travelMode, departureTime, weights);
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium">Source Lon</label>
                <input
                  type="number"
                  step="any"
                  value={origin.lon}
                  onChange={(e) => {
                    const newO = { ...origin, lon: parseFloat(e.target.value) || 0 };
                    setOrigin(newO);
                    triggerSearch(newO, destination, travelMode, departureTime, weights);
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium">Dest Lat</label>
                <input
                  type="number"
                  step="any"
                  value={destination.lat}
                  onChange={(e) => {
                    const newD = { ...destination, lat: parseFloat(e.target.value) || 0 };
                    setDestination(newD);
                    triggerSearch(origin, newD, travelMode, departureTime, weights);
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-medium">Dest Lon</label>
                <input
                  type="number"
                  step="any"
                  value={destination.lon}
                  onChange={(e) => {
                    const newD = { ...destination, lon: parseFloat(e.target.value) || 0 };
                    setDestination(newD);
                    triggerSearch(origin, newD, travelMode, departureTime, weights);
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md px-2 py-1 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Trade-off Sliders */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 transition-colors cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-600" />
            <span>{showAdvanced ? 'Hide Custom Weights' : 'Customize Objective Weights (alpha, beta, gamma)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Multi-Objective Trade-off Formula:</span>
                <span className="text-[11px] font-mono text-slate-500">
                  J = alpha*(D/D_ref) + beta*(T/T_ref) + gamma*(R/100)
                </span>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Distance Weight (alpha)</span>
                  <span className="font-mono font-semibold">{weights.alpha}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={weights.alpha}
                  onChange={(e) => handleWeightChange('alpha', e.target.value)}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Travel Time Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Travel Time Weight (beta)</span>
                  <span className="font-mono font-semibold">{weights.beta}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={weights.beta}
                  onChange={(e) => handleWeightChange('beta', e.target.value)}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Historical Risk Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Historical Risk Weight (gamma)</span>
                  <span className="font-mono font-semibold">{weights.gamma}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={weights.gamma}
                  onChange={(e) => handleWeightChange('gamma', e.target.value)}
                  className="w-full accent-cyan-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="text-[11px] text-slate-400 italic">
                * Note: Changes immediately re-rank the Balanced route in real-time.
              </div>
            </div>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-cyan-600/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Alternative Routes...</span>
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              <span>Compare Safety-Aware Routes</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
