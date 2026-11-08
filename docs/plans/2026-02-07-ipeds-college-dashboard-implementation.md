# IPEDS College Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive scatterplot dashboard of 4-year bachelor's-granting institutions using IPEDS 2023 data, with Observable Framework.

**Architecture:** Python ETL pipeline processes raw IPEDS CSVs into two clean output files (`institutions.csv`, `programs.csv`). Observable Framework renders a scatterplot with sidebar filters, hover tooltips, and a click-to-expand detail panel. Data layer is fully decoupled from frontend.

**Tech Stack:** Python 3 + pandas (pipeline), Observable Framework + Observable Plot + D3 (frontend), pytest (pipeline tests)

**Design doc:** `docs/plans/2026-02-07-ipeds-college-dashboard-design.md`

---

## IPEDS Column Reference

These column names are confirmed from the actual 2023 IPEDS CSV files:

| File | Key Columns |
|------|-------------|
| `HD2023.csv` | UNITID, INSTNM, STABBR, CITY, SECTOR, LOCALE, C18BASIC, INSTSIZE, CONTROL, HBCU, LONGITUD, LATITUDE, COUNTYCD, ICLEVEL |
| `drvadm2023.csv` | UNITID, DVADM01 (admission rate %) |
| `drvgr2023.csv` | UNITID, BAGR150 (6-year BA grad rate, 150% normal time) |
| `drvef2023.csv` | UNITID, ENRTOT (total enrollment), EFUG (UG enrollment), PCTENRWH/BK/HS/AP/AS/NH/AN/2M/UN/NR (race %), PCTENRW (% women), STUFACR (student-faculty ratio) |
| `sfa2223.csv` | UNITID, UPGRNTP (% UG receiving Pell grants) |
| `C2023_a.csv` | UNITID, CIPCODE, AWLEVEL, CTOTALT (total completions) |

**Download URL pattern:** `https://nces.ed.gov/ipeds/datacenter/data/{FILENAME}.zip`

**SECTOR codes:** 1=Public 4yr, 2=Private nonprofit 4yr, 3=Private for-profit 4yr

**LOCALE codes:** 11-13=City, 21-23=Suburb, 31-33=Town, 41-43=Rural

**AWLEVEL:** 5=Bachelor's

---

## Part 1: Project Scaffolding

### Task 1: Initialize Observable Framework project

**Files:**
- Create: `package.json`
- Create: `observablehq.config.js`
- Create: `src/index.md` (placeholder)

**Step 1: Initialize Observable Framework**

Run:
```bash
npx @observablehq/framework@latest create college-dashboard --template empty
```

This creates the project skeleton. If the `create` command doesn't support `--template`, just run `npx @observablehq/framework@latest create` and follow prompts, naming it `college-dashboard`.

**But wait** — we're building inside an existing repo at `/Users/jsd/Documents/OtherPlorps/clayplorp`. So instead:

Run:
```bash
npm init -y
npm install @observablehq/framework
```

**Step 2: Create Observable config**

Create `observablehq.config.js`:
```javascript
export default {
  title: "IPEDS College Dashboard",
  pages: [],
  root: "src",
};
```

**Step 3: Create placeholder index page**

Create `src/index.md`:
```markdown
# IPEDS College Dashboard

Welcome to the dashboard. Under construction.
```

**Step 4: Verify the dev server starts**

Run:
```bash
npx observable preview
```
Expected: Dev server starts, shows "IPEDS College Dashboard" in browser.

**Step 5: Create .gitignore**

Create `.gitignore`:
```
node_modules/
.observablehq/
data/raw/
__pycache__/
*.pyc
.venv/
dist/
```

**Step 6: Commit**

```bash
git add package.json observablehq.config.js src/index.md .gitignore
git commit -m "feat: initialize Observable Framework project"
```

---

### Task 2: Set up Python pipeline environment

**Files:**
- Create: `data/pipeline/build_dataset.py` (empty placeholder)
- Create: `data/pipeline/download_ipeds.sh`
- Create: `requirements.txt`
- Create: `tests/conftest.py`
- Create: `tests/test_pipeline.py` (empty placeholder)

**Step 1: Create requirements.txt**

Create `requirements.txt`:
```
pandas>=2.0
pytest>=7.0
```

**Step 2: Create Python virtual environment and install deps**

Run:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Step 3: Create download script**

Create `data/pipeline/download_ipeds.sh`:
```bash
#!/bin/bash
set -euo pipefail

RAW_DIR="$(dirname "$0")/../raw"
mkdir -p "$RAW_DIR"

BASE_URL="https://nces.ed.gov/ipeds/datacenter/data"

FILES=(
  "HD2023"
  "drvadm2023"
  "drvgr2023"
  "C2023_A"
  "drvef2023"
  "SFA2223"
)

for f in "${FILES[@]}"; do
  echo "Downloading $f..."
  curl -sL -o "$RAW_DIR/$f.zip" "$BASE_URL/$f.zip"
  unzip -o "$RAW_DIR/$f.zip" -d "$RAW_DIR"
done

echo "Done. Files in $RAW_DIR:"
ls "$RAW_DIR"/*.csv
```

Run:
```bash
chmod +x data/pipeline/download_ipeds.sh
```

