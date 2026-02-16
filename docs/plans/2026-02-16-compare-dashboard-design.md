# Compare Dashboard Design

## Overview

A second dashboard page that lets users define up to three categories of schools using filter controls, select X and Y axis variables, and view a scatterplot comparing the categories with polynomial trendlines.

## Data Pipeline Changes

- Download `IC2023_AY.csv` (IPEDS Institutional Characteristics, Academic Year pricing)
- Add to pipeline: join tuition (in-state TUITION2, out-of-state TUITION3) and SAT/ACT scores (DVADM03-06 for SAT, DVADM07-08 for ACT; compute midpoint of 25th/75th percentile) onto institutions table
- Compute `grad_ratio` field from existing enrollment data: `none` (0 grad students), `minority` (grad < undergrad), `majority` (grad >= undergrad)
- Re-export expanded `institutions.csv` to `src/data/`
- Existing dashboard page is unaffected (ignores new columns)

## Page Layout (`src/compare.md`)

### Top: Three Category Panels (3-column grid)

Each panel has:
- Color label (Blue / Red / Orange) and editable name field
- Sector checkboxes: Public, Private nonprofit, Private for-profit
- Grad enrollment multi-select radio: No grad students / Grad minority / Grad majority
- State multi-select
- Locale checkboxes: City, Suburb, Town, Rural
- Count of matched schools

### Middle: Axis Selectors

Two dropdowns for X and Y axis. Available variables:
- Admission rate
- 6-year graduation rate
- SAT score (midpoint of 25th/75th percentile)
- ACT score (midpoint of 25th/75th percentile)
- In-state tuition
- Out-of-state tuition
- Total enrollment
- % Pell recipients
- % Women

### Bottom: Scatterplot

- Three colors for three categories, legend shows user-defined names
- Polynomial trendline (degree 3) per category, dashed
- Tooltips with institution name and key stats
- Dot size = enrollment

## Interactions & Edge Cases

- Empty categories don't appear on the plot
- Overlapping categories: schools matching multiple categories are plotted once per category (intentional for comparison)
- Default state: all panels have everything selected, X = graduation rate, Y = admission rate
- Trendline requires minimum 4 data points per category
- Navigation links between existing dashboard and compare page
