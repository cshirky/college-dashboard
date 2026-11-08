# Project review: college-dashboard, 2026-11-03

An Observable Framework site that explores U.S. colleges: 13 pages
(intro, school card, landscape, vibe, academics, deck, schools, twins,
compare, and the scatterplot, 3D and scatterplot-deck pages) and 9
components. It's fed by a stdlib-Python pipeline
(`data/pipeline/build_carnegie.py`) that joins the Carnegie 2025 files with
IPEDS 2023 raw data. The code is small (17 code files, ~130 KB at review time;
12 files, ~105 KB after the 2026-11-08 cleanup). The data is not: tracked
data files totalled ~54 MB, ~38 MB of it in `data/raw/` (now ~40 MB and
~25 MB). The site code is in decent shape. Most findings are about the data
side: a superseded pipeline still in the repo, raw downloads committed
alongside their own zips, the scatterplot's dataset with no script that
builds it, and docs describing other branches or an older version of the
project.

Originally reviewed on 2026-11-03 against branch `Scatterplot`, including its
uncommitted edits. **Updated 2026-11-08** to reflect `main` after the
Scatterplot work was merged (PR #1) and the `Scatterplot` branch deleted. The
merge kept everything `main` already had, so some files the Scatterplot
branch had removed (the pandas pipeline, its tests, the raw zips) are back,
and `main`'s own pages add two new findings. Each finding has a
**Status** line where it changed.

## Summary
| Type | Open | Fixed | Suggested effort |
|---|---|---|---|
| Unused work | 0 | 5 | — |
| Duplicates that could be merged | 3 | 2 | small–medium |
| Design patterns worth changing | 3 | 0 | small–medium |
| Docs and data hygiene | 5 | 1 | small, plus 1 large (history) |

## Unused work

### Old pandas pipeline `build_dataset.py` is superseded
- **Status (2026-11-08):** fixed. Deleted along with `download_ipeds.sh`,
  `tests/` and `requirements.txt`. `build_carnegie.py` still rebuilds
  `institutions.csv` and `programs.csv` byte-for-byte identical to the
  committed copies without them.
- **Where:** `data/pipeline/build_dataset.py` (380 lines), plus the files
  that exist only for it: `data/pipeline/download_ipeds.sh`,
  `tests/test_pipeline.py`, `tests/conftest.py` and `requirements.txt`
  (pandas).
- **Evidence:** It writes the same `data/output/institutions.csv` and
  `programs.csv` that `build_carnegie.py` writes, but from IPEDS 2023 only.
  The `institutions.csv` the site serves has the Carnegie columns
  (`saec2025name`, `relaffil_label`), so it comes from `build_carnegie.py`.
  `memory/project_overview.md` calls the pandas version the "original"
  pipeline. It's the only reader of `data/raw/sfa2223.csv` (see below), and
  the 11 tests in `tests/` only test it.
- **Suggested response:** delete `build_dataset.py`, `download_ipeds.sh`,
  `tests/` and `requirements.txt` together. Git history keeps them, and so
  does the `main-old` branch. Update the README (see below) in the same
  commit.

### `sfa2223.csv` (12.4 MB) is only read by the dead pipeline
- **Status (2026-11-08):** fixed. Deleted, and `SFA2223` dropped from
  `download_carnegie.sh`.
- **Where:** `data/raw/sfa2223.csv`, and `SFA2223` in `data/pipeline/download_carnegie.sh:32`
- **Evidence:** `build_carnegie.py` never opens it; Pell share comes from
  the Carnegie file (`pell_2023`). The only reader is `build_dataset.py`.
  It's also the largest committed file in the repo.
- **Suggested response:** delete it with `build_dataset.py`, and drop
  `SFA2223` from the download list.

### `enrich_scratch_schools.py` can't run any more
- **Status (2026-11-08):** fixed. Deleted.
- **Where:** `enrich_scratch_schools.py:10`, `:13`
- **Evidence:** It reads `scratch_schools.csv` from the repo root, which
  doesn't exist. (`src/data/institutions.csv`, its other input, is back
  on `main`.) It also imports pandas, which the current pipeline
  deliberately avoids.
