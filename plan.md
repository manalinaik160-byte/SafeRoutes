Computer Science Engineering · Mini-Project Proposal
SafeRoute
An Explainable and Time-Aware Crime-Aware Route Recommendation System Using Machine Learning and Geospatial Analysis

A complete project document covering the concept, research background, research gap, objectives, expected outcomes, methodology, algorithms, architecture, tools, limitations, testing and implementation plan.

AI / Machine Learning
Geospatial Analysis
Web Application
Historical Crime Data
Contents
1. Project overview
2. Problem statement
3. Project title
4. Brief description
5. Objectives
6. Research papers reviewed
7. Hybrid K-means + RF paper
8. Research gap and novelty
9. Proposed methodology
10. Algorithms and scoring
11. System architecture
12. Features and workflow
13. Expected outcomes
14. Advantages
15. Disadvantages and limitations
16. Tools and technologies
17. Dataset and data strategy
18. API and database design
19. Testing and evaluation
20. Team division
21. Implementation plan
22. Scope and priorities
23. Safety, privacy and ethics
24. References and resources
25. Final checklist
1. Project overview
SafeRoute is a proposed web-based route recommendation system that compares alternative routes using historical crime information and available geographical safety indicators, in addition to distance and estimated travel time.

Recommended project direction: Build an explainable, time-aware and data-confidence-based route recommendation system. The key contribution is helping users understand estimated route risk, the reasons behind a score, the completeness of the data and the trade-off between risk, distance and time.
Domain
AI, ML and GIS
Application
Responsive web app
Initial scope
One selected study area
The system is a decision-support tool. It does not guarantee that a route is safe, predict immediate danger or replace official emergency services.

2. Problem statement
Conventional navigation applications generally optimize routes around distance, estimated travel time or traffic. These factors do not necessarily communicate the historical crime-related characteristics of the areas through which a route passes.

People travelling through unfamiliar areas may therefore have limited information with which to compare the historical risk characteristics of alternative routes. SafeRoute aims to address this information gap by analysing available historical crime records, identifying geographical concentrations of incidents and presenting route alternatives with understandable risk indicators.

Important boundary: The system estimates relative risk from the data it has. Historical records can be incomplete or biased and cannot establish whether a route is safe at the moment a user travels.
3. Project title
Recommended full title
SafeRoute: An Explainable and Time-Aware Crime-Aware Route Recommendation System Using Machine Learning and Geospatial Analysis

Short alternative
SafeRoute: Intelligent Crime-Aware Route Optimization for Safer Urban Navigation

The first title is recommended because it makes the intended differentiators—explainability and time-aware analysis—visible in the project title. Retain “time-aware” only if the selected dataset has sufficiently reliable incident timestamps.

4. Brief description
SafeRoute is a web-based intelligent navigation system designed to recommend comparatively lower-risk routes between a user's starting point and destination by analysing historical crime information and geographical safety factors.

Unlike conventional navigation systems that primarily focus on the shortest distance or fastest travel time, SafeRoute considers crime frequency, crime severity, incident recency and time-based patterns wherever reliable data is available.

The system uses geospatial analysis to associate crime records with geographical areas or road segments, clustering techniques such as K-means to identify crime hotspots, and—if the dataset supports a valid supervised-learning setup—Random Forest to estimate route-segment risk. Candidate routes are compared using distance, estimated time and historical risk indicators.

Users can compare the shortest route, a comparatively lower-estimated-risk route and a balanced route. Each result should explain the factors contributing to its score and display data coverage or confidence information. SafeRoute communicates historical indicators, not a guarantee of personal safety.

