# IPEDS College Dashboard — Design Document

**Date:** 2026-02-07
**Audience:** Higher education researchers and policy analysts
**Goal:** An interactive scatterplot dashboard indexing all 4-year bachelor's-granting institutions, plotting 6-year graduation rate vs. admission rate, with rich filtering and institutional detail.

---

## Data Architecture

### Source: IPEDS 2023 (Static Export)

| IPEDS Survey | What We Get |
|---|---|
| HD2023 (Directory) | Institution name, state, sector (public/private), urbanicity (locale codes), Carnegie classification |
| DRVADM2023 (Admissions) | Admission rate, applicants, admits, enrolled |
| DRVGR2023 (Graduation Rates) | 6-year graduation rate for bachelor's cohort |
| C2023_A (Completions) | Degrees awarded by CIP code (program mix) |
| DRVEF2023 (Enrollment) | Total enrollment, full/part-time |
| SFA2023 (Student Financial Aid) | Pell grant recipient percentage |
| EF2023A (Fall Enrollment by Race) | Race/ethnicity demographics |
| EF2023B (Fall Enrollment by Gender) | Male/female enrollment counts |

### Processing Pipeline

Standalone Python script (`data/pipeline/build_dataset.py`):

1. Filter to 4-year, bachelor's-granting institutions (HD sector + Carnegie codes)
2. Join all tables on UNITID (universal IPEDS institution key)
3. Compute derived fields: gender percentages, race/ethnicity percentages, locale group labels
4. Output two clean files:
   - `institutions.csv` — one row per school, all scalar fields
   - `programs.csv` — one row per school-per-CIP, for program filtering

### Schema Contract

The output CSVs have a documented column spec. Any frontend (Observable, Dash, Streamlit) consumes these same files. No framework-specific data transforms in the presentation layer.

---

## UI Layout

```
+----------------+------------------------------------------+
|                |                                          |
|   FILTERS      |           SCATTERPLOT                    |
|   SIDEBAR      |                                          |
|                |   x: 6-year graduation rate (0-100%)     |
|  Sector        |   y: admission rate (0-100%)             |
|  Locale        |   each dot = one institution             |
|  Region        |   dot color = sector (public/private)    |
|  Size          |   dot size = enrollment                  |
|  Programs      |                                          |
|  Demographics  |                                          |
|                |                                          |
|  [Reset All]   +------------------------------------------+
|                |         DETAIL PANEL                     |
|  N = 1,247     |   (appears on click)                     |
|  matching      |   Identity | Trends | Programs | Demo   |
|                |                                          |
+----------------+------------------------------------------+
```

---

## Sidebar Filters

All filters immediately update the scatterplot:

- **Sector**: checkbox — Public / Private nonprofit / Private for-profit
- **Locale**: checkbox — City / Suburb / Town / Rural (IPEDS locale codes grouped)
- **Region**: checkbox — states grouped by Census region, or individual state multiselect
- **Enrollment size**: range slider (e.g., 500 to 50,000+)
- **Programs offered**: searchable dropdown of CIP code families (Engineering, Business, Health Professions, etc.)
- **Demographics**: range sliders for Pell %, gender %, underrepresented minority %
- **Match count**: live "N = X institutions" display

---

## Scatterplot Behavior

- **Hover**: tooltip with school name, admission rate, grad rate, enrollment, state
- **Click**: selects dot (highlighted), opens detail panel below
- **Zoom/pan**: for exploring dense clusters
- **Dot encoding**: color = sector, size = enrollment

---

## Detail Panel (Tabbed)

Appears below scatterplot when an institution is clicked:

- **Identity tab**: name, location, sector, urbanicity, enrollment, Carnegie classification
- **Trends tab**: small line charts — admission rate and graduation rate over available IPEDS years
- **Programs tab**: bar chart of degrees awarded by CIP family
- **Demographics tab**: composition charts for race/ethnicity, gender, Pell %

---

## Technology

### Frontend: Observable Framework

- `@observablehq/framework` for the reactive static site
- `@observablehq/plot` for charts (scatterplot, trend lines, bar charts)
- `d3` for scales/zoom only

### Data Pipeline: Python

- `pandas` for ETL
- Standalone script, reusable by any future frontend

### Project Structure

```
college-dashboard/
├── data/
│   ├── raw/                    # Original IPEDS CSV downloads (gitignored)
│   ├── pipeline/
│   │   └── build_dataset.py    # Python ETL script
│   └── output/
│       ├── institutions.csv    # One row per school
│       └── programs.csv        # One row per school-per-CIP
├── src/
│   ├── index.md                # Main dashboard page
│   ├── components/
│   │   ├── scatterplot.js      # Plot.dot with interactions
│   │   ├── filters.js          # Sidebar filter logic
│   │   └── detail-panel.js     # Tabbed detail view
│   └── data/
│       └── loader.js           # CSV loading and data shaping
├── observablehq.config.js      # Framework config
├── requirements.txt            # Python deps for pipeline
└── README.md
```

---

## Deployment

Static site (HTML/JS/CSS + bundled CSVs). No server, no database, no API keys.

Options: GitHub Pages, Netlify/Vercel, or internal hosting.

### Data Refresh

When IPEDS 2024 data releases: run `build_dataset.py` with new raw files, commit updated CSVs, redeploy.

---

## Portability to Python

The design is frontend-agnostic:

- `build_dataset.py` and both output CSVs are reused unchanged
- UI zones (filters, scatterplot, detail panel) are rebuilt in Dash/Streamlit idioms
- This design doc and layout spec still apply — only rendering technology changes

---

## Scope Boundaries (v1)

**In scope:**
- Scatterplot with all 4-year bachelor's institutions
- Full sidebar filtering
- Click-to-detail with four tabs (identity, trends, programs, demographics)
- Static 2023 IPEDS data

**Out of scope (v2+):**
- Live IPEDS API integration
- Financial data tab
- Institution-to-institution comparison mode
- Export/download of filtered datasets
- User accounts or saved filter presets
