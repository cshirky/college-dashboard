---
title: Let's get started
---

```js
const qData = await FileAttachment("data/vibe-questions.json").json();
```

```js
// Renders a single question as an HTML element
function renderQuestion(q) {
  const label = html`<div style="
    font-size: 1.05rem;
    font-weight: 500;
    color: #222;
    margin-bottom: 0.75rem;
    line-height: 1.45;
  ">${q.text}</div>`;

  if (q.type === "checkbox" || q.type === "radio") {
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

    return html`<div style="margin-bottom: 2.25rem;">
      ${label}
      <div style="padding-left: 0.1rem;">${opts}</div>
    </div>`;
  }

  if (q.type === "textarea") {
    return html`<div style="margin-bottom: 2.25rem;">
      ${label}
      <textarea
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
      ></textarea>
    </div>`;
  }
}

// Build the full form
const vibeForm = html`<form id="vibe-form" style="max-width: 620px;">
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

// On submit: stash answers in sessionStorage for later pages, then advance.
vibeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(
    qData.questions.map(q => {
      const els = vibeForm.querySelectorAll(`[name="${q.id}"]`);
      if (q.type === "checkbox") {
        return [q.id, [...els].filter(el => el.checked).map(el => el.value)];
      } else if (q.type === "radio") {
        return [q.id, [...els].find(el => el.checked)?.value ?? null];
      } else {
        return [q.id, els[0]?.value ?? ""];
      }
    })
  );
  sessionStorage.setItem("vibe-answers", JSON.stringify(data));
  // TODO: navigate to page 2 when it exists
  console.log("vibe answers:", data);
  alert("Answers saved — page 2 coming soon.");
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

display(vibeForm);

display(html`<p style="
  max-width: 620px;
  margin-top: 2rem;
  font-size: 0.88rem;
  color: #888;
  line-height: 1.6;
  font-style: italic;
">${qData.outro}</p>`);
```
