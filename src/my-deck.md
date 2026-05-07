---
toc: false
---

# My Deck

```js
import { collegeCard } from "./components/collegeCard.js";
```

```js
const good_schools = await FileAttachment("data/good_schools.csv").csv({typed: true});
const programs_raw = await FileAttachment("data/programs.csv").csv({typed: true});
const usGeo = await FileAttachment("data/us-states.json").json();

const programsByUnitid = new Map();
for (const row of programs_raw) {
  const key = String(row.UNITID);
  if (!programsByUnitid.has(key)) programsByUnitid.set(key, []);
  programsByUnitid.get(key).push(row);
}
for (const v of programsByUnitid.values()) v.sort((a, b) => b.total_awards - a.total_awards);
```

```js
function getStarred() {
  try { return new Set(JSON.parse(localStorage.getItem("tray-starred") || "[]").map(String)); }
  catch { return new Set(); }
}
function setStarred(set) {
  localStorage.setItem("tray-starred", JSON.stringify([...set]));
}

function getDeck() {
  const params = new URLSearchParams(window.location.search);
  const idsParam = params.get("ids");
  if (idsParam) return new Set(idsParam.split(",").filter(Boolean));
  try { return new Set(JSON.parse(localStorage.getItem("tray-starred") || "[]").map(String)); }
  catch { return new Set(); }
}

const deckIds = getDeck();
const schoolMap = new Map(good_schools.map(s => [String(s.UNITID), s]));

const deckSchools = [...deckIds]
  .map(id => schoolMap.get(id))
  .filter(Boolean)
  .sort((a, b) => a.INSTNM.localeCompare(b.INSTNM));
```

```js
const container = document.createElement("div");

if (deckSchools.length === 0) {
  container.innerHTML = `<p style="color:#6b7280; font-size:0.95rem; margin-top:1rem;">
    No schools saved yet. On the <a href="./" style="color:#2563eb;">Explorer</a> page, 
    click any dot to add a school to the tray, then click <strong>★</strong> to star it and use the <strong>My Deck</strong> link in the tray to come here.
  </p>`;
} else {
  const grid = document.createElement("div");
  grid.style.cssText = "display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;";

  for (const school of deckSchools) {
    const topMajors = (programsByUnitid.get(String(school.UNITID)) || []).slice(0, 5);
    const wrapper = document.createElement("div");
    wrapper.appendChild(collegeCard(school, topMajors, {
      usGeo,
      onClose: () => {
        const starred = getStarred();
        starred.delete(String(school.UNITID));
        setStarred(starred);
        wrapper.remove();
      },
    }));
    grid.appendChild(wrapper);
  }

  container.appendChild(grid);
}

display(container);
```
