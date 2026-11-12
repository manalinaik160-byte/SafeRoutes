import React from 'react';
import { ShieldAlert, Info, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Risk Legend & Ethical Guidance Component (RiskLegend.jsx)
 * ---------------------------------------------------------
 * Clarifies risk tier thresholds, data confidence levels,
 * and mandatory safety disclaimers (plan.md Section 1 & 23).
 */
export default function RiskLegend() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Legend Header */}
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-cyan-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Scoring Methodology & Legend
        </h3>
      </div>

      {/* Risk Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        
        {/* Lower Risk Tier */}
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>0 – 34: Lower Risk</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Low recorded incident density along corridor. Historical incidents predominantly minor.
          </p>
        </div>

        {/* Moderate Risk Tier */}
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>35 – 64: Moderate Risk</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-snug">
            Average urban incident frequency. Intersects arterial corridors or commercial districts.
          </p>
        </div>

        {/* Higher Risk Tier */}
        <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>65 – 100: Higher Risk</span>
          </div>
          <p className="text-[11px] text-rose-700 leading-snug">
            Elevated historical crime concentration or proximity to active nightlife/hotspot clusters.
          </p>
        </div>

      </div>

      {/* Uncertainty & Ethics Disclaimer Callout */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
        <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-800">
            Important Academic Boundary & Safety Notice:
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            SafeRoute evaluates historical records to assist decision-making. Historical data can be
            incomplete or subject to reporting bias and <strong>cannot guarantee safety</strong> or predict
            immediate danger. Zero records in an area does not indicate absence of crime.
          </p>
        </div>
      </div>

    </div>
  );
}

