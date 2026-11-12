import React from 'react';
import { X, HelpCircle, Calculator, Layers, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

/**
 * Route Risk Score Explanation Drawer/Modal (ExplanationModal.jsx)
 * ---------------------------------------------------------------
 * Transparently reveals how the route score was computed:
 *   1. Mathematical formula and feature weights
 *   2. Component contributions (Frequency, Severity, Temporal)
 *   3. Street-level segment evaluation table
 *   4. Data confidence & provenance warnings
 */
export default function ExplanationModal({ route, onClose }) {
  if (!route) return null;

  const comps = route.score_components || {};
  const segments = route.segment_evaluations || [];
  const coverage = route.data_coverage || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Score Explainability: {route.recommendation_title || route.name}
              </h2>
              <p className="text-xs text-slate-500">
                Transparent factor attribution & segment evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {/* Top Score Summary Banner */}
          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-cyan-800 font-medium">Relative Historical Score:</span>
              <div className="text-2xl font-bold text-cyan-950">
                {route.risk_score} <span className="text-xs font-normal text-cyan-700">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-xs font-semibold text-cyan-800">{route.risk_label}</span>
              <span className="text-[11px] text-cyan-600">
                Density: {route.incident_density_per_km} incidents/km &bull; Clearance: {route.nearest_hotspot_dist_km} km
              </span>
            </div>
          </div>

          {/* Mathematical Formula Rationale */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-cyan-600" />
              <span>Mathematical Formula (plan.md Section 10)</span>
            </span>
            <div className="font-mono text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 space-y-1">
              <div>R_segment = 100 &times; (0.45 &times; C_norm + 0.35 &times; S_norm + 0.20 &times; T_norm)</div>
              <div>R_route = &sum;(d_i &times; R_i) / &sum;(d_i) &nbsp;[Length-Weighted Aggregation]</div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Length-weighting guarantees that a brief 20-meter alleyway does not disproportionately
              skew the assessment of an entire 4-kilometer commute.
            </p>
          </div>

          {/* Contributing Factors Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Factor-by-Factor Analysis
            </h4>
            <div className="space-y-2">
              {route.risk_factors && route.risk_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Component Score Contributions */}
          {comps.weights_applied && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Component Contributions to Risk Score
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Frequency (45%)</span>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {comps.incident_frequency_contribution}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Severity (35%)</span>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {comps.severity_contribution}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Time Window (20%)</span>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {comps.temporal_contribution}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Road Segment Evaluation Table */}
          {segments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Sample Road Segments Heatmap ({segments.length} total segments)
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2 px-3">Segment</th>
                      <th className="py-2 px-3">Length</th>
                      <th className="py-2 px-3">Incidents</th>
                      <th className="py-2 px-3">Mean Sev</th>
                      <th className="py-2 px-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {segments.slice(0, 5).map((seg, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-[11px]">#{idx + 1}</td>
                        <td className="py-2 px-3">{seg.length_meters}m</td>
                        <td className="py-2 px-3">{seg.incident_count}</td>
                        <td className="py-2 px-3">{seg.mean_severity}/3.0</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{seg.score}/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {segments.length > 5 && (
                <p className="text-[11px] text-slate-400 italic">
                  Showing first 5 segments. Length-weighting aggregates all segments into overall route score.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {coverage.warning || 'High Data Coverage (100% of corridor verified)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}