- **Suggested response:** delete it. If the enrichment is still wanted, move
  it into `scratch/` (already git-ignored) and fix its paths.

### Joy page is orphaned
- **Status (2026-11-08):** fixed. `edb463f` deleted `src/joy.md` and
  `src/components/joy.js`, after `6441766` dropped Joy (and Reverse) from
  the nav and index.

### Zip downloads committed next to their extracted CSVs
- **Status (2026-11-08):** fixed. Both zips deleted, and
  `download_carnegie.sh` now removes each zip after unzipping it.
- **Where:** `data/raw/ADM2023.zip` (with `adm2023.csv`), `data/raw/IC2023_AY.zip` (with `ic2023_ay.csv`)
- **Evidence:** `download_carnegie.sh` unzips into `data/raw/` and leaves
  the zip. The pipeline reads only the CSVs.
- **Suggested response:** delete the two zips, and have the download script
  `rm` each zip after unzipping it.

## Duplicates that could be merged

### Same 8-line `programsByUnitid` block on five pages
- **Status (2026-11-08):** still open, and now on five pages: Joy is gone,
  but `main`'s `deck.md` and `twins.md` build the same map.
- **Where:** `src/scatterplot.md:27`, `src/3d.md:28`, `src/my-deck.md:17`, `src/deck.md:13`, `src/twins.md:246`
- **Evidence:** It's the same code each time: load `programs.csv`, group by
  UNITID, sort by `total_awards`. The scatterplot pages also repeat the same
  `good_schools` / `us-states` loads and the `controls` / `yieldFloor` /
  `gradFloor` cells.
- **Suggested response:** extract a `groupPrograms(rows)` function into a
  component, e.g. `src/components/programs.js`. Each page keeps its own
  `FileAttachment` call, since Observable needs that literal in the page, and
  calls the helper. Small effort.

### `programs.csv` stored twice
- **Where:** `data/output/programs.csv` and `src/data/programs.csv` (identical,
  944 KB); likewise `data/output/institutions.csv` and
  `src/data/institutions.csv` (identical, 2.5 MB)
- **Evidence:** `build_carnegie.py:702-712` writes to `data/output/` and
  then copies to `src/data/`. Only the `src/data/` copies are used by the
  site.
- **Suggested response:** pick one home. The simplest is to have the
  pipeline write site data straight to `src/data/`, and keep `data/output/`
  for intermediates only. At minimum, stop committing the `data/output/`
  copies.

### `all_schools.csv` is a filtered copy of `institutions.csv`
- **Status (2026-11-08):** fixed. `6441766` committed
  `data/pipeline/build_all_schools.py` and `src/data/all_schools.csv`
  together with the scatterplot change, so a fresh clone and the CI build
  have it. Optional follow-up: fold the 2–98% filter into
  `build_carnegie.py` so one command produces all site data.

### Two school-card components and two decks
- **Where:** `src/components/collegeCard.js` and `src/components/scatterCard.js`;
  `src/deck.md` ("My Deck") and `src/my-deck.md` ("Scatterplot deck")
- **Evidence:** The merge kept `main`'s card for `main`'s pages and moved the
  Scatterplot branch's redesign to `scatterCard.js`, because the two take
  different arguments and only `collegeCard.js` exports
  `getDeck`/`saveDeck`/`getTier`. The decks are separate too: `deck.md`
  keeps definitely/probably/maybe tiers under the `college-deck`
  localStorage key, while the scatterplot tray and `my-deck.md` keep a flat
  starred list under `tray-starred`. A school starred on the scatterplot
  never shows up in My Deck, and vice versa.
- **Suggested response:** **your call** on which card and which deck model
  win. Then port the other pages to the winner and delete the loser. The
  card's ~20 inline style strings are a good moment to do the colors
  finding below. Medium effort.

### `CIP_FAMILIES` map copied between pipelines
- **Status (2026-11-08):** fixed. Went away with `build_dataset.py`.
- **Where:** `data/pipeline/build_dataset.py:7`, `data/pipeline/build_carnegie.py:228`
- **Evidence:** identical 38-entry dict.
- **Suggested response:** this goes away when `build_dataset.py` is deleted.
  No separate action needed.

