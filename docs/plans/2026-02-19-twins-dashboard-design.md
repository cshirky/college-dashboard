# School Twins Dashboard Design

## Overview

A third dashboard page where users paste a list of school names or UNITIDs and get the three closest "twin" institutions for each. Twins must match on sector and locale, and similarity is computed from enrollment sizes and degree-award distributions.

## Similarity Metric

Hard filter: twins must match the input school's sector AND locale exactly.

For each candidate pair:

1. **Enrollment distance** — normalized difference in undergrad enrollment + normalized difference in grad enrollment (denominator = range across all institutions)
2. **Program similarity** — cosine similarity on degree-count vectors (one entry per CIP family, ~30 dimensions, values = bachelor's degrees awarded)
3. **Combined score** — 50% program cosine similarity + 25% undergrad enrollment closeness + 25% grad enrollment closeness

Schools without program data are excluded from being matched as twins. Input schools without program data are flagged with "No program data available" and no twins are computed for them.

## Page Layout (`src/twins.md`)

**Input:** Textarea for pasting school names or UNITIDs (one per line). "Find Twins" button triggers matching.

**Matching:** Case-insensitive substring match on institution name, or exact match on UNITID. Unmatched inputs shown as status messages.

**Results:** Table with one row per input school, showing:
- Input school: name, state, sector, locale, enrollment
- Three twin columns: name, state, enrollment, similarity score

All results displayed at once.

## Edge Cases

- No sector/locale matches: show "No twins found" for that row
- Fewer than 3 matches: show as many as exist
- Missing program data: flag input school, exclude from matching; exclude candidate twins with no program data
- Duplicate inputs: deduplicate silently
- Self-match: exclude input school from its own twins
- Navigation links from explorer and compare pages

## Architecture

All computation in the browser (JavaScript). The institutions.csv (~2,700 rows) and programs.csv (~30,000 rows) are small enough for browser-side cosine similarity. No pipeline changes needed.