**Step 4: Create placeholder pipeline script**

Create `data/pipeline/build_dataset.py`:
```python
"""IPEDS 2023 data pipeline — builds institutions.csv and programs.csv."""


def main():
    pass


if __name__ == "__main__":
    main()
```

**Step 5: Create test placeholder**

Create `tests/conftest.py`:
```python
"""Shared test fixtures for pipeline tests."""
```

Create `tests/test_pipeline.py`:
```python
"""Tests for the IPEDS data pipeline."""
```

**Step 6: Verify pytest runs**

Run:
```bash
source .venv/bin/activate && pytest tests/ -v
```
Expected: 0 tests collected, no errors.

**Step 7: Download the raw IPEDS data**

Run:
```bash
bash data/pipeline/download_ipeds.sh
```
Expected: CSV files appear in `data/raw/`.

**Step 8: Commit**

```bash
git add requirements.txt data/pipeline/ tests/ .gitignore
git commit -m "feat: set up Python pipeline environment and IPEDS download script"
```

---

## Part 2: Data Pipeline (TDD)

### Task 3: Load and filter institutions from HD2023

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "data", "pipeline"))

from build_dataset import load_institutions


def test_load_institutions_filters_to_4year():
    """Only 4-year bachelor's-granting institutions should be included."""
    df = load_institutions("data/raw")
    # SECTOR 1, 2, 3 are 4-year institutions
    assert set(df["SECTOR"].unique()).issubset({1, 2, 3})
    assert len(df) > 0


