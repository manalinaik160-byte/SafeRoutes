import React from 'react';
import { X, Database, ShieldAlert, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';

/**
 * Dataset Provenance & Limitations Modal (DatasetInfoModal.jsx)
 * -------------------------------------------------------------
 * Displays data origin, date ranges, study boundaries, and
 * ethical disclosures as mandated by plan.md Section 17 & 23.
 */
export default function DatasetInfoModal({ metadata, onClose }) {
  if (!metadata) return null;

  const bbox = metadata.bounding_box || {};
  const limitations = metadata.limitations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Dataset Provenance & Coverage
              </h2>
              <p className="text-xs text-slate-500">
                Source metadata, bounding box & ethical limitations
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Metadata Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div>
              <span className="text-slate-400 text-xs uppercase font-semibold">Dataset Name</span>
              <div className="font-bold text-slate-900">{metadata.dataset_name}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Coverage Area</span>
                <div className="font-medium text-slate-800">{metadata.coverage_area}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px]">Reporting Window</span>
                <div className="font-medium text-slate-800">{metadata.start_date} to {metadata.end_date}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Source: {metadata.source_url}</span>
              <span className="font-semibold text-slate-700">{metadata.total_records} Verified Records</span>
            </div>
          </div>

          {/* Bounding Box Coordinates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Geographical Study Bounds (Bounding Box)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Min Lat</span>
                <span className="font-semibold">{bbox.min_lat || 51.498}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Max Lat</span>
                <span className="font-semibold">{bbox.max_lat || 51.532}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Min Lon</span>
                <span className="font-semibold">{bbox.min_lon || -0.145}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Max Lon</span>
                <span className="font-semibold">{bbox.max_lon || -0.065}</span>
              </div>
            </div>
          </div>

          {/* Documented Ethical Limitations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Documented Academic Limitations (plan.md Section 15 & 23)</span>
            </h4>
            <div className="space-y-2 text-xs">
              {limitations.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Stigmatization Notice */}
          <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
            <strong>Anti-Stigmatization Commitment:</strong> SafeRoute uses neutral descriptors such as
            "higher recorded incident concentration" rather than labeling entire neighborhoods as unsafe.
            The tool is designed for objective comparative decision support.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>

    </div>
  );
}

