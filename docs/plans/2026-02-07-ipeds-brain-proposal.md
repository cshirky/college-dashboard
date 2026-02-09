# IPEDSBrain: Agentic Research Infrastructure for Institutional Intelligence

**Proposal for Consulting Engagement**
**Prepared by:** John Dimatos
**Date:** February 2026

---

## Executive Summary

Universities generate and consume vast amounts of institutional data, yet the process of turning federal datasets into actionable intelligence remains largely manual — spreadsheets, ad-hoc scripts, and reports that take weeks to produce and are difficult to reproduce or audit.

This proposal describes **IPEDSBrain**, an AI-assisted research infrastructure that gives your Institutional Research team a conversational, command-driven interface to federal higher education data. Built on IPEDS, College Scorecard, and other federal sources, IPEDSBrain produces institutional profiles, peer benchmarks, trend analyses, and equity audits — each backed by fully reproducible analysis scripts and data bundles that any colleague or auditor can independently verify.

The system is designed for sophisticated users who work with data daily. It doesn't replace analytical judgment — it eliminates the mechanical overhead of data wrangling, report formatting, and methodology documentation so your team can focus on interpretation and strategy.

**Delivery timeline:** 8-12 weeks across four phases, each producing immediately usable deliverables.

**Engagement model:** Embedded partnership during build, transitioning to ongoing support retainer.

---

## The Problem

Institutional Research offices at large universities face a recurring set of challenges:

**Time-intensive data assembly.** IPEDS alone comprises dozens of survey components across multiple years. Joining admissions, outcomes, enrollment, financial aid, and completions data for a single peer comparison requires significant manual effort — and must be repeated for each new question.

**Reproducibility gaps.** When the Provost asks "how did you get that number?", the answer is often a chain of Excel operations that are difficult to retrace. When an accreditor asks for the same analysis with a different peer group, the work starts over.

**Report production bottleneck.** Turning raw analysis into board-ready presentations, accreditation evidence, or internal planning documents is a separate, labor-intensive process — often done under deadline pressure.

**Methodology inconsistency.** Different analysts may define peer groups differently, apply different filters, or use different IPEDS vintage years without documenting those choices. Results vary in ways that are hard to detect.

---

## The Solution

IPEDSBrain is a command-driven research tool that runs inside Claude Code — a terminal-based AI assistant. Your IR team interacts with it through natural language commands:

- `ipeds:profile Arizona State University` — generates a comprehensive institutional portrait
- `ipeds:benchmark --peers big-ten` — compares against a saved peer group
- `ipeds:trends graduation_rate --portfolio our-aspirants` — tracks metric changes over time
- `ipeds:equity` — audits outcome gaps across demographic groups

Each command produces three outputs:
1. **A narrative report** with every claim citing its specific data source
2. **A reproducible analysis script** (Python + pandas) that recreates every number without the AI framework
3. **A data bundle** containing the exact data slices used — a third party can run the script and verify the results with nothing more than Python installed

### Architecture

The system has three layers:

**Data Layer** — Python services that fetch, cache, and normalize data from IPEDS (bundled, multi-year), College Scorecard (API), and additional federal sources. All data processing is deterministic and auditable. IPEDS data ships pre-bundled, so the system works without internet access for most analyses.

**Analysis Layer** — Specialized analytical agents that produce findings with mandatory data citations. A profile agent synthesizes institutional portraits. A benchmark agent computes peer comparisons. A trend agent identifies inflection points. An equity agent measures outcome gaps. Every finding is validated against actual data before being included in output.

**Interface Layer** — Claude Code skills that expose the analytical capabilities as simple commands. The IR team doesn't need to write Python or understand the internals — they issue commands and get reports.

### Reproducibility Guarantee

Every analysis generates a self-contained bundle:

```
analysis-2026-03-15.zip
├── README.md              # How to reproduce this analysis
├── report.md              # Narrative report with inline citations
├── analysis.py            # Standalone Python script (pandas only)
├── data/                  # Exact data slices used
├── methodology.md         # Analytical choices documented
└── citations.json         # Every claim traced to source data
```

A colleague, auditor, or accreditation reviewer can download the bundle, run `pip install pandas && python analysis.py`, and verify every number. No AI, no proprietary software, no API keys required.

---

## Delivery Plan

### Phase 1: Core Engine + First Report (3-4 weeks)

**Objective:** Deliver a working analytical engine and a tangible artifact for the Provost.

**Deliverables:**
- IPEDSBrain installed and configured for your institution
- Bundled IPEDS data (2019-2023, all survey components)
- College Scorecard integration (earnings, debt, completion by income)
- `ipeds:profile` and `ipeds:benchmark` commands operational
- Reproducibility system functional (every analysis generates verifiable bundles)
- 3-5 custom peer portfolios built collaboratively with the IR team (actual peer groups, aspirant groups, competitor sets)
- **First deliverable report:** comprehensive institutional profile with peer benchmarking, ready for Provost review

