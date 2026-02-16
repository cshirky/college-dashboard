# Compare Institutions

<a href="/">← Back to Explorer</a>

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

### Category 1

```js
const show1 = view(Inputs.toggle({label: "Show on plot", value: false}));
```

```js
const name1 = view(Inputs.text({label: "Name", value: "Group 1", width: 200}));
```

```js
const sector1 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: []}));
```

```js
const grad1 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: [], format: d => gradLabels[d]}));
```

```js
const locale1 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: []}));
```

```js
const stateInput1 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: [], width: 200});
stateInput1.querySelector("select").size = 4;
const stateSelection1 = view(stateInput1);
```

```js
const state1 = stateSelection1.includes("All") ? allStates : stateSelection1;
const filtered1 = !show1 ? [] : institutions.filter(d =>
  sector1.includes(d.sector_label) &&
  locale1.includes(d.locale_group) &&
  (state1.length === 0 || state1.includes(d.STABBR)) &&
  grad1.includes(d.grad_ratio)
);
```

**${filtered1.length}** schools

</div>

<div style="border: 2px solid #e15759; border-radius: 8px; padding: 1rem;">

### Category 2

```js
const show2 = view(Inputs.toggle({label: "Show on plot", value: false}));
```

```js
const name2 = view(Inputs.text({label: "Name", value: "Group 2", width: 200}));
```

```js
const sector2 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: []}));
```

```js
const grad2 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: [], format: d => gradLabels[d]}));
```

```js
const locale2 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: []}));
```

```js
const stateInput2 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: [], width: 200});
stateInput2.querySelector("select").size = 4;
const stateSelection2 = view(stateInput2);
```

```js
const state2 = stateSelection2.includes("All") ? allStates : stateSelection2;
const filtered2 = !show2 ? [] : institutions.filter(d =>
  sector2.includes(d.sector_label) &&
  locale2.includes(d.locale_group) &&
  (state2.length === 0 || state2.includes(d.STABBR)) &&
  grad2.includes(d.grad_ratio)
);
```

**${filtered2.length}** schools

</div>

<div style="border: 2px solid #f28e2b; border-radius: 8px; padding: 1rem;">

### Category 3

```js
const show3 = view(Inputs.toggle({label: "Show on plot", value: false}));
```

```js
const name3 = view(Inputs.text({label: "Name", value: "Group 3", width: 200}));
```

```js
const sector3 = view(Inputs.checkbox(sectorOptions, {label: "Sector", value: []}));
```

```js
const grad3 = view(Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: [], format: d => gradLabels[d]}));
```

```js
const locale3 = view(Inputs.checkbox(localeOptions, {label: "Locale", value: []}));
```

```js
const stateInput3 = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: [], width: 200});
stateInput3.querySelector("select").size = 4;
const stateSelection3 = view(stateInput3);
```

```js
const state3 = stateSelection3.includes("All") ? allStates : stateSelection3;
const filtered3 = !show3 ? [] : institutions.filter(d =>
  sector3.includes(d.sector_label) &&
  locale3.includes(d.locale_group) &&
  (state3.length === 0 || state3.includes(d.STABBR)) &&
  grad3.includes(d.grad_ratio)
);
```

**${filtered3.length}** schools

</div>

</div>

---

## Comparison Plot

```js
const xVar = view(Inputs.select(axisVars, {label: "X axis", format: d => d.label, value: axisVars.find(d => d.value === "grad_rate_6yr")}));
const yVar = view(Inputs.select(axisVars, {label: "Y axis", format: d => d.label, value: axisVars.find(d => d.value === "admission_rate")}));
```

```js
{
  const allCategories = [
    {key: "cat1", name: name1, data: filtered1, color: "#4e79a7", show: show1},
    {key: "cat2", name: name2, data: filtered2, color: "#e15759", show: show2},
    {key: "cat3", name: name3, data: filtered3, color: "#f28e2b", show: show3},
  ];
  const categories = allCategories.filter(c => c.show);

  const allPoints = [];
  for (const cat of categories) {
    for (const d of cat.data) {
      if (d[xVar.value] != null && d[yVar.value] != null) {
        allPoints.push({...d, _cat: cat.key, _catName: cat.name, _color: cat.color});
      }
    }
  }

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