5. Objectives
To develop a web-based navigation system that considers historical crime information during route selection.
To identify geographical crime hotspots using clustering techniques such as K-means.
To estimate the relative risk of road segments using machine-learning techniques such as Random Forest, subject to dataset suitability.
To analyse crime frequency, severity and recency, and incorporate time-of-day patterns when reliable timestamps are available.
To generate and compare alternative routes based on distance, estimated travel time and crime-related risk.
To provide explainable risk scores so users can understand the factors influencing each route's assessment.
To display data coverage and confidence indicators so missing crime information is not mistaken for evidence of safety.
To evaluate the proposed system against conventional shortest-route recommendations and a suitable baseline method.
6. Research papers reviewed
The following papers were discussed as relevant background. They show that crime-aware and safety-aware route planning is an established research area. SafeRoute should therefore avoid claiming that crime-aware routing or the combination of clustering and machine learning is entirely new.

6.1 What's the Safest Way Home? Mapping Safe Transport Routes in South Africa with (and without) Crime Data (2024)
Authors: Theron and Breetzke. Journal: Journal of Transportation Security.

Compares safe-route approaches using historical crime data and approaches that use risky facilities or other indicators where detailed crime data is unavailable.
Illustrates the challenge of obtaining detailed, point-level crime information.
Useful for SafeRoute's fallback data strategy: clearly distinguish crime-based analysis from proxy-indicator analysis.
Read the paper at Springer

6.2 Safe Route-Finding: A Review of Literature and Future Directions (2022)
Authors: Sohrabi et al. Journal: Accident Analysis & Prevention, 177, 106816.

Reviews research on safe route-finding and identifies challenges in data availability, risk measurement and modelling.
Highlights the difficulty of balancing safety with route distance and travel time.
Useful for framing the research problem, limitations and evaluation criteria.
Read through DOI · PubMed record

6.3 Danger by Design? Mapping Safe Route Choices in the City of Tshwane, South Africa (2026)
Authors: Purchase and Breetzke.

Considers historical incivilities, risky facilities and safety infrastructure such as CCTV or patrols.
Examines differences such as day/night and weekdays/weekends.
Useful inspiration for time-aware analysis and the careful inclusion of verified infrastructure data. Incivilities should not automatically be treated as equivalent to recorded crimes.
Read the paper at Springer

6.4 Route-The Safe: A Robust Model for Safest Route Prediction Using Crime and Accidental Data (2019)
Authors: Soni et al.

Explores route-risk prediction using crime and accident information, clustering and machine-learning approaches.
Useful when considering accident records as an optional additional risk factor, if reliable data is available.
Read the paper

6.5 A Hybrid K-Means and Random Forest Framework for Crime-Aware Route Optimization in Urban Navigation Systems (2025)
Authors: Praveen Kumar Kollu, V.S.S.S. Veda Swaroop Cheruvu and Peetha Manikantha. Conference: 2025 International Conference on Computing Technologies & Data Communication (ICCTDC). DOI: 10.1109/ICCTDC64446.2025.11158939.

Combines K-means clustering and Random Forest for crime-aware route optimization.
The described system, GuardianNav, uses UK Police crime data focused on the City of London, covering December 2023 to September 2024.
It is the closest methodological reference to the proposed SafeRoute concept and should be studied carefully before claiming a research gap.
Open the paper using its DOI · ResearchGate record

Research verification note: The above descriptions summarize the papers as discussed, not a substitute for checking each full paper. Before submitting a formal literature survey, verify author names, publication details, methods, datasets, results and limitations against the actual full text. Do not repeat a performance figure or claim without checking its experimental setup.
7. Focus paper: Hybrid K-means and Random Forest
The 2025 paper is particularly important because it already combines crime hotspot clustering, machine learning and route optimization. Its broad workflow can be understood as follows.

