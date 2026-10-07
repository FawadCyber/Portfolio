(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  document.documentElement.classList.add('js');

  /* ---------- Loader: word cycle, then slide up ---------- */
  const loader = $('#loader');
  if (loader) {
    let seen = false;
    try { seen = sessionStorage.getItem('loader-seen') === '1'; } catch { /* storage unavailable */ }
    if (reduceMotion || seen) {
      loader.remove();
    } else {
      document.body.classList.add('lock');
      const word = $('.loader-word span', loader);
      const words = ['Hello', 'Salam', 'Bonjour', 'Ciao', 'Olá', 'नमस्ते', 'Hallo', 'Hej', 'Hola'];
      let index = 0;
      const finish = () => {
        loader.classList.add('done');
        document.body.classList.remove('lock');
        window.setTimeout(() => loader.classList.add('gone'), 1000);
        try { sessionStorage.setItem('loader-seen', '1'); } catch { /* ignore */ }
      };
      const step = () => {
        index += 1;
        if (index < words.length) {
          word.textContent = words[index];
          window.setTimeout(step, 135);
        } else {
          finish();
        }
      };
      window.setTimeout(step, 650);
    }
  }

  /* ---------- Hero video: only on larger screens, never with reduced motion or data saver ---------- */
  const heroVideo = $('[data-hero-video]');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (heroVideo && !reduceMotion && !saveData && window.matchMedia('(min-width: 721px)').matches) {
    $$('source[data-src]', heroVideo).forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    });
    heroVideo.autoplay = true;
    heroVideo.load();
    const tryPlay = () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); };
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
    window.addEventListener('pointerdown', tryPlay, { once: true });
    tryPlay();
  }

  /* ---------- Scrolled state (shows the round menu button) ---------- */
  const onScroll = () => document.body.classList.toggle('scrolled', window.scrollY > 90);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Side navigation ---------- */
  const menuButton = $('[data-menu]');
  const sideNav = $('#side-nav');
  const setNav = (open) => {
    document.body.classList.toggle('nav-active', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sideNav?.setAttribute('aria-hidden', String(!open));
  };
  menuButton?.addEventListener('click', () => setNav(!document.body.classList.contains('nav-active')));
  $$('[data-nav-close]').forEach((el) => el.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-active')) setNav(false);
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointerenter', () => { el.style.transition = 'transform .2s ease-out'; });
      el.addEventListener('pointermove', (event) => {
        const box = el.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        el.style.transform = `translate(${dx * 0.32}px, ${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
    // Fallback: anything already in or near the viewport is revealed on scroll even if the observer is slow.
    const revealVisible = () => {
      revealItems.forEach((item) => {
        if (item.classList.contains('in')) return;
        const box = item.getBoundingClientRect();
        if (box.top < window.innerHeight * 1.1 && box.bottom > 0) item.classList.add('in');
      });
    };
    window.addEventListener('scroll', revealVisible, { passive: true });
    window.setTimeout(revealVisible, 1800);
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
  }

  /* ---------- Work list: cursor-following preview ---------- */
  const workList = $('.work-list');
  const workFloat = $('.work-float');
  const workFloatButton = $('.work-float-btn');
  const workFloatImages = $('.work-float-images');
  if (finePointer && !reduceMotion && workList && workFloat && workFloatButton && workFloatImages) {
    let targetX = 0, targetY = 0, imageX = 0, imageY = 0, buttonX = 0, buttonY = 0, frame = 0;
    const animate = () => {
      imageX += (targetX - imageX) * 0.12;
      imageY += (targetY - imageY) * 0.12;
      buttonX += (targetX - buttonX) * 0.075;
      buttonY += (targetY - buttonY) * 0.075;
      workFloat.style.transform = `translate3d(${imageX - workFloat.offsetWidth / 2}px, ${imageY - workFloat.offsetHeight / 2}px, 0)`;
      workFloatButton.style.transform = `translate3d(${buttonX - workFloatButton.offsetWidth / 2}px, ${buttonY - workFloatButton.offsetHeight / 2}px, 0)`;
      frame = window.requestAnimationFrame(animate);
    };
    workList.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) {
        imageX = buttonX = targetX;
        imageY = buttonY = targetY;
        animate();
      }
    });
    $$('.work-item', workList).forEach((item, index) => {
      item.addEventListener('pointerenter', () => {
        workFloatImages.style.transform = `translateY(${-index * 100}%)`;
        workFloat.classList.add('on');
        workFloatButton.classList.add('on');
      });
    });
    workList.addEventListener('pointerleave', () => {
      workFloat.classList.remove('on');
      workFloatButton.classList.remove('on');
    });
  }

  /* ---------- Footer: local time and CTA drift ---------- */
  const timeEl = $('#local-time');
  if (timeEl) {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: true });
    const tick = () => { timeEl.textContent = `${formatter.format(new Date())} PKT`; };
    tick();
    window.setInterval(tick, 30000);
  }
  const footerCta = $('.footer-cta');
  if (footerCta && finePointer && !reduceMotion) {
    const drift = () => {
      const box = footerCta.parentElement.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, 1 - box.top / window.innerHeight));
      footerCta.style.setProperty('--drift', `${(1 - progress) * 14}vw`);
    };
    window.addEventListener('scroll', drift, { passive: true });
    drift();
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  $$('[data-copy-email]').forEach((button) => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(email);
        toast.textContent = 'Email copied to clipboard';
      } catch {
        toast.textContent = email;
      }
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 2600);
    });
  });

  /* ---------- Case studies ---------- */
  const fbaGallery = [
    { src: 'assets/proofs/drive-assets/fba/workflow.png', caption: 'Published n8n workflow: Odoo + three inventory sources → generated dashboard' },
    ...Array.from({ length: 13 }, (_, index) => ({
      src: `assets/proofs/drive-assets/fba/dashboard-${String(index + 1).padStart(2, '0')}.png`,
      caption: `Live FACON FBA dashboard output · view ${String(index + 1).padStart(2, '0')}`
    }))
  ];

  const workflowCases = {
    pinterest: {
      kicker: 'AI infrastructure / published',
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
      kicker: 'Executive reporting / published',
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
      kicker: 'Inventory intelligence / published',
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
      kicker: 'ERP automation / workflow build',
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
      kicker: 'Support operations / published',
      title: 'Amazon Buyer Message Fetching',
      summary: 'A scheduled support-data pipeline that retrieves Amazon buyer emails from Gmail, parses message content, enriches the records through Odoo lookups, removes duplicates, and maintains a structured Google Sheet for the support team.',
      tags: ['n8n', 'Gmail', 'Odoo', 'Google Sheets', 'JavaScript'],
      poster: 'assets/proofs/drive-assets/edesk/workflow.jpg',
      steps: ['Run on schedule and retrieve matching Gmail messages', 'Load each complete buyer message and normalize it in JavaScript', 'Enrich the message through Odoo customer and record lookups', 'Split and deduplicate the processed records', 'Append or update the support tracking sheet'],
      evidence: ['Published n8n workflow shown end to end', 'Real buyer-message rows were verified in the destination Google Sheet', 'Five supplied output screenshots prove the populated dataset', 'Buyer-identifying screenshots and the raw workflow export are intentionally kept out of the public site'],
      gallery: [{ src: 'assets/proofs/drive-assets/edesk/workflow.jpg', caption: 'Published Amazon buyer-message workflow' }]
    },
    'youtube-mcp': {
      kicker: 'AI media infrastructure / published',
      title: 'YouTube MCP Server',
      summary: 'A published MCP server that gives an AI client five focused YouTube operations: get a video, search, upload, update metadata, and delete. Each tool routes to its own n8n workflow for maintainable, auditable execution.',
      tags: ['MCP', 'n8n', 'YouTube API', 'AI Tools', 'Modular Workflows'],
      poster: 'assets/proofs/drive-assets/youtube/workflow.png',
      steps: ['Receive an MCP call from the AI client', 'Select one of five purpose-built YouTube tools', 'Route execution to the matching sub-workflow', 'Call the YouTube operation and return its result to the client'],
      evidence: ['Published MCP Server Trigger is visible in n8n', 'Five named tools cover the main YouTube content lifecycle', 'The main server and every sub-workflow export are included locally', 'Modular routing keeps each API operation isolated and maintainable'],
      gallery: [{ src: 'assets/proofs/drive-assets/youtube/workflow.png', caption: 'Published YouTube MCP server with five callable tools' }]
    }
  };

  const caseDialog = $('#case-dialog');
  const caseVideo = $('#case-video');
  const setList = (target, values) => {
    target.replaceChildren(...values.map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };
  const setGallery = (data) => {
    const gallery = $('#case-gallery');
    const grid = $('#case-gallery-grid');
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
    $('#case-gallery-count').textContent = `${items.length} verified view${items.length === 1 ? '' : 's'} · click to inspect`;
    gallery.hidden = items.length === 0;
  };
  const openWorkflowCase = (id) => {
    const data = workflowCases[id];
    if (!data || !caseDialog) return;
    $('#case-kicker').textContent = data.kicker;
    $('#case-title').textContent = data.title;
    $('#case-summary').textContent = data.summary;
    setList($('#case-tags'), data.tags);
    setList($('#case-steps'), data.steps);
    setList($('#case-evidence'), data.evidence);

    const videoShell = $('#case-video-shell');
    if (data.video) {
      $('#case-video-label').textContent = data.videoLabel;
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

    const exportLink = $('#case-export');
    if (data.exportFile) {
      exportLink.href = data.exportFile;
      exportLink.hidden = false;
    } else {
      exportLink.removeAttribute('href');
      exportLink.hidden = true;
    }

    const extra = $('#case-extra');
    if (data.extraImage) {
      $('#case-extra-image').src = data.extraImage;
      $('#case-extra-image').alt = `${data.title} supporting proof`;
      $('#case-extra-caption').textContent = data.extraCaption;
      extra.hidden = false;
    } else {
      extra.hidden = true;
    }
    setGallery(data);

    workFloat?.classList.remove('on');
    workFloatButton?.classList.remove('on');
    if (typeof caseDialog.showModal === 'function') caseDialog.showModal();
    else caseDialog.setAttribute('open', '');
    $('.case-modal', caseDialog).scrollTop = 0;
  };
  const closeWorkflowCase = () => {
    caseVideo?.pause();
    if (caseDialog?.open && typeof caseDialog.close === 'function') caseDialog.close();
    else caseDialog?.removeAttribute('open');
  };
  $$('[data-project]').forEach((card) => card.addEventListener('click', () => openWorkflowCase(card.dataset.project)));
  $('[data-case-close]')?.addEventListener('click', closeWorkflowCase);
  caseDialog?.addEventListener('click', (event) => {
    if (event.target === caseDialog) closeWorkflowCase();
  });
  caseDialog?.addEventListener('close', () => caseVideo?.pause());
})();
