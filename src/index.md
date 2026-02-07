# IPEDS College Dashboard

Explore graduation rates vs. admission selectivity across four-year bachelor's-granting institutions. Data source: IPEDS 2023.

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
const stateFilter = view(Inputs.select(allStates, {
  label: "State", multiple: true, value: allStates, width: 240,
}));
```

```js
const enrollMin = view(Inputs.range([0, 80000], {label: "Min enrollment", step: 500, value: 0, width: 240}));
```

```js
const enrollMax = view(Inputs.range([0, 80000], {label: "Max enrollment", step: 500, value: 80000, width: 240}));
```

```js
const programFilter = view(Inputs.select(cipLabels, {
  label: "Programs offered", multiple: true, value: cipLabels, width: 240,
}));
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
    (d.pct_women == null || (d.pct_women >= womenMin && d.pct_women <= womenMax))
  );
});
```

**${filtered.length}** of ${institutions.length} institutions

</div>
<div>

```js
// Scatterplot
Plot.plot({
  width: 900,
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
  r: { range: [2, 15] },
  color: {
    legend: true,
    domain: ["Public", "Private nonprofit", "Private for-profit"],
    range: ["#4e79a7", "#e15759", "#f28e2b"],
  },
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
})
```

</div>
</div>

---

## Institution Detail

```js
const selectedName = view(Inputs.text({
  label: "Search institution",
  placeholder: "Type to search...",
  datalist: filtered.map(d => d.INSTNM),
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