**Working sessions:** 2-3 sessions per week with the IR team to define peer groups, validate methodology choices, and review initial outputs.

### Phase 2: Trends, Equity + Dashboards (2-3 weeks)

**Objective:** Add longitudinal analysis and equity auditing — the capabilities most directly relevant to accreditation.

**Deliverables:**
- `ipeds:trends` command operational (multi-year trend analysis with anomaly detection)
- `ipeds:equity` command operational (outcome gap analysis across demographics)
- Interactive dashboard generator (standalone web dashboards scoped to any analysis)
- **Second deliverable:** trend report and equity audit for the institution, plus a standing dashboard the IR office can share internally

**Why this matters for accreditation:** Most regional accreditors require evidence of outcomes tracking over time and demonstrated commitment to equity in student outcomes. This phase produces exactly that evidence, with full reproducibility.

### Phase 3: Output Templates + Training (2-3 weeks)

**Objective:** Turn IPEDSBrain from "something the consultant runs" to "something our IR office produces routinely."

**Deliverables:**
- Report templates customized to institutional branding (markdown + PDF)
- Slide deck generator with templates for board presentations, accreditation self-study, and internal planning
- Portfolio management training (creating, editing, sharing institution groups)
- IR team proficiency in all commands — each team member runs analyses independently
- **Third deliverable:** board-ready presentation generated by the IR team (not the consultant) using the tool

### Phase 4: Handoff + Retainer Transition (1-2 weeks)

**Objective:** Ensure long-term sustainability and establish ongoing support.

**Deliverables:**
- Architecture documentation (system design, data flow, extension points)
- User guide (command reference, workflow examples, troubleshooting)
- Methodology reference (data sources, definitions, known limitations)
- Annual data refresh process documented and tested (the IR team runs the next IPEDS update independently)
- Retainer agreement for ongoing support

---

## Documentation Deliverables

The engagement produces four documentation artifacts, each serving a different audience:

| Document | Audience | Purpose |
|---|---|---|
| **User Guide** | IR team (daily users) | Command reference, workflow examples, portfolio management, output customization |
| **Methodology Reference** | Analysts, auditors, accreditors | Data source descriptions, cohort definitions, statistical methods, known limitations, IPEDS field mappings |
| **Architecture Document** | IT staff, future developers | System design, data flow, extension points, dependency management, security considerations |
| **Runbook** | IR team + IT | Data refresh procedures, troubleshooting, backup/recovery, environment setup for new team members |

---

## Ongoing Support (Retainer)

After the initial build, the retainer provides:

**Quarterly:**
- IPEDS data refresh when new vintage is released (download, rebuild, validate)
- Review of any methodology changes needed due to IPEDS survey updates

**On demand:**
- New analyses or reports for emerging institutional questions
- Additional peer portfolios as strategic context changes
- New data source integration (NSLDS, Common Data Set, state longitudinal data)
- Feature additions (new analytical capabilities, output formats, custom metrics)
- Support for accreditation self-study cycles

**Annual:**
- System review and update (dependencies, framework updates, performance)
- Methodology audit (verify all citations and reproducibility bundles against latest data)

---

## What Makes This Different

**It's not a dashboard.** Dashboards show you data. IPEDSBrain answers questions — and shows its work. The IR team asks a question in plain language, gets a narrative analysis with citations, and can hand the reproducibility bundle to anyone who wants to verify the findings.

**It's not a data warehouse.** The data layer is bundled and portable. No database to maintain, no ETL pipelines to monitor, no infrastructure to manage. It runs on a laptop.

**It's not a black box.** Every analysis generates a standalone Python script that reproduces every number without the AI framework. The methodology document explains every analytical choice. The citation file traces every claim to a specific field in a specific federal dataset.

**It compounds over time.** Peer portfolios, report templates, and methodology conventions accumulate as institutional knowledge. The second year's accreditation report takes a fraction of the time of the first.

---

## Technology

- **Runtime:** Claude Code (Anthropic's AI coding assistant)
- **Language:** Python 3.10+ with pandas, pydantic
- **Data sources:** IPEDS (bundled CSVs), College Scorecard (API), extensible to NSLDS and Common Data Set
- **Visualizations:** Observable Framework (interactive web dashboards)
- **Presentations:** Marp (markdown-based slide decks)
- **Reports:** Markdown with PDF export via pandoc
- **Infrastructure required:** A laptop with Python and Node.js. No servers, no databases, no cloud services (except optional Scorecard API).

---

## Engagement Terms

**Timeline:** 8-12 weeks for initial build (Phases 1-4)

**Working model:** Embedded partnership. 2-3 working sessions per week during build phases, transitioning to retainer cadence after handoff.

**Retainer:** Quarterly data refreshes + on-demand analysis and feature work. Scoped separately based on anticipated volume.

*Pricing, specific dates, and contractual terms to be discussed.*
