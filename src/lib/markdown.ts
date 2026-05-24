// Tiny, safe markdown -> HTML renderer for blog posts.
//
// Supports:
//   # / ## / ### headings
//   **bold** and *italic*
//   [text](url)  (only http(s) and mailto)
//   `inline code`
//   ```fenced code blocks```
//   - bullet lists  /  1. ordered lists
//   > blockquotes
//   blank-line-separated paragraphs
//
// All HTML is escaped first, then markdown patterns are converted, so the
// admin can't paste raw <script> tags.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:|\/)/i.test(url);
}

function renderInline(text: string): string {
  let out = text;
  // Inline code first (so its content isn't further parsed)
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code class="px-1.5 py-0.5 rounded bg-white/10 text-[0.9em]">${escapeHtml(code)}</code>`);
  // Bold then italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // Links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    if (!isSafeUrl(url)) return label;
    const safeUrl = escapeHtml(url);
    return `<a href="${safeUrl}" class="text-[color:var(--apple-blue)] hover:underline" ${url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  return out;
}

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const escaped = escapeHtml(src);
  const lines = escaped.split(/\r?\n/);
  const blocks: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(`<pre class="rounded-xl bg-black/40 border border-white/10 p-4 overflow-x-auto text-[13px] text-white/85 my-6"><code>${code.join("\n")}</code></pre>`);
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 6); // h1 from page title; bump down one
      const sizes: Record<number, string> = {
        2: "text-3xl sm:text-4xl mt-12 mb-4 font-semibold tracking-tighter",
        3: "text-2xl mt-10 mb-3 font-semibold tracking-tight",
        4: "text-xl mt-8 mb-3 font-semibold tracking-tight",
        5: "text-lg mt-6 mb-2 font-semibold tracking-tight",
        6: "text-base mt-6 mb-2 font-semibold"
      };
      blocks.push(`<h${level} class="text-white ${sizes[level] ?? ""}">${renderInline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(`<blockquote class="border-l-2 border-[color:var(--apple-blue)] pl-4 my-6 text-white/75 italic">${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*+]\s+/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ul class="list-disc list-outside pl-5 space-y-1.5 my-5 text-white/85">${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      blocks.push(`<ol class="list-decimal list-outside pl-5 space-y-1.5 my-5 text-white/85">${items.join("")}</ol>`);
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph — collect until blank line
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|>|[-*+]\s|\d+\.\s|```)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(`<p class="text-[17px] leading-[1.7] text-white/85 my-5">${renderInline(para.join(" "))}</p>`);
  }

  return blocks.join("");
}
