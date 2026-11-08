# IPEDSBrain — Design Document

**Date:** 2026-02-07
**Audience:** Institutional researchers and policy analysts
**Goal:** An agentic Claude Code skill collection that turns federal higher education data (IPEDS, College Scorecard, NSLDS, Common Data Set) into research intelligence — institutional profiles, peer benchmarks, trend analyses, and equity audits — with full reproducibility.

**Inspiration:** ForkBrain framework (Brindille & Twig). Same three-layer architecture (services → agents → skills), adapted from ecommerce business intelligence to higher education research.

---

## Architecture

Three-layer design mirroring ForkBrain:

```
Layer 1: Data Layer (Pure Python, framework-agnostic)
├── Services    — Fetch/cache data from IPEDS, Scorecard API, NSLDS, CDS
├── Models      — Pydantic schemas for institutions, metrics, time series
└── Analysis    — Idempotent analyzers: trends, peer comparison, demographics, clusters

Layer 2: Orchestration Layer (LLM-aware)
├── Agents      — ProfileAgent, BenchmarkAgent, TrendAgent, EquityAgent, NarrativeAgent, MethodologyAgent
└── Pipelines   — InstitutionalProfilePipeline, PeerAnalysisPipeline, TrendAnalysisPipeline, EquityAuditPipeline

Layer 3: Interface Layer (Claude Code skills)
└── Skills      — ipeds:profile, ipeds:benchmark, ipeds:trends, ipeds:equity, ipeds:portfolio, etc.
```

**Key principles:**
- Services never call LLMs; agents optionally do
- All LLM claims require data citations, validated against actual values
- Every analysis generates a reproducible Python script + data bundle
- No default institution — users specify scope explicitly or use saved portfolios
- Zero required configuration — bundled IPEDS data works out of the box

---

## Users

Two primary user types sharing the same infrastructure:

**Institutional researchers** — work at a university, benchmark their school against peers, prepare reports for administration and accreditation. Ask: "How does *my* school compare?"

**Policy analysts** — work at think tanks, state agencies, or foundations, study systemic patterns across higher ed. Ask: "What patterns exist *across* schools?"

---

## Data Layer

### Services

Modular data adapters — one per source, each fetches, caches, and normalizes data into shared Pydantic models.

| Service | Source | What It Provides | Priority |
|---|---|---|---|
| `IPEDSService` | Static CSVs (bundled) | All survey components, multi-year | v1 core |
| `ScorecardService` | College Scorecard API | Earnings, debt, completion by income | v1 core |
| `NSLDSService` | NSLDS flat files | Loan repayment, default rates | v2 |
| `CDSService` | Common Data Set PDFs/CSVs | Self-reported institutional data | v2 |
| `StateLongitudinalService` | State-level systems | State-specific student tracking | v3 |

**Caching:** IPEDS releases annually. The service layer caches aggressively — download once, query locally. The `IPEDSService` ships with pre-bundled data (2019-2023) and can download additional years or survey components on demand.

### Models

Pydantic schemas defining the shared vocabulary:

- `Institution` — identity, location, sector, Carnegie classification
- `AdmissionsMetrics` — rates, counts, yield, by year
- `OutcomeMetrics` — graduation rates, retention, by cohort
- `DemographicProfile` — race/ethnicity, gender, Pell, by year
- `FinancialProfile` — tuition, aid, debt, earnings (from Scorecard)
- `ProgramMix` — CIP families, degree counts, concentrations
- `Portfolio` — saved set of institutions with metadata (name, description, selection criteria)
- `TimeSeries` — generic wrapper for any metric across years
- `DataCitation` — claim + source + field + value + validation

### Analysis Utilities

Pure functions (no LLM, no side effects):

- `TrendAnalyzer` — compute slopes, detect inflection points, flag anomalies across years
- `PeerAnalyzer` — percentile ranks, z-scores, identify outliers within a group
- `EquityAnalyzer` — gap analysis across demographic groups (graduation gaps, Pell gaps, representation indices)
- `ClusterAnalyzer` — group similar institutions by configurable dimensions

---

## Orchestration Layer

### Agents

Single-purpose analytical actors. Services feed them raw numbers; they produce findings with citations.

| Agent | Role | Autonomy Level |
|---|---|---|
| `ProfileAgent` | Synthesize comprehensive institutional portrait | Show Your Work |
| `BenchmarkAgent` | Compare institution against peers, identify strengths/weaknesses | Show Your Work |
| `TrendAgent` | Narrate changes over time, flag inflection points | Show Your Work |
| `EquityAgent` | Analyze access and outcome gaps across demographics | Show Your Work |
| `NarrativeAgent` | Turn structured findings into polished prose | Constrained (template-driven) |
| `MethodologyAgent` | Document analytical choices, generate reproducible scripts | Constrained |

