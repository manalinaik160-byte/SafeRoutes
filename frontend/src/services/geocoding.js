/**
 * SafeRoute Geocoding & Landmark Directory Service (geocoding.js)
 * --------------------------------------------------------------
 * Allows users to search and add Source (Origin) and Destination by:
 *   1. Typing a place name or street address (with instant autocomplete)
 *   2. Selecting from popular urban landmarks
 *   3. Falling back to OpenStreetMap Nominatim geocoding for any custom address
 */

export const STUDY_LANDMARKS = [
  { name: "Covent Garden Market", lat: 51.5118, lon: -0.1235, category: "Shopping & Entertainment" },
  { name: "Bank Station / Financial Hub", lat: 51.5133, lon: -0.0886, category: "Financial District" },
  { name: "St Paul's Cathedral", lat: 51.5138, lon: -0.0984, category: "Historic Landmark" },
  { name: "Waterloo Station", lat: 51.5032, lon: -0.1123, category: "Transit Terminal" },
  { name: "Tower of London", lat: 51.5081, lon: -0.0759, category: "Historic Landmark" },
  { name: "Tower Bridge", lat: 51.5055, lon: -0.0754, category: "Thames Crossing" },
  { name: "London Bridge Station", lat: 51.5050, lon: -0.0860, category: "Transit Terminal" },
  { name: "Shoreditch High Street", lat: 51.5235, lon: -0.0775, category: "Nightlife & Tech Hub" },
  { name: "Trafalgar Square", lat: 51.5080, lon: -0.1281, category: "Public Square" },
  { name: "Piccadilly Circus", lat: 51.5101, lon: -0.1340, category: "West End Junction" },
  { name: "British Museum", lat: 51.5194, lon: -0.1270, category: "Cultural Hub" },
  { name: "Holborn Station / Kingsway", lat: 51.5174, lon: -0.1200, category: "Legal Quarter" },
  { name: "Liverpool Street Station", lat: 51.5180, lon: -0.0815, category: "Transit Hub" },
  { name: "Blackfriars Station", lat: 51.5115, lon: -0.1030, category: "River Terminal" },
  { name: "Fleet Street / Chancery Lane", lat: 51.5140, lon: -0.1110, category: "Historic Corridor" },
  { name: "Borough Market", lat: 51.5055, lon: -0.0910, category: "Food & Waterfront" },
  { name: "The Shard", lat: 51.5045, lon: -0.0865, category: "Southwark Landmark" },
  { name: "Barbican Centre", lat: 51.5200, lon: -0.0935, category: "Arts Complex" },
  { name: "Somerset House / Strand", lat: 51.5110, lon: -0.1170, category: "Cultural Centre" },
  { name: "Leadenhall Market", lat: 51.5126, lon: -0.0835, category: "Historic Market" },
  { name: "Farringdon Station", lat: 51.5205, lon: -0.1050, category: "Transit Junction" },
  { name: "Charing Cross Station", lat: 51.5083, lon: -0.1248, category: "Transit Terminal" }
];

/**
 * Searches locations matching query text.
 * Filters instant local landmarks first; queries Nominatim if query >= 3 chars.
 */
export async function searchLocations(query) {
  if (!query || query.trim().length === 0) {
    return STUDY_LANDMARKS.slice(0, 6);
  }

  const cleanQuery = query.toLowerCase().trim();

  // 1. Instant local landmark filter (0ms latency, works 100% offline)
  const localMatches = STUDY_LANDMARKS.filter(
    item => item.name.toLowerCase().includes(cleanQuery) || item.category.toLowerCase().includes(cleanQuery)
  );

  if (localMatches.length >= 3) {
    return localMatches.slice(0, 6);
  }

  // 2. Query OpenStreetMap Nominatim for any specific street / address
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const viewbox = "-0.145,51.498,-0.065,51.532"; // Study bounding box
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=0&limit=5`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const nominatimResults = data.map(item => ({
        name: item.display_name.split(',').slice(0, 3).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        category: item.type || "Street / Place"
      }));

      // Merge unique results
      const combined = [...localMatches];
      nominatimResults.forEach(nr => {
        if (!combined.some(c => Math.abs(c.lat - nr.lat) < 0.001 && Math.abs(c.lon - nr.lon) < 0.001)) {
          combined.push(nr);
        }
      });
      return combined.slice(0, 7);
    }
  } catch {
    // Return local matches on network timeout
  }

  return localMatches;
}

