# Fawad Naseem — Portfolio

**Live site:** https://fawadcyber.github.io/Portfolio/

A static, dependency-free portfolio for an AI automation engineer: production n8n systems, custom MCP servers, the internal apps built around them, a Remotion showreel, and a clickable proof library. GitHub Pages serves it straight from `main` with no build step.

## Design

The 2026 edition follows the editorial, motion-led style popularised by Dennis Snellenberg's portfolio: a full-height hero with a scrolling name marquee, a "located in" badge, a large statement intro with a round call-to-action, a hover-reveal work list with a cursor-following preview, a dark footer with a curved top edge, and a round menu button that opens a sliding side navigation. Everything is re-implemented from scratch in plain HTML, CSS and JavaScript with the site's own content.

- **Hero** — the Remotion showreel plays muted behind the marquee on screens wider than 720px; phones get the poster frame only.
- **Recent work** — six verified workflow case studies. Hovering a row shows its proof image next to the cursor; clicking opens a modal with the architecture, system flow, evidence notes, recorded walkthrough and screenshot gallery.
- **Products & platforms** — MorrowDesk, the social-media MCP server suite, FlowCore Leads and Morrow Product Engine.
- **About** — what I do, plus the working set of tools.
- **Contact** — email, copy-to-clipboard, GitHub, and a live local-time clock for Pakistan.

Motion respects `prefers-reduced-motion`: the preloader, marquee, magnetic buttons and cursor preview are disabled for users who ask for less motion, and the preloader only shows once per browser session.

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
