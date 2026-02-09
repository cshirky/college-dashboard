# IPEDSBrain — Competitive Landscape Analysis

**Date:** February 2026
**Purpose:** Market research to inform positioning and pricing for an agentic AI-driven IPEDS analysis tool targeting university institutional research offices.

---

## Executive Summary

The institutional research analytics market is fragmented across free government tools, open-source packages, BI platforms, purpose-built higher-ed suites, and consulting firms. IR offices typically use a patchwork of 3-5 tools from different categories.

**The critical gap:** No existing product combines autonomous analysis, IPEDS-specific domain intelligence, and reproducible output bundles in a single offering. Current "AI" features in commercial platforms (HelioCampus Theia, EAB Query Assist, Gray DI Insight Advisor) are query assistants — human asks, AI answers. None proactively generate complete, auditable analysis packages.

**Market timing is favorable:**
- NCES has been reduced to 3 staff members, creating uncertainty about government-provided tools
- EDUCAUSE named "The Data-Empowered Institution" the #1 IT issue for 2025
- Agentic AI is the recognized trend (Gartner's #1 tech trend for 2025; 33% of enterprise software projected to include it by 2028) but no one has built a purpose-specific product for IR/IPEDS
- New IPEDS reporting requirements for 2025-2026 are expanding data collection
- 85% of institutions report increasing digital transformation spending

---

## Category 1: Enterprise IR Platforms

### HelioCampus

- **Maker:** HelioCampus (Bethesda, MD)
- **What it does:** AI-powered analytics suite with cost analytics, assessment management, and a 3-tiered data architecture. Includes Theia Analyst — a natural language query interface that returns verified answers with SQL code transparency. Foundational dashboards for yield modeling, financial aid optimization, retention, and net tuition revenue.
- **Pricing:** Not publicly disclosed. Enterprise SaaS with custom quotes. Available through E&I Cooperative Services. Estimated low-to-mid six figures annually.
- **Implementation:** 12-month timeline for foundational dashboards.
- **Strengths:** Purpose-built for higher ed; benchmarking consortium data; NLP query interface.
- **Weaknesses:** Long implementation; closed ecosystem; pricing opacity; heavy integration work required.
- **Key differentiator vs. agentic tool:** Theia Analyst is the closest feature to an agentic approach, but it is embedded in a proprietary platform, does not generate reproducible analysis bundles, and requires 12 months to implement.

### EAB Edify

- **Maker:** EAB (Education Advisory Board), Washington, DC
- **What it does:** AI-powered data management combining data warehousing with 50+ "must-run" reports across 10 functional areas. Features Query Assist (plain English to SQL). Can stand up core platform in as few as 10 days. Integrates with Navigate CRM and Starfish student success.
- **Pricing:** Base platform: low-to-mid six figures annually. Large systems pay seven figures. University of Hawaii approved $7.4 million over 5 years for Navigate360 + Edify across 10 campuses (~$148k/campus/year combined).
- **Implementation:** As few as 10 days for core; full deployment longer.
- **Strengths:** Fast core setup; large installed base; strategic advisory team; broad product ecosystem.
- **Weaknesses:** Expensive multi-year lock-in (3-5 year commitments typical); primarily enrollment/student success rather than IPEDS analytics; consulting-heavy model.
- **Key differentiator vs. agentic tool:** EAB is a relationship-heavy, expensive, multi-year commitment. Query Assist is a query tool, not an autonomous analyst.

### Ellucian Insights

- **Maker:** Ellucian (Reston, VA)
- **What it does:** Analytics layer on top of Ellucian Banner/Colleague SIS/ERP systems. Role-specific dashboards connecting student outcomes, financial health, and operational metrics. Governed data lake unifying Ellucian and third-party data.
- **Pricing:** Typically bundled with Banner/Colleague SIS contracts. Mid-five to six figures annually.
- **Strengths:** Deep integration with Banner/Colleague (2,500+ institutions).
- **Weaknesses:** Only valuable for Ellucian ERP customers; vendor lock-in; not designed for IPEDS peer analysis or external benchmarking; less advanced AI than competitors.
- **Key differentiator vs. agentic tool:** Ellucian Insights is an ERP add-on. An agentic tool would complement it by providing the external benchmarking and IPEDS analysis that Insights does not natively provide.

### Anthology Illuminate

- **Maker:** Anthology (formerly Blackboard + Anthology)
- **What it does:** Analytics integrating Blackboard Learn (LMS) and Anthology Student (SIS) data. Powered by Snowflake and Amazon QuickSight. Student-level insights combining LMS engagement with SIS data.
- **Pricing:** Enterprise SaaS bundled with Anthology/Blackboard suite.
- **Strengths:** Unique LMS+SIS data integration; real-time student insights; modern cloud architecture.
- **Weaknesses:** Only valuable in Anthology/Blackboard ecosystem; focused on student success, not IPEDS/federal reporting.
- **Key differentiator vs. agentic tool:** Illuminate is about internal student data, not external IPEDS analysis. Complementary, not competitive.

### Watermark Insights

- **Maker:** Watermark (Indianapolis, IN)
- **What it does:** Assessment management, accreditation preparation, faculty activity reporting, curriculum management. Used by 1,700+ institutions.
- **Pricing:** Modular, estimated mid-five figures annually.
- **Strengths:** Deep accreditation/assessment focus; strong market penetration; 20+ years.
- **Weaknesses:** Not a BI or analytics platform; limited visualization; aging UI.
- **Key differentiator vs. agentic tool:** Minimal overlap. Watermark handles accreditation documentation workflow; an agentic tool handles the analytical evidence that feeds into accreditation.

### Civitas Learning

- **Maker:** Civitas Learning (Austin, TX)
- **What it does:** AI-powered student success platform using predictive modeling. Institution-specific models that continuously adapt. 400+ institutions.
- **Pricing:** Mid-five to low-six figures. Custom pricing.
- **Strengths:** Sophisticated predictive analytics; proven impact (16% retention increase at UTSA).
- **Weaknesses:** Narrowly focused on student success/retention; closed-source models with limited transparency.
- **Key differentiator vs. agentic tool:** Civitas solves a different problem (prediction) than IPEDS analysis (description and benchmarking).

### Datatelligent (IPEDS Assistant)

- **Maker:** Datatelligent
- **What it does:** The most IPEDS-specific commercial tool in the market. Consolidates data from disparate sources, maintains a local copy of IPEDS data, enables advanced comparisons and automated data pulls. Also offers a free IPEDS Enrollment Comparison Tool. Partners with Snowflake.
- **Pricing:** Free tier available. Subscription pricing not disclosed.
- **Strengths:** Most IPEDS-focused commercial product; free tier; Snowflake partnership.
- **Weaknesses:** Relatively new/small company; limited brand recognition; no evident AI/agentic capabilities.
- **Key differentiator vs. agentic tool:** This is the most directly competitive product. However, it appears to be a traditional dashboard/reporting tool, not an autonomous analysis engine. No reproducible output bundles, no narrative generation, no methodology documentation.

### Gray Decision Intelligence

- **Maker:** Gray DI (Boston, MA)
- **What it does:** The only complete academic Program Evaluation System (PES). Combines internal institutional data with external data (labor market, job postings, demographics, competitor offerings). AI-generated reports covering 50+ metrics across 1,500+ programs. Includes Insight Advisor — a conversational AI for plain-English queries.
- **Pricing:** Enterprise SaaS, not disclosed.
- **Strengths:** Unique program portfolio optimization focus; blends IPEDS with labor market intelligence; conversational AI.
- **Weaknesses:** Narrowly focused on program evaluation; does not cover all IPEDS reporting areas.
- **Key differentiator vs. agentic tool:** Insight Advisor is one of the closer AI analogs, but specialized for program decisions. An agentic tool would have broader scope and produce complete reproducible bundles.

---

## Category 2: BI Platforms Adapted for Higher Ed

### Tableau (Salesforce)

- **Pricing:** Creator license $630/user/year standard; academic pricing 50-70% off (~$189-$315/user/year). Free for instructors/students.
- **Higher ed adoption:** NCES itself acquired Tableau for IPEDS distribution. Salesforce offers an IPEDS Accelerator on the Tableau Exchange.
- **Strengths:** Industry-standard visualization; massive ecosystem; IPEDS Accelerator available.
- **Weaknesses:** Requires analyst expertise to build/maintain; no built-in IPEDS domain intelligence; visualizes but does not analyze; ongoing licensing.
- **Key differentiator vs. agentic tool:** Tableau is a visualization layer. An agentic tool autonomously selects comparisons, runs analyses, and produces narrative interpretations. Complementary, not competitive.

### Microsoft Power BI

- **Pricing:** Pro: $10/user/month. Premium: $20/user/month or capacity-based from ~$5,000/month. Microsoft 365 Copilot for Education: $18/user/month (from December 2025) with Researcher and Analyst agents.
- **Higher ed adoption:** Many universities publish Power BI dashboards (MTSU, Wright State, Columbus State, UH-Downtown).
- **Strengths:** Very affordable; ubiquitous in Microsoft 365 institutions; Copilot adds AI analysis.
- **Weaknesses:** Copilot agents are general-purpose, not IPEDS-specific; requires internal staff to maintain dashboards.
- **Key differentiator vs. agentic tool:** Power BI + Copilot is the closest mainstream BI equivalent, but lacks IPEDS domain knowledge and does not produce reproducible analysis bundles.

### Brightpoint BI

- **Maker:** Brightpoint BI
- **What it does:** Pre-built Power BI content packs for higher education covering academic programs, demographics, faculty, financial health, enrollment.
- **Pricing:** Marketed as affordable. Specific pricing not disclosed.
- **Strengths:** Pre-built higher-ed dashboards; saves implementation time.
- **Weaknesses:** Limited to Power BI ecosystem; dashboard-centric; small firm.

---

## Category 3: Consulting Firms

### NCHEMS (National Center for Higher Education Management Systems)

- **Background:** Nonprofit founded 1969. Created HEGIS, the predecessor to IPEDS.
- **Services:** Strategic planning, accreditation support, governance, affordability analysis. Works primarily with state systems.
- **Pricing:** Custom consulting engagements.
- **Strengths:** Unmatched credibility (55+ years, created the predecessor to IPEDS); deep policy expertise.
- **Weaknesses:** Expensive, slow, project-based; no technology platform; not scalable.
- **Key differentiator vs. agentic tool:** An agentic tool democratizes access to the kind of comparative analysis NCHEMS provides at boutique consulting rates.

### Huron Consulting Group

- **Background:** Major management consulting firm ($1B+ revenue) with dedicated higher ed practice.
- **Services:** Academic strategy, enrollment management, financial planning, data governance, ERP modernization.
- **Pricing:** $200-$500+/hour. Engagements often $100k-$1M+.
- **Strengths:** Deep bench; end-to-end strategy through implementation; strong brand.
- **Weaknesses:** Very expensive; project-based; no persistent analytics platform.
- **Key differentiator vs. agentic tool:** Huron sells human expertise. An agentic tool automates the data analysis their analysts do manually, at a fraction of the cost.

### RNL (Ruffalo Noel Levitz)

- **Background:** Leading enrollment management and fundraising solutions. 1,900+ institutions.
- **Services:** Predictive modeling (Student Retention Predictor, ForecastPlus), enrollment optimization (Class Optimizer). Recently launched RNL Edge (AI-powered suite).
- **Pricing:** Mid-five to low-six figures annually.
- **Strengths:** Largest installed base in enrollment management; RNL Edge adds AI; responsible AI governance.
- **Weaknesses:** Focused on enrollment/fundraising, not broad IPEDS analysis.

### OculusIT (Outsourced IR Services)

- **Background:** IT outsourcing firm serving 300+ institutions, offering embedded IR as a managed service.
- **Services:** Acts as an outsourced IR department — Argos/Power BI reporting, enrollment analysis, peer/IPEDS benchmarking, quarterly reviews.
- **Pricing:** Managed service model, likely priced below a full-time IR staff position.
- **Strengths:** Full outsourced IR capability; covers IPEDS benchmarking.
- **Weaknesses:** Dependency on external provider; less institutional knowledge than internal staff.
- **Key differentiator vs. agentic tool:** OculusIT represents the "outsourced human" model. An agentic tool replaces the manual analysis with instant, reproducible output.

### Compita Consulting

- **Background:** Boutique firm specializing in data analytics, IPEDS reporting, and survey design.
- **Services:** Data analysis, IPEDS reporting support, research methodology.
- **Key differentiator vs. agentic tool:** An agentic tool directly automates much of what Compita does manually.

### Presidio

- **Background:** Technology solutions provider selected by the Midwestern Higher Education Compact.
- **Notable:** Published "The IPEDS Wake-Up Call" arguing that with NCES reduced to 3 staff, institutions must build automated, integrated reporting systems.
- **Key differentiator vs. agentic tool:** Presidio's vision of automated IPEDS reporting aligns with the agentic tool approach, but Presidio is an infrastructure consultancy, not a product company.

---

## Category 4: AI-Powered Tools for IR

### Current State

No dedicated agentic AI tool for institutional research IPEDS analysis exists as a standalone product. The closest features are embedded in larger platforms:

| Product | AI Feature | Limitation |
|---|---|---|
| HelioCampus Theia Analyst | NLP query → verified answers with SQL | Embedded in proprietary platform |
| EAB Edify Query Assist | Plain English → SQL | Query tool, not autonomous analyst |
| Gray DI Insight Advisor | Conversational AI for program data | Narrowly focused on program evaluation |
| Microsoft Copilot Analyst | Chain-of-thought data reasoning | General-purpose, no IPEDS domain knowledge |
| Datatelligent IPEDS Assistant | Automated data pulls/comparisons | No evident AI/agentic capabilities |

### The Unoccupied Gap

No existing product:
1. Autonomously selects appropriate peer institutions and comparison metrics
2. Generates complete, reproducible analysis bundles (data + methodology + narrative + visualizations)
3. Embeds IPEDS-specific domain intelligence (survey components, data definitions, reporting cycles, analytical frameworks)
4. Produces publication-ready outputs that an IR office can review and submit rather than build from scratch
5. Maintains an audit trail showing exactly how analyses were produced

---

## Category 5: Free / Government Tools

### NCES IPEDS Data Tools Suite

All free. The standard toolkit every IR office uses:

| Tool | Purpose | Limitation |
|---|---|---|
| College Navigator | Consumer-facing institution search | Not designed for research analysis |
| Data Explorer | Browse pre-built tables from IPEDS publications | Static tables, no custom analysis |
| Trend Generator | View enrollment, completion, graduation trends | Limited to pre-defined subjects |
| Peer Analysis System (PAS) | Compare a focus institution to peers across variables and years | Clunky interface, limited visualization, no modern export |
| Executive Peer Tool (EPT) | Simplified PAS for quick comparisons | Latest year only, very limited variables |
| Data Feedback Report (DFR) | Annual graphical summary comparing institution to peers | Latest year only, limited customization |
| Dataset Cutting Tool (DCT) | Download large custom datasets | Requires analyst skill to use |
| IPEDS Data Center | Summary tables and custom downloads | Requires technical skill, no built-in analysis |

**Assessment:** These tools provide the raw ingredients but not the finished analysis. They are the floor, not the ceiling. An agentic tool consumes this same data and produces the interpreted, contextualized, reproducible analysis that takes an IR analyst hours or days to create manually.

**Risk factor:** With NCES down to 3 staff, the long-term maintenance of these tools is uncertain.

### College Scorecard

- **Provider:** U.S. Department of Education
- **What it does:** Free consumer tool and API with costs, graduation rates, post-graduation earnings, and debt at institution and field-of-study level. Data back to 1997.
- **API:** Free with key. 1,000 requests/hour limit.
- **Value:** Unique post-graduation earnings data not available in IPEDS. An important complementary data source for any IPEDS analysis tool.

### AWS Data Exchange — IPEDS Dataset

- **Provider:** Rearc (via AWS Marketplace)
- **What it does:** Complete IPEDS data files (1,000+ CSVs plus metadata) through AWS Marketplace.
- **Value:** Cloud-native data source option for scalable deployments.

---

## Category 6: Open Source

### Python

| Package | What It Does | Status |
|---|---|---|
| **scipeds** | DuckDB backend, reproducible pipeline, query engines for common analyses, completions data 1984-2023, institutional characteristics 2011-2023, Google Colab notebooks | Active, well-documented |
| **genpeds** | Python API for requesting/cleaning IPEDS data; gender trend focus | Active |
| **pypeds** | IPEDS data access from Python | Less active |

**scipeds** is the most relevant — it's a serious data access library with reproducibility goals. An agentic tool could use scipeds as its data backend rather than building raw CSV parsing from scratch.

### R

| Package | What It Does |
|---|---|
| **ipeds** (jbryer) | Download/load IPEDS databases as data frames |
| **ipedsr** | Simplified IPEDS data file downloads |
| **IPEDSuploadables** | Transforms data into IPEDS submission format |
| **rscorecard** | College Scorecard API access |
| **educationdata** (Urban Institute) | Harmonized IPEDS + other sources via API |
| **tidyipeds** | Tidy IPEDS data with Scorecard and ACS integration |

### Urban Institute Education Data Portal

- Free, open-data platform harmonizing IPEDS with other education data sources. API, R package, and web-based Data Explorer. Licensed under ODC-By v1.0.
- Maintained by a credible research institution. Could serve as an input source for an agentic tool.

---

## Category 7: Membership / Consortium Organizations

### HEDS (Higher Education Data Sharing Consortium)

- Founded 1983. Primarily private, nonprofit liberal arts institutions.
- Facilitates collection, analysis, and sharing of institutional data through three annual surveys (Research Practices, Alumni, Senior).
- Reports only available to contributing members.
- Limited analytics platform — the value is in the shared data, not the tooling.

---

## Competitive Positioning Map

```
                        HUMAN EFFORT REQUIRED
                    Low ........................ High
                    |                            |
  IPEDS-SPECIFIC    |  [AGENTIC AI TOOL]         |  NCHEMS, Compita
  DOMAIN            |  Datatelligent              |  OculusIT
  KNOWLEDGE         |                            |
       High ........|............................|
                    |                            |
                    |  HelioCampus (Theia)        |  Huron Consulting
                    |  EAB (Query Assist)         |  RNL
                    |  Gray DI (Insight Advisor)  |
       Medium ......|............................|
                    |                            |
                    |  Copilot + Power BI         |  Tableau (custom)
                    |  scipeds / R packages       |  Power BI (custom)
                    |                            |
       Low .........|............................|
```

An agentic AI tool uniquely occupies the top-left quadrant: high IPEDS domain intelligence with low human effort required.

---

## Pricing Context

| Category | Annual Cost | Implementation Time |
|---|---|---|
| Enterprise platforms (HelioCampus, EAB, Ellucian) | $100k–$1M+/year | 10 days – 12 months |
| BI platforms (Tableau, Power BI) | $5k–$60k/year (licenses) + internal staff | Weeks–months + ongoing maintenance |
| Consulting engagements (Huron, NCHEMS) | $100k–$1M+ per project | Weeks–months per engagement |
| Outsourced IR (OculusIT) | Estimated $50k–$100k/year | Weeks |
| NCES government tools | Free | Immediate (but limited capability) |
| Open source (scipeds, R packages) | Free | Requires technical staff |

An agentic tool at $80-120k build + $20-32k/year retainer undercuts enterprise platforms significantly while delivering faster time-to-value and leaving the institution with a reproducible, auditable system rather than a vendor dependency.

For the multi-client product model ($30-50k implementation + $20-32k/year), the tool becomes accessible to the ~3,000 smaller institutions that cannot afford enterprise analytics.

---

## Key Differentiators for an Agentic Approach

1. **Reproducibility** — No existing tool produces shareable, auditable analysis bundles with methodology documentation. Completely unoccupied.

2. **Autonomy** — Current AI features are query assistants (human asks, AI answers). An agentic tool proactively identifies relevant analyses, selects appropriate peers, and generates complete reports.

3. **Accessibility** — Most commercial platforms cost $100k-$1M+/yr. An agentic tool could serve institutions at a fraction of the cost.

4. **Speed** — Enterprise platforms take 10 days to 12 months to implement. An agentic tool delivers first analysis within minutes of installation.

5. **IPEDS domain intelligence** — General BI tools have no understanding of IPEDS survey components, Carnegie classifications, peer selection methodology, or federal reporting conventions.

6. **No vendor lock-in** — Reproducible output bundles use only pandas and standard Python. The institution's analyses survive even if the tool is discontinued.

---

## Sources

### Enterprise Platforms
- HelioCampus: https://www.heliocampus.com/data-analytics-platform
- EAB Edify: https://eab.com/solutions/edify/
- EAB Edify FAQ: https://eab.com/edify-faq/
- U Hawaii / EAB: https://www.hawaii.edu/news/2025/06/18/new-technology-systemwide-student-support/
- Ellucian: https://www.ellucian.com/products/platform/reporting-analytics
- Anthology Illuminate: https://www.anthology.com/products/institutional-intelligence/anthology-illuminate
- Watermark: https://www.watermarkinsights.com/
- Civitas Learning: https://www.civitaslearning.com/platform/
- Datatelligent: https://datatelligent.ai/solutions/ipeds-assistant/
- Gray DI: https://www.graydi.us/

### BI Platforms
- Tableau Academic: https://www.tableau.com/community/academic
- Salesforce IPEDS Accelerator: https://exchange.tableau.com/en-us/products/622
- Power BI Higher Ed: https://brightpointbi.com/higher-education/
- Microsoft Copilot Education: https://www.microsoft.com/en-us/education/blog/2025/10/designing-microsoft-365-copilot-to-empower-educators-students-and-staff/

### Consulting
- NCHEMS: https://nchems.org/
- Huron Education: https://www.huronconsultinggroup.com/industry/education-research
- RNL: https://www.ruffalonl.com/
- OculusIT IR Services: https://www.oculusit.com/service/institutional-research-and-reporting/
- Compita: https://compitaconsulting.com/data-analysis-and-services/

### Market Context
- Presidio IPEDS Wake-Up Call: https://www.presidio.com/blogs/the-ipeds-wake-up-call-a-data-modernization-moment-for-higher-education/
- Inside Higher Ed Agentic AI: https://www.insidehighered.com/opinion/columns/online-trending-now/2026/01/07/rise-agentic-ai-university-2026
- EAB Agentic AI in Higher Ed: https://eab.com/resources/blog/data-analytics-blog/how-will-agentic-ai-show-up-in-higher-education/
- EDUCAUSE Top 10 2025: https://er.educause.edu/articles/2024/10/2025-educause-top-10-1-the--data-empowered--institution

### Free / Government
- NCES IPEDS Tools: https://nces.ed.gov/ipeds/use-the-data
- College Scorecard API: https://collegescorecard.ed.gov/data/api/
- AWS IPEDS Marketplace: https://aws.amazon.com/marketplace/pp/prodview-dl2w2zcthbqrc

### Open Source
- scipeds: https://github.com/scienceforamerica/scipeds
- Urban Institute Education Data: https://educationdata.urban.org/
- IPEDSuploadables: https://alisonlanski.github.io/IPEDSuploadables/
