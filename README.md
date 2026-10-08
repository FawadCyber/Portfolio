# Fawad Naseem — Portfolio

**Live site:** https://fawadcyber.github.io/Portfolio/

A static, dependency-free portfolio for an AI automation engineer: production n8n systems, custom MCP servers, the internal apps built around them, a Remotion showreel, and a clickable proof library. GitHub Pages serves it straight from `main` with no build step.

## Design

A clean, premium "systems" layout: warm off-white background, one green accent, rounded cards. Each case study is a card with a small flow diagram (for example Gmail → Parse → Odoo → Sheets) instead of a raw screenshot; the screenshots and walkthrough videos live inside the proof modal, framed in a browser-window mock. Plain HTML, CSS and JavaScript, no build step.

- **Hero** — headline, lede, two buttons and a four-cell stats strip.
- **Selected systems** — six verified case cards; clicking opens the proof modal with architecture, system flow, evidence notes, recorded walkthrough and screenshot gallery.
- **Products & platforms** — MorrowDesk, the social-media MCP server suite, FlowCore Leads and Morrow Product Engine.
- **How I work** — method steps plus the working set of tools.
- **Contact** — dark card with email, copy-to-clipboard and GitHub; footer shows local time for Karachi.

## Verified workflow cases

- Pinterest MCP Server
- MP Executive Dashboard
- FACON FBA Weekly Dashboard
- Sell Bills to Odoo Sales Orders
- Amazon Buyer Message Fetching
- YouTube MCP Server

The public package contains 29 proof files. Buyer-identifying screenshots, raw n8n exports, webhook IDs, and credential references are intentionally excluded from the deployable site.

## Editing

- Case-study content lives in `script.js` under `workflowCases`. Each key matches a `data-project` attribute on a work-list row in `index.html`. The cursor preview images are the `<img>` tags inside `.work-float-images`, in the same order as the rows.
- Product rows and the About section are plain HTML in `index.html`.
- Colours, spacing and fonts are custom properties at the top of `styles.css`. Fonts (Inter and Inter Tight) load from Google Fonts via `<link>` tags in the page head.
- The social preview image is `assets/remotion-preview.png` (1920 × 1080), referenced by the Open Graph and Twitter tags in `index.html`.
- `favicon.svg` is the tab icon and the avatar mark in the footer.

## Local preview

Any static server works, for example:

```bash
npx serve .
```
