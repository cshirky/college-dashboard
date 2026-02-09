---
marp: true
theme: brindille
paginate: true
footer: 'IPEDSBrain'
---

<!-- _class: title -->

# IPEDSBrain

## Your IR Team's Research Analyst — On Demand
### John Dimatos — February 2026

---

# The Problem

Your IR office spends weeks producing a single peer comparison.

They download IPEDS files. Join tables in Excel. Manually compute metrics. Format reports. Build slides. Document methodology.

Then someone asks: **"Can you run that again with a different peer group?"**

And the work starts over.

---

# The Problem Gets Worse Every Year

### The tools are disappearing
NCES — the agency that maintains IPEDS — has been reduced to **3 staff members.** The free tools your IR office depends on may not be maintained.

### The demands are growing
EDUCAUSE named "The Data-Empowered Institution" the **#1 IT issue for 2025.** Accreditors want more evidence. Boards want more data. The reporting burden only increases.

### The methodology is fragile
When the Provost asks "how did you get that number?", the honest answer is often: *a chain of Excel operations that would take days to reconstruct.*

---

# What If Your IR Team Could Do This

Ask a question in plain language:

> **"Give me a full profile of our institution with peer benchmarking against the Big Ten."**

And get back — in minutes, not weeks:

- A narrative report with every number cited to its federal data source
- Comparison tables showing exactly where you stand among peers
- A complete, auditable methodology document
- A script that any colleague can run to verify every number independently

---

# Example: Institutional Profile

> `ipeds:profile University of Michigan-Ann Arbor`

### What comes back:

**Admissions & Selectivity**
Admission rate: 18% (down from 23% in 2019). Among the 50 most selective public institutions nationally. Yield rate: 47%, ranking 3rd among Big Ten peers.
*[Source: IPEDS DRVADM2023.DVADM01, UNITID 170976]*

**Student Outcomes**
6-year graduation rate: 93%, up 2 points over 5 years. Ranks 1st among Big Ten peers and in the 96th percentile nationally among public universities.
*[Source: IPEDS DRVGR2023.BAGR150, UNITID 170976]*

**Enrollment & Demographics**
Total enrollment: 48,090. Undergraduate: 33,126. 49% women. 12% underrepresented minority. 16% international.
*[Source: IPEDS DRVEF2023, UNITID 170976]*

> Every number links to a specific field in a specific federal dataset.

---

# Example: Peer Benchmarking

> `ipeds:benchmark University of Michigan --peers big-ten`

### What comes back:

| Metric | Michigan | Big Ten Median | Percentile | Rank |
|--------|----------|---------------|------------|------|
| Admission rate | 18% | 57% | 99th | 1 of 14 |
| 6-yr graduation rate | 93% | 74% | 99th | 1 of 14 |
| % Pell recipients | 16% | 24% | 22nd | 12 of 14 |
| % URM enrollment | 12% | 15% | 28th | 10 of 14 |

**Key finding:** Michigan leads the Big Ten on selectivity and outcomes but lags on socioeconomic and racial diversity. Pell recipient share is 8 points below the conference median.
*[Source: IPEDS 2023 — DRVADM, DRVGR, SFA2223, DRVEF]*

> The tool doesn't just show data. It identifies where you're strong, where you're weak, and what the gaps are — with citations.

---

# Example: Equity Audit

> `ipeds:equity University of Michigan`

### What comes back:

**Graduation Rate Gaps**

| Group | 6-Year Grad Rate | Gap vs. Overall (93%) |
|-------|------------------|-----------------------|
| White | 95% | +2 |
| Asian | 96% | +3 |
| Black | 83% | **-10** |
| Hispanic | 89% | -4 |
| Pell recipients | 87% | **-6** |

**Finding:** Black student graduation rates are 10 points below the institutional average and 12 points below White student rates. This gap has narrowed by 2 points since 2019 but remains the largest demographic disparity.
*[Source: IPEDS DRVGR2023 by race/ethnicity, UNITID 170976]*

> Accreditors ask for exactly this kind of evidence. IPEDSBrain produces it on demand with full methodology documentation.

---

# Example: Trend Analysis

> `ipeds:trends admission_rate --portfolio big-ten --years 2019-2023`

