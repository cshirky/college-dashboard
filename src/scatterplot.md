---
toc: false
---

# The Landscape of American Colleges

```js
import { collegeCard } from "./components/collegeCard.js";
```

```js
const good_schools = FileAttachment("data/good_schools.csv").csv({typed: true});
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
const localeGroups = new Set([
  ...(controls.localeFilter.includes("Cities") ? ["City"] : []),
  ...(controls.localeFilter.includes("Towns or Suburbs") ? ["Town", "Suburb"] : []),
  ...(controls.localeFilter.includes("Rural") ? ["Rural"] : []),
]);

const data = good_schools
  .filter(d => {
    if (d.instate_only === "true" && d.primary_recruit_state !== controls.selectedState) return false;
    if (!localeGroups.has(d.locale_group)) return false;
    const ug = d.enrollment_ug;
    const sizeLabel = ug < 1000 ? "Tiny" : ug < 2500 ? "Small" : ug < 10000 ? "Medium" : ug < 25000 ? "Large" : "Very Large";
    if (!controls.sizeFilter.includes(sizeLabel)) return false;
    return true;
  })
  .filter(d => d.grad_rate_6yr != null && d.yield_rate != null &&
               !isNaN(+d.grad_rate_6yr) && !isNaN(+d.yield_rate))
  .filter(d => {
    const y = Math.round(+d.yield_rate);
    const g = +d.grad_rate_6yr;
    if (y < yieldFloor) return false;
    if (g < gradFloor) return false;
    return true;
  })
  .map(d => ({
    ...d,
    yield_rate:    Math.round(+d.yield_rate),
    grad_rate_6yr: +d.grad_rate_6yr,
  }));

// yieldMax is used only for row-count labels (don't show zero-count rows at top).
// Axis domains are fixed at [floor, 100] and only redraw when yieldFloor/gradFloor change.
const yieldMax = d3.max(data, d => d.yield_rate);

const yieldStep = 5, gradStep = 5;
const yieldStart = Math.floor(yieldFloor / yieldStep) * yieldStep;
const yieldEnd   = 90;  // fixed — axis always runs to 90%
const gradStart  = gradFloor;
const gradEnd    = 100;
const grid = [];
for (let x1 = gradStart; x1 < gradEnd; x1 += gradStep) {
  for (let y1 = yieldStart; y1 < yieldEnd; y1 += yieldStep) {
    grid.push({x1, x2: x1 + gradStep, y1, y2: y1 + yieldStep});
  }
}
// Shade levels: 0=darkest … 3=white. Grad columns and yield rows each carry a level;
// cells use whichever is darker (lower index).
const shadeColors = ["#e9e9e9", "#efefef", "#f6f6f6", "white"];
function cellShade(x1, y1) {
  const gLevel = x1 < 55 ? 0 : x1 < 60 ? 1 : x1 < 65 ? 2 : 3;
  const yLevel = y1 < 15 ? 0 : y1 < 20 ? 1 : y1 < 25 ? 2 : 3;
  return shadeColors[Math.min(gLevel, yLevel)];
}
const colCounts = d3.range(gradStart, gradEnd, gradStep).map(x1 => ({
  x: x1 + gradStep / 2,
  count: data.filter(d => d.grad_rate_6yr >= x1 && d.grad_rate_6yr < x1 + gradStep).length
}));
// rowCounts only goes up to yieldMax so we don't render zero-count labels at the top
const rowCounts = d3.range(yieldStart, Math.ceil(yieldMax / yieldStep) * yieldStep, yieldStep).map(y1 => ({
  y: y1 + yieldStep / 2,
  count: data.filter(d => d.yield_rate >= y1 && d.yield_rate < y1 + yieldStep).length
}));
```

