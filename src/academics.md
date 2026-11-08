---
title: A little more about you
---

```js
const qData = await FileAttachment("data/academic-questions.json").json();
```

```js
function renderQuestion(q) {
  const labelEl = html`<div style="
    font-size: 1.05rem;
    font-weight: 500;
    color: #222;
    margin-bottom: 0.75rem;
    line-height: 1.45;
  ">${q.text}${q.maxSelect ? html` <span style="font-size: 0.82rem; font-weight: 400; color: #888;">(pick up to ${q.maxSelect})</span>` : ""}</div>`;

  let inner;

  if (q.type === "radio" || q.type === "checkbox") {
    const opts = q.options.map(opt => html`<label style="
      display: flex;
      align-items: flex-start;
      gap: 0.55rem;
      padding: 0.35rem 0;
      cursor: pointer;
      font-size: 0.97rem;
      color: #333;
      line-height: 1.45;
    ">
      <input
        type="${q.type}"
        name="${q.id}"
        value="${opt}"
        style="margin-top: 0.22rem; flex-shrink: 0; accent-color: #4e79a7;"
      >
      <span>${opt}</span>
    </label>`);

    inner = html`<div style="padding-left: 0.1rem;">${opts}</div>`;
  } else if (q.type === "textarea") {
    inner = html`<textarea
      name="${q.id}"
      rows="3"
      placeholder="${q.placeholder}"
      style="
        display: block;
        width: 100%;
        max-width: 520px;
        padding: 0.6rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
        color: #222;
        resize: vertical;
        line-height: 1.5;
      "
    ></textarea>`;
  }

  // Conditional questions start hidden; shown by the event wiring below.
  const wrapper = html`<div
    data-question-id="${q.id}"
    style="margin-bottom: 2.25rem; ${q.dependsOn ? "display: none;" : ""}"
  >
    ${labelEl}
    ${inner}
  </div>`;

  return wrapper;
}

// Build the form
const academicForm = html`<form id="academic-form" style="max-width: 620px;">
  ${qData.questions.map(renderQuestion)}
  <button type="submit" style="
    margin-top: 0.5rem;
    padding: 0.65rem 1.75rem;
    background: #4e79a7;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    font-family: inherit;
  ">Continue →</button>
</form>`;

// Wire up depends-on show/hide
for (const q of qData.questions.filter(q => q.dependsOn)) {
  const triggers = academicForm.querySelectorAll(`[name="${q.dependsOn}"]`);
  const target   = academicForm.querySelector(`[data-question-id="${q.id}"]`);
  const update   = () => {
    const selected = academicForm.querySelector(`[name="${q.dependsOn}"]:checked`)?.value ?? null;
    target.style.display = q.dependsValues?.includes(selected) ? "" : "none";
    // Clear hidden conditional fields so stale values don't get saved
    if (target.style.display === "none") {
      for (const el of target.querySelectorAll("input")) el.checked = false;
    }
  };
  for (const t of triggers) t.addEventListener("change", update);
}

// Wire up max-select enforcement
for (const q of qData.questions.filter(q => q.maxSelect)) {
  const wrapper   = academicForm.querySelector(`[data-question-id="${q.id}"]`);
  const checkboxes = wrapper.querySelectorAll(`input[type="checkbox"]`);
  const hint       = html`<div data-hint style="font-size: 0.82rem; color: #e15759; margin-top: 0.4rem; display: none;">
    Uncheck one before adding another.
  </div>`;
  wrapper.appendChild(hint);

  const update = () => {
    const n = [...checkboxes].filter(cb => cb.checked).length;
    const atLimit = n >= q.maxSelect;
    for (const cb of checkboxes) {
      if (!cb.checked) cb.disabled = atLimit;
    }
    hint.style.display = atLimit ? "" : "none";
  };
  for (const cb of checkboxes) cb.addEventListener("change", update);
}

// On submit: merge with existing vibe answers and stash in sessionStorage
academicForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(
    qData.questions.map(q => {
      const els = academicForm.querySelectorAll(`[name="${q.id}"]`);
      if (q.type === "checkbox") {
        return [q.id, [...els].filter(el => el.checked).map(el => el.value)];
      } else if (q.type === "radio") {
        return [q.id, [...els].find(el => el.checked)?.value ?? null];
      } else {
        return [q.id, els[0]?.value ?? ""];
      }
    })
  );
  const existing = JSON.parse(sessionStorage.getItem("vibe-answers") ?? "{}");
  sessionStorage.setItem("student-profile", JSON.stringify({...existing, ...data}));
  // TODO: navigate to the advice/explainer page when it exists
  console.log("student profile so far:", JSON.parse(sessionStorage.getItem("student-profile")));
  alert("Saved — the advice page is coming next.");
});

display(html`<div style="
  max-width: 660px;
  font-size: 1rem;
  line-height: 1.65;
  color: #444;
  margin-bottom: 2.5rem;
  padding: 1.25rem 1.5rem;
  background: #f8f8f8;
  border-radius: 8px;
  border-left: 4px solid #4e79a7;
">${qData.intro}</div>`);

display(academicForm);

display(html`<p style="
  max-width: 620px;
  margin-top: 2rem;
  font-size: 0.88rem;
  color: #888;
  line-height: 1.6;
  font-style: italic;
">${qData.outro}</p>`);
```
