// Generates one static, crawlable page per case study from the workflowCases data
// in script.js, plus sitemap.xml. Run from the repo root:
//   node tools/build-case-pages.js <cache-version> <yyyy-mm-dd>
const fs = require('fs');
const vm = require('vm');

const BASE = 'https://fawadcyber.github.io/Portfolio/';
const version = process.argv[2] || '1';
const today = process.argv[3] || new Date().toISOString().slice(0, 10);

// Pull the case data out of script.js so there is only one source of truth.
const src = fs.readFileSync('script.js', 'utf8');
const start = src.indexOf('const fbaGallery');
const end = src.indexOf('const caseDialog');
if (start < 0 || end < 0) throw new Error('case data not found in script.js');
const cases = vm.runInNewContext(`${src.slice(start, end)}; workflowCases`);

// Search-focused metadata per case. Facts come from the case data.
const PAGES = [
  { id: 'pinterest', slug: 'pinterest-mcp-server', title: 'Pinterest MCP Server Built with n8n: 19 AI Tools', desc: 'A self-hosted Pinterest MCP server built with n8n that gives Claude and other AI clients 19 real Pinterest tools. Recorded walkthrough and system flow.' },
  { id: 'youtube-mcp', slug: 'youtube-mcp-server', title: 'YouTube MCP Server Built with n8n: 5 AI Tools', desc: 'A published YouTube MCP server on n8n that lets AI clients search, upload, update and delete videos, with one sub-workflow for each tool.' },
  { id: 'mp-dashboard', slug: 'mp-executive-dashboard', title: 'Executive Dashboard Automation with n8n and Google Sheets', desc: 'An n8n webhook workflow that reads Google Sheets tabs, computes executive metrics and returns a complete HTML dashboard. Recorded walkthrough included.' },
  { id: 'fba-dashboard', slug: 'facon-fba-weekly-dashboard', title: 'Amazon FBA Inventory Dashboard with n8n and Odoo', desc: 'A weekly FBA inventory dashboard that combines Odoo sales orders with FBA, US warehouse and Karachi stock sheets, served as HTML by webhook.' },
  { id: 'odoo-orders', slug: 'sell-bills-to-odoo-orders', title: 'Google Sheets to Odoo Sales Order Automation', desc: 'An ERP workflow that loops through spreadsheet tabs, cleans each row, checks existing Odoo records and creates the required sales orders.' },
  { id: 'edesk-messages', slug: 'amazon-buyer-message-automation', title: 'Amazon Buyer Message Automation: Gmail to Odoo to Sheets', desc: 'A scheduled n8n pipeline that fetches Amazon buyer emails from Gmail, enriches them through Odoo, removes duplicates and updates a support sheet.' },
];

// Lines written for the internal proof pack, which read oddly on a public page.
const INTERNAL = /proof pack|new screenshots|included locally|supplied output screenshots/i;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const up = (p) => `../${p}`;
const EMAIL = 'https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=fawadnaseem28%40gmail.com&amp;su=Automation%20Project%20Inquiry';
const WHATSAPP = 'https://wa.me/923492971884?text=Hi%20Fawad%2C%20I%20saw%20your%20portfolio';