**Autonomy levels (from ForkBrain):**
- **Constrained:** No LLM discretion — deterministic data fetching and computation
- **Show Your Work:** Interpretation requires citations for every claim
- **Human Checkpoint:** Portfolio creation, methodology choices that affect results

### Pipelines

Multi-step workflows chaining agents:

**InstitutionalProfilePipeline** (the "diagnostic"):
1. Fetch all available data for an institution (Services)
2. Compute trends across years (TrendAnalyzer)
3. Generate profile narrative (ProfileAgent)
4. Document methodology (MethodologyAgent)
5. Output: report + reproducible script + data bundle

**PeerAnalysisPipeline** (the "benchmark"):
1. Define or load peer group (Portfolio)
2. Compute percentile ranks across all metrics (PeerAnalyzer)
3. Identify outlier dimensions (BenchmarkAgent)
4. Narrate findings (NarrativeAgent)
5. Output: report + comparison tables + script + data bundle

**TrendAnalysisPipeline:**
1. Load multi-year data for institution(s) (Services)
2. Detect trends and anomalies (TrendAnalyzer)
3. Contextualize against national/sector trends (TrendAgent)
4. Output: report + time series charts + script + data bundle

**EquityAuditPipeline:**
1. Load demographic and outcome data (Services)
2. Compute gaps (EquityAnalyzer)
3. Benchmark gaps against peers and national (BenchmarkAgent + EquityAgent)
4. Output: report + gap visualizations + script + data bundle

---

## Interface Layer (Skills)

### Analysis (core loop)

- `ipeds:profile <institution>` — Full institutional portrait with trends, demographics, programs, finances
- `ipeds:benchmark <institution> [--peers <portfolio>]` — Compare against peer group; auto-selects peers if none specified
- `ipeds:trends <institution|portfolio> <metric>` — Track metric changes over time
- `ipeds:equity <institution|portfolio>` — Analyze outcome gaps across demographics

### Portfolio management

- `ipeds:portfolio create <name>` — Interactive builder: filter by state, sector, size, Carnegie class, or pick manually
- `ipeds:portfolio list` — Show saved portfolios with summary stats
- `ipeds:portfolio show <name>` — Display members and key metrics

### Output generation

- `ipeds:report <analysis> [--format md|pdf]` — Polish analysis into formatted report with executive summary, methodology appendix, data tables
- `ipeds:dashboard <analysis>` — Generate standalone Observable Framework dashboard scoped to the analysis
- `ipeds:slides <analysis> [--template board|accreditation|research|freeform]` — Generate Marp presentation

### Data exploration

- `ipeds:lookup <institution>` — Quick fact lookup, no pipeline
- `ipeds:compare <inst1> <inst2> [<inst3>...]` — Side-by-side comparison table
- `ipeds:search <criteria>` — Find institutions matching filters; results can be saved as portfolio

### Framework management

- `ipeds:update-data` — Download latest IPEDS vintage, rebuild pipeline
- `ipeds:status` — Show loaded data vintages and configured sources

### Skill conventions

- Every skill has "When to use," "Pre-flight checks," "Steps," "What to show the user," "Never" sections
- Analysis skills show summary first, offer drill-down second
- Every finding includes its data citation
- Every analysis offers "Save as portfolio?" and "Generate report/dashboard/slides?" at end

---

## Reproducibility System

Every analysis produces a self-contained bundle a third party can verify independently.

### Output structure

```
asu-profile-2026-02-07.zip
├── README.md              # How to reproduce this analysis
├── report.md              # Narrative report with inline citations
├── analysis.py            # Standalone pandas script, zero framework deps
├── data/                  # Exact CSV slices used (not full IPEDS)
│   ├── institutions.csv   # Only rows relevant to this analysis
│   └── programs.csv
├── methodology.md         # Analytical choices + justifications
└── citations.json         # Every claim → source field → actual value
```

### Two levels of verification

**Level 1 — Check the math:** A colleague runs `pip install pandas && python analysis.py`. The script reproduces every number in the report. No API keys, no LLM, no framework install.

**Level 2 — Challenge the assumptions:** A peer reviewer reads `methodology.md` to understand *why* those filters and definitions were chosen. `citations.json` traces any claim back to a specific field in a specific IPEDS table for a specific year.

### Citation model

