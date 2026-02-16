# Compare Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a second dashboard page where users define up to three school categories with filter controls, choose X/Y axis variables, and see a comparative scatterplot with trendlines.

**Architecture:** Extend the Python pipeline to include SAT/ACT scores, tuition, and grad ratio. Add a new Observable Framework page (`src/compare.md`) with three inline filter panels, axis selectors, and a scatterplot reusing the existing polynomial regression approach.

**Tech Stack:** Python/pandas (pipeline), Observable Framework + D3/Plot (frontend)

---

### Task 1: Download new IPEDS data files

**Files:**
- Modify: `data/pipeline/download_ipeds.sh`

**Step 1: Add IC2023_AY and ADM2023 to download script**

In `data/pipeline/download_ipeds.sh`, add `"IC2023_AY"` and `"ADM2023"` to the FILES array:

```bash
FILES=(
  "HD2023"
  "drvadm2023"
  "drvgr2023"
  "C2023_A"
  "drvef2023"
  "SFA2223"
  "IC2023_AY"
  "ADM2023"
)
```

**Step 2: Run the download script**

Run: `bash data/pipeline/download_ipeds.sh`
Expected: Downloads IC2023_AY.zip and ADM2023.zip, extracts CSVs to `data/raw/`

**Step 3: Verify the new files exist and inspect columns**

Run: `head -1 data/raw/ic2023_ay.csv | tr ',' '\n' | grep -i 'tuition\|chg'`
Expected: See TUITION2, TUITION3, CHG2AY3, CHG3AY3 among columns

Run: `head -1 data/raw/adm2023.csv | tr ',' '\n' | grep -i 'sat\|act'`
Expected: See SATVR25, SATVR75, SATMT25, SATMT75, ACTCM25, ACTCM75 among columns

**Step 4: Commit**

```bash
git add data/pipeline/download_ipeds.sh data/raw/IC2023_AY.csv data/raw/ic2023_ay.csv data/raw/ADM2023.csv data/raw/adm2023.csv
git commit -m "data: download tuition (IC2023_AY) and admissions (ADM2023) files"
```

Note: IPEDS zip extraction may produce uppercase or lowercase filenames — add whichever exist.

---

### Task 2: Write failing tests for new pipeline functions

**Files:**
- Modify: `tests/test_pipeline.py`

**Step 1: Add imports for new functions at top of test file**

Add `join_tuition`, `join_sat_act`, and `add_grad_ratio` to the import from `build_dataset` in `tests/test_pipeline.py`:

```python
from build_dataset import (
    load_institutions,
    join_admissions,
    join_graduation_rates,
    join_enrollment_demographics,
    join_pell,
    join_tuition,
    join_sat_act,
    add_labels,
    add_grad_ratio,
    build_programs,
    main,
)
```

**Step 2: Write test for join_tuition**

Add after the `test_join_pell_adds_percentage` function:

```python
# --- Join tuition data ---

def test_join_tuition_adds_columns():
    inst = load_institutions(RAW_DIR)
    df = join_tuition(inst, RAW_DIR)
    assert "tuition_in_state" in df.columns
    assert "tuition_out_of_state" in df.columns
    valid_in = df["tuition_in_state"].dropna()
    assert valid_in.min() >= 0
    assert len(df) == len(inst)
```

**Step 3: Write test for join_sat_act**

```python
# --- Join SAT/ACT data ---

def test_join_sat_act_adds_columns():
    inst = load_institutions(RAW_DIR)
    df = join_sat_act(inst, RAW_DIR)
    assert "sat_avg" in df.columns
    assert "act_avg" in df.columns
    valid_sat = df["sat_avg"].dropna()
    assert valid_sat.min() >= 400  # minimum possible SAT total is 400
    assert valid_sat.max() <= 1600  # maximum possible SAT total is 1600
    assert len(df) == len(inst)
```

**Step 4: Write test for add_grad_ratio**

```python
# --- Add grad ratio ---

def test_add_grad_ratio():
    inst = load_institutions(RAW_DIR)
    df = join_enrollment_demographics(inst, RAW_DIR)
    df = add_grad_ratio(df)
    assert "grad_ratio" in df.columns
    assert set(df["grad_ratio"].dropna().unique()).issubset({"none", "minority", "majority"})
```