1. Crime data collection
Coordinates, crime categories, dates, severity and incident frequency
↓
2. K-means clustering
Groups nearby incidents and identifies geographical crime hotspots
↓
3. Candidate route generation
Routing service generates possible paths between origin and destination
↓
4. Random Forest classification
Uses route-related features to estimate or classify risk, according to the paper's model setup
↓
5. Route risk assessment
Combines crime-related indicators and hotspot proximity
↓
6. Route recommendations
Displays route options and relevant hotspot information on a map
What the algorithms do
Technique	Role
K-means	Groups geographical incident points into clusters; clusters can help identify concentrations of recorded incidents.
Random Forest	Uses labelled examples and selected features to classify or estimate risk. It requires a defensible target label and appropriate training/test separation.
Route scoring / optimization	Compares candidate paths using risk-related features and route costs such as distance or time.
What overlaps with the original SafeRoute idea?
Proposed SafeRoute feature	Overlap with focus paper
Crime hotspot identification	Yes, through clustering
K-means clustering	Yes
Random Forest risk classification	Yes
Crime frequency / severity features	Crime-related features are part of the described approach; verify the exact feature list in the paper
Crime-aware route comparison	Yes
Map-based route display	Yes
Explainable factor-by-factor output	Potential differentiation; verify the paper's exact explanation facilities
Data coverage / uncertainty display	Potential differentiation to develop and evaluate
Novelty warning: Reimplementing K-means + Random Forest with a different user interface or a different city's dataset is not, by itself, a strong claim of technical novelty.
8. Research gap and proposed differentiation
SafeRoute should focus on a defensible contribution that can be implemented and evaluated by the team. The strongest proposed direction is transparent route comparison under incomplete historical data.

Existing approach / challenge	Proposed SafeRoute improvement
Routes may be represented with broad safe/unsafe classes	Display a relative risk score with a clear explanation of its contributing factors.
Historical crime information may not reflect differences between travel times	Compare historical time-of-day patterns when reliable timestamps exist.
Missing incident records may be misinterpreted as low risk	Display data coverage and confidence; mark insufficiently supported areas as unknown or low-confidence.
Users may see only one recommended path	Show shortest, lower-estimated-risk and balanced route alternatives.
Route score may not explain why a path was ranked higher	Show incident frequency, severity, recency and other available feature contributions.
Models may be tested on one study region	Document the study-area boundaries and test generalization only if a second suitable dataset is available.
Recommended core contribution
Explainable and confidence-aware route risk assessment. Make it possible for a user or evaluator to understand not only which route received a lower estimated-risk score, but also why it received that score and how complete the underlying data is.
Time-aware analysis is a valuable secondary contribution, but it should only be claimed if the crime dataset includes reliable date/time information and enough observations to support meaningful comparisons.

9. Proposed methodology
Select a study area: Choose one city or a limited neighbourhood. Do not start with an entire country or a large region.
Acquire and inspect data: Identify the source, geographical precision, date range, crime categories, missing fields, update frequency and usage licence.
Clean the data: Remove duplicates where justified, handle missing values, standardize categories and validate coordinates.
Prepare geospatial data: Convert incident records into a consistent coordinate reference system and obtain road-network geometry.
Identify hotspots: Apply K-means or another justified spatial method to incident coordinates. Choose the number of clusters using a documented method.
Generate candidate routes: Use a routing service to obtain available paths between the user's origin and destination.
Associate incidents with route segments: Use spatial operations to count or otherwise summarize nearby incidents. Document the buffer distance and avoid double-counting the same incident without a reason.
Calculate route features: Derive incident frequency, severity, recency and optional time-of-day indicators for each segment or route.
Estimate relative risk: Start with a transparent baseline risk score. Add Random Forest only if there are valid labels and sufficient data to train and test it.
Measure data coverage: Record whether each route segment has usable data, the date range represented and any known gaps.
Rank and compare routes: Present shortest, lower-estimated-risk and balanced options rather than hiding all trade-offs behind one result.
Display explanations: Show the score, key contributing factors, distance, estimated duration, coverage and limitations.
Evaluate: Compare against a shortest-route baseline and document the limitations of any model metrics.
10. Algorithms and risk-scoring approach
10.1 K-means clustering
K-means partitions data points into a chosen number of clusters by assigning each point to the nearest cluster centre and updating centres to reduce within-cluster squared distance. In SafeRoute, incident coordinates can be clustered to identify concentrations of recorded crime.

Input: validated geographical coordinates (and, if appropriate, transformed projected coordinates). Output: cluster assignments and cluster centres.

