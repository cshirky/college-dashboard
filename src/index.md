# IPEDS College Dashboard


Explore graduation rates vs. admission selectivity across four-year bachelor's-granting institutions. Data source: IPEDS 2023.

<a href="/compare">→ Compare categories</a>

```js
const institutions = FileAttachment("data/institutions.csv").csv({typed: true});
const programs = FileAttachment("data/programs.csv").csv({typed: true});
```

```js
// Build CIP lookup
const cipLabels = [...new Set(programs.map(d => d.cip_label))].sort();
const institutionCips = new Map();
for (const p of programs) {
  if (!institutionCips.has(p.UNITID)) institutionCips.set(p.UNITID, new Set());
  institutionCips.get(p.UNITID).add(p.cip_label);
}
const allStates = [...new Set(institutions.map(d => d.STABBR))].sort();
```

<div style="display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem;">
<div>

## Filters

```js
const resetBtn = view(Inputs.button("Clear all filters", {reduce: () => {
  // Find all Observable form containers in the sidebar
  const sidebar = document.querySelector("div[style*='grid-template-columns']")?.firstElementChild;
  if (!sidebar) return;
  const forms = sidebar.querySelectorAll("form");
  for (const form of forms) {
    // Reset checkboxes
    for (const cb of form.querySelectorAll("input[type=checkbox]")) {
      cb.checked = true;
    }
    // Reset range inputs with known defaults
    const range = form.querySelector("input[type=range]");
    if (range) {
      const label = form.querySelector("label")?.textContent || "";
      if (label.includes("Max enrollment")) range.value = 80000;
      else if (label.includes("Max % women")) range.value = 100;
      else range.value = 0;
      range.dispatchEvent(new Event("input", {bubbles: true}));
    }
    // Reset multi-selects
    const sel = form.querySelector("select[multiple]");
    if (sel) {
      for (const opt of sel.options) opt.selected = true;
    }
    // Dispatch input on the form to trigger Observable reactivity
    form.value = form.value;
    form.dispatchEvent(new Event("input", {bubbles: true}));
  }
}}));
```

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
const stateOptions = ["All", ...allStates];
const stateInput = Inputs.select(stateOptions, {
  label: "State", multiple: true, value: ["All"], width: 240,
});
stateInput.querySelector("select").size = 4;
const stateSelection = view(stateInput);
```

```js
const stateFilter = stateSelection.includes("All") ? allStates : stateSelection;
```

```js
const enrollMin = view(Inputs.range([0, 80000], {label: "Min enrollment", step: 500, value: 0, width: 220}));
```

```js
const enrollMax = view(Inputs.range([0, 80000], {label: "Max enrollment", step: 500, value: 80000, width: 220}));
```

```js
const programInput = Inputs.select(cipLabels, {
  label: "Programs offered", multiple: true, value: cipLabels, width: 240,
});
programInput.querySelector("select").size = 4;
const programFilter = view(programInput);
```

```js
const pellMin = view(Inputs.range([0, 100], {label: "Min % Pell", step: 1, value: 0, width: 240}));
```

```js
const womenMin = view(Inputs.range([0, 100], {label: "Min % women", step: 1, value: 0, width: 240}));
```

```js
const womenMax = view(Inputs.range([0, 100], {label: "Max % women", step: 1, value: 100, width: 240}));
```

```js
// Filtered dataset
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
    (d.pct_women == null || (d.pct_women >= womenMin && d.pct_women <= womenMax)) &&
    d.grad_rate_6yr !== 100 &&
    (d.admission_rate == null || d.admission_rate <= 70)
  );
});
```

**${filtered.length}** of ${institutions.length} institutions

Undergrad: **${filtered.reduce((s, d) => s + (d.enrollment_ug || 0), 0).toLocaleString()}**<br>
Grad: **${filtered.reduce((s, d) => s + ((d.enrollment_total || 0) - (d.enrollment_ug || 0)), 0).toLocaleString()}**

</div>
<div>

```js
// Scatterplot
{
  // Polynomial regression (degree 3) per sector
  const trendData = filtered.filter(d => d.grad_rate_6yr != null && d.admission_rate != null);

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

  const sectorColors = {"Public": "#4e79a7", "Private nonprofit": "#e15759", "Private for-profit": "#f28e2b"};
  const trendLines = [];
  for (const sector of sectorFilter) {
    const sectorData = trendData.filter(d => d.sector_label === sector);
    if (sectorData.length < 4) continue;
    const xs = sectorData.map(d => d.grad_rate_6yr);
    const ys = sectorData.map(d => d.admission_rate);
    const coeffs = polyFit(xs, ys, 3);
    for (const x of d3.range(0, 101, 1)) {
      trendLines.push({
        x,
        y: Math.max(0, Math.min(70, coeffs[0] + coeffs[1] * x + coeffs[2] * x ** 2 + coeffs[3] * x ** 3)),
        sector,
      });
    }
  }

  display(Plot.plot({
    width: 900,
    height: 600,
    grid: true,
    style: {"--plot-grid-stroke": "#999"},
    x: {
      label: "6-Year Graduation Rate (%)",
      domain: [100, 33],
    },
    y: {
      label: "Admission Rate (%)",
      domain: [70, 0],
    },
    r: { range: [2, 15] },
    color: {
      legend: true,
      domain: ["Public", "Private nonprofit", "Private for-profit"],
      range: ["#4e79a7", "#e15759", "#f28e2b"],
    },
    marks: [
      Plot.line(trendLines, {x: "x", y: "y", z: "sector", stroke: d => sectorColors[d.sector], strokeWidth: 2, strokeDasharray: "6,4"}),
      Plot.dot(filtered.filter(d => d.INSTNM !== "New York University"), {
        x: "grad_rate_6yr",
        y: "admission_rate",
        fill: "sector_label",
        r: "enrollment_total",
        fillOpacity: 0.5,
        stroke: "currentColor",
        strokeWidth: 0.5,
        tip: {format: {x: false, y: false, fill: false, r: false}},
        channels: {
          Name: "INSTNM",
          State: "STABBR",
          "Admit Rate": "admission_rate",
          "6-Year Graduation Rate": "grad_rate_6yr",
          "% Men": d => d.pct_women != null ? (100 - d.pct_women) + "%" : "N/A",
          "% White": d => d.pct_white != null ? d.pct_white + "%" : "N/A",
          "Undergrad Enrollment": "enrollment_ug",
          "Grad Enrollment": d => d.enrollment_total != null && d.enrollment_ug != null ? d.enrollment_total - d.enrollment_ug : "N/A",
        },
      }),
      Plot.dot(filtered.filter(d => d.INSTNM === "New York University"), {
        x: "grad_rate_6yr",
        y: "admission_rate",
        fill: "purple",
        r: "enrollment_total",
        fillOpacity: 0.7,
        stroke: "purple",
        strokeWidth: 1.5,
        tip: {format: {x: false, y: false, fill: false, r: false}},
        channels: {
          Name: "INSTNM",
          State: "STABBR",
          "Admit Rate": "admission_rate",
          "6-Year Graduation Rate": "grad_rate_6yr",
          "% Men": d => d.pct_women != null ? (100 - d.pct_women) + "%" : "N/A",
          "% White": d => d.pct_white != null ? d.pct_white + "%" : "N/A",
          "Undergrad Enrollment": "enrollment_ug",
          "Grad Enrollment": d => d.enrollment_total != null && d.enrollment_ug != null ? d.enrollment_total - d.enrollment_ug : "N/A",
        },
      }),
      Plot.crosshair(filtered, {x: "grad_rate_6yr", y: "admission_rate", color: "#555"}),
      Plot.dot(filtered.filter(d => d.INSTNM === selectedName), {
        x: "grad_rate_6yr",
        y: "admission_rate",
        r: 12,
        fill: "none",
        stroke: "black",
        strokeWidth: 3,
      }),
    ],
  }));
}
```

</div>
</div>

---

## Institution Detail

```js
const selectedName = view(Inputs.text({
  label: "Search institution",
  placeholder: "Type to search...",
  datalist: filtered.map(d => d.INSTNM).sort(),
  width: 400,
}));
```

```js
const selected = filtered.find(d => d.INSTNM === selectedName) || null;
```

```js
if (selected) {
  display(html`<div style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
    <h2>${selected.INSTNM}</h2>
    <p>${selected.CITY}, ${selected.STABBR} &middot; ${selected.sector_label} &middot; ${selected.locale_group}</p>
    <table>
      <tr><td><strong>Admission Rate</strong></td><td>${selected.admission_rate != null ? selected.admission_rate + "%" : "N/A"}</td></tr>
      <tr><td><strong>6-Year Grad Rate</strong></td><td>${selected.grad_rate_6yr != null ? selected.grad_rate_6yr + "%" : "N/A"}</td></tr>
      <tr><td><strong>Total Enrollment</strong></td><td>${selected.enrollment_total?.toLocaleString() ?? "N/A"}</td></tr>
      <tr><td><strong>% Women</strong></td><td>${selected.pct_women != null ? selected.pct_women + "%" : "N/A"}</td></tr>
      <tr><td><strong>% Pell Recipients</strong></td><td>${selected.pct_pell != null ? selected.pct_pell + "%" : "N/A"}</td></tr>
      <tr><td><strong>HBCU</strong></td><td>${selected.HBCU === 1 ? "Yes" : "No"}</td></tr>
    </table>
  </div>`);
}
```

```js
// Demographics chart
if (selected) {
  display(html`<h3>Demographics</h3>`);
  const demoData = [
    {group: "White", value: selected.pct_white},
    {group: "Black", value: selected.pct_black},
    {group: "Hispanic", value: selected.pct_hispanic},
    {group: "Asian", value: selected.pct_asian},
    {group: "Two+", value: selected.pct_two_or_more},
    {group: "AIAN", value: selected.pct_aian},
    {group: "NHPI", value: selected.pct_nhpi},
    {group: "Nonresident", value: selected.pct_nonresident},
  ].filter(d => d.value > 0);

  display(Plot.plot({
    width: 500,
    height: Math.max(100, demoData.length * 30),
    marginLeft: 100,
    x: {label: "%", domain: [0, 100]},
    marks: [
      Plot.barX(demoData, {
        x: "value",
        y: "group",
        fill: "#4e79a7",
        sort: {y: "-x"},
        tip: true,
      }),
    ],
  }));
}
```

```js
// Programs chart
if (selected) {
  const instPrograms = programs
    .filter(d => d.UNITID === selected.UNITID)
    .sort((a, b) => b.total_awards - a.total_awards)
    .slice(0, 10);

  if (instPrograms.length > 0) {
    display(html`<h3>Programs (Top 10 by Bachelor's Degrees Awarded)</h3>`);
    display(Plot.plot({
      width: 500,
      height: Math.max(100, instPrograms.length * 28),
      marginLeft: 160,
      x: {label: "Degrees Awarded"},
      marks: [
        Plot.barX(instPrograms, {
          x: "total_awards",
          y: "cip_label",
          fill: "#e15759",
          sort: {y: "-x"},
          tip: true,
        }),
      ],
    }));
  } else {
    display(html`<p><em>No bachelor's program data available.</em></p>`);
  }
}
```
