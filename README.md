# IPEDS College Dashboard

Interactive scatterplot dashboard of all U.S. 4-year bachelor's-granting institutions, plotting 6-year graduation rate vs. admission rate. Built with Observable Framework and a Python data pipeline using IPEDS 2023 data.

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+

### Install and Run

Pre-built data files are included in the repo — no Python step is needed to view the dashboard.

```bash
# Install Node dependencies
npm install

# Start the dev server
npx observable preview
```

The dashboard will be available at `http://127.0.0.1:3000/`.

### Build for Deployment

```bash
npx observable build
```

Static site output goes to `dist/`.

## Project Structure

```
├── data/
│   ├── raw/                     # Original IPEDS 2023 CSV downloads (included)
│   │   ├── HD2023.csv           # Institution directory
│   │   ├── drvadm2023.csv       # Admissions (derived)
│   │   ├── drvgr2023.csv        # Graduation rates (derived)
│   │   ├── C2023_a.csv          # Completions by CIP code
│   │   ├── drvef2023.csv        # Enrollment & demographics (derived)
│   │   └── sfa2223.csv          # Student financial aid
│   ├── pipeline/
│   │   ├── build_dataset.py     # Python ETL script
│   │   └── download_ipeds.sh    # Script to re-download raw data from NCES
│   └── output/
│       ├── institutions.csv     # One row per school (2,738 institutions, 30 columns)
│       └── programs.csv         # One row per school-per-CIP (30,208 records)
├── src/
│   ├── index.md                 # Dashboard page (Observable Framework)
│   └── data/
│       ├── institutions.csv     # Copy of output, served by Observable
│       └── programs.csv         # Copy of output, served by Observable
├── tests/
│   └── test_pipeline.py         # Pipeline tests (11 tests)
├── observablehq.config.js       # Observable Framework config
├── package.json                 # Node dependencies
└── requirements.txt             # Python dependencies
```

## Data Pipeline (Optional)

The pre-built CSVs are checked into the repo, so you only need the Python pipeline if you want to modify the data processing or refresh with newer IPEDS data.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The pipeline reads 6 IPEDS 2023 survey files, joins them on UNITID, and outputs two clean CSVs:

- **institutions.csv** — one row per 4-year institution with admissions, graduation rates, enrollment, demographics, and Pell grant data
- **programs.csv** — one row per institution per CIP program family, with bachelor's degree counts

Institutions with 0% admission rate or 0% graduation rate are filtered out (data artifacts from non-reporting institutions).

### Running Tests

```bash
source .venv/bin/activate
pytest tests/ -v
```

### Refreshing Data

When new IPEDS data is released, update `data/pipeline/download_ipeds.sh` with new filenames, run it, then re-run the pipeline:

```bash
bash data/pipeline/download_ipeds.sh
python data/pipeline/build_dataset.py
cp data/output/institutions.csv src/data/institutions.csv
cp data/output/programs.csv src/data/programs.csv
```

## Dashboard Features

- **Scatterplot**: x = 6-year graduation rate, y = admission rate, color = sector, size = enrollment
- **Sidebar filters**: sector, locale, state, enrollment range, programs offered, Pell %, gender %
- **Institution search**: autocomplete text search
- **Detail panel**: identity info, demographics chart, top programs chart

## Data Source

All data from the Integrated Postsecondary Education Data System (IPEDS), National Center for Education Statistics (NCES), U.S. Department of Education. Survey year: 2023.

https://nces.ed.gov/ipeds/

## Design Documents

- `docs/plans/2026-02-07-ipeds-college-dashboard-design.md` — Full design spec
- `docs/plans/2026-02-07-ipeds-college-dashboard-implementation.md` — Implementation plan
