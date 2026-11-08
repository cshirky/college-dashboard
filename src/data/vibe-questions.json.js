// Data loader: parses src/data/vibe-questions.md into JSON.
// Observable Framework reruns this when the file changes.
// Edit vibe-questions.md directly; the page will hot-reload.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "vibe-questions.md"), "utf8");

// Split on <!-- ... --> comments; capturing group interleaves tags and bodies.
// Result: ["", "intro", "body...", "question id=...", "body...", ...]
const parts = src.split(/<!--([^>]+)-->/);

const result = { intro: "", outro: "", questions: [] };

for (let i = 1; i < parts.length; i += 2) {
  const header = parts[i].trim();
  const body = (parts[i + 1] ?? "").trim();

  if (header === "intro") {
    result.intro = body;
  } else if (header === "outro") {
    result.outro = body;
  } else if (header.startsWith("question")) {
    const id   = (header.match(/id="([^"]+)"/)   ?? [])[1] ?? `q${(i - 1) / 2}`;
    const type = (header.match(/type="([^"]+)"/) ?? [])[1] ?? "radio";

    const lines = body.split("\n");
    const optionLines    = lines.filter(l => l.trim().startsWith("- "));
    const nonOptionLines = lines.filter(l => !l.trim().startsWith("- ") && l.trim() !== "");

    let placeholder = "";
    let textLines = nonOptionLines;

    if (type === "textarea") {
      const pi = nonOptionLines.findIndex(l => l.trim().startsWith("placeholder:"));
      if (pi !== -1) {
        placeholder = nonOptionLines[pi].replace(/^\s*placeholder:\s*/, "").trim();
        textLines = nonOptionLines.filter((_, j) => j !== pi);
      }
    }

    result.questions.push({
      id,
      type,
      text: textLines.join("\n").trim(),
      options: optionLines.map(l => l.replace(/^\s*-\s*/, "").trim()),
      placeholder,
    });
  }
}

process.stdout.write(JSON.stringify(result, null, 2));
