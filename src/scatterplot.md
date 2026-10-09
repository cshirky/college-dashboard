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

```js
{
  const details = html`<details style="border:1px solid #ddd; border-radius:6px; padding:0.6rem 1rem; margin-bottom:1.5rem; background:#f9fafb;">
  <summary style="font-weight:600; font-size:1rem; cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center;">
    What (and who) this is for
    <span class="toggle-hint" style="font-size:0.8rem; font-weight:400; color:#888;">click to expand</span>
  </summary>
  <div style="margin-top:0.75rem; font-size:0.9rem; line-height:1.7; color:#333; max-width:720px;">
    <p>This is an opinionated guide to understanding the landscape of U.S. colleges you might be interested in attending. It assumes you are:</p>
    <ul>
      <li>An American high school student…</li>
      <li>…with a B- grade average or better</li>
      <li>…who wants a Bachelor's degree</li>
      <li>…at a college that has lots of options for majors</li>
      <li>…where you study full-time and live on campus.</li>
    </ul>
    <p>If that describes you, the chart below, drawn from data collected in the <a href="https://nces.ed.gov/ipeds">Integrated Postsecondary Education Data System</a>, is designed to help you explore your options. (And maybe that doesn't describe you, because you want to go to community college, or art school, or study online. Maybe you want to live at home, or go to a women's college, or a school for people of your religion. Those are fine choices, but present a much narrower set of options.)</p>
    <p>I'll start with three assertions:</p>
    <ol>
      <li><strong>High school students worry too much</strong> about whether they will be accepted to any particular college, while spending too little time trying to get a sense of the places they might like to go. This page is for you to get a sense of the overall landscape.</li>
      <li><strong>If you have a dream school</strong>, knock it off. Seriously, tf are you thinking? It's good to have a sense of what colleges you might like to attend, but no institution should have that much effect on your hopes for yourself. Make a list and don't fixate on just one school.</li>
      <li><strong>A college's acceptance rate</strong> is a fairly bullshit number. When the Common App went online in the late '90s, most of the selective colleges became more selective on paper, even though there were <em>no new students and no reductions in incoming classes</em> -- the change in rate came solely from the same number of students each applying to more schools.</li>
    </ol>
    <p>Colleges have every incentive to get you to focus on things like their mission statement (some version of "Knowledge is good", but in Latin), or how selective they are, or how nice the campus looks in the fall. These signals of quality are easy to understand, but they are also easy to fake and relatively unimportant.</p>
    <p>On the other hand, there are two important and hard to fake measurements: Yield, and graduation rate.</p>
    <ul>
      <li><p><strong>Yield</strong> is an input, a measure of the percentage of students who were admitted and chose to go there instead of to another school that accepted them.</p> 
      <p>Yield measures a <em>choice</em> -- if a student says Yes to one school, they are saying No to every other school they got into. Colleges obsess over yield internally, but don't mention it to applicants. If a school offers a spot to 100 students, and only 10 go, that tells you something very different than if 40 go, or 60: School A, at 10% yield, is a safety, School B, at 40%, has many more people who want to be there in particular. Schoool C, at 60%, is beloved. So, higher Yield is a good proxy for an engaged and committed student body.</p></li>
      <li><p><strong>6 Year Graduation Rate</strong> is an output, and just what it sounds like: how many students have graduated 6 years after their arrival? (The Bachelor's is often called a 4 year degree, but many students take more time, hence the 6 year window.)</p> 
        <p>Graduation rate is the single most important metric. Colleges don't like to talk about graduation rate either; out of thousands of colleges in the U.S. fewer than a hundred graduate 9 out of 10 students, while thousands of colleges graduate less than half.  Grad rate captures something about how prepared and serious the students there are, and something about how well the college supports them. If many students drop out or transfer out before graduating, it does not matter how nice the campus looks in fall -- just don't apply.</p></li>
    </ul>
    <p>The chart below shows colleges that:</p>
    <ul>
      <li>Have at least a 10%+ Yield and 50%+ graduation rate, pretty much <a href="https://en.wikipedia.org/wiki/Mendoza_Line">the Mendoza Line</a> for being a selective college. (You can set higher thresholds in the controls below the chart.)</li> 
      <li>Offers more Bachelor's degrees than Associate's ("two year") degrees</li>
      <li>Has students studying full-time, in person, and living on or near campus</li>
      <li>Has a broad curriculum (a lot of potential majors)</li>
    </ul>
    <p>There are also some schools that are categorically excluded:</p>
    <ul><li>For-profit schools, which typically have awful graduation rates, and are more reliable producers of debt than degrees. (Seriously, don't even <em>consider</em> for-profit colleges. Oh, and US News now camouflages for-profit schools as Proprietary on its lists, so don't consider proprietary schools either.)</li>
      <li>Schools with highly specialized curricula -- art schools, engineering schools, health professions schools, seminaries.</li>
      <li>Schools designed for students of a specific gender, race, ethnicity, or religious affiliation.</li>
    </ul>
    <p>As you'll see, schools where at least one in two admits actually attend (>50% yield) and schools where at least four out of five graduate (>80% grad rate) are rare. (They are also correlated at the upper end of both ranges) This is one of the reasons colleges obsess about these figures internally, but don't like to talk about them in public.</p>
    <p>Click any dot to see a school card in the tray at the bottom of the page, and any diamond to see the two or more schools at that location. </p>
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
const cardArea = createCardArea({usGeo});
```

```js
display(scatterPlot({
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
