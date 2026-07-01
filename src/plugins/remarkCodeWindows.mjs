/**
 * remarkCodeWindows
 * Converts fenced code blocks into raw HTML matching the CodeDemo component.
 * Same background, same titlebar, same token colors.
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const KEYWORDS = ["provider","backend","component","sync","output","unit","deploy","input","local","data","policy","check","exec","test","remote","interface","workspace","extend","import","moved"];

function tokenizeLine(line) {
  const parts = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // Comment — rest of line
    if (line[i] === "#") {
      parts.push(`<span style="color:#6e7681;font-style:italic">${escapeHtml(line.slice(i))}</span>`);
      i = len;
      continue;
    }

    // String — "..."
    if (line[i] === '"') {
      let j = i + 1;
      while (j < len && line[j] !== '"') j++;
      const s = line.slice(i, j + 1);
      parts.push(`<span style="color:#a5d6ff">${escapeHtml(s)}</span>`);
      i = j + 1;
      continue;
    }

    // Pending ref ~word.word
    if (line[i] === "~") {
      let j = i + 1;
      while (j < len && /[\w.]/.test(line[j])) j++;
      parts.push(`<span style="color:#00A693">${escapeHtml(line.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i + 1;
      while (j < len && /[\w_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (KEYWORDS.includes(word)) {
        parts.push(`<span style="color:#57C5C6">${word}</span>`);
      } else if (word === "true" || word === "false" || word === "null") {
        parts.push(`<span style="color:#f2cc60">${word}</span>`);
      } else {
        // Could be an attr name — check if followed by whitespace + =
        const rest = line.slice(j).match(/^(\s*)(=)(?!=)/);
        if (rest) {
          parts.push(`<span style="color:#7ee787">${word}</span>`);
          parts.push(rest[1]);
          parts.push(`<span style="color:#8b949e">=</span>`);
          i = j + rest[1].length + 1;
          continue;
        } else {
          parts.push(escapeHtml(word));
        }
      }
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(line[i])) {
      let j = i + 1;
      while (j < len && /[0-9.]/.test(line[j])) j++;
      parts.push(`<span style="color:#f2cc60">${line.slice(i, j)}</span>`);
      i = j;
      continue;
    }

    // Brace { }
    if (line[i] === "{" || line[i] === "}") {
      parts.push(`<span style="color:#e6edf3">${line[i]}</span>`);
      i++;
      continue;
    }

    // Equals sign standalone
    if (line[i] === "=") {
      parts.push(`<span style="color:#8b949e">=</span>`);
      i++;
      continue;
    }

    // Everything else
    parts.push(escapeHtml(line[i]));
    i++;
  }

  return parts.join("");
}

function highlight(code) {
  return code.split("\n").map(tokenizeLine).join("\n");
}

export function remarkCodeWindows() {
  return function (tree) {
    tree.children = tree.children.flatMap((node) => {
      if (node.type !== "code") return [node];

      const highlighted = highlight(node.value || "");

      return [{
        type: "html",
        value: `<div class="code-window"><div class="code-titlebar"><span class="tl tl-r"></span><span class="tl tl-y"></span><span class="tl tl-g"></span></div><pre><code>${highlighted}</code></pre></div>`,
      }];
    });
  };
}
