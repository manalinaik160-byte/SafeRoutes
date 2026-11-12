# SafeRoute

**An Explainable and Time-Aware Crime-Aware Route Recommendation System Using Machine Learning and Geospatial Analysis**

*Computer Science & Engineering (CSE) · 5th-Semester Mini-Project*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1%2B-lightgrey.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19.0%2B-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0%2B-646cff.svg)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9%2B-199900.svg)](https://leafletjs.com/)
[![Pytest](https://img.shields.io/badge/Tests-20%2F20%20Passed-brightgreen.svg)](https://docs.pytest.org/)

---

## 1. Project Overview & Motivation

Conventional navigation applications (Google Maps, OpenStreetMap, Mapbox) optimize primarily for shortest distance, estimated travel time, or vehicle traffic flow. These factors do not communicate historical crime-related characteristics of the urban road corridors through which a pedestrian or driver must travel.

**SafeRoute** addresses this information gap by:
1. Generating candidate route alternatives between an origin and destination.
2. Spatially associating historical crime incidents with road segments within a precise spatial buffer ($80\text{m}$).
3. Grouping crime incidents into geographical hotspots using **K-Means Clustering**.
4. Evaluating multivariate segment risk using a supervised **Random Forest Classifier** alongside a 100% transparent, explainable scoring baseline.
5. Comparing three distinct alternatives:
   - **Shortest Route** (optimizes distance)
   - **Lower-Estimated-Risk Route** (optimizes historical safety score)
   - **Balanced Route** (optimizes multi-objective trade-off function $J$)
6. Communicating **Data Coverage & Uncertainty**: Missing crime data is never mistaken for evidence of safety.

> **Important Boundary & Ethical Disclaimer:**  
> SafeRoute is strictly a **decision-support research tool**. It estimates relative historical risk from recorded data. It **never claims to guarantee personal safety**, predict immediate or real-time danger, or replace emergency law enforcement services.

---

## 2. Research Foundation

SafeRoute builds upon published research in crime-aware spatial routing:
- **Focus Paper**: Praveen Kumar Kollu, V.S.S.S. Veda Swaroop Cheruvu, and Peetha Manikantha (2025). *"A Hybrid K-Means and Random Forest Framework for Crime-Aware Route Optimization in Urban Navigation Systems."* ICCTDC, IEEE. DOI: `10.1109/ICCTDC64446.2025.11158939`.
- **Methodology References**: 
  - Theron & Breetzke (2024). *"What's the Safest Way Home? Mapping Safe Transport Routes in South Africa with (and without) Crime Data."* Journal of Transportation Security.
  - Sohrabi et al. (2022). *"Safe route-finding: A review of literature and future directions."* Accident Analysis & Prevention, 177, 106816.

---

## 3. System Architecture & Project Structure

SafeRoute is structured cleanly into frontend, backend, test suites, and documentation:

```
SafeRoute/
├── frontend/                     # React + Vite + Tailwind CSS + Leaflet
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with mobile hamburger drawer
│   │   │   ├── RouteSearch.jsx   # Coordinate inputs, preset chips, mode & time selection
│   │   │   ├── RouteMap.jsx      # Leaflet map with route polylines, hotspots & incident pins
│   │   │   ├── RouteCard.jsx     # Side-by-side or stacked route comparison cards
│   │   │   ├── RiskLegend.jsx    # Visual legend for risk tiers & ethical disclosures
│   │   │   ├── ExplanationModal.jsx # Factor attribution & segment breakdown
│   │   │   ├── DatasetInfoModal.jsx # Data provenance, bounding box & limitations
│   │   │   └── MLInsightsModal.jsx  # K-Means hotspots & Random Forest evaluation
│   │   ├── services/
│   │   │   └── api.js            # Fetch client connecting to Flask REST endpoints
│   │   ├── App.jsx               # Master state coordinator & responsive grid
│   │   ├── index.css             # Tailwind base & custom Leaflet styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # Vite config with backend proxy (/api -> :5000)
│   └── package.json
├── backend/                      # Python Flask REST API
│   ├── app.py                    # Flask application entry point & CORS configuration
│   ├── routes.py                 # REST endpoints (/api/routes/compare, /api/health, etc.)
│   ├── risk_engine.py            # Explainable scoring & multi-objective ranking
│   ├── ml_model.py               # K-Means clustering & Random Forest classifier
│   ├── data_processor.py         # Haversine distance, segment buffering & coverage tracking
│   ├── database.py               # SQLite schema & query operations
│   ├── routing_service.py        # OSRM client with resilient geometric fallback
│   ├── saferoute.db              # Seeded SQLite database
│   └── requirements.txt          # Python dependencies
├── tests/                        # Automated Pytest Test Suite
│   ├── test_api.py               # End-to-end REST API endpoint validation (8 tests)
│   ├── test_risk_engine.py       # ML clustering, RF evaluation & risk formulas (5 tests)
│   └── test_data_processor.py    # Spatial joins, buffers & coverage tests (7 tests)
├── docs/                         # Academic Documentation
│   ├── API_DOCUMENTATION.md      # OpenAPI/REST endpoint specifications
│   └── ALGORITHMS_EXPLAINED.md   # Mathematical derivations and formulas
├── README.md                     # Complete project documentation
└── plan.md                       # Original mini-project specification
```

---

## 4. Key Mathematical Formulations

### 1. Explainable Segment Risk Score ($R_i$)
$$R_i = 100 \times \left( w_c C_i + w_s S_i + w_t T_i \right)$$
- $C_i$: Normalized incident density ($\text{incidents/km}$)
- $S_i$: Normalized severity rating ($\text{severity} / 3.0$)
- $T_i$: Departure time-window alignment factor
- Default weights: $w_c = 0.45, w_s = 0.35, w_t = 0.20$ ($\sum w = 1.0$)

### 2. Length-Weighted Route Risk ($R_{\text{route}}$)
$$R_{\text{route}} = \frac{\sum_{i=1}^M d_i \times R_i}{\sum_{i=1}^M d_i}$$
Length-weighting ensures that a 20-meter alleyway does not disproportionately skew a 5-kilometer commute.

### 3. Multi-Objective Balanced Route Objective ($J$)
$$J = \alpha \left(\frac{D}{D_{\text{ref}}}\right) + \beta \left(\frac{T}{T_{\text{ref}}}\right) + \gamma \left(\frac{R}{100}\right)$$
- $\alpha = 0.35$ (Distance weight)
- $\beta = 0.25$ (Travel time weight)
- $\gamma = 0.40$ (Historical risk weight)

---

## 5. Setup & Execution Instructions

### Prerequisites
- **Python**: Version `3.10` or higher (compatible with Python 3.14)
- **Node.js**: Version `18.0` or higher & `npm`

---

### Step 1: Set Up Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask backend server:
   ```bash
   python app.py
   ```
   *The server starts on `http://127.0.0.1:5000`. On first launch, it automatically seeds `saferoute.db` with 1,249 validated study area incident records, fits the K-Means clustering model, and trains the Random Forest classifier.*

---

### Step 2: Set Up Frontend

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 6. Running Automated Tests

SafeRoute includes a 20-test automated test suite using `pytest`:

```bash
# From the project root
backend\.venv\Scripts\pytest -v tests
```

### Test Suite Summary:
- `tests/test_api.py` (8 tests): Validates `/api/health`, `/api/metadata`, `/api/incidents`, `/api/hotspots`, `/api/ml/evaluation`, `/api/presets`, input validation, and coordinate boundary error handling.
- `tests/test_risk_engine.py` (5 tests): Validates K-Means clustering, Random Forest training/evaluation, segment scoring formula, and multi-objective route ranking.
- `tests/test_data_processor.py` (7 tests): Validates Haversine distance, point-to-segment buffering, time-of-day parsing, coverage tracking, and SQLite operations.

**Result: 20 passed in 6.24s (100% pass rate).**

---

## 7. Responsive UI/UX Specifications

SafeRoute implements a **mobile-first responsive architecture** tested across standard viewport resolutions:

| Device Viewport | Dimensions | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile Phone** | $360 \times 800$ & $390 \times 844$ | Hamburger drawer, tabbed toggle between Map & Route Cards, $\ge 44\text{px}$ touch targets |
| **Tablet** | $768 \times 1024$ | Vertically stacked cards, responsive Leaflet map, adaptable typography |
| **Laptop** | $1366 \times 768$ | Two-column master-detail grid with sticky Leaflet map |
| **Desktop / Monitor** | $1920 \times 1080$ | Full-width container, side-by-side search, comparative cards & map |

---

## 8. Known Limitations & Future Enhancements

### Limitations
1. **Reporting Bias**: Historical crime records reflect reported incidents only; under-reporting varies across demographic groups.
2. **Privacy Anonymization**: Incident coordinates are snapped to road midpoints to protect victim privacy, introducing minor spatial imprecision.
3. **No Real-Time Danger Guarantee**: A historical indicator cannot predict active crimes or guarantee personal safety.

### Future Enhancements
1. **Safety Infrastructure Integration**: Incorporating verified street lighting density, CCTV coverage, and active police patrol routes.
2. **Multi-City Generalization**: Expanding beyond the primary study corridor to multiple metropolitan areas.
3. **Transit Multimodality**: Integrating public transit (buses, subways) with walking first/last-mile safety analysis.

---

## 9. Academic Project Submission Details

- **Project Title**: SafeRoute: An Explainable and Time-Aware Crime-Aware Route Recommendation System Using Machine Learning and Geospatial Analysis
- **Domain**: Artificial Intelligence / Machine Learning / GIS & Web Navigation
- **Course**: 5th-Semester Computer Science & Engineering (CSE) Mini-Project
- **Reference Document**: [`plan.md`](file:///c:/Users/manal/OneDrive/Desktop/SafeRoutes/plan.md)

