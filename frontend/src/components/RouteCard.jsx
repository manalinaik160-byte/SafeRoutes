import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Info 
} from 'lucide-react';

/**
 * Route Comparison Card Component (RouteCard.jsx)
 * ------------------------------------------------
 * Renders individual candidate route results with distance,
 * duration, relative risk score, data confidence tier, and key factors.
 * Mobile-first responsive design: switches from multi-column grid
 * on desktop to stacked touch-friendly cards on mobile.
 */
export default function RouteCard({
  route,
  isSelected,
  onSelect,
  onOpenExplain
}) {
  const type = route.recommendation_type;

  // Visual header styling by role
  const getHeaderBadge = () => {
    if (type === 'balanced') {
      return {
        label: 'Balanced Recommendation',
        tag: 'Recommended',
        bgColor: 'bg-cyan-50 border-cyan-200 text-cyan-800',
        badgeBg: 'bg-cyan-600 text-white',
        icon: Sparkles
      };
    }
    if (type === 'lower_risk') {
      return {
        label: 'Lower-Estimated-Risk Route',
        tag: 'Lowest Historical Risk',
        bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        badgeBg: 'bg-emerald-600 text-white',
        icon: ShieldCheck
      };
    }
    if (type === 'shortest') {
      return {
        label: 'Shortest Distance Route',
        tag: 'Fastest Path',
        bgColor: 'bg-purple-50 border-purple-200 text-purple-800',
        badgeBg: 'bg-purple-600 text-white',
        icon: Zap
      };
    }
    return {
      label: 'Alternative Route',
      tag: 'Candidate',
      bgColor: 'bg-slate-50 border-slate-200 text-slate-800',
      badgeBg: 'bg-slate-600 text-white',
      icon: MapPin
    };
  };

  const badge = getHeaderBadge();
  const IconComponent = badge.icon;

  // Risk Score Tier Styling
  const getRiskScoreColor = (score) => {
    if (score < 35) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (score < 65) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
  };

  const riskStyle = getRiskScoreColor(route.risk_score);
  const coverage = route.data_coverage || { coverage_percent: 100, confidence_tier: 'high' };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all cursor-pointer p-4 sm:p-5 relative ${
        isSelected
          ? 'bg-white border-cyan-500 ring-2 ring-cyan-500/30 shadow-md'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.badgeBg}`}>
            {badge.tag}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {route.recommendation_title || route.name}
          </span>
        </div>
        
        {/* Data Coverage Pill */}
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
            coverage.confidence_tier === 'high'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : coverage.confidence_tier === 'medium'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={coverage.warning || 'Data coverage confidence'}
        >
          {coverage.coverage_percent}% Data Coverage
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50/80 border border-slate-100 mb-3.5">
        
        {/* Distance */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Distance</span>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {route.distance_km} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Est. Time</span>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {route.duration_min} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
        </div>

        {/* Relative Risk Score */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Risk Score</span>
          <div className={`text-base sm:text-lg font-bold ${riskStyle.text}`}>
            {route.risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
        </div>

      </div>

      {/* Risk Progress Bar */}
      <div className="mb-3.5">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-slate-600">Relative Historical Indicator:</span>
          <span className={`font-semibold ${riskStyle.text}`}>{route.risk_label}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${riskStyle.bar} transition-all duration-500`}
            style={{ width: `${Math.max(8, route.risk_score)}%` }}
          />
        </div>
      </div>

      {/* Contributing Factors Preview */}
      <div className="space-y-1.5 mb-4">
        {route.risk_factors && route.risk_factors.slice(0, 2).map((factor, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
            <span className="text-cyan-600 font-bold shrink-0">&bull;</span>
            <span className="line-clamp-2">{factor}</span>
          </div>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {route.provider}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenExplain(route);
          }}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 hover:underline py-1 px-2 rounded-lg hover:bg-cyan-50 transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Explain Score & Factors</span>
        </button>
      </div>

    </div>
  );
}

