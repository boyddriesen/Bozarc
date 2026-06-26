import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

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
  ["productconcurrentie", "Productbrede concurrentieaudit", "docs/09-productbrede-concurrentieaudit.md"],
  ["zichtbaarheid", "Google-zichtbaarheid audit", "docs/10-google-zichtbaarheid-seo-sea-geo-aeo-audit.md"],
  ["goldencircle", "Golden Circle-vragenlijst", "docs/11-golden-circle-vragenlijst.md"],
  ["googleads", "Resultaten Google Ads", "docs/12-google-ads-resultaten.md"],
];
const downloads = [
  ["Bozarc_Analyse_Website_Marketing.pdf", "Strategisch rapport PDF"],
  ["bozarc_keyword_research.xlsx", "Keyword research Excel"],
  ["bozarc_productboom_mapping.xlsx", "Productboom mapping Excel"],
  ["bozarc_productbrede_audit_concurrentie_en_google.xlsx", "Productbrede audit Excel"],
];

// Maps a doc's markdown filename (e.g. "06-aanbevelingen.md") to its page slug,
// so cross-references between docs resolve to the right sub-URL instead of a
// dangling ".md" link.
const docFileToSlug = new Map(docs.map(([id, , file]) => [path.basename(file), id]));

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function resolveDocLink(href) {
  const target = href.startsWith("../reports/")
    ? `reports/${href.slice("../reports/".length)}`
    : href;
  const basename = target.split("/").pop();
  const slug = docFileToSlug.get(basename);
  return slug ? `/${slug}/` : target;
}

