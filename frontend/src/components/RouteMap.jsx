import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Maximize2, RotateCcw, Flame, ShieldAlert } from 'lucide-react';

/**
 * Interactive Leaflet Route Map Component (RouteMap.jsx)
 * -----------------------------------------------------
 * Displays:
 *   1. Origin & Destination custom pins
 *   2. Route alternatives with distinct color-coding (Balanced, Lower-Risk, Shortest)
 *   3. K-Means crime incident hotspot clusters with proportional radiuses
 *   4. Historical incident point markers with severity categorization
 *   5. Smooth responsive bounds fitting for mobile, tablet, and desktop viewports
 */
export default function RouteMap({
  origin,
  destination,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  hotspots = [],
  showHotspots = true,
  incidents = [],
  showIncidents = false,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef([]);
  const hotspotLayersRef = useRef([]);
  const incidentLayersRef = useRef([]);
  const markerLayersRef = useRef([]);

  // Route color styling by recommendation type
  const getRouteStyle = (route, isSelected) => {
    const type = route.recommendation_type;
    let baseColor = '#64748b'; // default slate
    if (type === 'balanced') baseColor = '#0284c7';       // Cyan/Sky
    else if (type === 'lower_risk') baseColor = '#059669'; // Emerald
    else if (type === 'shortest') baseColor = '#7c3aed';   // Purple
    else if (type === 'alternative') baseColor = '#d97706';// Amber

    return {
      color: baseColor,
      weight: isSelected ? 7 : 4,
      opacity: isSelected ? 0.95 : 0.65,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: route.is_simulated ? '6, 8' : null,
    };
  };

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = origin?.lat || 51.512;
    const initialLon = origin?.lon || -0.105;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SafeRoute',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Origin & Destination Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markerLayersRef.current.forEach((m) => map.removeLayer(m));
    markerLayersRef.current = [];

    if (origin && origin.lat && origin.lon) {
      const originIcon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: `<div class="custom-pin custom-pin-origin" style="width: 28px; height: 28px; font-size: 11px;">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon })
        .addTo(map)
        .bindPopup(
          `<div class="text-xs"><strong>Origin (Starting Point)</strong><br/>Lat: ${origin.lat.toFixed(4)}, Lon: ${origin.lon.toFixed(4)}</div>`
        );
      markerLayersRef.current.push(originMarker);
    }

    if (destination && destination.lat && destination.lon) {
      const destIcon = L.divIcon({
        className: 'custom-pin-wrapper',
        html: `<div class="custom-pin custom-pin-dest" style="width: 28px; height: 28px; font-size: 11px;">B</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const destMarker = L.marker([destination.lat, destination.lon], { icon: destIcon })
        .addTo(map)
        .bindPopup(
          `<div class="text-xs"><strong>Destination Point</strong><br/>Lat: ${destination.lat.toFixed(4)}, Lon: ${destination.lon.toFixed(4)}</div>`
        );
      markerLayersRef.current.push(destMarker);
    }
  }, [origin, destination]);

  // 3. Render Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (!routes || routes.length === 0) return;

    const allRoutePoints = [];

    routes.forEach((route) => {
      const isSelected = route.route_id === selectedRouteId;
      const polyline = L.polyline(route.coordinates, getRouteStyle(route, isSelected))
        .addTo(map)
        .on('click', () => {
          if (onSelectRoute) onSelectRoute(route);
        });

      // Interactive popup on hover/click
      const popupHtml = `
        <div class="text-xs font-sans">
          <div class="font-bold text-slate-900 mb-0.5">${route.recommendation_title || route.name}</div>
          <div class="text-slate-600 mb-1">
            <strong>Distance:</strong> ${route.distance_km} km &bull; 
            <strong>Time:</strong> ${route.duration_min} min
          </div>
          <div class="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
            Historical Risk Score: ${route.risk_score}/100
          </div>
        </div>
      `;
      polyline.bindPopup(popupHtml);

      routeLayersRef.current.push(polyline);
      route.coordinates.forEach((pt) => allRoutePoints.push(pt));
    });

    // Fit map bounds to show complete routes smoothly
    if (allRoutePoints.length > 0) {
      try {
        const bounds = L.latLngBounds(allRoutePoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } catch (err) {
        console.warn('Error fitting route bounds:', err);
      }
    }
  }, [routes, selectedRouteId]);

  // 4. Render K-Means Hotspots Circles Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    hotspotLayersRef.current.forEach((layer) => map.removeLayer(layer));
    hotspotLayersRef.current = [];

    if (!showHotspots || !hotspots || hotspots.length === 0) return;

    hotspots.forEach((spot) => {
      const lat = spot.centroid.lat;
      const lon = spot.centroid.lon;
      const radius = spot.radius_meters || 250;

      const circle = L.circle([lat, lon], {
        radius: radius,
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.18,
        weight: 1.5,
      }).addTo(map);

      const popupContent = `
        <div class="text-xs font-sans">
          <div class="flex items-center gap-1 font-bold text-rose-700 mb-1">
            <span>🔥 ${spot.label || 'Incident Hotspot'}</span>
          </div>
          <div class="space-y-0.5 text-slate-600">
            <div><strong>Recorded Incidents:</strong> ${spot.incident_count}</div>
            <div><strong>Dominant Category:</strong> ${spot.top_category}</div>
            <div><strong>Mean Severity:</strong> ${spot.mean_severity}/3.0</div>
            <div><strong>Cluster Radius:</strong> ${spot.radius_meters}m</div>
          </div>
          <div class="mt-1.5 text-[10px] text-slate-400 italic">
            K-Means spatial grouping. Does not imply real-time danger.
          </div>
        </div>
      `;
      circle.bindPopup(popupContent);
      hotspotLayersRef.current.push(circle);
    });
  }, [hotspots, showHotspots]);

  // 5. Render Historical Incident Point Markers Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    incidentLayersRef.current.forEach((layer) => map.removeLayer(layer));
    incidentLayersRef.current = [];

    if (!showIncidents || !incidents || incidents.length === 0) return;

    incidents.forEach((inc) => {
      let fillColor = '#f59e0b'; // Level 1: Amber
      if (inc.severity === 2) fillColor = '#ea580c'; // Level 2: Orange
      if (inc.severity === 3) fillColor = '#dc2626'; // Level 3: Red

      const marker = L.circleMarker([inc.latitude, inc.longitude], {
        radius: 4,
        fillColor: fillColor,
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      const popup = `
        <div class="text-xs">
          <strong>${inc.category}</strong><br/>
          Severity: ${inc.severity}/3 &bull; Time: ${inc.time_of_day}<br/>
          <span class="text-[10px] text-slate-400">Date: ${inc.incident_date}</span>
        </div>
      `;
      marker.bindPopup(popup);
      incidentLayersRef.current.push(marker);
    });
  }, [incidents, showIncidents]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routes && routes.length > 0) {
      const allPts = routes.flatMap((r) => r.coordinates);
      map.fitBounds(L.latLngBounds(allPts), { padding: [40, 40] });
    } else if (origin) {
      map.setView([origin.lat, origin.lon], 14);
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[450px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
          title="Recenter Map View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Active Layers Legend Pill */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-none">
        {showHotspots && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50/95 backdrop-blur-xs text-rose-700 border border-rose-200 shadow-xs">
            <Flame className="h-3 w-3 text-rose-500" />
            <span>K-Means Hotspots Active</span>
          </span>
        )}
        {showIncidents && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50/95 backdrop-blur-xs text-indigo-700 border border-indigo-200 shadow-xs">
            <span>• Historical Pins ({incidents.length})</span>
          </span>
        )}
      </div>

    </div>
  );
}

