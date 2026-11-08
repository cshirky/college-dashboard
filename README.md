# Carnegie 2025 College Dashboard

An [Observable Framework](https://observablehq.com/framework/) site for exploring U.S. colleges, built on the 2025 Carnegie Classification files plus IPEDS 2023 data. It's aimed at students looking for colleges that fit them, including ones they haven't heard of.

Live site: https://cshirky.github.io/college-dashboard/

## Run it locally

The built data files are committed, so you don't need Python just to view the site.

```bash
npm install
npm run dev      # http://localhost:3000/
npm run build    # static site in dist/
```

## Pages

| Page | What it is |
|---|---|
| `/` (`index.md`) | Explorer: filter every institution and open its card |
| `/intro`, `/school-card`, `/landscape` | Guided introduction: how to read a school card and the college landscape |
| `/vibe`, `/academics` | Questionnaires about what the student wants |
| `/deck` | My Deck: schools saved as definitely / probably / maybe |
| `/schools` | One school's full page |
| `/twins` | Schools similar to ones you name |
| `/compare` | Compare up to three groups of schools |
| `/scatterplot` | Colleges by yield vs. 6-year graduation rate, with a school tray |
| `/3d` | The same chart in drag-to-rotate 3D |
| `/my-deck` | Scatterplot deck: schools starred from the scatterplot tray |

The three scatterplot pages hide the sidebar and have their own nav (`src/components/nav.js`). They use `scatterCard.js`; the other pages use `collegeCard.js`.

## Data

Site data lives in `src/data/`:

| File | Built by |
|---|---|
| `institutions.csv`, `programs.csv` | `data/pipeline/build_carnegie.py` |
| `all_schools.csv` | `data/pipeline/build_all_schools.py` (schools with yield and grad rate between 2% and 98%) |
| `good_schools.csv` | No script yet: a hand-curated subset of `institutions.csv`. The rules are in `memory/project_good_schools_filters.md` |
| `us-states.json` | Static map outline for the school cards |
| `vibe-questions.json.js`, `academic-questions.json.js` | Observable data loaders for the questionnaires |

### Rebuilding the data

The pipeline is Python 3 standard library only; there's nothing to install.

```bash
# 1. Put the Carnegie files in the repo root (both are committed):
#    2025-Public-Data-File.xlsx, 2025-SAEC-Public-Data-File.xlsx
# 2. Fetch any missing IPEDS files into data/raw/
bash data/pipeline/download_carnegie.sh
# 3. Build institutions.csv and programs.csv (writes data/output/, copies to src/data/)
python3 data/pipeline/build_carnegie.py
# 4. Build all_schools.csv from the new institutions.csv
python3 data/pipeline/build_all_schools.py
```

`data/raw/eada2023_participants.csv` (athletics) comes from a different source and isn't downloaded by the script. `memory/project_overview.md` explains the field mappings, including which column is the real admission rate.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

## Other folders

- `NOTES/`: project reviews and notes, such as `project-review-2026-11-03.md`.
- `docs/plans/`: design docs and proposal decks from earlier phases (the decks render with marp, the one dev dependency).
- `memory/`: project notes for Claude Code.