function inlineMarkdown(value) {
  const withMarkdownLinks = escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      return `<a href="${escapeHtml(resolveDocLink(href))}">${label}</a>`;
    });
  // Auto-link bare URLs (e.g. plain "Label: https://...") that aren't already
  // inside an href attribute from the markdown-link replacement above.
  return withMarkdownLinks.replace(/(?<!href=")(https?:\/\/[^\s<)]+)/g, (url) => {
    const clean = url.replace(/[.,;:]+$/, "");
    const trailing = url.slice(clean.length);
    return `<a href="${clean}" target="_blank" rel="noopener">${clean}</a>${trailing}`;
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

function getLastCommitMeta() {
  try {
    const author = execSync("git log -1 --format=%an", { cwd: root }).toString().trim();
    const isoDate = execSync("git log -1 --format=%cI", { cwd: root }).toString().trim();
    return { author, date: new Date(isoDate) };
  } catch {
    return { author: null, date: new Date() };
  }
}

function topNav(updatedLabel) {
  return `<nav class="topnav"><a class="brand" href="/">Bozarc Research Hub</a><span>${updatedLabel}</span></nav>`;
}

function subNav(activeId) {
  return `<nav class="subnav" aria-label="Onderdelen">
    <a href="/" class="${activeId ? "" : "active"}">Overzicht</a>
    ${docs
      .map(([id, title]) => `<a href="/${id}/" class="${id === activeId ? "active" : ""}">${title}</a>`)
      .join("")}
  </nav>`;
}

function layout({ title, updatedLabel, activeId, body }) {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Bozarc website-, marketing- en keywordresearch als deelbare microsite.">
  <title>${escapeHtml(title)} — Bozarc Research Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${styles}</style>
</head>
<body>
  ${topNav(updatedLabel)}
  ${subNav(activeId)}
  ${body}
</body>
</html>`;
}

function homePage(updatedLabel) {
  const body = `
  <header class="hero">
    <section class="hero-grid">
      <div>
        <p class="label">Website & marketing analysis</p>
        <h1>Een deelbare researchpagina uit de GitHub-repo.</h1>
        <p class="intro">Deze microsite bundelt de bevindingen, keyword research, concurrentiebenchmark en downloads voor Bozarc. GitHub blijft de bron; Cloudflare Workers publiceert de laatste versie.</p>
        <div class="actions">
          <a class="button primary" href="/aanbevelingen/">Bekijk aanbevelingen</a>
          <a class="button" href="/reports/bozarc_keyword_research.xlsx">Download Excel</a>
        </div>
      </div>
      <aside class="summary">
        <h2>Kernpunten</h2>
        <ul>
          <li>Auditkader verbreed naar alle huidige productfamilies: carports, terras, Nova, Vista, serres en B2B.</li>
          <li>Concurrentiedruk komt van MiniFlat, Veranco, Winsol, Harol en Ovalux.</li>
          <li>Nieuwe audits bekijken elk huidig product op concurrentie, zichtbaarheid, SEO, SEA, GEO en AEO.</li>
          <li>Negatives en leadkwaliteit moeten vooraf besproken worden.</li>
          <li>Google Ads-resultaten van het afgelopen jaar zijn uitgelezen op account-, regio- en zoekwoordniveau.</li>
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
            `<a href="/reports/${file}"><span>${label}</span><small>${file}</small></a>`,
        )
        .join("")}
    </section>
    <section class="toc" aria-label="Onderdelen">
      ${docs.map(([id, title]) => `<a href="/${id}/">${title}</a>`).join("")}
    </section>
  </main>`;
  return layout({ title: "Overzicht", updatedLabel, activeId: null, body });
}

function docPage(doc, index, updatedLabel) {
  const prev = docs[index - 1];
  const next = docs[index + 1];
  const body = `
  <main class="doc-main">
    <article class="doc">
      <div class="doc-title"><span>${doc.title}</span></div>
      ${doc.html}
    </article>
    <nav class="pager">
      ${prev ? `<a class="button" href="/${prev[0]}/">&larr; ${prev[1]}</a>` : "<span></span>"}
      ${next ? `<a class="button" href="/${next[0]}/">${next[1]} &rarr;</a>` : "<span></span>"}
    </nav>
  </main>`;
  return layout({ title: doc.title, updatedLabel, activeId: doc.id, body });
}

async function build() {
  await rm(outDir, { force: true, recursive: true });
  await mkdir(path.join(outDir, "reports"), { recursive: true });

  const { author, date } = getLastCommitMeta();
  const updated = new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  }).format(date);
  const updatedLabel = author ? `Laatste aanpassing: ${updated} door ${author}` : `Laatst gebouwd: ${updated}`;

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

  await writeFile(path.join(outDir, "index.html"), homePage(updatedLabel), "utf8");
  await Promise.all(
    renderedDocs.map(async (doc, index) => {
      const dir = path.join(outDir, doc.id);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "index.html"), docPage(doc, index, updatedLabel), "utf8");
    }),
  );
  await writeFile(path.join(outDir, "_headers"), "/*\n  X-Content-Type-Options: nosniff\n", "utf8");
}

const styles = `
:root {
  color-scheme: light;
  --navy: #0B1A2E;
  --navy-700: #142A45;
  --navy-900: #050D17;
  --teal: #28B2C8;
  --teal-100: #DDF2F6;
  --teal-600: #1F8FA1;
  --teal-700: #186E7C;
  --neutral-0: #FFFFFF;
  --neutral-50: #F7F9FB;
  --neutral-100: #EFF2F5;
  --neutral-200: #E1E6EC;
  --neutral-500: #6B7785;
  --neutral-600: #4A5560;
  --neutral-700: #2F3842;
  --fg-1: var(--navy);
  --fg-3: var(--neutral-500);
  --border-1: var(--neutral-200);
  --bg-page: var(--neutral-50);
  --bg-wash: linear-gradient(180deg, #ffffff 0%, #f3f8fa 100%);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 2px 6px rgba(11,26,46,0.06), 0 1px 2px rgba(11,26,46,0.04);
  --shadow-md: 0 6px 16px rgba(11,26,46,0.08), 0 2px 4px rgba(11,26,46,0.04);
  --shadow-lg: 0 18px 40px rgba(11,26,46,0.12), 0 4px 10px rgba(11,26,46,0.05);
  --ease-snap: cubic-bezier(0.16, 1, 0.3, 1);
  --font-sans: "Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
html, body { overflow-x: clip; }
body { margin: 0; font-family: var(--font-sans); color: var(--fg-1); background: var(--bg-page); line-height: 1.55; -webkit-font-smoothing: antialiased; }
a { color: var(--navy); text-decoration: none; transition: color 120ms var(--ease-snap); }
a:hover { color: var(--teal-700); text-decoration: underline; }
a:focus-visible, button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(40,178,200,0.28); border-radius: 4px; }
.topnav { display: flex; align-items: center; justify-content: space-between; gap: 20px; color: var(--fg-3); font-family: var(--font-mono); font-size: 0.8rem; padding: 18px clamp(18px, 5vw, 68px); background: rgba(255,255,255,0.86); backdrop-filter: saturate(140%) blur(12px); border-bottom: 1px solid var(--border-1); }
.topnav .brand { color: var(--navy); font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; letter-spacing: -0.01em; }
.subnav { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px clamp(18px, 5vw, 68px); background: var(--bg-page); border-bottom: 1px solid var(--border-1); position: sticky; top: 0; z-index: 5; }
.subnav a { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border-1); background: var(--neutral-0); color: var(--fg-3); font-size: 0.82rem; font-weight: 600; white-space: nowrap; transition: all 120ms var(--ease-snap); }
.subnav a.active { background: var(--navy); border-color: var(--navy); color: var(--neutral-0); }
.subnav a:hover { text-decoration: none; border-color: var(--teal); color: var(--navy); }
.hero { padding: clamp(24px, 5vw, 56px) clamp(18px, 5vw, 68px) 52px; background: var(--bg-wash); border-bottom: 1px solid var(--border-1); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr); gap: clamp(26px, 5vw, 70px); align-items: end; max-width: 1180px; margin: 0 auto; }
.hero-grid > * { min-width: 0; }
.label { display: inline-flex; align-items: center; gap: 8px; color: var(--teal-700); font-family: var(--font-mono); font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.72rem; }
.label::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 4px rgba(40,178,200,0.18); }
h1 { max-width: 850px; margin: 14px 0 22px; font-family: var(--font-sans); font-weight: 700; font-size: clamp(2.2rem, 5.4vw, 4.4rem); line-height: 1.04; letter-spacing: -0.02em; color: var(--navy); overflow-wrap: anywhere; }
.intro { max-width: 720px; color: var(--neutral-600); font-size: clamp(1.05rem, 1.6vw, 1.2rem); line-height: 1.65; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 20px; border: 1px solid var(--border-1); border-radius: var(--radius-md); background: var(--neutral-0); color: var(--navy); font-family: var(--font-sans); font-weight: 600; font-size: 0.92rem; transition: all 120ms var(--ease-snap); }
.button:hover { background: var(--neutral-100); text-decoration: none; }
.button.primary { border-color: var(--teal); background: var(--teal); color: var(--neutral-0); }
.button.primary:hover { background: var(--teal-600); }
.button.primary:active { background: var(--teal-700); transform: scale(0.99); }
.summary { background: var(--neutral-0); border: 1px solid var(--border-1); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-lg); }
.summary h2 { margin-top: 0; font-size: 1.05rem; font-weight: 700; color: var(--navy); }
.summary ul { padding-left: 18px; margin-bottom: 0; color: var(--neutral-600); }
.summary li { margin-bottom: 6px; }
main { width: min(1120px, calc(100% - 36px)); margin: 0 auto 72px; }
main.doc-main { margin-top: 36px; }
.downloads, .toc { display: grid; gap: 12px; margin-top: 28px; }
.downloads { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.downloads a, .toc a { background: var(--neutral-0); border: 1px solid var(--border-1); border-radius: var(--radius-lg); padding: 16px 18px; transition: transform 160ms var(--ease-snap), box-shadow 160ms var(--ease-snap); }
.downloads a:hover, .toc a:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); text-decoration: none; }
.downloads span { display: block; font-weight: 700; color: var(--navy); }
.downloads small { color: var(--fg-3); font-family: var(--font-mono); font-size: 0.78rem; overflow-wrap: anywhere; }
.toc { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 26px; }
.toc a { font-weight: 700; color: var(--navy); }
.doc { padding: clamp(22px, 4vw, 42px); background: var(--neutral-0); border: 1px solid var(--border-1); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.doc-title { margin-bottom: 22px; color: var(--teal-700); font-family: var(--font-mono); font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.78rem; }
.doc h2 { margin: 0 0 18px; font-family: var(--font-sans); font-weight: 700; font-size: clamp(1.7rem, 2.8vw, 2.5rem); line-height: 1.1; letter-spacing: -0.018em; color: var(--navy); }
.doc h3 { margin-top: 34px; font-size: 1.4rem; font-weight: 600; letter-spacing: -0.012em; color: var(--navy); }
.doc h4 { margin-top: 26px; font-size: 1.05rem; font-weight: 600; color: var(--navy); }
.doc p, .doc li { color: var(--neutral-700); }
.doc code { padding: 2px 6px; border-radius: var(--radius-sm); background: var(--neutral-100); font-family: var(--font-mono); font-size: 0.88em; color: var(--navy); }
.pager { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
blockquote { margin: 22px 0; padding: 16px 18px; border-left: 3px solid var(--teal); border-radius: 0 var(--radius-md) var(--radius-md) 0; background: var(--teal-100); color: var(--navy-700); }
.table-wrap { width: 100%; overflow-x: auto; margin: 22px 0; border: 1px solid var(--border-1); border-radius: var(--radius-lg); }
table { width: 100%; border-collapse: collapse; min-width: 720px; background: var(--neutral-0); }
th, td { padding: 12px 14px; border-bottom: 1px solid var(--border-1); text-align: left; vertical-align: top; }
th { background: var(--neutral-100); font-family: var(--font-mono); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.74rem; color: var(--fg-3); }
tr:last-child td { border-bottom: 0; }
@media (max-width: 820px) {
  .topnav { flex-direction: column; align-items: flex-start; gap: 6px; }
  .hero-grid, .downloads, .toc { grid-template-columns: 1fr; }
  h1 { font-size: clamp(2.35rem, 14vw, 4rem); }
  main { width: min(100% - 24px, 1120px); }
  .doc { padding: 20px; }
}
`;

await build();
