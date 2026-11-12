import React from 'react';
import { X, BrainCircuit, BarChart3, Flame, CheckCircle, Info, Layers } from 'lucide-react';

/**
 * Machine Learning & K-Means Insights Modal (MLInsightsModal.jsx)
 * ----------------------------------------------------------------
 * Visualizes K-Means spatial cluster parameters and Random Forest
 * evaluation metrics (Precision, Recall, F1-Score, Confusion Matrix,
 * and Feature Importances) to demonstrate academic CSE rigor.
 */
export default function MLInsightsModal({ mlMetrics, hotspots = [], onClose }) {
  if (!mlMetrics) return null;

  const metrics = mlMetrics.metrics || {};
  const importances = metrics.feature_importances || {};
  const classReport = metrics.classification_report || {};
  const confMatrix = metrics.confusion_matrix || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Machine Learning & Hotspot Diagnostics
              </h2>
              <p className="text-xs text-slate-500">
                K-Means spatial grouping & Random Forest evaluation (plan.md Section 10)
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700">
          
          {/* Research Reference Callout */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 text-xs">
            <div className="font-semibold text-indigo-900 mb-0.5">
              Academic Reference (Focus Paper):
            </div>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Kollu, Cheruvu &amp; Manikantha (2025). <em>"A Hybrid K-Means and Random Forest Framework for
              Crime-Aware Route Optimization in Urban Navigation Systems."</em> ICCTDC, IEEE.
            </p>
          </div>

          {/* 1. K-Means Clustering Hotspots Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>1. K-Means Geospatial Hotspots ({hotspots.length} Clusters)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Algorithm: K-Means (Euclidean / WCSS)</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Cluster</th>
                    <th className="py-2.5 px-3">Centroid (Lat, Lon)</th>
                    <th className="py-2.5 px-3">Incidents</th>
                    <th className="py-2.5 px-3">Radius</th>
                    <th className="py-2.5 px-3">Dominant Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hotspots.map((spot, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-rose-700">#{spot.cluster_id + 1}</td>
                      <td className="py-2 px-3 font-mono text-[11px]">
                        {spot.centroid.lat.toFixed(4)}, {spot.centroid.lon.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 font-medium">{spot.incident_count}</td>
                      <td className="py-2 px-3">{spot.radius_meters}m</td>
                      <td className="py-2 px-3 text-slate-600">{spot.top_category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Radius is calculated as the 90th percentile distance from centroid to member incidents.
            </p>
          </div>

          {/* 2. Random Forest Evaluation Overview */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>2. Random Forest Classification Metrics</span>
            </h4>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Test Accuracy</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {(metrics.accuracy * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Macro F1-Score</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {metrics.macro_f1}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Trees in Ensemble</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  50
                </div>
              </div>
            </div>

            {/* Feature Importances Bar Chart */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Feature Importances (Gini Impurity Reduction):
              </span>
              <div className="space-y-1.5">
                {Object.entries(importances).map(([feat, imp]) => (
                  <div key={feat} className="text-xs">
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span className="font-mono text-[11px]">{feat}</span>
                      <span className="font-semibold font-mono">{(imp * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${imp * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification Report per Class */}
            {Object.keys(classReport).length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Precision</th>
                      <th className="py-2 px-3">Recall</th>
                      <th className="py-2 px-3">F1-Score</th>
                      <th className="py-2 px-3">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(classReport).map(([cls, row]) => (
                      <tr key={cls}>
                        <td className="py-2 px-3 font-semibold capitalize text-slate-800">{cls.replace('_', ' ')}</td>
                        <td className="py-2 px-3 font-mono">{row.precision}</td>
                        <td className="py-2 px-3 font-mono">{row.recall}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-indigo-700">{row.f1_score}</td>
                        <td className="py-2 px-3 text-slate-500">{row.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3x3 Confusion Matrix */}
            {confMatrix.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <span className="font-semibold text-slate-700 block">
                  Test Confusion Matrix (Rows: Actual, Columns: Predicted):
                </span>
                <div className="flex flex-col gap-1 font-mono text-[11px] max-w-xs mx-auto text-center">
                  {confMatrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 justify-center">
                      {row.map((val, cIdx) => (
                        <span 
                          key={cIdx} 
                          className={`w-12 py-1 rounded border font-semibold ${
                            rIdx === cIdx ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Validated on 80/20 stratified train/test split.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            Close Diagnostics
          </button>
        </div>

      </div>

    </div>
  );
}