### What comes back:

<!-- Placeholder: line chart showing admission rate trends for 14 Big Ten schools, 2019-2023. Michigan and Northwestern trending down sharply; Rutgers and Indiana relatively flat. -->

**[LINE CHART: Big Ten Admission Rate Trends, 2019-2023]**

**Key findings:**
- Michigan (-5 pts) and Northwestern (-7 pts) saw the steepest selectivity increases
- Rutgers (+1 pt) and Indiana (+2 pts) were essentially flat
- The Big Ten median admission rate dropped from 63% to 57%
- The spread between most and least selective widened from 48 to 54 points

> Trend analyses are automatically contextualized against the peer group and national benchmarks.

---

# Everything Is Reproducible

Every analysis produces a self-contained bundle:

```
michigan-profile-2026-03-15.zip
├── README.md              How to reproduce this analysis
├── report.md              The full narrative report
├── analysis.py            Python script — reproduces every number
├── data/                  The exact data used (not the full IPEDS dump)
├── methodology.md         Every analytical choice documented
└── citations.json         Every claim traced to its source
```

**Hand this zip to anyone.** A colleague. An auditor. An accreditation reviewer.

They run one command: `pip install pandas && python analysis.py`

Every number in the report is verified. No AI required. No proprietary software. No API keys.

---

# Why Reproducibility Matters

### For accreditation
Reviewers can independently verify your evidence. Your methodology is documented, not buried in Excel.

### For institutional trust
When the Provost asks "how did you get that number?", the answer is a 3-page methodology document and a script anyone can run — not "Sarah built a spreadsheet last year."

### For continuity
Staff turn over. Institutional knowledge walks out the door. With IPEDSBrain, every analysis is a permanent, verifiable record of what was measured, how, and why.

### For efficiency
Last year's accreditation analysis? Re-run it with this year's data in minutes. Change the peer group? Minutes. Different time window? Minutes.

---

# What It's Not

### It's not a dashboard
Dashboards show you data and wait for you to draw conclusions. IPEDSBrain answers questions — identifies patterns, flags gaps, contextualizes findings — and shows exactly how it got there.

### It's not a data warehouse
No database to maintain. No ETL pipelines to monitor. No IT infrastructure to manage. It runs on a laptop.

### It's not a black box
Every analysis generates a standalone script that reproduces every number without the AI. The methodology document explains every choice. The citation file traces every claim to a specific federal dataset.

### It compounds over time
Peer portfolios. Report templates. Methodology conventions. They accumulate as institutional knowledge. Year two is dramatically faster than year one.

---

# Who Uses It

<!-- Placeholder: organizational diagram showing flow from IR team (produces) → Provost/Deans/Enrollment (consumes reports) → Board (consumes presentations) → Accreditors (consumes evidence bundles) -->

**[DIAGRAM: Output Flow Through the Institution]**

| Produces | Consumes |
|----------|----------|
| **IR Analysts** — run analyses daily | **Provost** — institutional profiles, peer benchmarks |
| **IR Director** — define peers, set methodology | **Deans** — program-level analyses, demographic shifts |
| | **Enrollment Management** — yield data, competitor analysis |
| | **Accreditation Coordinators** — equity audits, outcomes evidence |
| | **Board of Trustees** — positioning slides, trend data |

**One tool, one methodology, one source of truth** — from raw analysis to board presentation.

---

# The Current Landscape

Your IR office probably uses some combination of:

| What | Cost | Limitation |
|------|------|------------|
| NCES free tools | Free | Manual, limited analysis, uncertain future |
| Tableau / Power BI | $5-60k/yr + staff time | Visualization only — no analysis, no narrative |
| Enterprise platforms (EAB, HelioCampus) | **$100k-$1M+/yr** | 12-month implementation, vendor lock-in |
| Consulting firms (Huron, NCHEMS) | **$100k-$1M per project** | Expensive, slow, nothing left behind |

**IPEDSBrain:** 8-12 week build. Runs on a laptop. No vendor lock-in. Every analysis is reproducible even if the tool is discontinued.

---

<!-- _class: title -->

# IPEDSBrain

## Ask a question. Get a cited, reproducible answer. In minutes.

*Let's discuss how this fits your institution.*