Important: K-means identifies spatial groupings; a cluster is not automatically proof that a place is dangerous. The number of clusters, coordinate projection and clustering parameters must be justified.

10.2 Random Forest
Random Forest is an ensemble learning method that combines predictions from multiple decision trees. In SafeRoute, it may classify a route segment or route into risk categories using features such as incident frequency, severity summaries, recency and hotspot proximity.

Input features might include: incident count within a defined buffer, severity-weighted count, time-window statistics, distance to a hotspot and data availability indicators.

Critical requirement: Supervised Random Forest needs a defensible target label. Do not invent “safe” and “unsafe” labels merely to train the model. Explain how labels are created, prevent data leakage, use geographically/time-aware train-test separation where appropriate and compare against simple baselines. If labels are unavailable or unreliable, use transparent scoring rather than presenting an unsupported classifier.

10.3 Illustrative segment risk score
A transparent starting point for segment \(i\) is:

R_i = 100 × (w_c C_i + w_s S_i + w_t T_i)
C_i: normalized incident frequency for the segment.
S_i: normalized severity indicator, based on documented category weights.
T_i: time-related factor, only if incident timestamps support it.
w_c, w_s, w_t: documented weights that sum to 1.
This is an illustrative design, not a validated crime-risk formula. Normalize features consistently, justify category weights, test sensitivity to weight choices and avoid counting the same information twice.

10.4 Route-level score
R_route = Σ(d_i × R_i) / Σ(d_i)
Here, d_i is the length of segment i and R_i is its estimated relative risk. Length-weighting prevents a very short segment from having the same influence as a much longer segment, but other aggregation approaches may be justified and tested.

10.5 Balanced route objective
J = α(D / D_ref) + β(T / T_ref) + γ(R / 100)
D: candidate route distance; D_ref: reference distance.
T: estimated travel time; T_ref: reference time.
R: relative route risk score.
α, β, γ: documented weights that express the chosen trade-off.
Smaller objective values rank better under the chosen weights. Present the component values as well as the combined score so users can see the trade-off. A Pareto-style comparison is also possible.

Uncertainty rule: Low incident counts can mean low recorded crime, poor reporting or missing data. If coverage is insufficient, show “insufficient data” or a low-confidence warning. Never convert missing data into a zero-risk value.
11. Proposed system architecture
User / Browser
Origin, destination and optional time or travel mode
↓
React + Vite frontend
Search form, route cards, explanation panel and Leaflet map
↓ HTTP / JSON
Python Flask REST API
Validates input and coordinates route and risk processing
↓
Routing service
OSRM / OpenRouteService candidate paths
Crime-data pipeline
Pandas, GeoPandas, Shapely and database
↓
Risk analysis engine
K-means hotspot analysis, feature extraction, optional Random Forest and coverage assessment
↓
Route ranking and explanation
Risk, distance, duration, data coverage and trade-offs
↓
Frontend results
Interactive map, route alternatives and factor explanations
End-to-end workflow
User enters starting point and destination.
Geocoding converts place names into coordinates.
The routing service generates one or more candidate routes.
Route geometries are divided into or matched against road segments.
Crime records are spatially associated with relevant segments.
The risk engine calculates available features and segment/route scores.
The coverage module identifies missing or weakly supported areas.
The system ranks and explains route alternatives.
The frontend displays route lines, map markers, scores and limitations.
12. Features and user workflow
Core screens
1. Route planner
Origin and destination search, optional departure time and a clearly stated travel mode.

2. Route comparison
Interactive map, candidate paths, distance, estimated duration and relative risk indicators.

3. Risk explanation
Breakdown of available factors, data coverage, data source and known limitations.

4. Data information
Study area, date range, source, last checked date, missing fields and coverage notes.

Suggested route options
Option	Optimization priority	What the user sees
Shortest route	Distance	Shortest available candidate and its risk information.
Lower estimated-risk route	Historical risk score	Candidate with the lowest supported risk score, including any coverage warning.
Balanced route	Risk, distance and time	Candidate selected using documented trade-off weights.
Illustrative result card (not real data)
Route A · Shortest
4.2 km · 14 min