**Step 5: Run tests to verify they fail**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python -m pytest tests/test_pipeline.py -v -k "tuition or sat_act or grad_ratio"`
Expected: FAIL — ImportError because functions don't exist yet

**Step 6: Commit**

```bash
git add tests/test_pipeline.py
git commit -m "test: add failing tests for tuition, SAT/ACT, and grad ratio"
```

---

### Task 3: Implement join_tuition

**Files:**
- Modify: `data/pipeline/build_dataset.py`

**Step 1: Add join_tuition function**

Add after the `join_pell` function in `data/pipeline/build_dataset.py`:

```python
def join_tuition(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join tuition data from IC2023_AY."""
    path = Path(raw_dir) / "ic2023_ay.csv"
    if not path.exists():
        path = Path(raw_dir) / "IC2023_AY.csv"
    ic = _read_csv(path)
    ic = ic[["UNITID", "TUITION2", "TUITION3"]].rename(columns={
        "TUITION2": "tuition_in_state",
        "TUITION3": "tuition_out_of_state",
    })
    ic["tuition_in_state"] = pd.to_numeric(ic["tuition_in_state"], errors="coerce")
    ic["tuition_out_of_state"] = pd.to_numeric(ic["tuition_out_of_state"], errors="coerce")
    return df.merge(ic, on="UNITID", how="left")
```

**Step 2: Run the tuition test**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python -m pytest tests/test_pipeline.py::test_join_tuition_adds_columns -v`
Expected: PASS

**Step 3: Commit**

```bash
git add data/pipeline/build_dataset.py
git commit -m "feat: add join_tuition to pipeline"
```

---

### Task 4: Implement join_sat_act

**Files:**
- Modify: `data/pipeline/build_dataset.py`

**Step 1: Add join_sat_act function**

Add after `join_tuition` in `data/pipeline/build_dataset.py`. Note: the raw ADM2023 file has SATVR25/75 (verbal) and SATMT25/75 (math). We compute a midpoint average: `sat_avg = (SATVR25 + SATVR75) / 2 + (SATMT25 + SATMT75) / 2`. For ACT: `act_avg = (ACTCM25 + ACTCM75) / 2`.

```python
def join_sat_act(df: pd.DataFrame, raw_dir: str) -> pd.DataFrame:
    """Join SAT and ACT score data from ADM2023."""
    path = Path(raw_dir) / "adm2023.csv"
    if not path.exists():
        path = Path(raw_dir) / "ADM2023.csv"
    adm = _read_csv(path)
    score_cols = ["UNITID", "SATVR25", "SATVR75", "SATMT25", "SATMT75", "ACTCM25", "ACTCM75"]
    # Only keep columns that exist
    score_cols = [c for c in score_cols if c in adm.columns]
    adm = adm[score_cols].copy()
    for col in score_cols[1:]:
        adm[col] = pd.to_numeric(adm[col], errors="coerce")
    if "SATVR25" in adm.columns:
        adm["sat_avg"] = ((adm["SATVR25"] + adm["SATVR75"]) / 2 +
                          (adm["SATMT25"] + adm["SATMT75"]) / 2).round(0)
    if "ACTCM25" in adm.columns:
        adm["act_avg"] = ((adm["ACTCM25"] + adm["ACTCM75"]) / 2).round(1)
    keep = ["UNITID"] + [c for c in ["sat_avg", "act_avg"] if c in adm.columns]
    return df.merge(adm[keep], on="UNITID", how="left")
```

**Step 2: Run the SAT/ACT test**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python -m pytest tests/test_pipeline.py::test_join_sat_act_adds_columns -v`
Expected: PASS

**Step 3: Commit**

```bash
git add data/pipeline/build_dataset.py
git commit -m "feat: add join_sat_act to pipeline"
```

---

### Task 5: Implement add_grad_ratio

**Files:**
- Modify: `data/pipeline/build_dataset.py`

**Step 1: Add add_grad_ratio function**

Add after `add_labels` in `data/pipeline/build_dataset.py`:

```python
def add_grad_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Add grad_ratio column: none, minority, or majority."""
    df = df.copy()
    grad = df["enrollment_total"] - df["enrollment_ug"]

    def ratio(row):
        total = row.get("enrollment_total")
        ug = row.get("enrollment_ug")
        if pd.isna(total) or pd.isna(ug):
            return None
        g = total - ug
        if g <= 0:
            return "none"
        elif g < ug:
            return "minority"
        else:
            return "majority"

    df["grad_ratio"] = df.apply(ratio, axis=1)
    return df
```

**Step 2: Run the grad ratio test**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python -m pytest tests/test_pipeline.py::test_add_grad_ratio -v`
Expected: PASS

**Step 3: Commit**

```bash
git add data/pipeline/build_dataset.py
git commit -m "feat: add add_grad_ratio to pipeline"
```

---

### Task 6: Wire new functions into main() and rebuild data

**Files:**
- Modify: `data/pipeline/build_dataset.py`

**Step 1: Update main() to call new functions and export new columns**

In the `main()` function of `data/pipeline/build_dataset.py`, add the new join calls after `join_pell` and before `add_labels`:

```python
    print("Joining tuition data...")
    df = join_tuition(df, raw_dir)

    print("Joining SAT/ACT scores...")
    df = join_sat_act(df, raw_dir)
```

After `add_labels`, add:

```python
    print("Adding grad ratio...")
    df = add_grad_ratio(df)
```

Update `institutions_cols` to include the new columns. Add these entries to the list:

```python
        "tuition_in_state", "tuition_out_of_state",
        "sat_avg", "act_avg", "grad_ratio",
```

**Step 2: Run all pipeline tests**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python -m pytest tests/test_pipeline.py -v`
Expected: All tests PASS including `test_main_produces_output_files`

**Step 3: Rebuild the data**

Run: `cd /home/cshirky/claude_project/ipeds-college-dashboard && python data/pipeline/build_dataset.py`
Expected: Output shows new join steps, writes institutions.csv with new columns

**Step 4: Copy to Observable data dir**

Run:
```bash
cp data/output/institutions.csv src/data/institutions.csv
cp data/output/programs.csv src/data/programs.csv
```

**Step 5: Verify new columns exist**

Run: `head -1 data/output/institutions.csv | tr ',' '\n' | grep -E "tuition|sat|act|grad_ratio"`
Expected: tuition_in_state, tuition_out_of_state, sat_avg, act_avg, grad_ratio

**Step 6: Commit**

```bash
git add data/pipeline/build_dataset.py data/output/ src/data/
git commit -m "feat: rebuild dataset with tuition, SAT/ACT, and grad ratio"
```

---

### Task 7: Add Observable config for the compare page

**Files:**
- Modify: `observablehq.config.js`

**Step 1: Add compare page to config**

Replace contents of `observablehq.config.js`:

```js
export default {
  title: "IPEDS College Dashboard",
  pages: [
    {name: "Explorer", path: "/"},
    {name: "Compare", path: "/compare"},
  ],
  root: "src",
};
```

**Step 2: Commit**

```bash
git add observablehq.config.js
git commit -m "feat: add compare page to Observable config"
```

---

### Task 8: Build compare page — data loading and category filters

**Files:**
- Create: `src/compare.md`

**Step 1: Create the compare page with data loading and three category panels**

Create `src/compare.md` with the following content:

````markdown
# Compare Institutions

Define up to three categories of schools, choose axes, and compare.

```js
const institutions = FileAttachment("data/institutions.csv").csv({typed: true});
```

```js
const allStates = [...new Set(institutions.map(d => d.STABBR))].sort();
const sectorOptions = ["Public", "Private nonprofit", "Private for-profit"];
const localeOptions = ["City", "Suburb", "Town", "Rural"];
const gradOptions = ["none", "minority", "majority"];
const gradLabels = {none: "No grad students", minority: "Grad minority", majority: "Grad majority"};
```

```js
// Axis variable definitions
const axisVars = [
  {label: "Admission Rate (%)", value: "admission_rate"},
  {label: "6-Year Graduation Rate (%)", value: "grad_rate_6yr"},
  {label: "SAT Score (avg)", value: "sat_avg"},
  {label: "ACT Score (avg)", value: "act_avg"},
  {label: "In-State Tuition ($)", value: "tuition_in_state"},
  {label: "Out-of-State Tuition ($)", value: "tuition_out_of_state"},
  {label: "Total Enrollment", value: "enrollment_total"},
  {label: "% Pell Recipients", value: "pct_pell"},
  {label: "% Women", value: "pct_women"},
];
```

<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">

<div style="border: 2px solid #4e79a7; border-radius: 8px; padding: 1rem;">

### 🔵 Category 1

```js
const name1 = view(Inputs.text({label: "Name", value: "Group 1", width: 200}));
const sector1 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: sectorOptions}));
const grad1 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: gradOptions, format: d => gradLabels[d]}));
const locale1 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: localeOptions}));
```

```js
const stateInput1 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: ["All"], width: 200});
stateInput1.querySelector("select").size = 4;
const stateSelection1 = view(stateInput1);
```

```js
const state1 = stateSelection1.includes("All") ? allStates : stateSelection1;
const filtered1 = institutions.filter(d =>
  sector1.includes(d.sector_label) &&
  locale1.includes(d.locale_group) &&
  state1.includes(d.STABBR) &&
  grad1.includes(d.grad_ratio)
);
```

**${filtered1.length}** schools

</div>

<div style="border: 2px solid #e15759; border-radius: 8px; padding: 1rem;">

### 🔴 Category 2

```js
const name2 = view(Inputs.text({label: "Name", value: "Group 2", width: 200}));
const sector2 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: sectorOptions}));
const grad2 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: gradOptions, format: d => gradLabels[d]}));
const locale2 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: localeOptions}));
```

```js
const stateInput2 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: ["All"], width: 200});
stateInput2.querySelector("select").size = 4;
const stateSelection2 = view(stateInput2);
```

```js
const state2 = stateSelection2.includes("All") ? allStates : stateSelection2;
const filtered2 = institutions.filter(d =>
  sector2.includes(d.sector_label) &&
  locale2.includes(d.locale_group) &&
  state2.includes(d.STABBR) &&
  grad2.includes(d.grad_ratio)
);
```

**${filtered2.length}** schools

</div>

<div style="border: 2px solid #f28e2b; border-radius: 8px; padding: 1rem;">

### 🟠 Category 3

```js
const name3 = view(Inputs.text({label: "Name", value: "Group 3", width: 200}));
const sector3 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: sectorOptions}));
const grad3 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: gradOptions, format: d => gradLabels[d]}));
const locale3 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: localeOptions}));
```

```js
const stateInput3 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: ["All"], width: 200});
stateInput3.querySelector("select").size = 4;
const stateSelection3 = view(stateInput3);
```

```js
const state3 = stateSelection3.includes("All") ? allStates : stateSelection3;
const filtered3 = institutions.filter(d =>
  sector3.includes(d.sector_label) &&
  locale3.includes(d.locale_group) &&
  state3.includes(d.STABBR) &&
  grad3.includes(d.grad_ratio)
);
```

**${filtered3.length}** schools

</div>

</div>
````

**Step 2: Verify page loads in dev server**

Run: `npx observable preview` (if not already running)
Navigate to: `http://127.0.0.1:3000/compare`
Expected: Three filter panels side by side, each showing school counts