function page(p) {
  const c = cases[p.id];
  if (!c) throw new Error('no case data for ' + p.id);
  const url = `${BASE}${p.slug}/`;
  const fullTitle = `${p.title} | Fawad Naseem`;
  const image = BASE + (c.poster || c.extraImage || 'assets/remotion-preview.png');
  const evidence = c.evidence.filter((e) => !INTERNAL.test(e));
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: p.title, description: p.desc, image, url, dateModified: today, author: { '@type': 'Person', name: 'Fawad Naseem', url: BASE }, keywords: c.tags.join(', ') },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Fawad Naseem', item: BASE },
        { '@type': 'ListItem', position: 2, name: c.title, item: url },
      ] },
    ],
  };
  const others = PAGES.filter((o) => o.slug !== p.slug);
  const video = c.video ? `
      <div class="frame">
        <div class="frame-bar"><i></i><i></i><i></i><span>${esc(c.videoLabel || c.title)}</span></div>
        <video controls preload="metadata" playsinline poster="${up(c.poster || '')}" aria-label="${esc(c.title)} recorded walkthrough"><source src="${up(c.video)}" type="video/mp4"></video>
      </div>` : '';
  const extra = c.extraImage ? `
      <figure class="frame">
        <div class="frame-bar"><i></i><i></i><i></i><span>${esc(c.title)}</span></div>
        <img src="${up(c.extraImage)}" alt="${esc(c.title)} workflow and output" loading="lazy" decoding="async">
      </figure>` : '';
  const gallery = (c.gallery || []).length ? `
      <section class="case-gallery">
        <div class="case-gallery-heading"><h2>Supporting proof</h2><span>${c.gallery.length} view${c.gallery.length === 1 ? '' : 's'}</span></div>
        <div class="case-gallery-grid">
${c.gallery.map((g) => `          <a class="case-gallery-item" href="${up(g.src)}" target="_blank" rel="noopener"><img src="${up(g.src)}" alt="${esc(g.caption)}" loading="lazy" decoding="async"><span>${esc(g.caption)}</span></a>`).join('\n')}
        </div>
      </section>` : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta name="theme-color" content="#0C0A09">
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${up('favicon.svg?v=3')}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${up('favicon.svg?v=3')}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Fawad Naseem">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(p.desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(p.desc)}">
  <meta name="twitter:image" content="${image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="${up(`styles.css?v=${version}`)}">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <div class="aurora" aria-hidden="true"></div>
  <header class="topbar container">
    <a class="brand" href="${up('')}"><img class="brand-mark" src="${up('favicon.svg?v=3')}" alt="" width="26" height="26">Fawad Naseem</a>
    <nav class="topnav" aria-label="Main navigation">
      <a href="${up('#work')}">Work</a>
      <a href="${up('#products')}">Products</a>
      <a href="${up('#about')}">About</a>
      <a href="${up('#contact')}">Contact</a>
    </nav>
    <a class="btn btn-dark" href="${EMAIL}" target="_blank" rel="noopener">Let’s talk</a>
  </header>

  <main class="container case-page">
    <nav class="case-back" aria-label="Breadcrumb"><a href="${up('#work')}">← All systems</a></nav>
    <article>
      <p class="eyebrow">${esc(c.kicker)}</p>
      <h1>${esc(c.title)}</h1>
      <p class="case-summary">${esc(c.summary)}</p>
      <ul class="tags">${c.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>${video}
      <div class="case-details">
        <section><h2>System flow</h2><ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
        <section><h2>What this proves</h2><ul>${evidence.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></section>
      </div>${extra}${gallery}
    </article>

    <section class="case-more" aria-labelledby="more-title">
      <h2 id="more-title">More case studies</h2>
      <div class="case-more-grid">
${others.map((o) => `        <a class="case-more-item" href="${up(o.slug + '/')}"><b>${esc(cases[o.id].title)}</b><span>${esc(cases[o.id].tags.slice(0, 3).join(' · '))}</span></a>`).join('\n')}
      </div>
    </section>

    <section class="contact-card case-cta">
      <p class="eyebrow light">Need something like this?</p>
      <h2>Let’s make it actually work.</h2>
      <div class="hero-actions">
        <a class="btn btn-light" href="${EMAIL}" target="_blank" rel="noopener">Email me</a>
        <a class="btn btn-wa" href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-outline" href="${up('cv/Fawad_Naseem_CV.pdf')}" target="_blank" rel="noopener">Download CV</a>
      </div>
    </section>
  </main>

  <footer class="container footer">
    <span>© 2026 Fawad Naseem · Karachi, Pakistan</span>
    <nav class="footer-links" aria-label="Elsewhere">
      <a href="https://www.linkedin.com/in/fawad-naseem-51901941a/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://github.com/FawadCyber" target="_blank" rel="noopener">GitHub</a>
      <a href="https://fawadcyber.github.io/FlowCore/" target="_blank" rel="noopener">FlowCore</a>
    </nav>
  </footer>
</body>
</html>
`;
}

for (const p of PAGES) {
  fs.mkdirSync(p.slug, { recursive: true });
  fs.writeFileSync(`${p.slug}/index.html`, page(p));
  console.log('wrote', `${p.slug}/index.html`, `| title ${p.title.length + 15} chars | desc ${p.desc.length} chars`);
}

const urls = [BASE, ...PAGES.map((p) => `${BASE}${p.slug}/`)];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log('wrote sitemap.xml with', urls.length, 'urls');
