import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Database, 
  BrainCircuit, 
  Menu, 
  X, 
  Flame, 
  Layers, 
  Info 
} from 'lucide-react';

/**
 * Responsive Navigation Header (Navbar.jsx)
 * -----------------------------------------
 * Provides brand identity, map layer toggles, modals triggers,
 * and a mobile-friendly hamburger drawer for small screens (<768px).
 */
export default function Navbar({
  backendStatus,
  showHotspots,
  setShowHotspots,
  showIncidents,
  setShowIncidents,
  onOpenDatasetModal,
  onOpenMLModal,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Safe<span className="text-cyan-600">Route</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  CSE Mini-Project
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 font-medium">
                Explainable & Time-Aware Route Recommendation System
              </p>
            </div>
          </div>

          {/* Desktop Controls (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Map Layer Toggles */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showHotspots
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Hotspots Layer</span>
              <span className={`w-2 h-2 rounded-full ${showHotspots ? 'bg-rose-500' : 'bg-slate-300'}`} />
            </button>

            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showIncidents
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Incidents Pins</span>
              <span className={`w-2 h-2 rounded-full ${showIncidents ? 'bg-indigo-500' : 'bg-slate-300'}`} />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Modals & Insights Buttons */}
            <button
              onClick={onOpenMLModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <BrainCircuit className="h-3.5 w-3.5 text-cyan-600" />
              <span>ML & K-Means</span>
            </button>

            <button
              onClick={onOpenDatasetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Database className="h-3.5 w-3.5 text-slate-600" />
              <span>Dataset Provenance</span>
            </button>

            {/* Backend Health / Calculation Engine Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-cyan-500 animate-pulse'
                }`}
              />
              <span>{backendStatus === 'connected' ? 'Flask API Live' : 'Smart Engine Active'}</span>
            </div>
          </div>

          {/* Mobile & Tablet Hamburger Button (< 1024px) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}
              />
              <span>{backendStatus === 'connected' ? 'API Live' : 'Active'}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Map Data Layers
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border ${
                showHotspots
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Flame className="h-4 w-4 text-rose-500" />
              <span>Hotspots {showHotspots ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border ${
                showIncidents
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Incidents {showIncidents ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            Project Documentation & AI
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                onOpenMLModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-cyan-600" />
                <span>K-Means & Random Forest Insights</span>
              </div>
              <span className="text-xs text-cyan-600 font-semibold">View &rarr;</span>
            </button>

            <button
              onClick={() => {
                onOpenDatasetModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-600" />
                <span>Study Area & Dataset Limitations</span>
              </div>
              <span className="text-xs text-slate-600 font-semibold">View &rarr;</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            SafeRoute Decision-Support Navigation · Non-predictive Academic Tool
          </div>
        </div>
      )}
    </header>
  );
}

