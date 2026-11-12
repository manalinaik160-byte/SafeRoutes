# SafeRoute — Algorithms & Mathematical Formulations

This document provides a comprehensive academic explanation of all algorithms, geospatial calculations, and machine learning models implemented in **SafeRoute**, prepared for CSE 5th-semester mini-project defense and evaluation.

---

## 1. Geospatial Analysis & Spatial Buffering

### 1.1 Great-Circle Distance (Haversine Formula)
To measure physical distance between coordinate points on the curved surface of the Earth without distortion, SafeRoute uses the Haversine formula:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c$$

Where:
- $\phi_1, \phi_2$: Latitudes in radians
- $\lambda_1, \lambda_2$: Longitudes in radians
- $R = 6,371,000 \text{ meters}$ (Mean volumetric radius of Earth)

### 1.2 Point-to-Segment Perpendicular Projection
Road networks consist of sequential polyline segments $AB$. An incident at point $P(lat_p, lon_p)$ must be assigned to segment $AB$ if it occurred within an $80\text{m}$ buffer.

1. Points $A, B, P$ are converted to local metric Cartesian coordinates $(x, y)$ using equirectangular scaling centered at $\bar{\phi} = \frac{\phi_A + \phi_B + \phi_P}{3}$:
   $$x = \Delta\lambda \times \left(111412.84 \cos\bar{\phi}\right), \quad y = \Delta\phi \times \left(111132.95 - 559.82\cos 2\bar{\phi}\right)$$
2. Scalar projection $t$ determines the projection of $P$ onto vector $\vec{AB}$:
   $$t = \frac{\vec{AP} \cdot \vec{AB}}{\|\vec{AB}\|^2}$$
3. Clamping $t^* = \max(0, \min(1, t))$ enforces that the closest point lies strictly within segment endpoints.
4. Perpendicular distance is:
   $$d_\perp = \| P - (A + t^* \vec{AB}) \|$$

---

## 2. K-Means Geospatial Clustering (Crime Hotspots)

### 2.1 Optimization Objective
K-Means partitions $N$ historical incident coordinates into $K$ disjoint spatial clusters $C = \{C_1, C_2, \dots, C_K\}$ by minimizing Within-Cluster Sum of Squares (WCSS / Inertia):

$$\text{WCSS} = \sum_{k=1}^K \sum_{x \in C_k} \| x - \mu_k \|^2$$

Where $\mu_k = \frac{1}{|C_k|} \sum_{x \in C_k} x$ is the cluster centroid.

### 2.2 Optimal $K$ Selection (Elbow Heuristic & Silhouette Score)
The number of clusters $K$ is justified using the **Silhouette Score**:

$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$

Where:
- $a(i)$: Mean intra-cluster distance of sample $i$ to all other points in the same cluster.
- $b(i)$: Mean nearest-cluster distance of sample $i$ to points in the closest neighboring cluster.

For the Central London urban corridor dataset, $K=5$ yields the optimal silhouette score and distinct spatial epicenters (West End, City/Bank, Southwark, Shoreditch, Fleet Street).

### 2.3 Effective Hotspot Radius
Rather than treating a hotspot as a single dimensionless point, the effective spatial radius is computed from the 90th percentile distance of incidents to their centroid:

$$\text{Radius}_k = \text{Percentile}_{90}\left(\{ d_{\text{Haversine}}(\mu_k, x) \mid x \in C_k \}\right)$$

---

## 3. Supervised Random Forest Classifier

### 3.1 Feature Vector Construction
For each candidate road segment, a 5-dimensional feature vector is constructed:
1. `incident_count` ($x_1$): Total incidents falling within the $80\text{m}$ buffer.
2. `severity_sum` ($x_2$): Sum of severity ratings ($\sum \text{severity}_j$).
3. `nearest_hotspot_km` ($x_3$): Distance in km to the nearest K-Means cluster centroid.
4. `night_ratio` ($x_4$): Ratio of incidents occurring during late-night hours ($22:00 - 05:59$).
5. `segment_length_km` ($x_5$): Physical length of the road segment.