Illustrative relative risk: 72/100

Higher estimated historical risk in this example.
Route B · Lower risk
5.1 km · 18 min

Illustrative relative risk: 35/100

Longer route with lower estimated historical risk in this example.
Route C · Balanced
4.6 km · 16 min

Illustrative relative risk: 48/100

Illustrative compromise between distance and risk.
Coverage note
Coverage: example only

A real result must show the actual percentage or category calculated from the dataset, not a made-up value.

13. Expected outcomes
At the end of development, the team expects to deliver:

A working responsive web application in which users can enter a source location and destination.
An interactive map displaying candidate routes and available historical incident markers or hotspot areas.
A geospatial processing module that associates crime records with geographical areas or route segments.
A hotspot identification module using K-means or a justified alternative.
A transparent route-risk scoring module and a Random Forest module only if the dataset supports valid supervised learning.
Comparisons of shortest, lower-estimated-risk and balanced routes.
Explanations of the available factors influencing each route's score.
Data coverage and confidence indicators, including clear warnings for insufficient data.
A project report describing the dataset, methods, experiments, results and limitations.
Expected outcome is a functional prototype and evaluated method—not proof that the application reduces crime or guarantees safer journeys.
14. Advantages
Safety-oriented navigation: Considers historical crime indicators instead of relying only on shortest-distance calculations.
Better-informed route choices: Gives users multiple alternatives based on different priorities.
Crime hotspot identification: Helps identify locations with higher concentrations of recorded incidents.
Machine-learning integration: Provides an opportunity to apply clustering and classification to a real-world problem.
Explainable results: Shows which available factors contribute to a route's estimated score.
Time-aware analysis: Can compare historical patterns at different times of day when timestamps are available.
User awareness: Communicates data coverage and known limitations along candidate routes.
Extensibility: Additional verified indicators, such as street lighting, CCTV, public transport access or patrol locations, can be added when reliable data is available.
Research value: Allows comparison between a shortest-route baseline and a risk-aware approach.
15. Disadvantages and limitations
Data availability: Accurate, location-specific crime records may be difficult to obtain, especially for Indian cities.
Data reliability: Records can be underreported, outdated, incomplete or inconsistently categorized.
No real-time danger detection: Historical crime data cannot identify an immediate threat or guarantee current conditions.
Machine-learning limitations: Random Forest depends on representative training data and reliable labels.
Longer travel distance: A lower-estimated-risk route may take more time or cover more distance.
Computational complexity: Geospatial processing, clustering and evaluating several candidate routes can require additional computation.
Score uncertainty: A low score does not guarantee safety; a high score does not prove that a route is unsafe.
Geographical limitations: A model developed for one study area may not generalize to another city.
Bias and stigmatization: Crime data may reflect reporting patterns and policing practices. Poorly designed labels can stigmatize neighbourhoods.
External service dependence: Geocoding and route services may have usage limits, availability constraints or terms that affect deployment.
Dataset granularity warning: If a dataset contains only district- or police-station-level totals, do not assign those totals to individual streets or invent precise incident coordinates. Use a clearly labelled demonstration dataset for UI testing, or narrow the study area to a source with suitable spatial detail.
16. Tools and technologies
Recommended implementation stack for a manageable semester mini-project:

