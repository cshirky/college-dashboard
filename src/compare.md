<h1>Compare Institutions</h1>

<a href="/">← Back to Explorer</a> | <a href="/twins">→ Find school twins</a>

Define up to three categories of schools, choose axes, and compare.

```js
import { collegeCard } from "./components/collegeCard.js";
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

```js
function addAllButton(input, allValues) {
  const btn = document.createElement("button");
  btn.textContent = "All";
  btn.type = "button";
  btn.style.cssText = "margin-left: 0.5rem; padding: 0 0.4rem; font-size: 0.75rem; cursor: pointer;";
  btn.onclick = () => {
    const allChecked = input.querySelectorAll("input[type=checkbox]:checked").length === allValues.length;
    for (const cb of input.querySelectorAll("input[type=checkbox]")) cb.checked = !allChecked;
    input.value = allChecked ? [] : allValues;
    input.dispatchEvent(new Event("input", {bubbles: true}));
    btn.textContent = allChecked ? "All" : "None";
  };
  const label = input.querySelector("label");
  if (label) label.appendChild(btn);
  return input;
}

function buildCategoryForm(name, color) {
  const stateSelect = Inputs.select(["All", ...allStates], {label: "State", multiple: true, value: [], width: 200});
  stateSelect.querySelector("select").size = 4;
  const sectorInput = Inputs.checkbox(sectorOptions, {label: "Sector", value: []});
  const gradInput = Inputs.checkbox(gradOptions, {label: "Grad enrollment", value: [], format: d => gradLabels[d]});
  const localeInput = Inputs.checkbox(localeOptions, {label: "Locale", value: []});
  addAllButton(sectorInput, sectorOptions);
  addAllButton(gradInput, gradOptions);
  addAllButton(localeInput, localeOptions);
  const form = Inputs.form({
    show: Inputs.toggle({label: "Show on plot", value: false}),
    name: Inputs.text({label: "Name", value: name, width: 200}),
    sector: sectorInput,
    grad: gradInput,
    locale: localeInput,
    state: stateSelect,
  });
  form.style.border = `2px solid ${color}`;
  form.style.borderRadius = "8px";
  form.style.padding = "1rem";
  return form;
}
```

```js
const cat1 = view(buildCategoryForm("Group 1", "#4e79a7"));
```

```js
const cat2 = view(buildCategoryForm("Group 2", "#e15759"));
```

```js
const cat3 = view(buildCategoryForm("Group 3", "#f28e2b"));
```

```js
function filterCategory(cat) {
  if (!cat.show) return [];
  const states = cat.state.includes("All") ? allStates : cat.state;
  return institutions.filter(d =>
    cat.sector.includes(d.sector_label) &&
    cat.locale.includes(d.locale_group) &&
    (states.length === 0 || states.includes(d.STABBR)) &&
    cat.grad.includes(d.grad_ratio)
  );
}
const filtered1 = filterCategory(cat1);
const filtered2 = filterCategory(cat2);
const filtered3 = filterCategory(cat3);
```

```js
display(html`<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
  <div style="text-align: center;"><strong>${filtered1.length}</strong> schools</div>
  <div style="text-align: center;"><strong>${filtered2.length}</strong> schools</div>
  <div style="text-align: center;"><strong>${filtered3.length}</strong> schools</div>
</div>`);
```

<h2>Comparison Plot</h2>

```js
const xVar = view(Inputs.select(axisVars, {label: "X axis", format: d => d.label, value: axisVars.find(d => d.value === "grad_rate_6yr")}));
```

```js
const yVar = view(Inputs.select(axisVars, {label: "Y axis", format: d => d.label, value: axisVars.find(d => d.value === "admission_rate")}));
```

```js
{
  const categories = [
    {key: "cat1", name: cat1.name, data: filtered1, color: "#4e79a7", show: cat1.show},
    {key: "cat2", name: cat2.name, data: filtered2, color: "#e15759", show: cat2.show},
    {key: "cat3", name: cat3.name, data: filtered3, color: "#f28e2b", show: cat3.show},
  ].filter(c => c.show);

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

---

## Institution Lookup

```js
const lookupName = view(Inputs.text({
  label: "Search institution",
  placeholder: "Type to search...",
  datalist: institutions.map(d => d.INSTNM).sort(),
  width: 400,
}));
```

```js
const lookupSelected = institutions.find(d => d.INSTNM === lookupName) || null;
if (lookupSelected) display(collegeCard(lookupSelected));
```
