(function () {

  // ── 1. Inject nav CSS (self-contained, works on any page) ──────────────────
  var style = document.createElement('style');
  style.textContent = [
    'nav#navbar {',
    '  position: fixed;',
    '  top: 20px;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  z-index: 10000;',
    '  height: 52px;',
    '  display: grid;',
    '  grid-template-columns: 1fr auto 1fr;',
    '  align-items: center;',
    '  padding: 0 8px 0 24px;',
    '  background: rgba(253,252,250,0.97);',
    '  backdrop-filter: blur(28px);',
    '  -webkit-backdrop-filter: blur(28px);',
    '  border: 1px solid rgba(216,210,200,0.7);',
    '  border-radius: 100px;',
    '  width: calc(100% - 48px);',
    '  max-width: 860px;',
    '  box-shadow: 0 2px 20px rgba(28,28,28,0.07), 0 1px 4px rgba(28,28,28,0.04);',
    '  transition: box-shadow 0.3s ease, background 0.3s ease;',
    '}',
    'nav#navbar.scrolled {',
    '  box-shadow: 0 4px 32px rgba(28,28,28,0.12), 0 1px 4px rgba(28,28,28,0.05);',
    '  background: rgba(253,252,250,0.99);',
    '}',
    '.nav-logo {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 10.5px;',
    '  font-weight: 500;',
    '  letter-spacing: 0.3em;',
    '  text-transform: uppercase;',
    '  color: #1C1C1C;',
    '  text-decoration: none;',
    '  white-space: nowrap;',
    '  justify-self: start;',
    '}',
    '.nav-logo:hover { opacity: 0.7; transition: opacity 0.2s; }',
    '.nav-links {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 2px;',
    '  justify-self: center;',
    '}',
    '.nav-destinations-wrap { position: relative; }',
    '.nav-destinations-btn { display: flex; align-items: center; gap: 5px; }',
    '.nav-dest-dropdown {',
    '  display: none;',
    '  position: absolute;',
    '  top: 100%;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  background: #FDFCFA;',
    '  border: 1px solid #D8D2C8;',
    '  border-radius: 14px;',
    '  padding: 34px 20px 20px;',
    '  min-width: 420px;',
    '  box-shadow: 0 16px 48px rgba(28,28,28,0.12);',
    '  z-index: 9000;',
    '}',
    '.nav-dest-dropdown.open { display: block; }',
    '.nav-dest-grid {',
    '  display: grid;',
    '  grid-template-columns: 1fr 1fr;',
    '  gap: 2px;',
    '}',
    '.nav-dest-grid a {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 12px;',
    '  font-weight: 400;',
    '  color: #1C1C1C;',
    '  letter-spacing: 0.04em;',
    '  text-decoration: none;',
    '  padding: 10px 12px;',
    '  border-radius: 8px;',
    '  display: flex;',
    '  justify-content: space-between;',
    '  align-items: center;',
    '  gap: 8px;',
    '  transition: background 0.15s;',
    '}',
    '.nav-dest-grid a:hover { background: #EDEAE2; }',
    '.nav-dest-grid a span { color: #9E9890; font-size: 10px; font-weight: 300; text-align: right; flex-shrink: 0; }',
    '.nav-dest-footer {',
    '  border-top: 1px solid #D8D2C8;',
    '  margin-top: 12px;',
    '  padding-top: 12px;',
    '  text-align: center;',
    '}',
    '.nav-dest-footer a {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 10px;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: #6B6660;',
    '  text-decoration: none;',
    '  transition: color 0.15s;',
    '}',
    '.nav-dest-footer a:hover { color: #1C1C1C; }',
    '.nav-link-right {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 11px;',
    '  font-weight: 400;',
    '  letter-spacing: 0.08em;',
    '  color: #6B6660;',
    '  text-decoration: none;',
    '  padding: 7px 14px;',
    '  border-radius: 100px;',
    '  transition: color 0.18s, background 0.18s;',
    '  white-space: nowrap;',
    '}',
    '.nav-link-right:hover { color: #1C1C1C; background: #EDEAE2; }',
    '.nav-link-right.nav-active { color: #1C1C1C; font-weight: 500; }',
    '.nav-right {',
    '  display: flex;',
    '  justify-content: flex-end;',
    '  align-items: center;',
    '  gap: 2px;',
    '  position: relative;',
    '}',
    '.nav-cta {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 10.5px;',
    '  font-weight: 500;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: #FDFCFA !important;',
    '  background: #1C1C1C;',
    '  border-radius: 100px;',
    '  padding: 10px 22px;',
    '  text-decoration: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  transition: background 0.2s, transform 0.15s;',
    '  white-space: nowrap;',
    '  display: inline-block;',
    '}',
    '.nav-cta:hover { background: #8C7B64; transform: scale(1.02); }',
    /* ── Hamburger button (hidden on desktop) ── */
    '.nav-hamburger {',
    '  display: none;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 36px;',
    '  height: 36px;',
    '  background: none;',
    '  border: 1px solid rgba(216,210,200,0.8);',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  color: #1C1C1C;',
    '  transition: background 0.15s;',
    '  flex-shrink: 0;',
    '}',
    '.nav-hamburger:hover { background: #EDEAE2; }',
    /* ── Mobile dropdown menu ── */
    '.nav-mobile-menu {',
    '  display: none;',
    '  position: absolute;',
    '  top: calc(100% + 10px);',
    '  right: 0;',
    '  background: #FDFCFA;',
    '  border: 1px solid #D8D2C8;',
    '  border-radius: 14px;',
    '  padding: 8px;',
    '  min-width: 210px;',
    '  box-shadow: 0 16px 48px rgba(28,28,28,0.12);',
    '  z-index: 9500;',
    '}',
    '.nav-mobile-menu.open { display: block; }',
    '.nav-mobile-link {',
    '  display: block;',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 13px;',
    '  font-weight: 400;',
    '  color: #1C1C1C;',
    '  text-decoration: none;',
    '  padding: 12px 14px;',
    '  border-radius: 8px;',
    '  transition: background 0.15s;',
    '  letter-spacing: 0.02em;',
    '}',
    '.nav-mobile-link:hover { background: #EDEAE2; }',
    '.nav-mobile-divider { height: 1px; background: #E4E0D8; margin: 6px 6px; }',
    '.nav-mobile-cta-link {',
    '  display: block;',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 10.5px;',
    '  font-weight: 500;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: #FDFCFA !important;',
    '  background: #1C1C1C;',
    '  border-radius: 100px;',
    '  padding: 12px 18px;',
    '  text-decoration: none;',
    '  text-align: center;',
    '  margin: 4px 4px 2px;',
    '  transition: background 0.2s;',
    '}',
    '.nav-mobile-cta-link:hover { background: #8C7B64; }',
    '.nav-backdrop {',
    '  display: none;',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 8998;',
    '  background: transparent;',
    '  cursor: default;',
    '}',
    '.nav-backdrop.active { display: block; }',
    '.filter-backdrop {',
    '  display: none;',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 499;',
    '  background: transparent;',
    '  cursor: default;',
    '}',
    '.filter-backdrop.active { display: block; }',
    '@media (max-width: 680px) {',
    '  nav#navbar { padding: 0 12px; }',
    '  .nav-logo { font-size: 9px; letter-spacing: 0.2em; }',
    '  .nav-link-right:not(.nav-destinations-btn) { display: none; }',
    '  .nav-destinations-btn { font-size: 12px; padding: 7px 10px; }',
    '  .nav-cta { display: none; }',
    '  .nav-hamburger { display: flex; }',
    '  .nav-dest-dropdown {',
    '    position: fixed;',
    '    left: 16px;',
    '    right: 16px;',
    '    top: 82px;',
    '    min-width: unset;',
    '    transform: none;',
    '    max-height: 70vh;',
    '    overflow-y: auto;',
    '    border-radius: 16px;',
    '    z-index: 10002;',
    '  }',
    '  .nav-dest-grid { grid-template-columns: 1fr 1fr; gap: 4px; }',
    '  .nav-dest-grid a { min-height: 48px; align-items: center; font-size: 12px; padding: 10px 8px; }',
    '  .nav-dest-grid a span { font-size: 9px; }',
    '  .nav-backdrop.mobile-dest-active { z-index: 10001; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── 2. Detect page ────────────────────────────────────────────────────────────
  var path = window.location.pathname;
  var isIndex = path === '/' || path === '/index.html';
  var isInspiration = path === '/inspiration.html' || path.endsWith('inspiration.html');
  var isStoriesSection = path.startsWith('/stories') || path.endsWith('stories.html');

  // ── 3. Build nav HTML ─────────────────────────────────────────────────────────
  var logoHref = isIndex ? '#' : '/';
  var logoClick = isIndex ? ' onclick="showPage(\'home\'); return false;"' : '';

  var destinations = [
    ['Italy', 'Europe', 'italy'],
    ['Greece', 'Europe', 'santorini'],
    ['France', 'Europe', 'south-of-france'],
    ['Portugal', 'Europe', 'portugal'],
    ['Switzerland', 'Europe', 'switzerland'],
    ['Bali', 'Indonesia', 'bali'],
    ['Tulum', 'Mexico', 'tulum'],
    ['Maldives', 'Indian Ocean', 'maldives'],
    ['Costa Rica', 'Central America', 'costa-rica'],
    ['Nicaragua', 'Central America', 'nicaragua'],
    ['New York', 'USA', 'new-york']
  ];

  var destItems = destinations.map(function (d) {
    return '<a href="/destinations/' + d[2] + '">' + d[0] + ' <span>' + d[1] + '</span></a>';
  }).join('');

  var viewAllDest = '<a href="/destinations" style="color:#A55A4A;font-weight:500">View all destinations →</a>';

  var howItWorksLink = '<a href="/how-it-works" class="nav-link-right">How It Works</a>';

  var faqLink = isIndex
    ? '<a href="#" id="nav-faq" onclick="goToFaq(); return false;" class="nav-link-right">FAQ</a>'
    : '<a href="/#faq" class="nav-link-right">FAQ</a>';

  var inspirationClass = 'nav-link-right' + ((isInspiration || isStoriesSection) ? ' nav-active' : '');

  var collectionBtn = isIndex
    ? '<a href="#" id="nav-collection" onclick="event.preventDefault(); openCollection();" class="nav-cta nav-collection-link">♡ My Collection</a>'
    : '<a href="/" class="nav-cta">Find a Spot →</a>';

  // Mobile menu links
  var mobileFaqLink = isIndex
    ? '<a href="#" onclick="goToFaq(); closeNavMobile(); return false;" class="nav-mobile-link">FAQ</a>'
    : '<a href="/#faq" class="nav-mobile-link">FAQ</a>';

  var mobileCtaLink = isIndex
    ? '<a href="#" onclick="event.preventDefault(); openCollection(); closeNavMobile();" class="nav-mobile-cta-link">♡ My Collection</a>'
    : '<a href="/" class="nav-mobile-cta-link">Find a Spot →</a>';

  var hamburgerSvg =
    '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<line x1="0" y1="1" x2="16" y2="1" stroke="#1C1C1C" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="0" y1="6" x2="16" y2="6" stroke="#1C1C1C" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="0" y1="11" x2="16" y2="11" stroke="#1C1C1C" stroke-width="1.5" stroke-linecap="round"/>' +
    '</svg>';

  var backdrop = document.createElement('div');
  backdrop.id = 'nav-backdrop';
  backdrop.className = 'nav-backdrop';
  backdrop.addEventListener('click', function () {
    closeAllNavDropdowns();
  });
  document.body.appendChild(backdrop);

  var filterBackdrop = document.createElement('div');
  filterBackdrop.id = 'filter-backdrop';
  filterBackdrop.className = 'filter-backdrop';
  filterBackdrop.addEventListener('click', function () {
    closeAllFilterPanels();
  });
  document.body.appendChild(filterBackdrop);

  function closeAllNavDropdowns() {
    var dd = document.getElementById('nav-dest-dropdown');
    if (dd) dd.classList.remove('open');
    var menu = document.getElementById('nav-mobile-menu');
    if (menu) menu.classList.remove('open');
    backdrop.classList.remove('active');
    backdrop.classList.remove('mobile-dest-active');
  }

  function closeAllFilterPanels() {
    document.querySelectorAll('.results-inline-panel').forEach(function(p) { p.classList.remove('open'); });
    filterBackdrop.classList.remove('active');
  }

  var nav = document.createElement('nav');
  nav.id = 'navbar';
  nav.innerHTML =
    '<a href="' + logoHref + '" class="nav-logo"' + logoClick + '>Proposal Spots</a>' +
    '<div class="nav-links">' +
      '<div class="nav-destinations-wrap">' +
        '<a href="/destinations" class="nav-link-right nav-destinations-btn" onclick="if(window.innerWidth<=680){toggleDestDropdown();return false;}">' +
          'Destinations ' +
          '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>' +
        '</a>' +
        '<div class="nav-dest-dropdown" id="nav-dest-dropdown">' +
          '<div class="nav-dest-grid">' + destItems + '</div>' +
          '<div class="nav-dest-footer">' + viewAllDest + '</div>' +
        '</div>' +
      '</div>' +
      howItWorksLink +
      '<a href="/inspiration.html" class="' + inspirationClass + '">Inspiration</a>' +
      faqLink +
    '</div>' +
    '<div class="nav-right">' +
      collectionBtn +
      '<button class="nav-hamburger" id="nav-hamburger" onclick="toggleNavMobile(event)" aria-label="Menu">' +
        hamburgerSvg +
      '</button>' +
      '<div class="nav-mobile-menu" id="nav-mobile-menu">' +
        '<a href="/destinations" class="nav-mobile-link">Destinations</a>' +
        '<a href="/how-it-works" class="nav-mobile-link">How It Works</a>' +
        '<a href="/inspiration.html" class="nav-mobile-link">Inspiration</a>' +
        mobileFaqLink +
        '<div class="nav-mobile-divider"></div>' +
        mobileCtaLink +
      '</div>' +
    '</div>';

  // ── 4. Replace placeholder ────────────────────────────────────────────────────
  var placeholder = document.getElementById('nav-placeholder') || document.getElementById('nav-root');
  if (placeholder) {
    placeholder.parentNode.replaceChild(nav, placeholder);
  } else {
    document.body.insertBefore(nav, document.body.firstChild);
  }

  // ── 5a. Desktop destinations dropdown: mouseenter/mouseleave → backdrop ─────────
  var destWrap = nav.querySelector('.nav-destinations-wrap');
  if (destWrap) {
    destWrap.addEventListener('mouseenter', function () {
      var dd = document.getElementById('nav-dest-dropdown');
      if (dd) dd.classList.add('open');
      backdrop.classList.add('active');
    });
    destWrap.addEventListener('mouseleave', function () {
      var dd = document.getElementById('nav-dest-dropdown');
      if (dd) dd.classList.remove('open');
      backdrop.classList.remove('active');
    });
  }

  // ── 5b. Filter panel backdrop: wrap toggleDLPanel so backdrop tracks open state ─
  // nav.js runs defer (after inline scripts), so toggleDLPanel is already defined.
  (function wrapFilterToggle() {
    var origToggle = window.toggleDLPanel;
    if (typeof origToggle !== 'function') return;
    window.toggleDLPanel = function (panelId, pillId) {
      origToggle(panelId, pillId);
      var anyOpen = document.querySelector('.results-inline-panel.open');
      filterBackdrop.classList.toggle('active', !!anyOpen);
    };
  }());

  // ── 5. Scroll effect ──────────────────────────────────────────────────────────
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ── 6. Dropdown toggle (only define if index.html has not already) ────────────
  if (typeof window.toggleDestDropdown === 'undefined') {
    window.toggleDestDropdown = function () {
      var dd = document.getElementById('nav-dest-dropdown');
      if (dd) {
        var willOpen = !dd.classList.contains('open');
        dd.classList.toggle('open');
        backdrop.classList.toggle('active', willOpen);
        if (window.innerWidth <= 680) {
          backdrop.classList.toggle('mobile-dest-active', willOpen);
        }
      }
    };
  }

  // ── 7. Mobile menu toggle ─────────────────────────────────────────────────────
  window.toggleNavMobile = function (e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('nav-mobile-menu');
    if (menu) {
      var willOpen = !menu.classList.contains('open');
      menu.classList.toggle('open');
      backdrop.classList.toggle('active', willOpen);
    }
  };

  window.closeNavMobile = function () {
    var menu = document.getElementById('nav-mobile-menu');
    if (menu) menu.classList.remove('open');
    backdrop.classList.remove('active');
  };

  // ── 8. Load spot-links.js on homepage (Phase 1 spot page links) ───────────────
  if (isIndex) {
    var spotLinksEl = document.createElement('script');
    spotLinksEl.src = '/spot-links.js';
    document.body.appendChild(spotLinksEl);
  }

})();