Component	Recommended technology	Purpose
Frontend	React + Vite	Build the route search, results and explanation interface.
UI styling	HTML, CSS, JavaScript, Tailwind CSS	Responsive and consistent user interface.
Interactive map	Leaflet + OpenStreetMap	Display routes, incident markers and hotspot areas.
Backend	Python + Flask	API endpoints, validation and application logic.
Machine learning	Scikit-learn	K-means and Random Forest implementation.
Data processing	Pandas, NumPy	Clean, transform and analyse tabular data.
Geospatial analysis	GeoPandas, Shapely	Spatial joins, buffers, coordinate operations and route-segment analysis.
Routing	OSRM or OpenRouteService	Generate candidate routes and route geometries.
Database	SQLite initially	Store processed incidents and dataset metadata.
Development	VS Code, Git, GitHub	Code editing, version control and collaboration.
Testing	Pytest, Postman	Backend unit tests and API testing.
Why this stack?
React and Vite provide a convenient way to build a responsive single-page interface.
Leaflet is suitable for displaying map tiles, route polylines and markers.
Python has accessible libraries for machine learning, tabular data and geospatial analysis.
Flask is lightweight and sufficient for a mini-project API.
SQLite reduces database setup effort for an initial prototype. PostgreSQL/PostGIS can be considered later if needed.
Initial setup commands
Frontend:

npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install leaflet react-leaflet
npm run dev
Backend (Windows PowerShell):

cd backend
py -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install flask flask-cors requests pandas numpy scikit-learn geopandas shapely
pip freeze > requirements.txt
Install Node.js LTS and Python 3 first. If PowerShell blocks activation, use the appropriate execution-policy guidance for your own machine or activate the environment through Command Prompt. Geospatial package installation can vary by operating system.

17. Dataset and data strategy
Data fields to look for
Field	Why it matters
Incident ID or unique record key	Helps identify duplicates without exposing personal information.
Latitude and longitude or precise geography	Needed for defensible spatial analysis at the intended scale.
Crime category	Allows category-level summaries and analysis.
Severity or a documented category mapping	Supports a transparent severity feature, if justified.
Incident date/time	Supports recency and time-of-day analysis.
Source and reporting period	Supports provenance, freshness and coverage reporting.
Geographical boundary or road network	Helps associate records with the study area and routes.
Potential source to investigate
Crime in India 2023 – Open Government Data portal

Inspect the actual downloadable files and metadata. Confirm whether they contain coordinates, dates, categories, geographical granularity, licence and update details. A national or state-level aggregate table may be useful for context but may not support street-level routing.

Data handling rules
Do not fabricate real-looking incident locations or dates.
If synthetic data is used for a demonstration, label it clearly as synthetic in the interface, report and screenshots.
Do not present ward-, district- or police-station-level totals as exact street-level incident locations.
Record source URL, retrieval date, date range, study area, fields, missingness and licence.
Do not assume that a location with no records has no crime.
Use only data that the project is permitted to access and reuse.
18. Suggested API and database design
Suggested API endpoints
Endpoint	Purpose
GET /api/health	Check whether the backend is running.
POST /api/routes/compare	Generate and compare route candidates.
GET /api/incidents	Retrieve permitted incident records for map display or analysis.
GET /api/metadata	Return dataset source, coverage, date range and limitations.
Illustrative request
{
  "origin": {"lat": 15.85, "lon": 74.50},
  "destination": {"lat": 15.87, "lon": 74.52},
  "travel_mode": "walking",
  "departure_time": "18:00"
}
Coordinates and times above are examples only. Use valid coordinates for the selected study area. Include departure time only if the system supports a time-aware analysis.

Illustrative response structure
{
  "routes": [
    {
      "route_id": "route_1",
      "distance_km": 4.2,
      "duration_min": 14,
      "risk_score": 72,
      "risk_level": "higher_estimated_risk",
      "data_coverage": "medium",
      "risk_factors": [
        "Higher recorded incident frequency",
        "Several incidents in the selected historical period"
      ],
      "notice": "Historical data does not guarantee current safety"
    }
  ],
  "dataset": {
    "source": "documented source name",
    "period": "documented date range",
    "limitations": ["documented limitation"]
  }
}
This is a schema illustration, not a claim that the API or model already exists. Define the exact coverage calculation and response contract before frontend/backend integration.

Suggested SQLite tables
incidents(
  id,
  latitude,
  longitude,
  category,
  severity,
  incident_date,
  source
)

