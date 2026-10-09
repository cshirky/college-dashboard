---
toc: false
---

```js
import {scatterNav} from "./components/nav.js";
import {createCardArea} from "./components/tray.js";
import {buildControls, filterData} from "./components/filters.js";
import {isometricPlot} from "./components/isometric.js";
```

```js
display(scatterNav("isometric"));
```

# The Landscape of American Colleges in 3D

The same data as the [original](/scatterplot), with a prism rising from each 5×5-point square in proportion to the number of schools in it. Hover a prism for the schools; click to add them to the tray.

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

## ${data.length} Residential Colleges, one prism per square

```js
const cardArea = createCardArea({usGeo, emptyText: "Click a prism to add its schools"});
```

```js
display(isometricPlot({
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