### 3.2 Target Risk Classes & Gini Impurity
Segments are labeled based on empirical density thresholds:
- $y = 0$ (`low_risk`): Density $< 2.0 \text{ severity/km}$
- $y = 1$ (`moderate_risk`): $2.0 \le \text{Density} < 8.0 \text{ severity/km}$
- $y = 2$ (`higher_risk`): $\text{Density} \ge 8.0 \text{ severity/km}$

The Random Forest constructs an ensemble of $B=50$ decorrelated decision trees, splitting nodes by minimizing Gini impurity:

$$I_G(p) = 1 - \sum_{c=0}^2 p_c^2$$

---

## 4. Explainable Segment Risk Scoring

To preserve 100% transparent explainability for users and evaluators, the segment risk score $R_i \in [0, 100]$ is computed via a transparent weighted combination:

$$R_i = 100 \times \left( w_c C_i + w_s S_i + w_t T_i \right)$$

Where:
- **Normalized Frequency ($C_i$)**:
  $$C_i = \min\left(1.0, \frac{\text{incident\_count}}{10.0 \times \text{length\_km}}\right)$$
- **Normalized Severity ($S_i$)**:
  $$S_i = \frac{\bar{S}_i - 1.0}{2.0} \quad \text{where } \bar{S}_i \in [1.0, 3.0]$$
- **Temporal Alignment ($T_i$)**:
  $$T_i = \min\left(1.0, \frac{\text{incidents in departure window}}{\text{total incidents}} \times 1.25\right)$$
- **Weights**:
  $$w_c = 0.45, \quad w_s = 0.35, \quad w_t = 0.20 \quad (\sum w = 1.0)$$

---

## 5. Length-Weighted Route Aggregation

A major flaw in naive routing averages is that a 15-meter alleyway can skew a 5-kilometer journey. SafeRoute solves this using length-weighted integration:

$$R_{\text{route}} = \frac{\sum_{i=1}^M d_i \times R_i}{\sum_{i=1}^M d_i}$$

Where $d_i$ is the physical length of segment $i$ in meters.

### Risk Tier Boundaries:
- $R_{\text{route}} \in [0, 35)$: **Lower Historical Risk**
- $R_{\text{route}} \in [35, 65)$: **Moderate Historical Risk**
- $R_{\text{route}} \in [65, 100]$: **Higher Historical Risk**

---

## 6. Multi-Objective Route Comparison & Trade-Offs

When comparing candidate paths returned by the routing provider, SafeRoute assigns three distinct roles:

### 6.1 Shortest Route
Minimizes total distance:
$$\text{Route}_{\text{Shortest}} = \arg\min_{r} D_r$$

### 6.2 Lower-Estimated-Risk Route
Minimizes historical crime risk:
$$\text{Route}_{\text{LowerRisk}} = \arg\min_{r \in \text{HighCoverage}} R_r$$

### 6.3 Balanced Route (Trade-off Cost $J$)
Evaluates the multi-objective cost function:

$$J = \alpha \left(\frac{D}{D_{\text{ref}}}\right) + \beta \left(\frac{T}{T_{\text{ref}}}\right) + \gamma \left(\frac{R}{100}\right)$$

Where:
- $D_{\text{ref}} = \min_r(D_r)$: Reference distance (shortest candidate)
- $T_{\text{ref}} = \min_r(T_r)$: Reference time (fastest candidate)
- $\alpha = 0.35$ (Distance trade-off weight)
- $\beta = 0.25$ (Travel time trade-off weight)
- $\gamma = 0.40$ (Historical risk weight)

The candidate with the lowest $J$ value represents the optimal compromise.

---

## 7. Data Confidence & Uncertainty Principle

From `plan.md` Section 10:
> *"Low incident counts can mean low recorded crime, poor reporting, or missing data. Never convert missing data into a zero-risk value."*

SafeRoute checks the percentage of vertices within the study bounding box:
$$\text{Coverage} = \frac{\text{Vertices inside Bounding Box}}{\text{Total Route Vertices}} \times 100\%$$

- **High Confidence ($\ge 90\%$)**: Fully supported historical evaluation.
- **Medium Confidence ($60\% - 89\%$)**: Fringe traverse warning.
- **Low Confidence ($20\% - 59\%$)**: Low confidence alert.
- **Insufficient Data ($< 20\%$)**: Warning triggered; risk score marked as uncalibrated.