dataset_metadata(
  id,
  dataset_name,
  source_url,
  coverage_area,
  start_date,
  end_date,
  last_verified,
  limitations
)
Additional tables for route requests or model evaluations should be added only if needed. Avoid storing users' route histories unless there is a clear requirement and appropriate privacy protection.

Suggested project folder structure
SafeRoute/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RouteSearch.jsx
│   │   │   ├── RouteMap.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   └── RiskLegend.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── app.py
│   ├── routes.py
│   ├── risk_engine.py
│   ├── data_processor.py
│   ├── database.py
│   ├── data/
│   └── requirements.txt
├── tests/
├── docs/
└── README.md
19. Testing and evaluation
Functional test cases
Test case	Expected behaviour
Valid origin and destination	Generate available routes and show distance, time and supported risk information.
No nearby incident records	Do not automatically label the route safe; display coverage and uncertainty.
Missing or incomplete dataset	Show an insufficient-data warning or suppress unsupported scoring.
Only one route returned	Show the single candidate and clearly state that alternatives were unavailable.
Different departure times	Change the analysis only if reliable timestamp-based patterns are implemented.
Invalid coordinates	Validate input and show a clear error.
Routing API unavailable	Show a service error and do not fabricate a route.
Change route weights	Recalculate route ranking consistently and show the selected trade-off.
Evaluation measures
Route distance overhead: Percentage of extra distance compared with the shortest route.
Travel-time overhead: Additional estimated travel time compared with the fastest candidate.
Estimated risk-score difference: Compare route scores under the same documented risk model.
Data coverage: Percentage or proportion of route length with usable data, using a clearly defined rule.
Model performance: If Random Forest is trained, report appropriate metrics such as precision, recall, F1-score and confusion matrix—not accuracy alone.
Baseline comparison: Compare against shortest-route selection and a transparent non-ML scoring baseline.
Usability: Ask test users to complete route search and interpret the explanations; record task completion and feedback.
Sensitivity analysis: Check whether route rankings change substantially when scoring weights or buffer distances change.
These evaluations test system behaviour and model performance on the selected data. They do not prove that the route is safer in real life or that crime has been reduced.
20. Team division
Member	Responsibility	Deliverables
Member 1	Frontend and map UI	React screens, Leaflet map, route cards and responsive styling.
Member 2	Dataset and GIS	Data-source review, cleaning, coordinate validation, spatial processing and coverage metadata.
Member 3	Backend and algorithm	Flask API, route integration, risk scoring, clustering and optional Random Forest.
Member 4 (if available)	Integration, testing and research	API integration support, test cases, evaluation, literature review, report and presentation.
For a three-person team, combine integration/testing/documentation with the data/GIS or backend member. Assign one person to maintain the shared API contract and integration schedule.

Team collaboration practices
Create the GitHub repository at the beginning.
Agree on the API request/response structure before parallel implementation.
Use branches and meaningful commits; do not overwrite teammates' working code.
Integrate and test at least once each week.
Keep dataset provenance and algorithm assumptions in the README or project documentation.
21. Suggested six-week implementation plan
Period	Work	Milestone
Days 1–4	Research feasibility; select study area; inspect crime data granularity, dates, categories, licence and missing values.	Go/no-go decision on dataset and scope.
Days 5–6	Set up React/Vite and Flask; create GitHub repository; confirm both run locally.	Frontend and backend skeleton.
Week 2	Implement map, geocoding and route-service integration; investigate whether alternative routes are available.	Display a route on the map.
Week 3	Clean and validate data; convert coordinates; identify hotspots; spatially associate incidents with route segments; implement coverage tracking.	Validated data pipeline and hotspot layer.
Week 4	Implement transparent risk scoring; evaluate whether Random Forest has suitable labels and training data.	Risk engine and documented assumptions.
Week 5	Connect frontend and backend; implement route comparison, explanations and warnings.	End-to-end working prototype.
Week 6	Test, evaluate, tune, document limitations, prepare report and presentation.	Demonstrable and documented mini-project.
Adjust this schedule to the actual semester calendar and data-access delays. Data feasibility should be checked before spending time on the machine-learning model.