def test_load_institutions_has_required_columns():
    """Output must include all columns needed for the dashboard."""
    df = load_institutions("data/raw")
    required = [
        "UNITID", "INSTNM", "STABBR", "CITY", "SECTOR", "LOCALE",
        "C18BASIC", "INSTSIZE", "CONTROL", "HBCU", "LONGITUD", "LATITUDE",
    ]
    for col in required:
        assert col in df.columns, f"Missing column: {col}"
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_load_institutions_filters_to_4year -v
```
Expected: FAIL with `ImportError: cannot import name 'load_institutions'`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
import pandas as pd
from pathlib import Path


def load_institutions(raw_dir: str) -> pd.DataFrame:
    """Load HD2023 and filter to 4-year bachelor's-granting institutions."""
    path = Path(raw_dir) / "HD2023.csv"
    df = pd.read_csv(path, encoding="latin-1")
    # SECTOR 1=Public 4yr, 2=Private nonprofit 4yr, 3=Private for-profit 4yr
    df = df[df["SECTOR"].isin([1, 2, 3])].copy()
    return df
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "load_institutions" -v
```
Expected: 2 tests PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: load and filter 4-year institutions from HD2023"
```

---

### Task 4: Join admissions data

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import load_institutions, join_admissions


def test_join_admissions_adds_rate():
    """Joining admissions data adds admission_rate column."""
    inst = load_institutions("data/raw")
    df = join_admissions(inst, "data/raw")
    assert "admission_rate" in df.columns
    # Rates should be 0-100 (percentages)
    valid = df["admission_rate"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100


def test_join_admissions_preserves_institutions():
    """All institutions should be preserved after left join."""
    inst = load_institutions("data/raw")
    df = join_admissions(inst, "data/raw")
    assert len(df) == len(inst)
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_join_admissions_adds_rate -v
```
Expected: FAIL with `ImportError: cannot import name 'join_admissions'`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
def join_admissions(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join DRVADM2023 admission rate onto institutions."""
    path = Path(raw_dir) / "drvadm2023.csv"
    adm = pd.read_csv(path, encoding="latin-1")
    # DVADM01 = Percent admitted - total
    adm = adm[["UNITID", "DVADM01"]].rename(columns={"DVADM01": "admission_rate"})
    adm["admission_rate"] = pd.to_numeric(adm["admission_rate"], errors="coerce")
    return df.merge(adm, on="UNITID", how="left")
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "admissions" -v
```
Expected: 2 tests PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: join admission rate from DRVADM2023"
```

---

### Task 5: Join graduation rate data

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import load_institutions, join_admissions, join_graduation_rates


def test_join_grad_rates_adds_columns():
    """Joining grad rates adds grad_rate_6yr column."""
    inst = load_institutions("data/raw")
    df = join_graduation_rates(inst, "data/raw")
    assert "grad_rate_6yr" in df.columns
    valid = df["grad_rate_6yr"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_join_grad_rates_adds_columns -v
```
Expected: FAIL with `ImportError: cannot import name 'join_graduation_rates'`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
def join_graduation_rates(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join DRVGR2023 6-year bachelor's graduation rate."""
    path = Path(raw_dir) / "drvgr2023.csv"
    gr = pd.read_csv(path, encoding="latin-1")
    # BAGR150 = BA graduation rate at 150% normal time (6 years)
    gr = gr[["UNITID", "BAGR150"]].rename(columns={"BAGR150": "grad_rate_6yr"})
    gr["grad_rate_6yr"] = pd.to_numeric(gr["grad_rate_6yr"], errors="coerce")
    return df.merge(gr, on="UNITID", how="left")
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "grad_rates" -v
```
Expected: PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: join 6-year graduation rate from DRVGR2023"
```

---

### Task 6: Join enrollment and demographics

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import load_institutions, join_enrollment_demographics


def test_join_enrollment_adds_demographics():
    """Joining enrollment adds enrollment and demographic percentage columns."""
    inst = load_institutions("data/raw")
    df = join_enrollment_demographics(inst, "data/raw")
    required = [
        "enrollment_total", "enrollment_ug",
        "pct_women", "pct_white", "pct_black", "pct_hispanic",
        "pct_asian", "pct_aian", "pct_nhpi", "pct_two_or_more",
        "pct_unknown", "pct_nonresident",
    ]
    for col in required:
        assert col in df.columns, f"Missing column: {col}"
    assert len(df) == len(inst)
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_join_enrollment_adds_demographics -v
```
Expected: FAIL with `ImportError`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
def join_enrollment_demographics(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join DRVEF2023 enrollment totals and demographic percentages."""
    path = Path(raw_dir) / "drvef2023.csv"
    ef = pd.read_csv(path, encoding="latin-1")
    rename_map = {
        "ENRTOT": "enrollment_total",
        "EFUG": "enrollment_ug",
        "PCTENRW": "pct_women",
        "PCTENRWH": "pct_white",
        "PCTENRBK": "pct_black",
        "PCTENRHS": "pct_hispanic",
        "PCTENRAS": "pct_asian",
        "PCTENRAN": "pct_aian",
        "PCTENRNH": "pct_nhpi",
        "PCTENR2M": "pct_two_or_more",
        "PCTENRUN": "pct_unknown",
        "PCTENRNR": "pct_nonresident",
    }
    cols = ["UNITID"] + list(rename_map.keys())
    ef = ef[cols].rename(columns=rename_map)
    for col in rename_map.values():
        ef[col] = pd.to_numeric(ef[col], errors="coerce")
    return df.merge(ef, on="UNITID", how="left")
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "enrollment" -v
```
Expected: PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: join enrollment and demographic data from DRVEF2023"
```

---

### Task 7: Join Pell grant data

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import load_institutions, join_pell


def test_join_pell_adds_percentage():
    """Joining SFA adds pct_pell column."""
    inst = load_institutions("data/raw")
    df = join_pell(inst, "data/raw")
    assert "pct_pell" in df.columns
    valid = df["pct_pell"].dropna()
    assert valid.min() >= 0
    assert valid.max() <= 100
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_join_pell_adds_percentage -v
```
Expected: FAIL with `ImportError`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
def join_pell(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join SFA2223 Pell grant recipient percentage."""
    path = Path(raw_dir) / "sfa2223.csv"
    sfa = pd.read_csv(path, encoding="latin-1")
    # UPGRNTP = Percent of undergrads awarded Pell grants
    sfa = sfa[["UNITID", "UPGRNTP"]].rename(columns={"UPGRNTP": "pct_pell"})
    sfa["pct_pell"] = pd.to_numeric(sfa["pct_pell"], errors="coerce")
    return df.merge(sfa, on="UNITID", how="left")
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "pell" -v
```
Expected: PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: join Pell grant percentage from SFA2223"
```

---

### Task 8: Add locale and sector labels

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import add_labels


def test_add_labels_creates_readable_columns():
    """Labels should produce human-readable sector and locale names."""
    inst = load_institutions("data/raw")
    df = add_labels(inst)
    assert "sector_label" in df.columns
    assert "locale_group" in df.columns
    # Check that labels are strings, not codes
    assert df["sector_label"].iloc[0] in [
        "Public", "Private nonprofit", "Private for-profit"
    ]
    assert df["locale_group"].iloc[0] in ["City", "Suburb", "Town", "Rural"]
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_add_labels_creates_readable_columns -v
```
Expected: FAIL with `ImportError`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
def add_labels(df: pd.DataFrame) -> pd.DataFrame:
    """Add human-readable labels for sector and locale codes."""
    df = df.copy()

    sector_map = {1: "Public", 2: "Private nonprofit", 3: "Private for-profit"}
    df["sector_label"] = df["SECTOR"].map(sector_map)

    # LOCALE codes: 11-13=City, 21-23=Suburb, 31-33=Town, 41-43=Rural
    def locale_group(code):
        if pd.isna(code):
            return "Unknown"
        code = int(code)
        tens = code // 10
        return {1: "City", 2: "Suburb", 3: "Town", 4: "Rural"}.get(tens, "Unknown")

    df["locale_group"] = df["LOCALE"].apply(locale_group)
    return df
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "labels" -v
```
Expected: PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: add human-readable sector and locale labels"
```

---

### Task 9: Build programs.csv from completions data

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
from build_dataset import build_programs


def test_build_programs_filters_to_bachelors():
    """Programs should only include bachelor's awards (AWLEVEL=5)."""
    df = build_programs("data/raw")
    assert "cip_family" in df.columns
    assert "cip_code" in df.columns
    assert "total_awards" in df.columns
    assert len(df) > 0


def test_build_programs_has_cip_families():
    """Should aggregate to 2-digit CIP families."""
    df = build_programs("data/raw")
    # CIP families are 2-digit codes like "11", "13", "14"
    assert df["cip_family"].str.len().max() == 2
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_build_programs_filters_to_bachelors -v
```
Expected: FAIL with `ImportError`

**Step 3: Write minimal implementation**

Add to `data/pipeline/build_dataset.py`:
```python
# 2-digit CIP family labels
CIP_FAMILIES = {
    "01": "Agriculture", "03": "Natural Resources", "04": "Architecture",
    "05": "Area/Ethnic Studies", "09": "Communication", "10": "Communications Tech",
    "11": "Computer Science", "12": "Personal/Culinary", "13": "Education",
    "14": "Engineering", "15": "Engineering Tech", "16": "Foreign Languages",
    "19": "Family/Consumer Sciences", "22": "Legal Professions",
    "23": "English", "24": "Liberal Arts", "25": "Library Science",
    "26": "Biological Sciences", "27": "Mathematics", "29": "Military Tech",
    "30": "Interdisciplinary", "31": "Parks/Recreation",
    "38": "Philosophy/Religion", "39": "Theology",
    "40": "Physical Sciences", "41": "Science Tech",
    "42": "Psychology", "43": "Homeland Security",
    "44": "Public Administration", "45": "Social Sciences",
    "46": "Construction Trades", "47": "Mechanic/Repair",
    "48": "Precision Production", "49": "Transportation",
    "50": "Visual/Performing Arts", "51": "Health Professions",
    "52": "Business", "54": "History",
}


def build_programs(raw_dir: str) -> pd.DataFrame:
    """Build programs.csv from C2023_A completions data.

    Filters to bachelor's degrees (AWLEVEL=5), aggregates by
    institution and 2-digit CIP family.
    """
    path = Path(raw_dir) / "C2023_a.csv"
    comp = pd.read_csv(path, encoding="latin-1", dtype={"CIPCODE": str})

    # AWLEVEL 5 = Bachelor's degree
    comp = comp[comp["AWLEVEL"] == 5].copy()

    # Filter out summary rows (CIPCODE "99" = grand total)
    comp = comp[comp["CIPCODE"] != "99"]

    comp["CTOTALT"] = pd.to_numeric(comp["CTOTALT"], errors="coerce")
    comp = comp.dropna(subset=["CTOTALT"])

    # Extract 2-digit CIP family
    comp["cip_family"] = comp["CIPCODE"].str[:2]

    # Aggregate awards by institution + CIP family
    programs = (
        comp.groupby(["UNITID", "cip_family"])["CTOTALT"]
        .sum()
        .reset_index()
        .rename(columns={"CTOTALT": "total_awards", "CIPCODE": "cip_code"})
    )
    programs["cip_code"] = programs["cip_family"]
    programs["cip_label"] = programs["cip_family"].map(CIP_FAMILIES).fillna("Other")

    return programs
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py -k "programs" -v
```
Expected: PASS.

**Step 5: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py
git commit -m "feat: build programs dataset from C2023_A completions"
```

---

### Task 10: Wire up main() to produce output CSVs

**Files:**
- Modify: `data/pipeline/build_dataset.py`
- Modify: `tests/test_pipeline.py`

**Step 1: Write the failing test**

Add to `tests/test_pipeline.py`:
```python
import tempfile
from build_dataset import main


def test_main_produces_output_files():
    """main() should write institutions.csv and programs.csv."""
    with tempfile.TemporaryDirectory() as tmpdir:
        main(raw_dir="data/raw", output_dir=tmpdir)
        inst_path = os.path.join(tmpdir, "institutions.csv")
        prog_path = os.path.join(tmpdir, "programs.csv")
        assert os.path.exists(inst_path), "institutions.csv not created"
        assert os.path.exists(prog_path), "programs.csv not created"

        inst = pd.read_csv(inst_path)
        assert len(inst) > 500, f"Expected 500+ institutions, got {len(inst)}"
        assert "admission_rate" in inst.columns
        assert "grad_rate_6yr" in inst.columns
        assert "pct_pell" in inst.columns
        assert "sector_label" in inst.columns
```

**Step 2: Run test to verify it fails**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_main_produces_output_files -v
```
Expected: FAIL (main() doesn't accept args yet)

**Step 3: Write minimal implementation**

Update `main()` in `data/pipeline/build_dataset.py`:
```python
def main(raw_dir: str = "data/raw", output_dir: str = "data/output"):
    """Run the full pipeline: load, join, label, and write output CSVs."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print("Loading institutions from HD2023...")
    df = load_institutions(raw_dir)
    print(f"  {len(df)} 4-year institutions")

    print("Joining admissions data...")
    df = join_admissions(df, raw_dir)

    print("Joining graduation rates...")
    df = join_graduation_rates(df, raw_dir)

    print("Joining enrollment and demographics...")
    df = join_enrollment_demographics(df, raw_dir)

    print("Joining Pell grant data...")
    df = join_pell(df, raw_dir)

    print("Adding labels...")
    df = add_labels(df)

    # Select and rename final columns for clean output
    institutions_cols = [
        "UNITID", "INSTNM", "CITY", "STABBR", "SECTOR", "sector_label",
        "LOCALE", "locale_group", "C18BASIC", "INSTSIZE", "CONTROL", "HBCU",
        "LONGITUD", "LATITUDE", "COUNTYCD",
        "admission_rate", "grad_rate_6yr",
        "enrollment_total", "enrollment_ug",
        "pct_women", "pct_white", "pct_black", "pct_hispanic",
        "pct_asian", "pct_aian", "pct_nhpi", "pct_two_or_more",
        "pct_unknown", "pct_nonresident", "pct_pell",
    ]
    institutions = df[[c for c in institutions_cols if c in df.columns]]
    institutions.to_csv(output_path / "institutions.csv", index=False)
    print(f"Wrote {len(institutions)} rows to institutions.csv")

    print("Building programs dataset...")
    programs = build_programs(raw_dir)
    programs.to_csv(output_path / "programs.csv", index=False)
    print(f"Wrote {len(programs)} rows to programs.csv")

    print("Done.")
```

Also update the `if __name__` block:
```python
if __name__ == "__main__":
    main()
```

**Step 4: Run tests to verify they pass**

Run:
```bash
source .venv/bin/activate && pytest tests/test_pipeline.py::test_main_produces_output_files -v
```
Expected: PASS.

**Step 5: Run the full pipeline for real**

Run:
```bash
source .venv/bin/activate && python data/pipeline/build_dataset.py
```
Expected: Output like:
```
Loading institutions from HD2023...
  ~2000 4-year institutions
...
Wrote X rows to institutions.csv
Wrote Y rows to programs.csv
```

**Step 6: Run all tests to confirm nothing broke**

Run:
```bash
source .venv/bin/activate && pytest tests/ -v
```
Expected: All tests PASS.

**Step 7: Commit**

```bash
git add data/pipeline/build_dataset.py tests/test_pipeline.py data/output/
git commit -m "feat: wire up main pipeline, produce institutions.csv and programs.csv"
```

---

## Part 3: Frontend — Core Scatterplot

### Task 11: Load CSV data in Observable

**Files:**
- Create: `src/data/institutions.csv.js` (data loader)
- Modify: `src/index.md`

**Step 1: Create Observable data loader**

Observable Framework uses [data loaders](https://observablehq.com/framework/loaders) — files named `*.csv.js` that output CSV to stdout, or you can just reference static files.

The simplest approach: symlink or copy the output CSVs into the `src/data/` directory.

Create `src/data/institutions.csv.js`:
```javascript
import {csvFormat} from "d3-dsv";
import {readFileSync} from "fs";

// Read the pipeline output
const raw = readFileSync("data/output/institutions.csv", "utf-8");
process.stdout.write(raw);
```

Create `src/data/programs.csv.js`:
```javascript
import {readFileSync} from "fs";

const raw = readFileSync("data/output/programs.csv", "utf-8");
process.stdout.write(raw);
```

**Step 2: Update index.md to load and display row count**

Replace `src/index.md`:
```markdown
# IPEDS College Dashboard

```js
const institutions = FileAttachment("data/institutions.csv").csv({typed: true});
const programs = FileAttachment("data/programs.csv").csv({typed: true});
```

**${institutions.length}** institutions loaded. **${programs.length}** program records loaded.
```

**Step 3: Verify in dev server**

Run:
```bash
npx observable preview
```
Expected: Page shows institution and program counts.

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: load IPEDS data into Observable Framework"
```

---

### Task 12: Render basic scatterplot

**Files:**
- Modify: `src/index.md`

**Step 1: Add scatterplot to index.md**

Add below the data loading block in `src/index.md`:
````markdown
```js
import * as Plot from "@observablehq/plot";
```

```js
Plot.plot({
  width: 800,
  height: 600,
  x: {
    label: "6-Year Graduation Rate (%)",
    domain: [0, 100],
  },
  y: {
    label: "Admission Rate (%)",
    domain: [0, 100],
  },
  color: {
    legend: true,
  },
  marks: [
    Plot.dot(institutions, {
      x: "grad_rate_6yr",
      y: "admission_rate",
      fill: "sector_label",
      r: "enrollment_total",
      fillOpacity: 0.6,
      tip: true,
      channels: {
        Name: "INSTNM",
        State: "STABBR",
        Enrollment: "enrollment_total",
      },
    }),
  ],
})
```
````

**Step 2: Verify in dev server**

Run:
```bash
npx observable preview
```
Expected: Scatterplot renders with colored dots (by sector), sized by enrollment. Hovering shows tooltip with school name, state, enrollment, grad rate, admission rate.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: render basic scatterplot with admission rate vs graduation rate"
```

---

### Task 13: Add dot size scaling and improve tooltip

**Files:**
- Modify: `src/index.md`

**Step 1: Improve the scatterplot configuration**

Update the `Plot.plot()` call in `src/index.md`:
````markdown
```js
Plot.plot({
  width: 800,
  height: 600,
  x: {
    label: "6-Year Graduation Rate (%)",
    domain: [0, 100],
    grid: true,
  },
  y: {
    label: "Admission Rate (%)",
    domain: [0, 100],
    grid: true,
  },
  r: {
    range: [2, 15],
  },
  color: {
    legend: true,
    domain: ["Public", "Private nonprofit", "Private for-profit"],
    range: ["#4e79a7", "#e15759", "#f28e2b"],
  },
  marks: [
    Plot.dot(institutions, {
      x: "grad_rate_6yr",
      y: "admission_rate",
      fill: "sector_label",
      r: "enrollment_total",
      fillOpacity: 0.5,
      stroke: "currentColor",
      strokeWidth: 0.5,
      tip: true,
      channels: {
        Name: "INSTNM",
        State: "STABBR",
        Enrollment: "enrollment_total",
        "Grad Rate": "grad_rate_6yr",
        "Admit Rate": "admission_rate",
      },
    }),
  ],
})
```
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Dots scale nicely by enrollment, colors are distinct, grid lines help reading values, tooltips show all key fields.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: improve scatterplot styling, dot sizing, and tooltips"
```

---

## Part 4: Frontend — Sidebar Filters

### Task 14: Add sector and locale filters

**Files:**
- Modify: `src/index.md`

**Step 1: Add filter inputs above the scatterplot**

Update `src/index.md` to add Observable Inputs for filtering:
````markdown
```js
const sectorFilter = view(Inputs.checkbox(
  ["Public", "Private nonprofit", "Private for-profit"],
  {label: "Sector", value: ["Public", "Private nonprofit", "Private for-profit"]}
));
```

```js
const localeFilter = view(Inputs.checkbox(
  ["City", "Suburb", "Town", "Rural"],
  {label: "Locale", value: ["City", "Suburb", "Town", "Rural"]}
));
```

```js
const filtered = institutions.filter(d =>
  sectorFilter.includes(d.sector_label) &&
  localeFilter.includes(d.locale_group)
);
```

**${filtered.length}** institutions match current filters.
````

Then update the `Plot.plot()` call to use `filtered` instead of `institutions`:
```js
Plot.dot(filtered, { ... })
```

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Checkboxes appear. Unchecking "Private for-profit" immediately removes those dots from the scatterplot. Count updates.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add sector and locale checkbox filters"
```

---

### Task 15: Add state/region filter

**Files:**
- Modify: `src/index.md`

**Step 1: Add state search/select input**

Add to `src/index.md`:
````markdown
```js
const allStates = [...new Set(institutions.map(d => d.STABBR))].sort();
const stateFilter = view(Inputs.select(allStates, {
  label: "State",
  multiple: true,
  value: allStates,
  width: 200,
}));
```
````

Update the `filtered` definition to include state:
```js
const filtered = institutions.filter(d =>
  sectorFilter.includes(d.sector_label) &&
  localeFilter.includes(d.locale_group) &&
  stateFilter.includes(d.STABBR)
);
```

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Multi-select dropdown for states. Selecting only "CA" and "NY" shows only those states' institutions.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add state multi-select filter"
```

---

### Task 16: Add enrollment size range slider

**Files:**
- Modify: `src/index.md`

**Step 1: Add range input**

Add to `src/index.md`:
````markdown
```js
const enrollmentRange = view(Inputs.range(
  [0, 80000],
  {label: "Enrollment range", step: 500, value: [0, 80000], width: 200}
));
```
````

Note: Observable's `Inputs.range` returns a single value. For a two-ended range, we need two sliders or a custom approach:

````markdown
```js
const enrollMin = view(Inputs.range([0, 80000], {label: "Min enrollment", step: 500, value: 0}));
const enrollMax = view(Inputs.range([0, 80000], {label: "Max enrollment", step: 500, value: 80000}));
```
````

Update filtered:
```js
const filtered = institutions.filter(d =>
  sectorFilter.includes(d.sector_label) &&
  localeFilter.includes(d.locale_group) &&
  stateFilter.includes(d.STABBR) &&
  d.enrollment_total >= enrollMin &&
  d.enrollment_total <= enrollMax
);
```

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Sliding min/max enrollment narrows the scatterplot to show only schools in the range.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add enrollment size range filter"
```

---

### Task 17: Add program filter (CIP family)

**Files:**
- Modify: `src/index.md`

**Step 1: Add CIP family filter**

This requires cross-referencing programs.csv. Add to `src/index.md`:
````markdown
```js
// Build lookup: which institutions offer which CIP families
const cipLabels = [...new Set(programs.map(d => d.cip_label))].sort();
const institutionCips = new Map();
for (const p of programs) {
  if (!institutionCips.has(p.UNITID)) institutionCips.set(p.UNITID, new Set());
  institutionCips.get(p.UNITID).add(p.cip_label);
}
```

```js
const programFilter = view(Inputs.select(cipLabels, {
  label: "Programs offered",
  multiple: true,
  value: cipLabels,
}));
```
````

Update filtered to include program check:
```js
const filtered = institutions.filter(d => {
  const cips = institutionCips.get(d.UNITID) || new Set();
  return (
    sectorFilter.includes(d.sector_label) &&
    localeFilter.includes(d.locale_group) &&
    stateFilter.includes(d.STABBR) &&
    d.enrollment_total >= enrollMin &&
    d.enrollment_total <= enrollMax &&
    programFilter.some(p => cips.has(p))
  );
});
```

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Selecting only "Engineering" shows only schools that award bachelor's degrees in engineering.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add CIP program family filter"
```

---

### Task 18: Add demographic range filters

**Files:**
- Modify: `src/index.md`

**Step 1: Add Pell % and gender % sliders**

Add to `src/index.md`:
````markdown
```js
const pellMin = view(Inputs.range([0, 100], {label: "Min % Pell recipients", step: 1, value: 0}));
const womenMin = view(Inputs.range([0, 100], {label: "Min % women", step: 1, value: 0}));
const womenMax = view(Inputs.range([0, 100], {label: "Max % women", step: 1, value: 100}));
```
````

Update filtered:
```js
const filtered = institutions.filter(d => {
  const cips = institutionCips.get(d.UNITID) || new Set();
  return (
    sectorFilter.includes(d.sector_label) &&
    localeFilter.includes(d.locale_group) &&
    stateFilter.includes(d.STABBR) &&
    d.enrollment_total >= enrollMin &&
    d.enrollment_total <= enrollMax &&
    programFilter.some(p => cips.has(p)) &&
    (d.pct_pell == null || d.pct_pell >= pellMin) &&
    (d.pct_women == null || (d.pct_women >= womenMin && d.pct_women <= womenMax))
  );
});
```

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Adjusting Pell slider to 50%+ shows only high-Pell institutions. Gender sliders work similarly.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add Pell and gender demographic filters"
```

---

### Task 19: Organize layout with sidebar

**Files:**
- Modify: `src/index.md`

**Step 1: Restructure page layout using Observable's grid**

Wrap the filters and chart in a CSS grid layout in `src/index.md`:

````markdown
<div style="display: grid; grid-template-columns: 250px 1fr; gap: 1rem;">
<div>

## Filters

```js
const sectorFilter = view(Inputs.checkbox(
  ["Public", "Private nonprofit", "Private for-profit"],
  {label: "Sector", value: ["Public", "Private nonprofit", "Private for-profit"]}
));
```

```js
const localeFilter = view(Inputs.checkbox(
  ["City", "Suburb", "Town", "Rural"],
  {label: "Locale", value: ["City", "Suburb", "Town", "Rural"]}
));
```

```js
const allStates = [...new Set(institutions.map(d => d.STABBR))].sort();
const stateFilter = view(Inputs.select(allStates, {
  label: "State", multiple: true, value: allStates, width: 220,
}));
```

```js
const enrollMin = view(Inputs.range([0, 80000], {label: "Min enrollment", step: 500, value: 0, width: 220}));
const enrollMax = view(Inputs.range([0, 80000], {label: "Max enrollment", step: 500, value: 80000, width: 220}));
```

```js
const programFilter = view(Inputs.select(cipLabels, {
  label: "Programs", multiple: true, value: cipLabels, width: 220,
}));
```

```js
const pellMin = view(Inputs.range([0, 100], {label: "Min % Pell", step: 1, value: 0, width: 220}));
const womenMin = view(Inputs.range([0, 100], {label: "Min % women", step: 1, value: 0, width: 220}));
const womenMax = view(Inputs.range([0, 100], {label: "Max % women", step: 1, value: 100, width: 220}));
```

**${filtered.length}** institutions

</div>
<div>

```js
/* scatterplot code here — use filtered dataset */
```

</div>
</div>
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Filters appear in a left sidebar, scatterplot takes the remaining width.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: organize dashboard with sidebar filter layout"
```

---

## Part 5: Frontend — Detail Panel

### Task 20: Add click-to-select and identity detail panel

**Files:**
- Modify: `src/index.md`

**Step 1: Add selection state and detail panel**

Add a click handler using Observable's reactive state:

````markdown
```js
const selected = view(Inputs.input(null));
```

Update the scatterplot to add a click handler by wrapping it:

```js
const chart = Plot.plot({
  /* ... existing config ... */
  marks: [
    Plot.dot(filtered, {
      x: "grad_rate_6yr",
      y: "admission_rate",
      fill: "sector_label",
      r: "enrollment_total",
      fillOpacity: 0.5,
      stroke: "currentColor",
      strokeWidth: 0.5,
      tip: true,
      channels: {
        Name: "INSTNM",
        State: "STABBR",
        Enrollment: "enrollment_total",
        "Grad Rate": "grad_rate_6yr",
        "Admit Rate": "admission_rate",
      },
    }),
  ],
});

// Add click handler
chart.addEventListener("click", (event) => {
  const [dot] = chart.querySelectorAll(":hover circle");
  if (dot) {
    const i = [...chart.querySelectorAll("circle")].indexOf(dot);
    if (i >= 0) selected.value = filtered[i];
  }
});

display(chart);
```
````

Below the scatterplot, add the detail panel:

````markdown
```js
const detail = selected;
```

${detail ? html`
<div style="border: 1px solid #ddd; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
  <h2>${detail.INSTNM}</h2>
  <p>${detail.CITY}, ${detail.STABBR} · ${detail.sector_label} · ${detail.locale_group}</p>
  <table>
    <tr><td>Admission Rate</td><td><strong>${detail.admission_rate}%</strong></td></tr>
    <tr><td>6-Year Graduation Rate</td><td><strong>${detail.grad_rate_6yr}%</strong></td></tr>
    <tr><td>Total Enrollment</td><td><strong>${detail.enrollment_total?.toLocaleString()}</strong></td></tr>
    <tr><td>% Women</td><td>${detail.pct_women}%</td></tr>
    <tr><td>% Pell Recipients</td><td>${detail.pct_pell}%</td></tr>
    <tr><td>HBCU</td><td>${detail.HBCU === 1 ? "Yes" : "No"}</td></tr>
  </table>
</div>
` : html`<p style="color: #999; margin-top: 1rem;">Click a dot to see institution details.</p>`}
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Clicking a dot shows the institution's identity details below the chart.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add click-to-select with identity detail panel"
```

---

### Task 21: Add demographics tab to detail panel

**Files:**
- Modify: `src/index.md`

**Step 1: Add demographics visualization to detail panel**

Expand the detail panel to show a stacked bar or small multiples for demographics:

````markdown
```js
// Inside the detail panel conditional
${detail ? html`
  <h3>Demographics</h3>
  ${Plot.plot({
    width: 400,
    height: 80,
    x: {label: "%", domain: [0, 100]},
    marks: [
      Plot.barX([
        {group: "White", value: detail.pct_white},
        {group: "Black", value: detail.pct_black},
        {group: "Hispanic", value: detail.pct_hispanic},
        {group: "Asian", value: detail.pct_asian},
        {group: "Two+", value: detail.pct_two_or_more},
        {group: "AIAN", value: detail.pct_aian},
        {group: "NHPI", value: detail.pct_nhpi},
        {group: "Nonresident", value: detail.pct_nonresident},
        {group: "Unknown", value: detail.pct_unknown},
      ].filter(d => d.value > 0), {
        x: "value",
        y: "group",
        fill: "group",
        sort: {y: "-x"},
        tip: true,
      }),
    ],
  })}
` : ""}
```
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Clicking an institution shows a horizontal bar chart of racial/ethnic demographics.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add demographics chart to detail panel"
```

---

### Task 22: Add programs tab to detail panel

**Files:**
- Modify: `src/index.md`

**Step 1: Add programs bar chart to detail panel**

````markdown
```js
${detail ? (() => {
  const instPrograms = programs
    .filter(d => d.UNITID === detail.UNITID)
    .sort((a, b) => b.total_awards - a.total_awards)
    .slice(0, 10);  // Top 10 programs

  return instPrograms.length > 0 ? Plot.plot({
    width: 400,
    height: Math.max(100, instPrograms.length * 25),
    marginLeft: 150,
    x: {label: "Bachelor's Degrees Awarded"},
    marks: [
      Plot.barX(instPrograms, {
        x: "total_awards",
        y: "cip_label",
        fill: "#4e79a7",
        sort: {y: "-x"},
        tip: true,
      }),
    ],
  }) : html`<p>No bachelor's program data available.</p>`;
})() : ""}
```
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Clicking an institution shows a bar chart of its top 10 bachelor's programs by degrees awarded.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: add programs bar chart to detail panel"
```

---

### Task 23: Organize detail panel with tabs

**Files:**
- Modify: `src/index.md`

**Step 1: Add tab navigation to detail panel**

````markdown
```js
const detailTab = view(Inputs.radio(
  ["Identity", "Demographics", "Programs"],
  {value: "Identity"}
));
```

${detail ? html`
<div style="border: 1px solid #ddd; padding: 1rem; margin-top: 1rem; border-radius: 8px;">
  <h2>${detail.INSTNM}</h2>
  <p>${detail.CITY}, ${detail.STABBR} · ${detail.sector_label} · ${detail.locale_group}</p>
  ${detailTab}
</div>
` : html`<p style="color: #999; margin-top: 1rem;">Click a dot to see institution details.</p>`}
```

Then conditionally render each tab's content based on `detailTab` value:
- `"Identity"` → the stats table from Task 20
- `"Demographics"` → the demographics chart from Task 21
- `"Programs"` → the programs chart from Task 22
````

**Step 2: Verify in dev server**

Run: `npx observable preview`
Expected: Detail panel has radio buttons to switch between Identity, Demographics, and Programs views.

**Step 3: Commit**

```bash
git add src/index.md
git commit -m "feat: organize detail panel with tabbed navigation"
```

---

### Task 24: Final polish and build verification

**Files:**
- Modify: `src/index.md` (title, instructions)

**Step 1: Add dashboard header and instructions**

Add at the top of `src/index.md`:
````markdown
# IPEDS College Dashboard

Explore graduation rates vs. admission selectivity across **${institutions.length}** four-year bachelor's-granting institutions. Data source: IPEDS 2023.

Use the filters on the left to narrow the dataset. Hover over dots for quick stats. Click a dot to see full institutional details below.
````

**Step 2: Run all Python tests**

Run:
```bash
source .venv/bin/activate && pytest tests/ -v
```
Expected: All tests PASS.

**Step 3: Build the static site**

Run:
```bash
npx observable build
```
Expected: Static site generated in `dist/` directory with no errors.

**Step 4: Commit**

```bash
git add src/ dist/
git commit -m "feat: final polish — dashboard header, instructions, and production build"
```

---

## Deferred to v2

- **Trends tab**: Requires downloading 2019-2022 DRVADM/DRVGR files for multi-year trend lines
- **Reset All button**: Clear all filters to defaults in one click
- **Zoom/pan**: D3 zoom behavior on the scatterplot
- **URL state**: Encode filter state in URL for sharing specific views
- **Export**: Download filtered dataset as CSV
