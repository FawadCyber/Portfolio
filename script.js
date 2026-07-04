const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));
document.querySelector('#year').textContent = new Date().getFullYear();

const tilt = document.querySelector('[data-tilt]');
if (tilt && window.matchMedia('(pointer:fine)').matches) {
  tilt.addEventListener('pointermove', (event) => {
    const box = tilt.getBoundingClientRect();
    const rx = ((event.clientY - box.top) / box.height - 0.5) * -3;
    const ry = ((event.clientX - box.left) / box.width - 0.5) * 4;
    tilt.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  tilt.addEventListener('pointerleave', () => {
    tilt.style.transform = 'perspective(1400px) rotateX(0) rotateY(0)';
  });
}

const copyEmail = document.querySelector('[data-copy-email]');
const toast = document.querySelector('.toast');
copyEmail?.addEventListener('click', async () => {
  const email = copyEmail.dataset.copyEmail;
  try {
    await navigator.clipboard.writeText(email);
    toast.textContent = 'Email copied to clipboard';
  } catch {
    toast.textContent = email;
  }
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
});

const fbaGallery = [
  { src: 'assets/proofs/drive-assets/fba/workflow.png', caption: 'Published n8n workflow: Odoo + three inventory sources → generated dashboard' },
  ...Array.from({ length: 13 }, (_, index) => ({
    src: `assets/proofs/drive-assets/fba/dashboard-${String(index + 1).padStart(2, '0')}.png`,
    caption: `Live FACON FBA dashboard output · view ${String(index + 1).padStart(2, '0')}`
  }))
];

const workflowCases = {
  pinterest: {
    kicker: 'AI INFRASTRUCTURE / PUBLISHED',
    title: 'Pinterest MCP Server',
    summary: 'A self-hosted Model Context Protocol server that turns the Pinterest API into a practical toolset an AI client can call. One published n8n endpoint coordinates profile, board, section, follower, and pin operations.',
    tags: ['MCP', 'n8n', 'Pinterest API', 'OAuth2', 'Claude'],
    video: 'assets/proofs/pinterest-mcp-server.mp4',
    poster: 'assets/proofs/pinterest-mcp-server.jpg',
    videoLabel: 'Pinterest MCP / recorded walkthrough',
    steps: ['Receive an MCP tool call from the connected AI client', 'Route the request to one of 19 purpose-built Pinterest tools', 'Authenticate the operation through the configured API connection', 'Return the real Pinterest result through the MCP server'],
    evidence: ['Published workflow visible in the production n8n workspace', 'Nineteen named tools are connected to one MCP Server Trigger', 'Recorded walkthrough demonstrates the real system rather than a mockup', 'Architecture supports reusable AI access instead of a single fixed automation'],
    extraImage: 'assets/pinterest-mcp-workflow.png',
    extraCaption: 'Full published Pinterest MCP canvas — credentials and customer data excluded'
  },
  'mp-dashboard': {
    kicker: 'EXECUTIVE REPORTING / PUBLISHED',
    title: 'MP Executive Dashboard',
    summary: 'A webhook-driven reporting system that discovers visible Google Sheets tabs, reads their values, combines the datasets, computes executive metrics, builds a complete HTML dashboard, and returns it immediately to the requester.',
    tags: ['n8n', 'Google Sheets API', 'Webhook', 'JavaScript', 'HTML'],
    video: 'assets/proofs/mp-executive-dashboard.mp4',
    poster: 'assets/proofs/mp-executive-dashboard.jpg',
    videoLabel: 'MP Executive Dashboard / recorded walkthrough',
    steps: ['Receive a browser request through the production webhook', 'List and filter the visible main Google Sheets tabs', 'Read tab values and merge the retrieved datasets', 'Compute dashboard metrics in JavaScript', 'Build the HTML interface and respond through the webhook'],
    evidence: ['Published end-to-end webhook workflow', 'Dynamic discovery avoids hard-coding every spreadsheet tab', 'Business logic and presentation are generated inside the automation', 'The proof pack includes the workflow export, architecture, and dashboard output'],
    gallery: [
      { src: 'assets/proofs/drive-assets/mp/workflow.png', caption: 'Published n8n webhook workflow' },
      { src: 'assets/proofs/drive-assets/mp/mp-01.png', caption: 'Executive dashboard · KPI strip and account table' },
      { src: 'assets/proofs/drive-assets/mp/mp-02.png', caption: 'Executive dashboard · supporting analysis view' },
      { src: 'assets/proofs/drive-assets/mp/mp-03.png', caption: 'Executive dashboard · supporting analysis view' }
    ]
  },
  'fba-dashboard': {
    kicker: 'INVENTORY INTELLIGENCE / PUBLISHED',
    title: 'FACON FBA Weekly Dashboard',
    summary: 'A multi-source inventory dashboard that combines Odoo sales-order lines with FBA, US warehouse, and Karachi inventory sheets. The workflow normalizes the source tabs, computes the reporting model, and serves a generated HTML dashboard by webhook.',
    tags: ['Odoo', 'Google Sheets', 'Webhook', 'Inventory', 'HTML'],
    video: 'assets/proofs/facon-fba-weekly-dashboard.mp4',
    poster: 'assets/proofs/facon-fba-weekly-dashboard.jpg',
    videoLabel: 'FACON FBA Weekly / recorded walkthrough',
    steps: ['Trigger the report through a webhook', 'Retrieve Odoo sales-order line data', 'Find the latest FBA spreadsheet and read stock data', 'Read visible US warehouse and Karachi inventory tabs', 'Compute the unified dashboard model', 'Build and return the final HTML dashboard'],
    evidence: ['Published workflow with every source and transformation visible', 'Combines ERP data and multiple warehouse spreadsheets', 'Latest-sheet discovery keeps weekly reporting maintainable', 'Fourteen new screenshots, the workflow export, and the earlier video remain available'],
    extraImage: 'assets/proofs/fba-weekly-report.png',
    extraCaption: 'Earlier FACON FBA Weekly production proof — retained',
    gallery: fbaGallery
  },
  'odoo-orders': {
    kicker: 'ERP AUTOMATION / WORKFLOW BUILD',
    title: 'Sell Bills → Odoo Sales Orders',
    summary: 'A structured ERP migration workflow that iterates through source spreadsheet tabs, cleans each row, checks existing Odoo records and product attributes, applies JavaScript transformations and filters, then creates the required sales-order records.',
    tags: ['Odoo', 'Google Sheets', 'JavaScript', 'Data Mapping', 'ERP'],
    video: 'assets/proofs/sell-bills-to-odoo-orders.mp4',
    poster: 'assets/proofs/sell-bills-to-odoo-orders.jpg',
    videoLabel: 'Sell Bills to Odoo / recorded walkthrough',
    steps: ['List spreadsheet tabs and extract their names', 'Loop through each tab and read its bill rows', 'Normalize fields before querying Odoo', 'Fetch matching records and product attribute values', 'Apply JavaScript rules, filters, merges, and conditions', 'Create the final Odoo sales-order records'],
    evidence: ['Large multi-stage workflow visible in one recorded walkthrough', 'Uses branching and filtering to prevent uncontrolled record creation', 'A real Odoo sales order was verified in the supplied proof', 'Customer-identifying output and the raw workflow export are intentionally kept out of the public site']
  },
  'edesk-messages': {
    kicker: 'SUPPORT OPERATIONS / PUBLISHED',
    title: 'Amazon Buyer Message Fetching',
    summary: 'A scheduled support-data pipeline that retrieves Amazon buyer emails from Gmail, parses message content, enriches the records through Odoo lookups, removes duplicates, and maintains a structured Google Sheet for the support team.',
    tags: ['n8n', 'Gmail', 'Odoo', 'Google Sheets', 'JavaScript'],
    poster: 'assets/proofs/drive-assets/edesk/workflow.jpg',
    steps: ['Run on schedule and retrieve matching Gmail messages', 'Load each complete buyer message and normalize it in JavaScript', 'Enrich the message through Odoo customer and record lookups', 'Split and deduplicate the processed records', 'Append or update the support tracking sheet'],
    evidence: ['Published n8n workflow shown end to end', 'Real buyer-message rows were verified in the destination Google Sheet', 'Five supplied output screenshots prove the populated dataset', 'Buyer-identifying screenshots and the raw workflow export are intentionally kept out of the public site'],
    gallery: [{ src: 'assets/proofs/drive-assets/edesk/workflow.jpg', caption: 'Published Amazon buyer-message workflow' }]
  },
  'youtube-mcp': {
    kicker: 'AI MEDIA INFRASTRUCTURE / PUBLISHED',
    title: 'YouTube MCP Server',
    summary: 'A published MCP server that gives an AI client five focused YouTube operations: get a video, search, upload, update metadata, and delete. Each tool routes to its own n8n workflow for maintainable, auditable execution.',
    tags: ['MCP', 'n8n', 'YouTube API', 'AI Tools', 'Modular Workflows'],
    poster: 'assets/proofs/drive-assets/youtube/workflow.png',
    steps: ['Receive an MCP call from the AI client', 'Select one of five purpose-built YouTube tools', 'Route execution to the matching sub-workflow', 'Call the YouTube operation and return its result to the client'],
    evidence: ['Published MCP Server Trigger is visible in n8n', 'Five named tools cover the main YouTube content lifecycle', 'The main server and every sub-workflow export are included locally', 'Modular routing keeps each API operation isolated and maintainable'],
    gallery: [{ src: 'assets/proofs/drive-assets/youtube/workflow.png', caption: 'Published YouTube MCP server with five callable tools' }]
  }
};

const slider = document.querySelector('[data-case-slider]');
document.querySelector('[data-case-prev]')?.addEventListener('click', () => slider?.scrollBy({ left: -slider.clientWidth * 0.78, behavior: 'smooth' }));
document.querySelector('[data-case-next]')?.addEventListener('click', () => slider?.scrollBy({ left: slider.clientWidth * 0.78, behavior: 'smooth' }));

const caseDialog = document.querySelector('#case-dialog');
const caseVideo = document.querySelector('#case-video');
const setList = (target, values) => {
  target.replaceChildren(...values.map((value) => {
    const item = document.createElement('li');
    item.textContent = value;
    return item;
  }));
};

const setGallery = (data) => {
  const gallery = document.querySelector('#case-gallery');
  const grid = document.querySelector('#case-gallery-grid');
  const items = data.gallery || [];
  grid.replaceChildren(...items.map((proof, index) => {
    const link = document.createElement('a');
    link.className = 'case-gallery-item';
    link.href = proof.src;
    link.target = '_blank';
    link.rel = 'noopener';
    const image = document.createElement('img');
    image.src = proof.src;
    image.alt = `${data.title} proof ${index + 1}`;
    image.loading = 'lazy';
    const caption = document.createElement('span');
    caption.textContent = proof.caption;
    link.append(image, caption);
    return link;
  }));
  document.querySelector('#case-gallery-count').textContent = `${items.length} verified view${items.length === 1 ? '' : 's'} · click to inspect`;
  gallery.hidden = items.length === 0;
};

const openWorkflowCase = (id) => {
  const data = workflowCases[id];
  if (!data || !caseDialog) return;
  document.querySelector('#case-kicker').textContent = data.kicker;
  document.querySelector('#case-title').textContent = data.title;
  document.querySelector('#case-summary').textContent = data.summary;
  setList(document.querySelector('#case-tags'), data.tags);
  setList(document.querySelector('#case-steps'), data.steps);
  setList(document.querySelector('#case-evidence'), data.evidence);

  const videoShell = document.querySelector('#case-video-shell');
  if (data.video) {
    document.querySelector('#case-video-label').textContent = data.videoLabel;
    caseVideo.src = data.video;
    caseVideo.poster = data.poster || '';
    caseVideo.load();
    videoShell.hidden = false;
  } else {
    caseVideo.removeAttribute('src');
    caseVideo.removeAttribute('poster');
    caseVideo.load();
    videoShell.hidden = true;
  }

  const exportLink = document.querySelector('#case-export');
  if (data.exportFile) {
    exportLink.href = data.exportFile;
    exportLink.hidden = false;
  } else {
    exportLink.removeAttribute('href');
    exportLink.hidden = true;
  }

  const extra = document.querySelector('#case-extra');
  if (data.extraImage) {
    document.querySelector('#case-extra-image').src = data.extraImage;
    document.querySelector('#case-extra-image').alt = `${data.title} supporting proof`;
    document.querySelector('#case-extra-caption').textContent = data.extraCaption;
    extra.hidden = false;
  } else {
    extra.hidden = true;
  }
  setGallery(data);

  if (typeof caseDialog.showModal === 'function') caseDialog.showModal();
  else caseDialog.setAttribute('open', '');
};

document.querySelectorAll('[data-project]').forEach((card) => card.addEventListener('click', () => openWorkflowCase(card.dataset.project)));
const closeWorkflowCase = () => {
  caseVideo?.pause();
  if (caseDialog?.open && typeof caseDialog.close === 'function') caseDialog.close();
  else caseDialog?.removeAttribute('open');
};
document.querySelector('[data-case-close]')?.addEventListener('click', closeWorkflowCase);
caseDialog?.addEventListener('click', (event) => {
  if (event.target === caseDialog) closeWorkflowCase();
});