**Step 3: Commit**

```bash
git add src/compare.md
git commit -m "feat: add compare page with three category filter panels"
```

---

### Task 9: Add axis selectors and scatterplot

**Files:**
- Modify: `src/compare.md`

**Step 1: Add axis selectors and scatterplot below the filter panels**

Append to the end of `src/compare.md`:

````markdown
---

## Comparison Plot

```js
const xVar = view(Inputs.select(axisVars, {label: "X axis", format: d => d.label, value: axisVars.find(d => d.value === "grad_rate_6yr")}));
const yVar = view(Inputs.select(axisVars, {label: "Y axis", format: d => d.label, value: axisVars.find(d => d.value === "admission_rate")}));
```

```js
{
  const colors = {"cat1": "#4e79a7", "cat2": "#e15759", "cat3": "#f28e2b"};
  const categories = [
    {key: "cat1", name: name1, data: filtered1, color: "#4e79a7"},
    {key: "cat2", name: name2, data: filtered2, color: "#e15759"},
    {key: "cat3", name: name3, data: filtered3, color: "#f28e2b"},
  ];

  // Tag each point with its category
  const allPoints = [];
  for (const cat of categories) {
    for (const d of cat.data) {
      if (d[xVar.value] != null && d[yVar.value] != null) {
        allPoints.push({...d, _cat: cat.key, _catName: cat.name, _color: cat.color});
      }
    }
  }

  // Polynomial regression (degree 3)
  function polyFit(xs, ys, degree) {
    const n = xs.length;
    const size = degree + 1;
    const X = Array.from({length: size}, (_, i) => Array.from({length: size}, (_, j) =>
      xs.reduce((s, x) => s + x ** (i + j), 0)));
    const Y = Array.from({length: size}, (_, i) =>
      xs.reduce((s, x, k) => s + x ** i * ys[k], 0));
    for (let i = 0; i < size; i++) {
      let max = i;
      for (let j = i + 1; j < size; j++) if (Math.abs(X[j][i]) > Math.abs(X[max][i])) max = j;
      [X[i], X[max]] = [X[max], X[i]];
      [Y[i], Y[max]] = [Y[max], Y[i]];
      for (let j = i + 1; j < size; j++) {
        const f = X[j][i] / X[i][i];
        for (let k = i; k < size; k++) X[j][k] -= f * X[i][k];
        Y[j] -= f * Y[i];
      }
    }
    const coeffs = new Array(size);
    for (let i = size - 1; i >= 0; i--) {
      coeffs[i] = Y[i];
      for (let j = i + 1; j < size; j++) coeffs[i] -= X[i][j] * coeffs[j];
      coeffs[i] /= X[i][i];
    }
    return coeffs;
  }

  // Build trendlines
  const trendLines = [];
  for (const cat of categories) {
    const catPoints = allPoints.filter(d => d._cat === cat.key);
    if (catPoints.length < 4) continue;
    const xs = catPoints.map(d => d[xVar.value]);
    const ys = catPoints.map(d => d[yVar.value]);
    const xMin = d3.min(xs), xMax = d3.max(xs);
    const coeffs = polyFit(xs, ys, 3);
    for (const x of d3.range(xMin, xMax, (xMax - xMin) / 100)) {
      trendLines.push({
        x,
        y: coeffs[0] + coeffs[1] * x + coeffs[2] * x ** 2 + coeffs[3] * x ** 3,
        _cat: cat.key,
        _catName: cat.name,
        _color: cat.color,
      });
    }
  }

  display(Plot.plot({
    width: 900,
    height: 600,
    grid: true,
    x: {label: xVar.label},
    y: {label: yVar.label},
    r: {range: [2, 12]},
    color: {
      legend: true,
      domain: categories.map(c => c.name),
      range: categories.map(c => c.color),
    },
    marks: [
      Plot.line(trendLines, {
        x: "x", y: "y", z: "_catName", stroke: "_color",
        strokeWidth: 2, strokeDasharray: "6,4",
      }),
      Plot.dot(allPoints, {
        x: xVar.value,
        y: yVar.value,
        fill: "_catName",
        r: "enrollment_total",
        fillOpacity: 0.5,
        stroke: "currentColor",
        strokeWidth: 0.5,
        tip: {format: {x: false, y: false, fill: false, r: false}},
        channels: {
          Name: "INSTNM",
          State: "STABBR",
          Category: "_catName",
          [xVar.label]: xVar.value,
          [yVar.label]: yVar.value,
        },
      }),
      Plot.crosshair(allPoints, {x: xVar.value, y: yVar.value, color: "#555"}),
    ],
  }));
}
```
````

