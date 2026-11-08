# Project review: college-dashboard, 2026-11-03

An Observable Framework site (`src/`, 5 pages, 8 components) that plots U.S.
colleges by yield and graduation rate. It's fed by a stdlib-Python pipeline
(`data/pipeline/build_carnegie.py`) that joins the Carnegie 2025 files with
IPEDS 2023 raw data. The code is small (14 code files, ~118 KB). The data is
not: 25 data files, ~46 MB, almost all of it in `data/raw/`. The site code is
in decent shape. Most findings are about the data side: a superseded
pipeline still in the repo, raw downloads committed alongside their own zips,
the main dataset with no script that builds it, and docs describing other
branches.

Reviewed as the working tree stands on branch `Scatterplot`, including its
uncommitted edits (`reverse.md` deleted, nav trimmed to two versions).

## Summary
| Type | Findings | Suggested effort |
|---|---|---|
| Unused work | 5 | small |
| Duplicates that could be merged | 4 | small–medium |
| Design patterns worth changing | 3 | small–medium |
| Docs and data hygiene | 6 | small, plus 1 large (history) |

## Unused work

### Old pandas pipeline `build_dataset.py` is superseded
- **Where:** `data/pipeline/build_dataset.py` (380 lines)
- **Evidence:** It writes the same `data/output/institutions.csv` and
  `programs.csv` that `build_carnegie.py` writes, but from IPEDS 2023 only.
  Nothing runs or mentions it. `memory/project_overview.md` names
  `build_carnegie.py` as the pipeline, and calls the pandas version the
  "original" one from the old `master` branch. It's the only reader of
  `data/raw/sfa2223.csv` (see below).
- **Suggested response:** delete it. Git history keeps it, and so do the
  `main-old` branch and the archived `college-scatterplot` repo.

### `sfa2223.csv` (12.4 MB) is only read by the dead pipeline
- **Where:** `data/raw/sfa2223.csv`, and `SFA2223` in `data/pipeline/download_carnegie.sh:32`
- **Evidence:** `build_carnegie.py` never opens it; Pell share comes from
  the Carnegie file (`pell_2023`). The only reader is `build_dataset.py`.
  It's also the largest committed file in the repo.
- **Suggested response:** delete it with `build_dataset.py`, and drop
  `SFA2223` from the download list.

### `enrich_scratch_schools.py` can't run any more
- **Where:** `enrich_scratch_schools.py:10`, `:13`
- **Evidence:** It reads `scratch_schools.csv` from the repo root and
  `src/data/institutions.csv`. Neither file exists. It also imports pandas,
  which the current pipeline deliberately avoids.
- **Suggested response:** delete it. If the enrichment is still wanted, move
  it into `scratch/` (already git-ignored) and fix its paths.

### Joy page is orphaned
- **Where:** `src/joy.md`, `src/components/joy.js`
- **Evidence:** The uncommitted `nav.js` and `index.md` edits remove Joy
  from the version nav and the index, but the page and component remain and
  still build to `/joy`. `reverse.md` was deleted in the same edit.
- **Suggested response:** if Joy is retired, delete both files in the same
  commit as the nav change, as was done for Reverse. If it's parked, keep it
  and say so in the commit message.

### Zip downloads committed next to their extracted CSVs
- **Where:** `data/raw/ADM2023.zip` (with `adm2023.csv`), `data/raw/IC2023_AY.zip` (with `ic2023_ay.csv`)
- **Evidence:** `download_carnegie.sh` unzips into `data/raw/` and leaves
  the zip. The pipeline reads only the CSVs.
- **Suggested response:** delete the two zips, and have the download script
  `rm` each zip after unzipping it.

## Duplicates that could be merged

### Same 8-line `programsByUnitid` block on three pages
- **Where:** `src/scatterplot.md:24-33`, `src/3d.md:25-34`, `src/joy.md:25-34` (also `src/my-deck.md:13-22`)
- **Evidence:** It's the same code each time: load `programs.csv`, group by
  UNITID, sort by `total_awards`. The pages also repeat the same
  `good_schools` / `us-states` loads and the `controls` / `yieldFloor` /
  `gradFloor` cells.
- **Suggested response:** extract a `groupPrograms(rows)` function into a
  component, e.g. `src/components/programs.js`. Each page keeps its own
  `FileAttachment` call, since Observable needs that literal in the page, and
  calls the helper. Small effort.

### `programs.csv` stored twice
- **Where:** `data/output/programs.csv` and `src/data/programs.csv` (identical, 944 KB)
- **Evidence:** `build_carnegie.py:702-712` writes to `data/output/` and
  then copies to `src/data/`. Only the `src/data/` copy is used by the site.
- **Suggested response:** pick one home. The simplest is to have the
  pipeline write site data straight to `src/data/`, and keep `data/output/`
  for intermediates only. At minimum, stop committing the `data/output/` copy.

### `all_schools.csv` is a filtered copy of `institutions.csv`
- **Where:** `src/data/all_schools.csv` (untracked, 1.1 MB), built by `data/pipeline/build_all_schools.py` (untracked) from `data/output/institutions.csv`
- **Evidence:** same columns; the script keeps rows with yield and grad rate
  between 2 and 98. That's fine as a derived file, but both the script and
  its output are uncommitted, while `scatterplot.md:20` already loads the
  output. A fresh clone or the CI build would be missing it.
- **Suggested response:** commit `build_all_schools.py` and
  `all_schools.csv` together with the scatterplot change. Or fold the filter
  into `build_carnegie.py` so one command produces all site data.

