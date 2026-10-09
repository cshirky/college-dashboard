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
display(scatterNav("reverse"));
```

# The Landscape of American Colleges, Reversed

The same chart as the [original](/scatterplot), with the axes swapped: **yield** runs left to right and **6-year graduation rate** runs bottom to top. Click any dot to see a school card in the tray.

```js
const good_schools = FileAttachment("data/good_schools.csv").csv({typed: true});
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
const data = filterData(good_schools, controls);
```

## ${data.length} Residential Colleges, arranged by Graduation Rate x Yield

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
const controls = view(buildControls(Inputs, good_schools));
```

```js
const yieldFloor = controls.yieldFloor;
const gradFloor  = controls.gradFloor;
```