**Step 2: Verify in browser**

Navigate to: `http://127.0.0.1:3000/compare`
Expected: Filter panels at top, axis dropdowns, and scatterplot with three colored groups and dashed trendlines

**Step 3: Commit**

```bash
git add src/compare.md
git commit -m "feat: add axis selectors and scatterplot to compare page"
```

---

### Task 10: Add navigation links between pages

**Files:**
- Modify: `src/index.md`
- Modify: `src/compare.md`

**Step 1: Add link to compare page from index**

At the top of `src/index.md`, after the subtitle line ("Explore graduation rates..."), add:

```markdown
<a href="/compare">→ Compare categories</a>
```

**Step 2: Add link back from compare page**

At the top of `src/compare.md`, after the title, add:

```markdown
<a href="/">← Back to Explorer</a>
```

**Step 3: Verify navigation works in browser**

Click links in both directions.

**Step 4: Commit**

```bash
git add src/index.md src/compare.md
git commit -m "feat: add navigation links between explorer and compare pages"
```

---

### Task 11: Build and push

**Step 1: Build the static site**

Run: `npx observable build`
Expected: Build succeeds, `dist/` contains both index.html and compare.html

**Step 2: Push to GitHub**

```bash
git push
```

Expected: GitHub Actions deploys to Pages automatically.
