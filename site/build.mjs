import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "site", "dist");
const docs = [
  ["website", "Website-analyse", "docs/01-website-analyse.md"],
  ["marketing", "Marketingkanalen", "docs/02-marketingkanalen.md"],
  ["keywords", "Keyword research", "docs/03-keyword-research.md"],
  ["concurrenten", "Concurrentie-benchmark", "docs/04-concurrentie-benchmark.md"],
  ["doelgroep", "Doelgroep en seizoen", "docs/05-doelgroep-seizoenspatroon.md"],
  ["aanbevelingen", "Aanbevelingen", "docs/06-aanbevelingen.md"],
  ["productbreed", "Productbreed auditkader", "docs/08-productbreed-auditkader.md"],
];
const downloads = [
  ["Bozarc_Analyse_Website_Marketing.pdf", "Strategisch rapport PDF"],
  ["bozarc_keyword_research.xlsx", "Keyword research Excel"],
];

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const target = href.startsWith("../reports/")
        ? `reports/${href.slice("../reports/".length)}`
        : href;
      return `<a href="${escapeHtml(target)}">${label}</a>`;
    });
}

function renderTable(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*-/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => inlineMarkdown(cell.trim())));
  const [head, ...body] = rows;
  return `<div class="table-wrap"><table><thead><tr>${head
    .map((cell) => `<th>${cell}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const html = [];
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (line.startsWith("|")) {
      const table = [];
      while (index < lines.length && lines[index].startsWith("|")) {
        table.push(lines[index]);
        index += 1;
      }
      index -= 1;
      html.push(renderTable(table));
    } else if (line.startsWith("### ")) {
      html.push(`<h4>${inlineMarkdown(line.slice(4))}</h4>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h3>${inlineMarkdown(line.slice(3))}</h3>`);
    } else if (line.startsWith("# ")) {
      html.push(`<h2>${inlineMarkdown(line.slice(2))}</h2>`);
    } else if (line.startsWith("- ")) {
      const items = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(`<li>${inlineMarkdown(lines[index].slice(2))}</li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ul>${items.join("")}</ul>`);
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) {
        items.push(`<li>${inlineMarkdown(lines[index].replace(/^\d+\. /, ""))}</li>`);
        index += 1;
      }
      index -= 1;
      html.push(`<ol>${items.join("")}</ol>`);
    } else if (line.startsWith("> ")) {
      html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
    } else {
      html.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }
  return html.join("\n");
}

async function build() {
  await rm(outDir, { force: true, recursive: true });
  await mkdir(path.join(outDir, "reports"), { recursive: true });
  const renderedDocs = await Promise.all(
    docs.map(async ([id, title, file]) => {
      const markdown = await readFile(path.join(root, file), "utf8");
      return { id, title, html: renderMarkdown(markdown) };
    }),
  );
  await Promise.all(
    downloads.map(([file]) =>
      copyFile(path.join(root, "reports", file), path.join(outDir, "reports", file)),
    ),
  );
  await writeFile(path.join(outDir, "index.html"), page(renderedDocs), "utf8");
  await writeFile(path.join(outDir, "_headers"), "/*\n  X-Content-Type-Options: nosniff\n", "utf8");
}

