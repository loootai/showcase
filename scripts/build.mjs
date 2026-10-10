// Static build: data/projects.json + src/* -> dist/. No dependencies.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const data = JSON.parse(readFileSync(join(root, "data/projects.json"), "utf8"));
const { site, projects } = data;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const GROUP_ORDER = [
  "Apps",
  "Open-source alternatives",
  "Agent tools",
  "Automation",
  "Utilities",
  "SDKs and frameworks",
  "Editors and CI",
  "Lists and examples",
];
const groups = GROUP_ORDER.filter((g) => projects.some((p) => p.group === g));
for (const p of projects) if (!GROUP_ORDER.includes(p.group)) throw new Error(`Unknown group ${p.group} on ${p.id}`);
projects.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));

const BASIS = { listed: "Public price", estimate: "Estimate", none: "Not public" };

function card(p) {
  const shot = p.image
    ? `<a class="shot" href="${esc(p.live || p.repo)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" width="960" height="600" loading="lazy" decoding="async" alt="${esc(p.title)} screenshot${p.imageNote ? ", " + esc(p.imageNote.toLowerCase()) : ""}"></a>`
    : "";
  const note = p.image && p.imageNote ? `<p class="shotnote">${esc(p.imageNote)}</p>` : "";
  const facts = [];
  if (p.replaces) facts.push(`<div><dt>Replaces</dt><dd>${esc(p.replaces)}</dd></div>`);
  if (p.replacesPrice)
    facts.push(
      `<div><dt>Their price</dt><dd>${esc(p.replacesPrice.text)} <span class="tag tag-${p.replacesPrice.basis}">${BASIS[p.replacesPrice.basis]}</span>${p.replacesPrice.note ? `<span class="fine">${esc(p.replacesPrice.note)}</span>` : ""}</dd></div>`,
    );
  if (p.costOfRun) facts.push(`<div><dt>A typical run, list price</dt><dd>${esc(p.costOfRun)}</dd></div>`);
  const cmd = p.command
    ? `<div class="cmd"><span class="cmdlabel">${esc(p.commandLabel)}</span><div class="cmdrow"><code>${esc(p.command)}</code><button type="button" class="copy" data-copy="${esc(p.command)}" aria-label="Copy command for ${esc(p.name)}">Copy</button></div></div>`
    : "";
  const meta = [p.release, p.tests ? `${p.tests} tests` : null].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
  const live = p.live ? `<a class="btn btn-ghost" href="${esc(p.live)}">Open live</a>` : "";
  const search = [p.name, p.title, p.summary, p.replaces, p.group].filter(Boolean).join(" ").toLowerCase();
  return `<article class="card" data-group="${esc(p.group)}" data-search="${esc(search)}">
${shot}<div class="cbody">
<p class="kicker">${esc(p.group)}</p>
<h3><a href="${esc(p.repo)}">${esc(p.name)}</a></h3>
<p class="sum">${esc(p.summary)}</p>${note}
${facts.length ? `<dl class="facts">${facts.join("")}</dl>` : ""}
${cmd}
<div class="cfoot"><a class="btn" href="${esc(p.repo)}">View repo</a>${live}<span class="meta">${meta}</span></div>
</div></article>`;
}

const alts = projects.filter((p) => p.kind === "alternative");
const table = `<table class="cmp"><thead><tr><th scope="col">Replaces</th><th scope="col">Their price</th><th scope="col">Typical run on looot, list price</th><th scope="col">Repo</th></tr></thead><tbody>
${alts
  .map(
    (p) =>
      `<tr><th scope="row" data-label="Replaces">${esc(p.replaces)}</th><td data-label="Their price">${esc(p.replacesPrice.text)} <span class="tag tag-${p.replacesPrice.basis}">${BASIS[p.replacesPrice.basis]}</span><span class="fine">${esc(p.replacesPrice.note || "")}</span></td><td data-label="Typical run on looot">${esc(p.costOfRun)}</td><td data-label="Repo"><a href="${esc(p.repo)}">${esc(p.name)}</a></td></tr>`,
  )
  .join("\n")}
</tbody></table>`;