22. Scope and implementation priorities
Must implement for the MVP
One selected study area.
One travel mode initially—walking is a manageable starting point.
Origin/destination input and map display.
Candidate route generation.
Historical incident visualization and hotspot analysis where supported by data.
Route risk score and data coverage warning.
Distance/time/risk comparison and a short explanation.
Additional features after the MVP works
Time-aware comparison, if timestamps and sample size permit.
Verified safety infrastructure such as street lighting, CCTV or patrol locations.
Accident information as an additional, separately described risk factor.
Additional travel modes or a second study area.
Postpone or avoid initially
User login and account management unless required.
Live crime prediction or claims of real-time danger detection.
Emergency SOS features without a dependable, tested emergency-service integration.
Social-media surveillance or unverified community incident feeds.
Native Android application before the web MVP is stable.
Complex deep learning without a clear need and adequate data.
23. Safety, privacy and ethical considerations
Historical, not predictive certainty: Clearly state that historical records do not reveal immediate danger.
Avoid stigmatizing labels: Do not call neighbourhoods “criminal areas.” Use neutral descriptions such as “higher recorded incident concentration in the selected dataset and period.”
Explain reporting bias: Reported crime data may not represent all incidents equally across places or groups.
Show provenance: Display the data source, period, geographical scope and last verification date.
Protect location privacy: Avoid storing users' origin/destination histories unless necessary. Minimize retention and access.
Do not expose personal data: Exclude victim, witness or suspect identifying details from the application.
Communicate uncertainty: Make insufficient coverage visible and do not imply certainty from a low score.
Use responsible wording: Call results “relative historical risk indicators” or “estimated risk scores,” not guarantees of safety.
24. References and development resources
Research references
Theron & Breetzke (2024), What's the Safest Way Home? Mapping Safe Transport Routes in South Africa with (and without) Crime Data. Springer article.
Sohrabi et al. (2022), Safe route-finding: A review of literature and future directions. Accident Analysis & Prevention, 177, 106816. DOI.
Purchase & Breetzke (2026), Danger by design? Mapping safe route choices in the city of Tshwane, South Africa. Springer article.
Soni et al. (2019), Route-The Safe: A Robust Model for Safest Route Prediction Using Crime and Accidental Data. Journal article.
Kollu, Cheruvu & Manikantha (2025), A Hybrid K-Means and Random Forest Framework for Crime-Aware Route Optimization in Urban Navigation Systems. DOI.
Data and technical documentation
India Open Government Data – Crime in India 2023
OSRM documentation
Leaflet documentation
React documentation
Vite documentation
Flask documentation
GeoPandas documentation
Pandas documentation
Scikit-learn documentation
SQLite documentation
25. Final project checklist
Before development
Choose the study area and travel mode.
Verify dataset source, location precision, date range, fields, licence and limitations.
Decide whether Random Forest is genuinely feasible or whether a transparent score is the defensible MVP.
Write down how hotspot clusters, segment buffers, risk weights and data coverage will be calculated.
Define the baseline and evaluation plan.
Before final demonstration
Demonstrate a valid route search and map display.
Show the shortest, lower-estimated-risk and balanced options when alternatives are available.
Explain why scores differ and show the data coverage.
Show what happens when data is missing or the routing service fails.
Clearly label illustrative or synthetic data.
Present limitations and avoid claiming guaranteed safety.
Include a baseline comparison, tests and reproducible methodology in the report.
Final recommendation
SafeRoute is a worthwhile CSE mini-project if the team keeps the scope focused and verifies the data first. The strongest version is not simply another crime-hotspot map. It is a transparent route-comparison prototype that communicates estimated historical risk, the reasons behind the score, data confidence and the trade-off between route safety indicators, distance and time.

SafeRoute project planning document · Prepared from the project discussion and research references identified during that discussion.

Before formal academic submission, verify every bibliographic detail and methodological claim against the full text of the cited papers and the actual dataset used.