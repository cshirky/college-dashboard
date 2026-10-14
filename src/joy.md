---
toc: false
---

```js
import {scatterNav} from "./components/nav.js";
import {createCardArea} from "./components/tray.js";
import {buildControls, filterData} from "./components/filters.js";
import {joyPlot} from "./components/joy.js";
```

```js
display(scatterNav("joy"));
```

# The Landscape of American Colleges as a Joy Plot

The same data as the [scatterplot](/scatterplot), drawn as a ridgeline plot. Each horizontal line is a 5-point band of **graduation rate**; along the **yield** axis each school covers its own yield ±1 point, and the line's height is the number of schools covering that yield. Hover a ridge for the schools; click to add them to the tray.

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

## ${data.length} Residential Colleges, one ridge per grad-rate row

```js
const cardArea = createCardArea({usGeo, emptyText: "Click a ridge to add its schools"});
```

```js
display(joyPlot({
  data, query: controls.searchQuery.trim().toLowerCase(), yieldFloor, gradFloor, cardArea, programsByUnitid,
}));
```

```js
const controls = view(buildControls(Inputs, good_schools));
```

```js
const yieldFloor = controls.yieldFloor;
const gradFloor  = controls.gradFloor;
```