const counts = { all: projects.length, apps: projects.filter((p) => p.kind === "app").length, alts: alts.length, conn: projects.filter((p) => p.kind === "connector").length };
const desc = `${counts.all} open-source repos built on looot: ${counts.apps} apps, ${counts.alts} alternatives to paid GTM tools with the price of a run next to the price of the tool, and ${counts.conn} connectors.`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>looot showcase: open-source apps and connectors</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${site.url}">
<meta name="theme-color" content="#0B4A35">
<meta property="og:type" content="website">
<meta property="og:site_name" content="looot">
<meta property="og:title" content="looot showcase: open-source apps and connectors">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${site.url}">
<meta property="og:image" content="${site.url}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="brand/looot-mark.svg">
<link rel="icon" type="image/png" sizes="32x32" href="brand/favicon-32.png">
<link rel="apple-touch-icon" href="brand/apple-touch-icon-180.png">
<script>try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#gallery">Skip to the gallery</a>
<header class="top"><div class="wrap topin">
<a class="brand" href="${site.home}" aria-label="looot home"><img class="wm wm-light" src="brand/looot-wordmark-1024.png" width="765" height="148" alt="looot"><img class="wm wm-dark" src="brand/looot-wordmark-white-1024.png" width="765" height="148" alt=""></a>
<nav class="nav" aria-label="Main"><a href="#gallery">Gallery</a><a href="#compare">Replace vs cost</a><a href="${site.org}">GitHub</a><a href="${site.home}">looot.ai</a>
<button type="button" id="theme" class="icon" aria-label="Switch theme"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4A5.5 5.5 0 0 1 12.4 3.1C12.3 3 12.1 3 12 3z"/></svg></button></nav>
</div></header>
<main>
<section class="hero"><div class="wrap">
<p class="eyebrow">Built on looot</p>
<h1>One key for 2,500+ data APIs, and ${counts.all} open-source repos that use it.</h1>
<p class="lead">${esc(site.tagline)}</p>
<div class="cta"><a class="btn btn-primary" href="#gallery">Browse the gallery</a><a class="btn btn-ghost" href="${site.home}">Get a looot key</a></div>
<ul class="stats"><li><b>${counts.apps}</b> apps</li><li><b>${counts.alts}</b> open-source alternatives</li><li><b>${counts.conn}</b> connectors and tools</li></ul>
</div></section>

<section id="gallery" class="wrap sec" aria-labelledby="gh">
<h2 id="gh">Gallery</h2>
<div class="controls">
<label class="search"><span class="sr">Search the gallery</span><input id="q" type="search" placeholder="Search by name or what it replaces" autocomplete="off"></label>
<div class="chips" role="group" aria-label="Filter by group"><button type="button" class="chip" data-g="" aria-pressed="true">All <i>${counts.all}</i></button>${groups
  .map((g) => `<button type="button" class="chip" data-g="${esc(g)}" aria-pressed="false">${esc(g)} <i>${projects.filter((p) => p.group === g).length}</i></button>`)
  .join("")}</div>
<p id="count" class="count" aria-live="polite">Showing ${counts.all} of ${counts.all}</p>
</div>
<div class="grid" id="grid">
${projects.map(card).join("\n")}
</div>
<p id="none" class="none" hidden>Nothing matches. Clear the search or pick All.</p>
</section>

<section id="compare" class="wrap sec" aria-labelledby="ch">
<h2 id="ch">Replace vs cost</h2>
<p class="lede">What each paid product charges, next to what a typical run costs on looot at list price. Their prices are what each repo's README recorded on the date shown. Where the vendor does not publish a price, the row says so, and a third-party figure is labelled as an estimate.</p>
${table}
<p class="fine block">Run costs are the figures each README gives at looot list prices. They are quotes from the catalog, not receipts. The tools are not feature-for-feature replacements; each README lists what it leaves out.</p>
</section>
</main>
<footer class="foot"><div class="wrap footin"><p>MIT licence, copyright looot. Screenshots show demo data. <a href="${site.home}">looot.ai</a> · <a href="${site.org}">github.com/loootai</a> · <a href="https://github.com/loootai/showcase">Add a repo</a></p></div></footer>
<script src="app.js" defer></script>
</body>
</html>
`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "index.html"), html);
for (const f of ["style.css", "app.js"]) cpSync(join(root, "src", f), join(dist, f));
cpSync(join(root, "public"), dist, { recursive: true });
writeFileSync(join(dist, ".nojekyll"), "");
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.url}sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site.url}</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
);
writeFileSync(join(dist, "404.html"), `<!doctype html><meta charset="utf-8"><title>Not found</title><meta http-equiv="refresh" content="0;url=./"><a href="./">Back to the showcase</a>`);
console.log(`built ${projects.length} projects -> dist/`);