### `CIP_FAMILIES` map copied between pipelines
- **Where:** `data/pipeline/build_dataset.py:7`, `data/pipeline/build_carnegie.py:228`
- **Evidence:** identical 38-entry dict.
- **Suggested response:** this goes away when `build_dataset.py` is deleted.
  No separate action needed.

## Design patterns worth changing

### Main dataset has no script that builds it
- **Where:** `src/data/good_schools.csv` (566 KB; loaded by every page)
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
- **Where:** `src/components/collegeCard.js` (20 inline style strings), `tray.js` (11), `3d.js` (7), `nav.js:9-21`
- **Evidence:** The same palette hexes recur across files: `#2563eb` ×7,
  `#1d4ed8`, `#1e3a8a` and `#9ca3af` ×5 each, `#dbeafe` ×4. They're set
  through `style.cssText` strings. Changing the accent color means editing
  several files, and none of it follows Observable's light/dark theme.
- **Suggested response:** move the repeated colors into CSS custom
  properties in a `src/style.css`, and use classes for the nav pills and
  card chrome. Medium effort; do it file by file as you touch them.

### Pipeline copy step lives in `__main__`
- **Where:** `data/pipeline/build_carnegie.py:694-712`
- **Evidence:** The copy into `src/data/` only happens when the file is run
  as a script, not when `main()` is called. The comment `# Also copy outputs
  to src/data/` sits above the `main()` call rather than the copy. The copy
  also still lists `institutions.csv`, which no page reads.
- **Suggested response:** move the copy into `main()` (or a `publish()`
  function it calls), and drop `institutions.csv` from the list. Small
  effort; it fits naturally with the `programs.csv` fix above.

## Docs and data hygiene

### Raw IPEDS downloads committed although a script fetches them
- **Where:** `data/raw/` (15 files, ~40 MB)
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
  force-pushing every branch: main, Scatterplot, Carnegie-Data,
  feature/discover and main-old. Large effort, with some risk. Worth it only
  if clone size actually bothers you.

### Handoff and memory docs describe other branches
- **Where:** `HANDOFF.md`, `HANDOFF_Carnegie-Data.md`, `memory/project_overview.md`
- **Evidence:**
  - `HANDOFF.md` is for `feature/discover`. It gives the path
    `/home/cshirky/college-dashboard` (the project lives in
    `~/claude_projects/`) and names files that don't exist here (`twins.md`,
    `vibe.md`, `discover.md`).
  - `HANDOFF_Carnegie-Data.md` describes US News extraction outputs that
    aren't in this branch.
  - The overview refers to a `master` branch; the repo uses `main`.
- **Suggested response:** delete both handoffs from this branch; they live
  on in their own branches. Then add a short CLAUDE.md for `Scatterplot`
  with a `## Status` section, which is what `/catchup` looks for. Fix
  `master` → `main` in the overview.

### No README; `card_description.md` is unfinished
- **Where:** repo root
- **Evidence:** There's no README, so the run and build steps
  (`download_carnegie.sh` → `build_carnegie.py` → `build_all_schools.py` →
  `npm run dev`) are written down nowhere. `card_description.md` stops
  mid-sentence ("It also shows that") and nothing references it.
- **Suggested response:** add a 15-line README covering the pipeline order
  and the deploy workflows. Finish `card_description.md` or move it to
  `scratch/`.

### Deploy workflows point at an archived repo and a missing branch
- **Where:** `.github/workflows/deploy-scatterplot.yml`, `.github/workflows/deploy.yml:5`
- **Evidence:**
  - `deploy-scatterplot.yml` pushes `Scatterplot` builds to
    `cshirky/college-scatterplot`, which is now archived. It deployed fine
    on 2026-10-25, so the archiving came later. GitHub rejects pushes to
    archived repos, so the next push to `Scatterplot` will fail at the
    deploy step.
  - `deploy.yml` also triggers on a `dashboard` branch that doesn't exist.
- **Suggested response:** decide where the Scatterplot version should live.
  Unarchive `college-scatterplot`, or deploy `Scatterplot` through this
  repo's own Pages. Remove `dashboard` from the trigger list.

### Boilerplate left in `package.json`
- **Where:** `package.json`
- **Evidence:** It has `"name": "clay_scatterplot"`, `"main": "index.js"`
  (no such file), `"directories": {"doc": "docs"}` (no such folder), and a
  placeholder `test` script.
- **Suggested response:** rename to `college-dashboard` (matching the repo)
  and drop `main`, `directories` and `test`. Small effort.

## Next steps
1. Commit or settle the in-progress Scatterplot work. That means committing
   `build_all_schools.py` and `all_schools.csv`, and deciding Joy's fate,
   because the deployed page depends on a file that isn't in git.
2. Fix the deploy target before the next push to `Scatterplot`
   (`college-scatterplot` is archived).
3. Delete the dead pipeline: `build_dataset.py`, `sfa2223.csv`,
   `enrich_scratch_schools.py` and the two raw zips, plus `SFA2223` from the
   download script.
4. Write `build_good_schools.py`, so the main dataset can be rebuilt.
5. Stop committing `data/raw/` and `data/output/programs.csv`. Leave the
   history rewrite for later, if ever.

- `/simplify src/scatterplot.md src/3d.md src/joy.md src/my-deck.md` to
  extract the shared programs block.
- `/code-review data/pipeline/build_carnegie.py` for a bug hunt in the
  712-line pipeline. Its field-mapping pitfalls (OMENRAP vs. admission
  rate, 0–1 vs. 0–100 scales) are exactly where bugs hide.