```python
class DataCitation(BaseModel):
    claim: str              # "Graduation rate fell 8 points"
    source: str             # "IPEDS.DRVGR2023"
    field: str              # "BAGR150"
    institution: int        # UNITID
    year: int               # 2023
    claimed_value: float    # -8.0
    actual_value: float     # System-computed
    matches: bool           # Validated automatically
    comparison_base: str | None  # "DRVGR2019.BAGR150" for trend claims
```

### Methodology documentation captures

- Which IPEDS vintage year(s) used
- Cohort definitions (e.g., "4-year bachelor's-granting, SECTOR in 1,2,3")
- Exclusion criteria (e.g., "filtered 0% admission rate as data artifact")
- Peer selection method (manual, filter-based, cluster-based)
- Statistical methods (percentile ranks, z-scores, trend slopes)

---

## Output Generators

Three formats, all driven from the same structured findings data.

### Reports (`ipeds:report`)

Markdown is the primary format (diffs well in git, Claude Code can read/edit). Template:
- Executive summary (3-5 key findings, each with citation)
- Methodology section
- Findings by dimension (admissions, outcomes, demographics, finances, programs)
- Peer comparison tables (if benchmark pipeline was used)
- Appendix: data sources, vintage years, exclusion criteria

PDF via pandoc for distribution.

### Dashboards (`ipeds:dashboard`)

Generates a standalone Observable Framework project scoped to the analysis. Scaffolds from `templates/dashboard-scaffold/`, populates with analysis data. User runs `npx observable preview` to view or `npx observable build` for a static site.

Dashboard types: profile, peer comparison, equity, portfolio overview.

### Slide decks (`ipeds:slides`)

Marp markdown decks with audience-specific templates:
- `board` — executive summary, 8-10 slides, key metrics with trend arrows
- `accreditation` — evidence-heavy, maps findings to accreditation standards
- `research` — detailed methodology, suitable for conference presentation
- `freeform` — agent structures based on analysis content

---

## Project Structure

```
ipeds-brain/
├── .claude/
│   ├── settings.json
│   └── skills/ipeds/              # 12-15 skill .md files
├── src/ipeds/
│   ├── models/                    # Pydantic schemas (8 files)
│   ├── services/                  # Data source adapters (5 files)
│   ├── analysis/                  # Pure function analyzers (4 files)
│   ├── agents/                    # LLM-powered actors (6 files)
│   ├── pipelines/                 # Multi-step orchestrators (4 files)
│   ├── outputs/                   # Artifact generators (3 files)
│   └── config.py
├── data/
│   ├── ipeds/                     # Bundled CSVs by year (2019-2023)
│   ├── scorecard/                 # Cached API responses
│   └── cache/                     # Computed/derived data
├── portfolios/                    # Saved institution groups (.yaml)
├── outputs/                       # Generated artifacts
│   ├── reports/
│   ├── dashboards/
│   └── presentations/
├── templates/                     # Report/deck/dashboard templates
├── tests/
├── docs/plans/
├── pyproject.toml
├── CLAUDE.md
├── .env.example
└── README.md
```

---

## Configuration

**Zero required configuration.** Bundled IPEDS data works out of the box.

`.env` (optional):
```
SCORECARD_API_KEY=your-key-here    # Unlocks earnings/debt data
OUTPUT_DIR=outputs
PORTFOLIO_DIR=portfolios
```

---

## Scope

### v1 — Foundation

- `IPEDSService` with bundled multi-year data (2019-2023)
- `ScorecardService` with API client (optional)
- All Pydantic models
- All four analysis utilities (trends, peers, equity, clusters)
- All six agents
- All four pipelines
- Core skills: `profile`, `benchmark`, `trends`, `equity`, `lookup`, `compare`, `search`
- Portfolio management: `portfolio create/list/show`
- Output: `report` (markdown), reproducibility bundles
- `CLAUDE.md`, configuration, tests
- Built-in dashboard template (from the college dashboard project)

### v2 — Richer outputs and sources

- `ipeds:dashboard` generator (Observable Framework scaffolding)
- `ipeds:slides` generator (Marp templates)
- PDF report export
- `NSLDSService` (loan repayment, default rates)
- `CDSService` (Common Data Set parser)
- Auto-peer selection via `ClusterAnalyzer`

### v3 — Advanced

- State longitudinal data integration
- Custom metric definitions (user-defined computed columns)
- Saved analysis templates (re-run last year's report with new data)
- Collaborative portfolios (shared via git)

### Out of scope

- Live IPEDS API (doesn't exist — IPEDS is file-based)
- Student-level microdata (IPEDS is institution-level)
- Predictive modeling (descriptive/analytical framework, not ML)
- Web application (Claude Code tool, not a hosted service)