## Design patterns worth changing

### Scatterplot dataset has no script that builds it
- **Where:** `src/data/good_schools.csv` (566 KB; loaded by the
  scatterplot, 3D and scatterplot-deck pages)
- **Evidence:** No script writes it. `build_all_schools.py` only says
  "unlike good_schools.csv there is no curation". The curation rules exist
  only as prose in `memory/project_good_schools_filters.md` (e.g. HBCUs and
  women's colleges excluded). It's older (April) than the Carnegie output it
  presumably derives from.
- **Suggested response:** write `data/pipeline/build_good_schools.py`, which
  applies the curation rules to `institutions.csv`, the same way
  `build_all_schools.py` does its filter. Then `good_schools.csv` can be
  rebuilt when the data updates, rather than quietly drifting. Medium effort.
  The rules need confirming against the current file.

### Colors and styles hard-coded in components
- **Where:** `src/components/collegeCard.js` and `scatterCard.js` (20 inline
  style strings each), `tray.js` (11), `3d.js` (7), `nav.js:9-21`
- **Evidence:** The same palette hexes recur across components and pages:
  `#2563eb` ×16, `#dbeafe` ×7, `#1e3a8a` ×6, `#9ca3af` ×5, `#1d4ed8` ×4.
  They're set through `style.cssText` strings. Changing the accent color
  means editing several files, and none of it follows Observable's
  light/dark theme.
- **Suggested response:** move the repeated colors into CSS custom
  properties in a `src/style.css`, and use classes for the nav pills and
  card chrome. Medium effort; do it file by file as you touch them.

### Pipeline copy step lives in `__main__`
- **Where:** `data/pipeline/build_carnegie.py:694-712`
- **Evidence:** The copy into `src/data/` only happens when the file is run
  as a script, not when `main()` is called. The comment `# Also copy outputs
  to src/data/` sits above the `main()` call rather than the copy.
  (*Updated 2026-11-08:* the copy's `institutions.csv` is needed again,
  since `main`'s index, deck, schools and twins pages read it.)
- **Suggested response:** move the copy into `main()` (or a `publish()`
  function it calls). Small effort; it fits naturally with the
  `programs.csv` fix above.

## Docs and data hygiene

### Raw IPEDS downloads committed although a script fetches them
- **Where:** `data/raw/` (15 files, ~40 MB at review time; 12 files, ~25 MB
  after the 2026-11-08 deletions)
- **Evidence:** `download_carnegie.sh` re-downloads every file the pipeline
  needs except `eada2023_participants.csv` (athletics; it's from a different
  source). CI only runs `observable build` on `src/`, so the site never
  needs `data/raw/`.
- **Suggested response:** add `data/raw/*` to `.gitignore`, with an
  exception for `eada2023_participants.csv` and `IC2023_dict.xlsx` (the
  data dictionary). Then `git rm --cached` the rest, and note in the docs
  that `download_carnegie.sh` restores them. Small effort; it shrinks future
  clones, but not history (next item).

### 59 MB `C2023_a.csv` still in git history
- **Where:** history only. It was replaced by `data/raw/C2023_a.csv.gz` (4.7 MB).
- **Evidence:** It's over GitHub's 50 MB warning and is downloaded by every
  clone, although no current file uses it.
- **Suggested response:** **your call.** Removing it means rewriting history
  (`git filter-repo --path data/raw/C2023_a.csv --invert-paths`) and
  force-pushing every branch: main, Carnegie-Data, feature/discover and
  main-old (`Scatterplot` was deleted on 2026-11-08). Large effort, with some risk. Worth it only
  if clone size actually bothers you.

### Handoff and memory docs describe other branches
- **Where:** `HANDOFF.md`, `HANDOFF_Carnegie-Data.md`, `memory/project_overview.md`
- **Evidence:**
  - `HANDOFF.md` is for `feature/discover`. It gives the path
    `/home/cshirky/college-dashboard` (the project lives in
    `~/claude_projects/`) and plans a `src/discover.md` that doesn't exist
    here. (*Updated 2026-11-08:* the pages it builds on, `twins.md`,
    `vibe.md` and `academics.md`, are on `main` now.)
  - `HANDOFF_Carnegie-Data.md` describes US News extraction outputs that
    aren't on `main`.
  - The overview refers to a `master` branch; the repo uses `main`.
  - There's no `CLAUDE.md`, so `/catchup` finds no `## Status` notes.
- **Suggested response:** delete both handoffs from `main`; they live on in
  their own branches. Then add a short CLAUDE.md with a `## Status`
  section. Fix `master` → `main` in the overview.

### README describes the original dashboard; `card_description.md` is unfinished
- **Status (2026-11-08):** README part fixed. It's rewritten around the
  current pages, data files, the `build_carnegie.py` →
  `build_all_schools.py` pipeline and the Pages deploy.
  `card_description.md` is still unfinished.
- **Where:** `README.md`, `card_description.md`
- **Evidence:** The README describes the first version: an admission-rate
  scatterplot on `index.md`, built by `build_dataset.py` from IPEDS 2023
  only. It doesn't mention `build_carnegie.py`, the Carnegie files,
  `build_all_schools.py`, the 13 pages or the Pages deploy. So the real run
  and build steps (`download_carnegie.sh` → `build_carnegie.py` →
  `build_all_schools.py` → `npm run dev`) are written down nowhere.
  `card_description.md` stops mid-sentence ("It also shows that") and
  nothing references it.
- **Suggested response:** rewrite the README around the current pipeline
  and pages, alongside deleting `build_dataset.py`. Finish
  `card_description.md` or move it to `scratch/`.

### Deploy workflows point at an archived repo and a missing branch
- **Status (2026-11-08):** fixed. `5dfa9d7` removed
  `deploy-scatterplot.yml`, which pushed `Scatterplot` builds to the
  archived `cshirky/college-scatterplot`; the scatterplot now deploys with
  `main` to this repo's Pages (PR #1), and the `Scatterplot` branch is
  deleted. The nonexistent `dashboard` branch was removed from the
  `deploy.yml` trigger list in the same update as this note.

### Boilerplate left in `package.json`
- **Where:** `package.json`
- **Evidence:** It has `"name": "clayplorp"` (*updated 2026-11-08:* `main`'s
  name; the Scatterplot branch had `clay_scatterplot`), `"main": "index.js"`
  (no such file), `"directories": {"doc": "docs"}`, and a placeholder
  `test` script. Its one dev dependency, `@marp-team/marp-cli`, is only for
  rendering the slide decks in `docs/plans/`.
- **Suggested response:** rename to `college-dashboard` (matching the repo)
  and drop `main`, `directories` and `test`. Keep marp if you still render
  those decks. Small effort.

## Next steps
1. ~~Commit or settle the in-progress Scatterplot work.~~ Done 2026-11-05
   (`6441766`, `edb463f`): `build_all_schools.py` and `all_schools.csv`
   committed, Joy deleted.
2. ~~Fix the deploy target before the next push to `Scatterplot`
   (`college-scatterplot` is archived).~~ Done 2026-11-08 (`5dfa9d7`).
3. ~~Delete the dead pipeline: `build_dataset.py`, `download_ipeds.sh`,
   `tests/`, `requirements.txt`, `sfa2223.csv`, `enrich_scratch_schools.py`
   and the two raw zips, plus `SFA2223` from the download script. Rewrite
   the README in the same change.~~ Done 2026-11-08.
4. Decide between the two card components and the two decks.
5. Write `build_good_schools.py`, so the scatterplot dataset can be rebuilt.
6. Stop committing `data/raw/` and `data/output/`. Leave the history
   rewrite for later, if ever.

- `/simplify src/scatterplot.md src/3d.md src/my-deck.md src/deck.md src/twins.md`
  to extract the shared programs block.
- `/code-review data/pipeline/build_carnegie.py` for a bug hunt in the
  712-line pipeline. Its field-mapping pitfalls (OMENRAP vs. admission
  rate, 0–1 vs. 0–100 scales) are exactly where bugs hide.