function page(renderedDocs) {
  const updated = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long" }).format(new Date());
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Bozarc website-, marketing- en keywordresearch als deelbare microsite.">
  <title>Bozarc Research Hub</title>
  <style>${styles}</style>
</head>
<body>
  <header class="hero">
    <nav><strong>Bozarc Research Hub</strong><span>Laatst gebouwd: ${updated}</span></nav>
    <section class="hero-grid">
      <div>
        <p class="label">Website & marketing analysis</p>
        <h1>Een deelbare researchpagina uit de GitHub-repo.</h1>
        <p class="intro">Deze microsite bundelt de bevindingen, keyword research, concurrentiebenchmark en downloads voor Bozarc. GitHub blijft de bron; Cloudflare Workers publiceert de laatste versie.</p>
        <div class="actions">
          <a class="button primary" href="#aanbevelingen">Bekijk aanbevelingen</a>
          <a class="button" href="reports/bozarc_keyword_research.xlsx">Download Excel</a>
        </div>
      </div>
      <aside class="summary">
        <h2>Kernpunten</h2>
        <ul>
          <li>Auditkader verbreed naar alle huidige productfamilies: carports, terras, Nova, Vista, serres en B2B.</li>
          <li>Concurrentiedruk komt van MiniFlat, Veranco, Winsol, Harol en Ovalux.</li>
          <li>Negatives en leadkwaliteit moeten vooraf besproken worden.</li>
          <li>Cloudflare Workers maakt hiervan een automatisch updatebare webpagina.</li>
        </ul>
      </aside>
    </section>
  </header>
  <main>
    <section class="downloads" aria-label="Downloads">
      ${downloads
        .map(
          ([file, label]) =>
            `<a href="reports/${file}"><span>${label}</span><small>${file}</small></a>`,
        )
        .join("")}
    </section>
    <section class="toc">
      ${renderedDocs
        .map((doc) => `<a href="#${doc.id}">${doc.title}</a>`)
        .join("")}
    </section>
    ${renderedDocs
      .map(
        (doc) => `<article id="${doc.id}" class="doc"><div class="doc-title"><span>${doc.title}</span></div>${doc.html}</article>`,
      )
      .join("\n")}
  </main>
</body>
</html>`;
}

const styles = `
:root { color-scheme: light; --ink: #18201d; --muted: #647067; --line: #d9e0d9; --paper: #f6f8f5; --white: #ffffff; --accent: #1f6f58; --accent-dark: #164b3e; --warm: #d8a75d; }
* { box-sizing: border-box; }
html, body { overflow-x: clip; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--paper); line-height: 1.55; }
a { color: var(--accent-dark); text-decoration: none; }
a:hover { text-decoration: underline; }
.hero { min-height: 76vh; padding: 28px clamp(18px, 5vw, 68px) 52px; background: linear-gradient(135deg, #eef4ef 0%, #ffffff 58%, #e7efe9 100%); border-bottom: 1px solid var(--line); }
nav { display: flex; align-items: center; justify-content: space-between; gap: 20px; color: var(--muted); font-size: 0.92rem; }
nav strong { color: var(--ink); font-size: 1rem; }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr); gap: clamp(26px, 5vw, 70px); align-items: end; max-width: 1180px; margin: clamp(70px, 12vw, 130px) auto 0; }
.hero-grid > * { min-width: 0; }
.label { color: var(--accent-dark); font-weight: 700; text-transform: uppercase; letter-spacing: 0; font-size: 0.78rem; }
h1 { max-width: 850px; margin: 14px 0 22px; font-size: clamp(2.4rem, 6vw, 5.6rem); line-height: 0.95; letter-spacing: 0; overflow-wrap: anywhere; }
.intro { max-width: 720px; color: var(--muted); font-size: clamp(1.05rem, 1.7vw, 1.35rem); }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 17px; border: 1px solid var(--line); border-radius: 7px; background: var(--white); color: var(--ink); font-weight: 700; }
.button.primary { border-color: var(--accent); background: var(--accent); color: var(--white); }
.summary { background: rgba(255,255,255,0.74); border: 1px solid var(--line); border-radius: 8px; padding: 24px; box-shadow: 0 22px 60px rgba(24,32,29,0.08); }
.summary h2 { margin-top: 0; font-size: 1.1rem; }
.summary ul { padding-left: 18px; margin-bottom: 0; color: var(--muted); }
main { width: min(1120px, calc(100% - 36px)); margin: 0 auto 72px; }
.downloads, .toc { display: grid; gap: 12px; margin-top: 28px; }
.downloads { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.downloads a, .toc a { background: var(--white); border: 1px solid var(--line); border-radius: 8px; padding: 16px 18px; }
.downloads span { display: block; font-weight: 800; color: var(--ink); }
.downloads small { color: var(--muted); overflow-wrap: anywhere; }
.toc { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 26px; }
.toc a { font-weight: 700; }
.doc { margin-top: 22px; padding: clamp(22px, 4vw, 42px); background: var(--white); border: 1px solid var(--line); border-radius: 8px; }
.doc-title { margin-bottom: 22px; color: var(--accent-dark); font-weight: 800; }
.doc h2 { margin: 0 0 18px; font-size: clamp(1.8rem, 3vw, 3rem); line-height: 1.05; }
.doc h3 { margin-top: 34px; font-size: 1.45rem; }
.doc h4 { margin-top: 26px; font-size: 1.08rem; }
.doc p, .doc li { color: #38443c; }
.doc code { padding: 2px 5px; border-radius: 4px; background: #edf2ee; }
blockquote { margin: 22px 0; padding: 16px 18px; border-left: 4px solid var(--warm); background: #fbf7ef; color: #584429; }
.table-wrap { width: 100%; overflow-x: auto; margin: 22px 0; border: 1px solid var(--line); border-radius: 8px; }
table { width: 100%; border-collapse: collapse; min-width: 720px; background: var(--white); }
th, td { padding: 12px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
th { background: #edf3ef; font-size: 0.88rem; }
tr:last-child td { border-bottom: 0; }
@media (max-width: 820px) {
  .hero { min-height: auto; padding-bottom: 34px; }
  nav { align-items: flex-start; flex-direction: column; }
  .hero-grid, .downloads, .toc { grid-template-columns: 1fr; }
  h1 { font-size: clamp(2.35rem, 14vw, 4rem); }
  main { width: min(100% - 24px, 1120px); }
  .doc { padding: 20px; }
}
`;

await build();
