<h1>School Twins</h1>

<a href="/">← Back to Explorer</a> | <a href="/compare">→ Compare categories</a>

Paste school names or UNITIDs (one per line) to find the three closest twin institutions for each.

```js
const institutions = FileAttachment("data/institutions.csv").csv({typed: true});
const programs = FileAttachment("data/programs.csv").csv({typed: true});
```

```js
// Build CIP degree-count vector per school
const cipFamilies = [...new Set(programs.map(d => d.cip_family))].sort();
const cipIndex = new Map(cipFamilies.map((f, i) => [f, i]));
const schoolVectors = new Map();
for (const p of programs) {
  if (!schoolVectors.has(p.UNITID)) schoolVectors.set(p.UNITID, new Float64Array(cipFamilies.length));
  schoolVectors.get(p.UNITID)[cipIndex.get(p.cip_family)] = p.total_awards;
}

// Precompute vector magnitudes for cosine similarity
const schoolMagnitudes = new Map();
for (const [id, vec] of schoolVectors) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  schoolMagnitudes.set(id, Math.sqrt(sum));
}

function cosineSimilarity(idA, idB) {
  const vecA = schoolVectors.get(idA);
  const vecB = schoolVectors.get(idB);
  if (!vecA || !vecB) return 0;
  const magA = schoolMagnitudes.get(idA);
  const magB = schoolMagnitudes.get(idB);
  if (magA === 0 || magB === 0) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return dot / (magA * magB);
}

// Enrollment normalization ranges
const ugRange = d3.max(institutions, d => d.enrollment_ug) - d3.min(institutions, d => d.enrollment_ug) || 1;
const gradMax = d3.max(institutions, d => (d.enrollment_total || 0) - (d.enrollment_ug || 0));
const gradMin = d3.min(institutions, d => (d.enrollment_total || 0) - (d.enrollment_ug || 0));
const gradRange = gradMax - gradMin || 1;

function enrollmentCloseness(a, b) {
  const ugDist = Math.abs((a.enrollment_ug || 0) - (b.enrollment_ug || 0)) / ugRange;
  const gradA = (a.enrollment_total || 0) - (a.enrollment_ug || 0);
  const gradB = (b.enrollment_total || 0) - (b.enrollment_ug || 0);
  const gradDist = Math.abs(gradA - gradB) / gradRange;
  return 1 - (ugDist * 0.5 + gradDist * 0.5);
}

function twinScore(a, b) {
  const programSim = cosineSimilarity(a.UNITID, b.UNITID);
  const enrollClose = enrollmentCloseness(a, b);
  return programSim * 0.5 + enrollClose * 0.5;
}

function findTwins(school, n = 3) {
  if (!schoolVectors.has(school.UNITID)) return {school, twins: [], noPrograms: true};
  const candidates = institutions.filter(d =>
    d.UNITID !== school.UNITID &&
    d.sector_label === school.sector_label &&
    d.locale_group === school.locale_group &&
    schoolVectors.has(d.UNITID)
  );
  const scored = candidates.map(d => ({school: d, score: twinScore(school, d)}));
  scored.sort((a, b) => b.score - a.score);
  return {school, twins: scored.slice(0, n), noPrograms: false};
}
```

```js
const inputText = view(Inputs.textarea({label: "Paste school names or UNITIDs (one per line)", rows: 8, width: 600}));
```

```js
const findBtn = view(Inputs.button("Find Twins"));
```

```js
// Parse input and match schools
const searchLines = inputText.split("\n").map(s => s.trim()).filter(s => s.length > 0);
const dedupedLines = [...new Set(searchLines)];

const matchResults = dedupedLines.map(line => {
  const asNum = parseInt(line, 10);
  // Try UNITID match first
  if (!isNaN(asNum)) {
    const match = institutions.find(d => d.UNITID === asNum);
    if (match) return {line, match, error: null};
  }
  // Try case-insensitive substring match on name
  const lower = line.toLowerCase();
  const nameMatches = institutions.filter(d => d.INSTNM.toLowerCase().includes(lower));
  if (nameMatches.length === 1) return {line, match: nameMatches[0], error: null};
  if (nameMatches.length > 1) return {line, match: null, error: `"${line}" matched ${nameMatches.length} schools — be more specific`};
  return {line, match: null, error: `"${line}" not found`};
});

const errors = matchResults.filter(r => r.error);
const matched = matchResults.filter(r => r.match);
// Deduplicate by UNITID
const seen = new Set();
const uniqueMatched = matched.filter(r => {
  if (seen.has(r.match.UNITID)) return false;
  seen.add(r.match.UNITID);
  return true;
});
```

```js
// Show errors
if (errors.length > 0) {
  display(html`<div style="color: #e15759; margin: 0.5rem 0;">
    ${errors.map(e => html`<div>${e.error}</div>`)}
  </div>`);
}
```

```js
// Compute twins for all matched schools
const results = uniqueMatched.map(r => findTwins(r.match));
```

```js
// Display results table
if (results.length > 0) {
  display(html`<table style="border-collapse: collapse; width: 100%; font-size: 0.85rem;">
    <thead>
      <tr style="border-bottom: 2px solid #333;">
        <th style="text-align: left; padding: 0.5rem;">Input School</th>
        <th style="text-align: left; padding: 0.5rem;">State</th>
        <th style="text-align: right; padding: 0.5rem;">UG</th>
        <th style="text-align: right; padding: 0.5rem;">Grad</th>
        <th style="text-align: left; padding: 0.5rem;">Twin 1</th>
        <th style="text-align: left; padding: 0.5rem;">Twin 2</th>
        <th style="text-align: left; padding: 0.5rem;">Twin 3</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => {
        const s = r.school;
        const grad = (s.enrollment_total || 0) - (s.enrollment_ug || 0);
        if (r.noPrograms) {
          return html`<tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 0.5rem;">${s.INSTNM}</td>
            <td style="padding: 0.5rem;">${s.STABBR}</td>
            <td style="text-align: right; padding: 0.5rem;">${(s.enrollment_ug || 0).toLocaleString()}</td>
            <td style="text-align: right; padding: 0.5rem;">${grad.toLocaleString()}</td>
            <td colspan="3" style="padding: 0.5rem; color: #999;"><em>No program data available</em></td>
          </tr>`;
        }
        const twinCells = [0, 1, 2].map(i => {
          const t = r.twins[i];
          if (!t) return html`<td style="padding: 0.5rem; color: #999;">—</td>`;
          const tGrad = (t.school.enrollment_total || 0) - (t.school.enrollment_ug || 0);
          return html`<td style="padding: 0.5rem;">
            <strong>${t.school.INSTNM}</strong><br>
            ${t.school.STABBR} · UG ${(t.school.enrollment_ug || 0).toLocaleString()} · Grad ${tGrad.toLocaleString()}<br>
            <span style="color: #666;">Score: ${(t.score * 100).toFixed(1)}%</span>
          </td>`;
        });
        return html`<tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 0.5rem;"><strong>${s.INSTNM}</strong></td>
          <td style="padding: 0.5rem;">${s.STABBR}</td>
          <td style="text-align: right; padding: 0.5rem;">${(s.enrollment_ug || 0).toLocaleString()}</td>
          <td style="text-align: right; padding: 0.5rem;">${grad.toLocaleString()}</td>
          ${twinCells}
        </tr>`;
      })}
    </tbody>
  </table>`);
} else if (findBtn > 0 && searchLines.length > 0 && uniqueMatched.length === 0) {
  display(html`<p><em>No schools matched.</em></p>`);
}
```
