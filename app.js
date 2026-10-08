/* =========================================================
   NIVAAN INDUSTRIES — App JS
   ========================================================= */

(function () {
  'use strict';

  /* ---- NAV ---- */
  const nav = document.getElementById('site-nav');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
    });
    // Close on mobile link click
    mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- SCROLL REVEAL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-scale'
  );
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- LAYERS ANIMATION ---- */
  const boardLayers = document.querySelectorAll('.board-layer');
  const layerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        boardLayers.forEach(l => l.classList.add('visible'));
        layerObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });
  const boardEl = document.getElementById('exploded-board');
  if (boardEl) layerObserver.observe(boardEl);

  /* ---- ANIMATED COUNTERS ---- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease;
      el.textContent = value.toFixed(decimal) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObserver.observe(el));

  /* ---- BOX BUILDER ---- */
  const specL = document.getElementById('spec-l');
  const specW = document.getElementById('spec-w');
  const specH = document.getElementById('spec-h');
  const specVol = document.getElementById('spec-vol');
  const specLoad = document.getElementById('spec-load');
  const boardRadios = document.querySelectorAll('input[name="board-type"]');
  const previewBox = document.getElementById('preview-box');
  const previewBoardLabel = document.getElementById('preview-board-label');
  const previewVolLabel = document.getElementById('preview-vol-label');
  const dimLabelFront = document.getElementById('dim-label-front');
  const dimLabelSide  = document.getElementById('dim-label-side');

  // Board type stacking-load multipliers (rough estimate for UX purposes)
  const boardData = {
    '3ply': { name: '3-Ply Single Wall', loadFactor: 1.0 },
    '5ply': { name: '5-Ply Double Wall', loadFactor: 1.8 },
    '7ply': { name: '7-Ply Triple Wall', loadFactor: 2.8 },
    '9ply': { name: '9-Ply Quad Wall',   loadFactor: 4.0 },
  };
  const BASE_LOAD = 200; // kg per m² of base area at 5-ply

  function getSelectedBoard() {
    for (const r of boardRadios) {
      if (r.checked) return r.value;
    }
    return '5ply';
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Normalised size for preview (in px), target is 140px at 300mm
  const PREVIEW_SCALE = 140 / 300;

  function updatePreviewBoxStyles(L, W, H) {
    const px = (mm) => Math.round(clamp(mm * PREVIEW_SCALE, 30, 200));
    const lp = px(L), wp = px(W), hp = px(H);
    const halfW = wp / 2;
    const halfH = hp / 2;

    // All 6 faces
    const front  = previewBox.querySelector('.preview-front');
    const back   = previewBox.querySelector('.preview-back');
    const left   = previewBox.querySelector('.preview-left');
    const right  = previewBox.querySelector('.preview-right');
    const top    = previewBox.querySelector('.preview-top');
    const bottom = previewBox.querySelector('.preview-bottom');

    if (!front) return;

    front.style.width = lp + 'px';
    front.style.height = hp + 'px';
    front.style.transform = `translateZ(${halfW}px)`;

    back.style.width = lp + 'px';
    back.style.height = hp + 'px';
    back.style.transform = `rotateY(180deg) translateZ(${halfW}px)`;

    left.style.width = wp + 'px';
    left.style.height = hp + 'px';
    left.style.transform = `rotateY(-90deg) translateZ(${halfW}px)`;

    right.style.width = wp + 'px';
    right.style.height = hp + 'px';
    right.style.transform = `rotateY(90deg) translateZ(${halfW}px)`;

    top.style.width = lp + 'px';
    top.style.height = wp + 'px';
    top.style.transform = `rotateX(90deg) translateZ(${halfH}px)`;

    bottom.style.width = lp + 'px';
    bottom.style.height = wp + 'px';
    bottom.style.transform = `rotateX(-90deg) translateZ(${halfH}px)`;

    // Center the box in preview-scene
    previewBox.style.marginLeft = `${-lp / 2}px`;
    previewBox.style.marginTop  = `${-hp / 2}px`;
  }

  function updateSpec() {
    const L = parseFloat(specL?.value) || 400;
    const W = parseFloat(specW?.value) || 300;
    const H = parseFloat(specH?.value) || 250;
    const board = getSelectedBoard();
    const bd = boardData[board];

    const volLitres = (L * W * H) / 1e6;
    const baseAreaM2 = (L / 1000) * (W / 1000);
    const loadKg = Math.round(BASE_LOAD * baseAreaM2 * bd.loadFactor);

    if (specVol)  specVol.textContent  = volLitres.toFixed(1) + ' L';
    if (specLoad) specLoad.textContent = loadKg + ' kg';
    if (previewBoardLabel) previewBoardLabel.textContent = bd.name;
    if (previewVolLabel)   previewVolLabel.textContent   = volLitres.toFixed(1) + ' L';
    if (dimLabelFront) dimLabelFront.textContent = `${L}×${H}mm`;
    if (dimLabelSide)  dimLabelSide.textContent  = `${W}×${H}mm`;

    updatePreviewBoxStyles(L, W, H);

    // Update board option visual
    document.querySelectorAll('.board-option').forEach(opt => {
      opt.classList.remove('board-option-checked');
    });
    const checkedOpt = document.querySelector(`input[name="board-type"]:checked`);
    if (checkedOpt) {
      checkedOpt.closest('.board-option').classList.add('board-option-checked');
    }
  }

  [specL, specW, specH].forEach(inp => {
    if (inp) inp.addEventListener('input', updateSpec);
  });
  boardRadios.forEach(r => r.addEventListener('change', updateSpec));

  // Pass spec to quote form via hidden field
  const specToQuote = document.getElementById('spec-to-quote');
  if (specToQuote) {
    specToQuote.addEventListener('click', (e) => {
      const L = specL?.value || '400';
      const W = specW?.value || '300';
      const H = specH?.value || '250';
      const board = getSelectedBoard();
      const bd = boardData[board];
      const detailsField = document.getElementById('f-details');
      if (detailsField && !detailsField.value) {
        detailsField.value = `Custom spec from builder:\nDimensions: ${L} × ${W} × ${H} mm\nBoard Type: ${bd.name}`;
      }
    });
  }

  // Initial render
  updateSpec();

  /* ---- QUOTE FORM ---- */
  const quoteForm = document.getElementById('quote-form');
  const WHATSAPP_NUMBER = '919632410505';

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      const company = quoteForm.querySelector('[name="company"]').value.trim();
      const email = quoteForm.querySelector('[name="email"]').value.trim();
      const volume = quoteForm.querySelector('[name="volume"]');
      const useCase = quoteForm.querySelector('[name="use_case"]');
      const details = quoteForm.querySelector('[name="details"]').value.trim();
      const message = [
        'Hello Nivaan Industries, I would like to request a B2B packaging quote.',
        `Company: ${company}`,
        `Work email: ${email}`,
        `Monthly volume: ${volume.selectedOptions[0]?.text || ''}`,
        `Primary use case: ${useCase.selectedOptions[0]?.text || ''}`,
        details ? `Additional details: ${details}` : ''
      ].filter(Boolean).join('\n');

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---- HERO BOX INTERACTIVE ROTATION on mousemove ---- */
  const heroSection = document.getElementById('hero');
  const heroBox = document.getElementById('hero-box');
  let heroRY = 30;

  if (heroSection && heroBox) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const targetRY = 30 + dx * 30;
      const targetRX = -20 - dy * 15;
      heroBox.style.transition = 'none';
      heroBox.style.transform = `translate(-50%, -50%) rotateX(${targetRX}deg) rotateY(${targetRY}deg)`;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      heroBox.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      heroBox.style.transform = `translate(-50%, -50%) rotateX(-20deg) rotateY(30deg)`;
    });
  }

  /* ---- PLY CARD INTERACTION ---- */
  document.querySelectorAll('.ply-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.ply-card').forEach(c => c.classList.remove('ply-card-active'));
      card.classList.add('ply-card-active');
    });
  });

  /* ---- INDUSTRY CARDS colour inheritance fix ---- */
  // The CSS var(--ind-color) needs numeric parts for rgba usage
  // We set icon wrap backgrounds inline for simplicity
  document.querySelectorAll('.industry-card').forEach(card => {
    const color = card.style.getPropertyValue('--ind-color') || '#B87333';
    const iconWrap = card.querySelector('.industry-icon-wrap');
    if (iconWrap) {
      iconWrap.style.background = color + '18';
    }
  });

  /* ---- PRODUCT CARD HOVER EFFECT ---- */
  document.querySelectorAll('.product-card').forEach(card => {
    const color = card.dataset.color || '#B87333';
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = color + '60';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
  });

  /* ---- FADE IN KEYFRAME for success message ---- */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleTag);

  /* ---- INITIAL CALL on load ---- */
  window.addEventListener('load', () => {
    // Trigger first frame reveals for elements above fold
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('revealed');
      }
    });
  });

})();
