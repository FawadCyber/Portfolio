# Fawad Naseem — Portfolio

**Live site:** https://fawadcyber.github.io/Portfolio/

A static, dependency-free portfolio for an AI automation engineer: production n8n systems, custom MCP servers, the internal apps built around them, a 20-second Remotion showreel, and a clickable proof library. GitHub Pages serves it straight from `main` with no build step.

## Sections

- **Reel** — Remotion showreel. The 10 MB video is lazy-loaded and starts (muted) only when scrolled near; under `prefers-reduced-motion` it shows controls instead of autoplaying.
- **Work** — featured system plus a horizontal slider of six verified workflow case studies.
- **Proof** — six proof tiles. Each opens a modal with the architecture, system flow, evidence notes, a recorded walkthrough where available, and a responsive screenshot gallery.
- **Products & platforms** — larger systems beyond single workflows: MorrowDesk, the social-media MCP server suite, FlowCore Leads, and Morrow Product Engine.
- **How I work**, **About**, **Contact**.

## Verified workflow cases

- Pinterest MCP Server
- MP Executive Dashboard
- FACON FBA Weekly Dashboard
- Sell Bills to Odoo Sales Orders
- Amazon Buyer Message Fetching
- YouTube MCP Server

The public package contains 29 proof files. Buyer-identifying screenshots, raw n8n exports, webhook IDs, and credential references are intentionally excluded from the deployable site.

## Editing

- Case-study content lives in `script.js` under `workflowCases`. Each key matches a `data-project` attribute in `index.html`.
- Product cards are plain HTML in the `#products` section of `index.html`.
- Colours and fonts are custom properties at the top of `styles.css`. Fonts load from Google Fonts via `<link>` tags in the page head.
- The social preview image is `assets/remotion-preview.png` (1920 × 1080), referenced by the Open Graph and Twitter tags in `index.html`.
- `favicon.svg` is the tab icon.

## Local preview

Any static server works, for example:

```bash
npx serve .
```