```js
{
  const details = html`<details open style="border:1px solid #ddd; border-radius:6px; padding:0.6rem 1rem; margin-bottom:1.5rem; background:#f9fafb;">
  <summary style="font-weight:600; font-size:1rem; cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
    What (and who) this is for
    <span class="toggle-hint" style="font-size:0.8rem; font-weight:400; color:#888;">click to close</span>
  </summary>
  <div style="margin-top:0.75rem; font-size:0.9rem; line-height:1.7; color:#333; max-width:720px;">
    <p>This is an opinionated guide to picking U.S. colleges you might be interested in attending. It assumes you are:</p>
    <ul>
      <li>An American high school student…</li>
      <li>…with a B- grade average or better</li>
      <li>…who wants a Bachelor's degree</li>
      <li>…at a college that has lots of options for majors</li>
      <li>…where you study full-time and live on campus.</li>
    </ul>
    <p>If that describes you, the chart below, drawn from data collected in the <a href="https://nces.ed.gov/ipeds">Integrated Postsecondary Education Data System</a>, is designed to help you explore your options. (And maybe that doesn't describe you, because you want to go to community college, or art school, or study online. Maybe you want to live at home, or go to a women's college, or a school for people of your religion. Those are fine choices, but present a narrower set of choices.)</p>
    <p>I'll start with three assertions:</p>
    <ol>
      <li><strong>High school students worry too much</strong> about whether they will be accepted to any particular college, while spending too little time trying to get a sense of the places they might like to go. This page is for you to get a sense of the layout of American shape.</li>
      <li><strong>If you have a dream school</strong>, knock it off. Seriously, tf are you thinking? It's good to have a sense of what colleges you might like to attend, but no institution is worth that much of your hopes for yourself. Make a list and don't fixate on just one school.</li>
      <li><strong>A college's acceptance rate</strong> is a fairly bullshit number. When the Common App went online in the late '90s, most of the selective colleges became more selective on paper, even though there were <em>no new students and no reductions in incoming classes</em> -- the change in rate came solely from the same number of students each applying to more schools.</li>
    </ol>
    <p>Colleges have every incentive to get you to focus on things like their mission statement (some version of "Knowledge is good", but in Latin), or how selective they are, or how nice the campus looks in the fall. These signals of quality are easy to understand but also easy to fake and relatively unimportant.</p>
    <p>On the other hand, there are two important and hard to fake measurements: Yield, and 6 Year Graduation rate.</p>
    <ul>
      <li><p><strong>Yield</strong> is an input, a measure of the percentage of students who were admitted and chose to go.</p> 
      <p>Yield measures a <em>choice</em> -- if a student says Yes to one school, they are saying No to every other school they got into. Colleges obsess over yield internally, but don't mention it to applicants. If a school offers a spot to 100 students, and only 10 go, that tells you something very different than if 40 go, or 60: School A, at 10% yield, is a safety, School B, at 40%, has more people who want to be there in particular. Schoool C, at 60%, is beloved. So, higher Yield is a good proxy for an engaged and committed student body.</p></li>
      <li><p><strong>6 Year Graduation Rate</strong> is an output, and just what it sounds like: how many students have graduated 6 years after their arrival? (The Bachelor's is often called a 4 year degree, but many students take more time, hence the 6 year window.)</p> 
        <p>Colleges don't like to talk about graduation rate either; out of thousands of colleges in the U.S. fewer than 100 graduate 9 out of 10 students, while thousands graduate less than half their incoming classes. Graduation rate is the single most important metric. It captures something about how prepared and serious the students there are, and something about how well the college supports them. If many students drop out or transfer out before graduating, it does not matter how nice the campus looks in fall -- just don't apply.</p></li>
    </ul>
    <p>The chart below shows colleges that:</p>
    <ul>
      <li>Have 10%+ Yield and 50%+ 6 year graduation rate (You can adjust this to higher thresholds in the controls below the chart.)</li> 
      <li>Offers more Bachelor's degrees than Associates degrees</li>
      <li>Has students studying full-time, in person, and living on or near campus</li>
      <li>Has a broad curriculum (a lot of potential majors)</li>
    </ul>
    <p>The chart excludes:</p>
    <ul><li>For-profit schools, which typically have awful graduation rates, and are more reliable producers of debt than degrees. (Seriously, don't even <em>consider</em> attending a for-profit college.)</li>
      <li>Schools with highly specialized curricula -- art schools, engineering schools, health professions schools, seminaries.</li>
      <li>Schools designed for students of a specific gender, race, ethnicity, or religious affiliation.</li>
    </ul>
    <p>Click any dot to see a school card at the bottom of the page, and any diamond to see the two or more schools at that location.</p>
  </div>
</details>`;
  details.addEventListener("toggle", () => {
    details.querySelector(".toggle-hint").textContent = details.open ? "click to close" : "click to expand";
  });
  display(details);
}
```

## ${data.length} Residential Colleges with a Broad Student Body and Curriculum, arranged by Yield x Graduation Rate
```js
const searchQuery = view(Inputs.text({placeholder: "Search for a school…", width: 300}));
```

```js
const cardArea = html`<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; max-width:800px;"></div>`;
```

```js
{
  const query = searchQuery.trim().toLowerCase();
  const match = d => query && d.INSTNM.toLowerCase().includes(query);

  const baseColor = d => d.sector_label === "Public" ? "#d50000" : "#1d4ed8";
  const hiColor   = d => d.sector_label === "Public" ? "#7f0000" : "#1e3a8a";

  const stackKeys = new Set(), dupeKeys = new Set();
  for (const d of data) {
    const key = `${d.grad_rate_6yr}|${d.yield_rate}`;
    if (stackKeys.has(key)) dupeKeys.add(key); else stackKeys.add(key);
  }

  const marginLeft = 65, marginRight = 45, marginTop = 36, marginBottom = 50;
  const plotWidth = 860, plotHeight = 720;

  const plt = Plot.plot({
    width: plotWidth,
    height: plotHeight,
    marginLeft,
    marginBottom,
    marginTop,
    marginRight,
    x: { label: null, domain: [gradFloor, 100], ticks: d3.range(gradFloor, 101, 5) },
    y: { label: null, domain: [yieldFloor, 90], ticks: d3.range(yieldFloor, 91, 5) },
    marks: [
      Plot.rect(grid, {x1: "x1", x2: "x2", y1: "y1", y2: "y2", fill: d => cellShade(d.x1, d.y1)}),
      Plot.dot(data.filter(d => !dupeKeys.has(`${d.grad_rate_6yr}|${d.yield_rate}`)), {
        x: "grad_rate_6yr",
        y: "yield_rate",
        r: d => match(d) ? 7 : 5,
        symbol: "circle",
        fill: d => match(d) ? hiColor(d) : baseColor(d),
        fillOpacity: d => match(d) ? 0.9 : (query ? 0.15 : 0.6),
        stroke: "none",
      }),
      Plot.dot(data.filter(d => dupeKeys.has(`${d.grad_rate_6yr}|${d.yield_rate}`)), {
        x: "grad_rate_6yr",
        y: "yield_rate",
        r: d => match(d) ? 7 : 5,
        symbol: "diamond",
        fill: d => match(d) ? hiColor(d) : baseColor(d),
        fillOpacity: d => match(d) ? 0.9 : (query ? 0.15 : 0.6),
        stroke: "none",
      }),
      Plot.ruleX(data.filter(match), {x: "grad_rate_6yr", y1: yieldFloor, y2: "yield_rate", stroke: "#16a34a", strokeWidth: 1, strokeDasharray: "4,3"}),
      Plot.ruleY(data.filter(match), {y: "yield_rate", x1: gradFloor, x2: "grad_rate_6yr", stroke: "#16a34a", strokeWidth: 1, strokeDasharray: "4,3"}),
      Plot.text(data.filter(match), {x: "grad_rate_6yr", y: "yield_rate", text: "INSTNM", dy: -10, fontSize: 11, fontWeight: "600", fill: "#111", stroke: "white", strokeWidth: 3, paintOrder: "stroke"}),
      Plot.text(colCounts, {x: "x", y: 90, text: "count", textAnchor: "middle", lineAnchor: "bottom", dy: -4, fontSize: 9, fontFamily: "sans-serif", fill: "#888", clip: false}),
      Plot.gridX({ticks: d3.range(gradFloor, 101, 5)}),
      Plot.gridY({ticks: d3.range(yieldFloor, 91, 5)}),
    ],
  });

  const svgEl = plt.tagName === "svg" ? plt : plt.querySelector("svg");

  // Rotate the dupe-diamond dot layer 90° so the long axis is horizontal.
  // The second g[aria-label="dot"] in the SVG is the dupe layer.
  const dotGroups = svgEl.querySelectorAll("g[aria-label='dot']");
  if (dotGroups[1]) {
    for (const path of dotGroups[1].querySelectorAll("path")) {
      const t = path.getAttribute("transform") || "";
      path.setAttribute("transform", t + " rotate(90)");
    }
  }

  const xs = plt.scale("x");
  const ys = plt.scale("y");
  const xRange = xs.range;
  const ns = "http://www.w3.org/2000/svg";

  // Y-axis label
  const plotCenterY = (marginTop + (plotHeight - marginBottom)) / 2;
  const yAxisLabel = document.createElementNS(ns, "text");
  yAxisLabel.setAttribute("transform", `translate(22, ${plotCenterY}) rotate(-90)`);
  yAxisLabel.setAttribute("text-anchor", "middle");
  yAxisLabel.setAttribute("font-size", "11");
  yAxisLabel.setAttribute("font-family", "sans-serif");
  yAxisLabel.setAttribute("fill", "#555");
  yAxisLabel.textContent = "Yield (% of admitted students who chose to attend)";
  svgEl?.appendChild(yAxisLabel);

  // X-axis label
  const plotCenterX = (marginLeft + (plotWidth - marginRight)) / 2;
  const xAxisLabel = document.createElementNS(ns, "text");
  xAxisLabel.setAttribute("x", plotCenterX);
  xAxisLabel.setAttribute("y", plotHeight - 8);
  xAxisLabel.setAttribute("text-anchor", "middle");
  xAxisLabel.setAttribute("font-size", "11");
  xAxisLabel.setAttribute("font-family", "sans-serif");
  xAxisLabel.setAttribute("fill", "#555");
  xAxisLabel.textContent = "6-year graduation rate (%)";
  svgEl?.appendChild(xAxisLabel);

  // "Number of schools in each column" label across the top
  const colCountLabel = document.createElementNS(ns, "text");
  colCountLabel.setAttribute("x", plotCenterX);
  colCountLabel.setAttribute("y", 11);
  colCountLabel.setAttribute("text-anchor", "middle");
  colCountLabel.setAttribute("font-size", "9");
  colCountLabel.setAttribute("font-family", "sans-serif");
  colCountLabel.setAttribute("fill", "#888");
  colCountLabel.textContent = "Number of schools in each grad-rate column";
  svgEl?.appendChild(colCountLabel);

  // Row counts to the right of the plot
  for (const row of rowCounts) {
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", xRange[1] + 8);
    t.setAttribute("y", ys.apply(row.y));
    t.setAttribute("text-anchor", "start");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute("font-size", "9");
    t.setAttribute("font-family", "sans-serif");
    t.setAttribute("fill", "#888");
    t.textContent = String(row.count);
    svgEl?.appendChild(t);
  }

  // "Number of schools in each row" label down the right side
  const rowCountLabel = document.createElementNS(ns, "text");
  rowCountLabel.setAttribute("transform", `translate(${xRange[1] + 36}, ${plotCenterY}) rotate(90)`);
  rowCountLabel.setAttribute("text-anchor", "middle");
  rowCountLabel.setAttribute("font-size", "9");
  rowCountLabel.setAttribute("font-family", "sans-serif");
  rowCountLabel.setAttribute("fill", "#888");
  rowCountLabel.textContent = "Number of schools in each yield row";
  svgEl?.appendChild(rowCountLabel);

  const tipEl = html`<div style="position:absolute; display:none; background:white; border:1px solid #ddd; border-radius:6px; padding:0.4rem 0.65rem; font-size:0.8rem; pointer-events:none; box-shadow:0 2px 8px rgba(0,0,0,0.12); max-width:260px; line-height:1.5;"></div>`;
  const wrapper = html`<div style="position:relative; display:inline-block;"></div>`;
  wrapper.append(plt);
  wrapper.append(tipEl);

  function stackAt(d) {
    // All schools at the exact same yield_rate × grad_rate_6yr position
    return data.filter(e => e.yield_rate === d.yield_rate && e.grad_rate_6yr === d.grad_rate_6yr);
  }

  plt.addEventListener("pointermove", evt => {
    if (!xs || !ys) return;
    const rect = plt.getBoundingClientRect();
    const px = evt.clientX - rect.left, py = evt.clientY - rect.top;
    let nearest = null, minDist = Infinity;
    for (const d of data) {
      const dx = xs.apply(d.grad_rate_6yr) - px, dy = ys.apply(d.yield_rate) - py;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) { minDist = dist; nearest = d; }
    }
    if (nearest && minDist < 100) {
      const stack = stackAt(nearest);
      const sector = nearest.sector_label === "Public" ? "Public" : "Private";
      if (stack.length === 1) {
        tipEl.innerHTML = `<strong>${nearest.INSTNM}</strong><br>${sector} · ${nearest.CITY}, ${nearest.STABBR}<br><span style="color:#555">Grad: ${nearest.grad_rate_6yr}% &nbsp;·&nbsp; Yield: ${nearest.yield_rate}%</span>`;
      } else {
        tipEl.innerHTML = `<strong>${stack.length} schools</strong> · ${nearest.yield_rate}% yield, ${nearest.grad_rate_6yr}% grad<br><span style="color:#555">${stack.map(s => s.INSTNM).join("<br>")}</span>`;
      }
      const offX = px + 14, offY = py - 10;
      tipEl.style.left = offX + "px";
      tipEl.style.top  = offY + "px";
      tipEl.style.display = "block";
    } else {
      tipEl.style.display = "none";
    }
  });

  plt.addEventListener("pointerleave", () => { tipEl.style.display = "none"; });

  plt.addEventListener("click", evt => {
    const r = plt.getBoundingClientRect();
    const px = evt.clientX - r.left, py = evt.clientY - r.top;
    let nearest = null, minDist = Infinity;
    for (const d of data) {
      const dx = xs.apply(d.grad_rate_6yr) - px, dy = ys.apply(d.yield_rate) - py;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) { minDist = dist; nearest = d; }
    }
    if (nearest && minDist < 100) {
      const stack = stackAt(nearest);
      cardArea.innerHTML = "";
      if (stack.length > 1) {
        cardArea.append(html`<p style="grid-column:1/-1; margin:0 0 0.5rem; font-size:0.9rem; color:#555;">
          <strong>${stack.length} schools</strong> at ${nearest.yield_rate}% yield · ${nearest.grad_rate_6yr}% grad rate
        </p>`);
      }
      for (const school of stack) cardArea.append(collegeCard(school, (programsByUnitid.get(String(school.UNITID)) || []).slice(0, 5)));
    }
  });

  // Legend: upper-left corner of plot area
  // d3 diamond for r=5: M0,-8.25 L4.76,0 L0,8.25 L-4.76,0 — height/width ratio = sqrt(3)
  const legW = 185, legPad = 7, legShapeR = 4;
  const legDiamondHH = legShapeR * (8.25 / 4.76); // half-height matching d3 ratio ≈ 6.93
  const legRow1Y = 13;   // relative to legRectY
  const legRow2Y = 33;   // enough clearance for diamond half-height above
  const legH = legRow2Y + Math.ceil(legDiamondHH) + legPad;
  const legRectX = marginLeft + 8;
  const legRectY = marginTop + 8;
  const legShapeX = legRectX + legPad + legShapeR;
  const legTextX  = legRectX + legPad + legShapeR * 2 + 6;

  const r1Y = legRectY + legRow1Y, r2Y = legRectY + legRow2Y;

  const legBg = document.createElementNS(ns, "rect");
  legBg.setAttribute("x", legRectX); legBg.setAttribute("y", legRectY);
  legBg.setAttribute("width", legW); legBg.setAttribute("height", legH);
  legBg.setAttribute("fill", "white"); legBg.setAttribute("stroke", "#ccc");
  legBg.setAttribute("stroke-width", "1"); legBg.setAttribute("rx", "3");
  svgEl?.appendChild(legBg);

  const legCircle = document.createElementNS(ns, "circle");
  legCircle.setAttribute("cx", legShapeX); legCircle.setAttribute("cy", r1Y);
  legCircle.setAttribute("r", legShapeR); legCircle.setAttribute("fill", "#888");
  legCircle.setAttribute("fill-opacity", "0.6");
  svgEl?.appendChild(legCircle);

  const legT1 = document.createElementNS(ns, "text");
  legT1.setAttribute("x", legTextX); legT1.setAttribute("y", r1Y);
  legT1.setAttribute("font-size", "9"); legT1.setAttribute("font-family", "sans-serif");
  legT1.setAttribute("fill", "#555"); legT1.setAttribute("dominant-baseline", "middle");
  legT1.setAttribute("text-anchor", "start");
  legT1.textContent = "One school at this position";
  svgEl?.appendChild(legT1);

  const legDiamond = document.createElementNS(ns, "path");
  legDiamond.setAttribute("d", `M${legShapeX - legDiamondHH},${r2Y} L${legShapeX},${r2Y - legShapeR} L${legShapeX + legDiamondHH},${r2Y} L${legShapeX},${r2Y + legShapeR} Z`);
  legDiamond.setAttribute("fill", "#888"); legDiamond.setAttribute("fill-opacity", "0.6");
  svgEl?.appendChild(legDiamond);

  const legT2 = document.createElementNS(ns, "text");
  legT2.setAttribute("x", legTextX); legT2.setAttribute("y", r2Y);
  legT2.setAttribute("font-size", "9"); legT2.setAttribute("font-family", "sans-serif");
  legT2.setAttribute("fill", "#555"); legT2.setAttribute("dominant-baseline", "middle");
  legT2.setAttribute("text-anchor", "start");
  legT2.textContent = "Two+ schools at this position";
  svgEl?.appendChild(legT2);

  display(wrapper);
}
```

```js
const stateOptions = [
  "AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN",
  "KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ",
  "NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA",
  "WI","WV","WY"
];
```

```js
const localeCounts = {
  "Cities":           good_schools.filter(d => d.locale_group === "City").length,
  "Towns or Suburbs": good_schools.filter(d => d.locale_group === "Town" || d.locale_group === "Suburb").length,
  "Rural":            good_schools.filter(d => d.locale_group === "Rural").length,
};
const sizeCounts = {
  "Tiny":      good_schools.filter(d => +d.enrollment_ug < 1000).length,
  "Small":     good_schools.filter(d => +d.enrollment_ug >= 1000  && +d.enrollment_ug < 2500).length,
  "Medium":    good_schools.filter(d => +d.enrollment_ug >= 2500  && +d.enrollment_ug < 10000).length,
  "Large":     good_schools.filter(d => +d.enrollment_ug >= 10000 && +d.enrollment_ug < 25000).length,
  "Very Large":good_schools.filter(d => +d.enrollment_ug >= 25000).length,
};
```

```js
const controls = view(Inputs.form(
  {
    yieldFloor: Inputs.select([10, 15, 20, 25], {
      label: null,
      format: d => `Exclude schools with < ${d}% yield`,
      value: 10,
      width: 170,
    }),
    gradFloor: Inputs.select([50, 55, 60, 65], {
      label: null,
      format: d => `Exclude schools with < ${d}% grad rate`,
      value: 50,
      width: 185,
    }),
    selectedState: Inputs.select([null, ...stateOptions], {
      label: "Add regionally recruiting schools from state:",
      format: d => d ?? "None",
      value: null,
    }),
    localeFilter: Inputs.checkbox(["Cities", "Towns or Suburbs", "Rural"], {
      label: "Setting:",
      value: ["Cities", "Towns or Suburbs", "Rural"],
      format: d => `${d} (${localeCounts[d]})`,
    }),
    sizeFilter: Inputs.checkbox(["Tiny", "Small", "Medium", "Large", "Very Large"], {
      label: "Undergrad population:",
      value: ["Tiny", "Small", "Medium", "Large", "Very Large"],
      format: d => ({
        "Tiny":      `Tiny (<1,000) (${sizeCounts["Tiny"]})`,
        "Small":     `Small (<2,500) (${sizeCounts["Small"]})`,
        "Medium":    `Medium (<10,000) (${sizeCounts["Medium"]})`,
        "Large":     `Large (<25,000) (${sizeCounts["Large"]})`,
        "Very Large":`Very Large (25,000+) (${sizeCounts["Very Large"]})`,
      })[d],
    }),
  },
  {
    template: inputs => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "border:1px solid #ddd; border-radius:6px; padding:0.75rem 1rem; margin-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem;";
      const row1 = document.createElement("div");
      row1.style.cssText = "display:flex; gap:1rem;";
      row1.append(inputs.yieldFloor, inputs.gradFloor);
      wrap.append(row1, inputs.selectedState, inputs.localeFilter, inputs.sizeFilter);
      return wrap;
    }
  }
));
```

```js
const yieldFloor = controls.yieldFloor;
const gradFloor  = controls.gradFloor;
```

```js
display(cardArea);
```

