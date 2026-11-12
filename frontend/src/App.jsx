import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RouteSearch from './components/RouteSearch';
import RouteMap from './components/RouteMap';
import RouteCard from './components/RouteCard';
import RiskLegend from './components/RiskLegend';
import ExplanationModal from './components/ExplanationModal';
import DatasetInfoModal from './components/DatasetInfoModal';
import MLInsightsModal from './components/MLInsightsModal';

import {
  fetchHealth,
  fetchDatasetMetadata,
  fetchIncidents,
  fetchHotspots,
  fetchMLEvaluation,
  fetchPresets,
  compareRoutes,
} from './services/api';

import { 
  AlertCircle, 
  MapPin, 
  ListFilter, 
  Layers, 
  Map as MapIcon, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

/**
 * Main Application Component (App.jsx)
 * ------------------------------------
 * Coordinates application state, map layers, modals, and route cards.
 * Zero-failure resilience: ensures candidate routes, presets, and map layers
 * are loaded and rendered immediately on startup with full button reactivity.
 */
export default function App() {
  // Navigation & Map States
  const [origin, setOrigin] = useState({ lat: 51.5118, lon: -0.1235, name: 'Covent Garden' });
  const [destination, setDestination] = useState({ lat: 51.5133, lon: -0.0886, name: 'Bank Station' });
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  // Data & Layers
  const [presets, setPresets] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);

  // Layer Visibility Toggles
  const [showHotspots, setShowHotspots] = useState(true);
  const [showIncidents, setShowIncidents] = useState(false);

  // Mobile View Toggle: 'cards' | 'map'
  const [mobileTab, setMobileTab] = useState('cards');

  // UI & Loading States
  const [backendStatus, setBackendStatus] = useState('connected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal Dialogs
  const [explainingRoute, setExplainingRoute] = useState(null);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isMLModalOpen, setIsMLModalOpen] = useState(false);

  // Primary Route Search & Comparison Function
  const performRouteComparison = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      setOrigin(payload.origin);
      setDestination(payload.destination);

      const res = await compareRoutes(payload);
      if (res && res.routes && res.routes.length > 0) {
        setRoutes(res.routes);
        // Default to balanced recommendation or first route
        const defaultSelected =
          res.routes.find((r) => r.recommendation_type === 'balanced') || res.routes[0];
        setSelectedRouteId(defaultSelected.route_id);
      }
    } catch (err) {
      console.warn('Route comparison notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Data Fetch & Instant Route Population on Startup
  useEffect(() => {
    const initializeApplication = async () => {
      try {
        const health = await fetchHealth();
        if (health && health.status === 'healthy') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('client_mode');
        }
      } catch {
        setBackendStatus('client_mode');
      }

      // Fetch study metadata, hotspots, presets, and ML diagnostics
      try {
        const [metaRes, hotspotsRes, presetsRes, mlRes, incRes] = await Promise.allSettled([
          fetchDatasetMetadata(),
          fetchHotspots(),
          fetchPresets(),
          fetchMLEvaluation(),
          fetchIncidents(250),
        ]);

        if (metaRes.status === 'fulfilled' && metaRes.value) {
          setMetadata(metaRes.value.dataset);
        }
        if (hotspotsRes.status === 'fulfilled' && hotspotsRes.value) {
          setHotspots(hotspotsRes.value.clusters || []);
        }
        if (presetsRes.status === 'fulfilled' && presetsRes.value) {
          setPresets(presetsRes.value.presets || []);
        }
        if (mlRes.status === 'fulfilled' && mlRes.value) {
          setMlMetrics(mlRes.value);
        }
        if (incRes.status === 'fulfilled' && incRes.value) {
          setIncidents(incRes.value.incidents || []);
        }

        // Immediately execute route comparison on startup so routes display right away!
        await performRouteComparison({
          origin: { lat: 51.5118, lon: -0.1235 },
          destination: { lat: 51.5133, lon: -0.0886 },
          travel_mode: 'walking',
          departure_time: '19:00',
          weights: { alpha: 0.35, beta: 0.25, gamma: 0.40 }
        });
      } catch (initErr) {
        console.error('Error bootstrapping initial data:', initErr);
      }
    };

    initializeApplication();
  }, []);

  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        backendStatus={backendStatus}
        showHotspots={showHotspots}
        setShowHotspots={setShowHotspots}
        showIncidents={showIncidents}
        setShowIncidents={setShowIncidents}
        onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
        onOpenMLModal={() => setIsMLModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Error Alert Banner (Only shown if a real critical error happens) */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-semibold block">Notice:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Mobile View Toggle Bar (< 1024px) */}
        <div className="lg:hidden mb-4 flex items-center justify-between p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setMobileTab('cards')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'cards'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="h-4 w-4" />
            <span>Route Recommendations ({routes.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="h-4 w-4" />
            <span>Interactive Map</span>
          </button>
        </div>

        {/* Master Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column (Search & Route Cards) - 5 cols on desktop */}
          <div 
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            
            {/* Origin/Destination Search Form */}
            <RouteSearch
              presets={presets}
              onSearch={performRouteComparison}
              isLoading={isLoading}
              initialValues={{ origin, destination }}
            />

            {/* Route Alternatives List Header */}
            {routes.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alternative Recommendations ({routes.length})
                </span>
                <span className="text-[11px] text-cyan-600 font-medium">
                  Click card to focus on map
                </span>
              </div>
            )}

            {/* Route Comparison Cards */}
            <div className="space-y-3">
              {routes.map((route) => (
                <RouteCard
                  key={route.route_id}
                  route={route}
                  isSelected={route.route_id === selectedRouteId}
                  onSelect={() => setSelectedRouteId(route.route_id)}
                  onOpenExplain={(r) => setExplainingRoute(r)}
                />
              ))}

              {routes.length === 0 && !isLoading && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
                  <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Calculating safety-aware routes...</p>
                </div>
              )}
            </div>

            {/* Methodology & Risk Tiers Legend */}
            <RiskLegend />

          </div>

          {/* Right Column (Interactive Leaflet Map) - 7 cols on desktop */}
          <div 
            className={`lg:col-span-7 lg:sticky lg:top-20 space-y-3 ${
              mobileTab === 'cards' ? 'hidden lg:block' : 'block'
            }`}
          >
            
            {/* Map Card Wrapper */}
            <RouteMap
              origin={origin}
              destination={destination}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(r) => setSelectedRouteId(r.route_id)}
              hotspots={hotspots}
              showHotspots={showHotspots}
              incidents={incidents}
              showIncidents={showIncidents}
            />

            {/* Selected Route Quick Banner */}
            {selectedRoute && (
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="font-bold text-slate-800">
                    Active Map Focus: {selectedRoute.recommendation_title}
                  </span>
                  <span className="text-slate-500 font-mono">
                    ({selectedRoute.distance_km} km &bull; {selectedRoute.duration_min} min &bull; Risk: {selectedRoute.risk_score}/100)
                  </span>
                </div>
                <button
                  onClick={() => setExplainingRoute(selectedRoute)}
                  className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 underline cursor-pointer"
                >
                  View Factor Attribution &rarr;
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-700">
          <ShieldCheck className="h-4 w-4 text-cyan-600" />
          <span>SafeRoute &bull; College 5th-Semester CSE Mini-Project</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto px-4">
          An Explainable &amp; Time-Aware Crime-Aware Route Recommendation System Using Machine Learning and Geospatial Analysis.
          Decision-support prototype. Non-predictive; does not guarantee safety.
        </p>
      </footer>

      {/* Explanation Modal */}
      {explainingRoute && (
        <ExplanationModal
          route={explainingRoute}
          onClose={() => setExplainingRoute(null)}
        />
      )}

      {/* Dataset Provenance Modal */}
      {isDatasetModalOpen && (
        <DatasetInfoModal
          metadata={metadata}
          onClose={() => setIsDatasetModalOpen(false)}
        />
      )}

      {/* ML Diagnostics Modal */}
      {isMLModalOpen && (
        <MLInsightsModal
          mlMetrics={mlMetrics}
          hotspots={hotspots}
          onClose={() => setIsMLModalOpen(false)}
        />
      )}

    </div>
  );
}
