---
toc: false
---

```js
import {scatterNav} from "./components/nav.js";
import {createCardArea} from "./components/tray.js";
import {buildControls, filterData} from "./components/filters.js";
import {scatterPlot} from "./components/scatter.js";
```

```js
display(scatterNav("scatterplot"));
```

# The Landscape of American Colleges

Every U.S. institution that awards Bachelor's degrees and reports both measures. **Yield** runs left to right and **6-year graduation rate** runs bottom to top. Click any dot to see a school card in the tray.

```js
const all_schools = FileAttachment("data/all_schools.csv").csv({typed: true});
const usGeo = await FileAttachment("data/us-states.json").json();
```

```js
const programs_raw = await FileAttachment("data/programs.csv").csv({typed: true});
const programsByUnitid = new Map();
for (const row of programs_raw) {
  const key = String(row.UNITID);
  if (!programsByUnitid.has(key)) programsByUnitid.set(key, []);
  programsByUnitid.get(key).push(row);
}
for (const v of programsByUnitid.values()) v.sort((a, b) => b.total_awards - a.total_awards);
```

```js
const data = filterData(all_schools, controls);
```

## ${data.length.toLocaleString()} Bachelor's-granting Colleges, arranged by Graduation Rate x Yield

```js
const cardArea = createCardArea({usGeo, emptyText: "Click any dot to see a school"});
```

```js
display(scatterPlot({
  data, query: controls.searchQuery.trim().toLowerCase(), yieldFloor, gradFloor, cardArea, programsByUnitid,
  reversed: true,
}));
```

```js
const controls = view(buildControls(Inputs, all_schools, {
  yieldFloors: [0, 5, 10, 15, 20, 25],
  gradFloors: [0, 10, 20, 30, 40, 50, 55, 60, 65],
  regional: false,
}));
```

```js
const yieldFloor = controls.yieldFloor;
const gradFloor  = controls.gradFloor;
```
