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
    '  padding: 26px 18px 16px;',
    '  min-width: 540px;',
    '  box-shadow: 0 16px 48px rgba(28,28,28,0.12);',
    '  z-index: 9000;',
    '}',
    '.nav-dest-dropdown.open { display: block; }',
    /* ── Two-pane mega-menu (desktop): continents left, spots right ── */
    '.nav-dest-panes {',
    '  display: grid;',
    '  grid-template-columns: 176px 1fr;',
    '  gap: 14px;',
    '}',
    '.nav-dest-continents {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 1px;',
    '  border-right: 1px solid #E4E0D8;',
    '  padding-right: 12px;',
    '}',
    '.nav-continent-btn {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 12px;',
    '  font-weight: 400;',
    '  color: #6B6660;',
    '  letter-spacing: 0.04em;',
    '  text-align: left;',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  padding: 9px 12px;',
    '  border-radius: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 8px;',
    '  transition: background 0.15s, color 0.15s;',
    '}',
    '.nav-continent-btn:hover { background: #EDEAE2; color: #1C1C1C; }',
    '.nav-continent-btn.active { background: #EDEAE2; color: #1C1C1C; font-weight: 500; }',
    '.nav-continent-btn .nav-continent-caret { opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }',
    '.nav-continent-btn.active .nav-continent-caret { opacity: 1; }',
    '.nav-dest-spots { min-height: 180px; }',
    '.nav-dest-grid {',
    '  display: grid;',
    '  grid-template-columns: 1fr 1fr;',
    '  gap: 2px;',
    '  align-content: start;',
    '}',
    '.nav-dest-panel { display: none; }',
    '.nav-dest-panel.active { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; align-content: start; }',
    '.nav-dest-grid a, .nav-dest-panel a {',
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
    '.nav-dest-grid a:hover, .nav-dest-panel a:hover { background: #EDEAE2; }',
    '.nav-dest-grid a span, .nav-dest-panel a span { color: #9E9890; font-size: 10px; font-weight: 300; text-align: right; flex-shrink: 0; }',
    '.nav-dest-grid a.coming-soon, .nav-dest-panel a.coming-soon { color: #A55A4A; }',
    '.nav-dest-grid a.coming-soon:hover, .nav-dest-panel a.coming-soon:hover { background: rgba(165,90,74,0.06); }',
    '.nav-dest-grid a .nav-soon-tag, .nav-dest-panel a .nav-soon-tag {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 8px;',
    '  font-weight: 400;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: #A55A4A;',
    '  border: 1px solid rgba(165,90,74,0.35);',
    '  border-radius: 10px;',
    '  padding: 2px 8px;',
    '  white-space: nowrap;',
    '  flex-shrink: 0;',
    '  text-align: center;',
    '}',
    '.nav-dest-soon-label {',
    '  grid-column: 1 / -1;',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 9px;',
    '  font-weight: 400;',
    '  letter-spacing: 0.16em;',
    '  text-transform: uppercase;',
    '  color: #A55A4A;',
    '  border-top: 1px solid #D8D2C8;',
    '  margin-top: 6px;',
    '  padding: 12px 12px 4px;',
    '}',
    '.nav-dest-footer {',
    '  border-top: 1px solid #D8D2C8;',
    '  margin-top: 16px;',
    '  padding-top: 14px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 10px;',
    '}',
    '.nav-dest-footer a {',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 10px;',
    '  font-weight: 500;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  padding: 9px 16px;',
    '  border-radius: 100px;',
    '  transition: background 0.15s, color 0.15s, border-color 0.15s;',
    '}',
    '.nav-dest-footer a.nav-dest-elsewhere {',
    '  color: #6B6660;',
    '  border: 1px solid #D8D2C8;',
    '}',
    '.nav-dest-footer a.nav-dest-elsewhere:hover { color: #1C1C1C; background: #EDEAE2; border-color: #C9C2B6; }',
    '.nav-dest-footer a.nav-dest-viewall {',
    '  color: #FDFCFA;',
    '  background: #A55A4A;',
    '}',
    '.nav-dest-footer a.nav-dest-viewall:hover { background: #8C4C3E; }',
    /* ── Mobile accordion: continents stack, tap to expand spots ── */
    /* On desktop the group wrapper is layout-transparent so the active panel */
    /* fills the spots column directly; the accordion chrome only shows mobile. */
    '.nav-continent-group { display: contents; }',
    '.nav-continent-accordion-btn {',
    '  display: none;',
    '  width: 100%;',
    '  font-family: "Jost", sans-serif;',
    '  font-size: 13px;',
    '  font-weight: 500;',
    '  color: #1C1C1C;',
    '  letter-spacing: 0.03em;',
    '  background: none;',
    '  border: none;',
    '  cursor: pointer;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 14px 8px;',
    '}',
    '.nav-continent-accordion-btn .nav-acc-caret { transition: transform 0.2s; flex-shrink: 0; }',
    '.nav-continent-group.open .nav-acc-caret { transform: rotate(180deg); }',
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
    '  nav#navbar { padding: 0 10px; display: flex; align-items: center; justify-content: space-between; }',
    /* Carrying Map as well as Destinations leaves no slack at 320px, so the
       logo gives up the padding it was only using decoratively. */
    '  .nav-logo { font-size: 9px; letter-spacing: 0.14em; padding-left: 6px; }',
    '  .nav-link-right:not(.nav-destinations-btn):not(.nav-map-btn) { display: none; }',
    '  .nav-destinations-btn { font-size: 12px; padding: 7px 7px; }',
    '  .nav-map-btn { font-size: 12px; padding: 7px 7px; }',
    '  .nav-links { gap: 0; flex: 0 1 auto; min-width: 0; }',
    '  .nav-right { flex: 0 0 auto; }',
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
    /* Collapse the two-pane desktop layout into a single-column accordion */
    '  .nav-dest-panes { display: block; }',
    '  .nav-dest-continents { display: none; }',
    '  .nav-dest-spots { min-height: 0; }',
    '  .nav-continent-group { display: block; border-bottom: 1px solid #EDEAE2; }',
    '  .nav-continent-group:last-child { border-bottom: none; }',
    '  .nav-continent-accordion-btn { display: flex; }',
    /* Spot panels are hidden by default on mobile; only the open group shows */
    '  .nav-dest-panel, .nav-dest-panel.active { display: none; }',
    '  .nav-continent-group.open .nav-dest-panel, .nav-continent-group.open .nav-dest-panel.active {',
    '    display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 2px 0 12px;',
    '  }',
    '  .nav-dest-panel a { min-height: 48px; align-items: center; font-size: 12px; padding: 10px 8px; }',
    '  .nav-dest-panel a span { font-size: 9px; }',
    '  .nav-dest-footer { flex-direction: column; gap: 8px; }',
    '  .nav-dest-footer a { width: 100%; text-align: center; }',
    '  .nav-backdrop.mobile-dest-active { z-index: 10001; }',
    '}',
    '@media (max-width: 360px) {',
    /* Take the last few pixels out of padding, not out of the tap targets. */
    '  nav#navbar { padding: 0 6px; }',
    '  .nav-logo { font-size: 8px; letter-spacing: 0.1em; padding-left: 0; }',
    '  .nav-destinations-btn, .nav-map-btn { font-size: 11px; padding: 8px 5px; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // ── 2. Detect page ────────────────────────────────────────────────────────────
  var path = window.location.pathname;
  var isIndex = path === '/' || path === '/index.html';
  var isInspiration = path === '/inspiration.html' || path.endsWith('inspiration.html');
  var isStoriesSection = path.startsWith('/stories') || path.endsWith('stories.html');
  var isMap = path === '/map' || path.endsWith('map.html');

  // ── 3. Build nav HTML ─────────────────────────────────────────────────────────
  var logoHref = isIndex ? '#' : '/';
  var logoClick = isIndex ? ' onclick="showPage(\'home\'); return false;"' : '';

  // Destinations populated asynchronously from /api/destinations.
  var destItems = '';

  var viewAllDest = '<a href="/destinations" class="nav-dest-viewall">View all destinations →</a>';

  // "Elsewhere": newly onboarded spots that don't yet have a dedicated page.
  var elsewhereLink = '<a href="/elsewhere" class="nav-dest-elsewhere">Elsewhere — newly added spots →</a>';

  var howItWorksLink = '<a href="/how-it-works" class="nav-link-right">How It Works</a>';

  var faqLink = isIndex
    ? '<a href="#" id="nav-faq" onclick="goToFaq(); return false;" class="nav-link-right">FAQ</a>'
    : '<a href="/#faq" class="nav-link-right">FAQ</a>';

  var mapClass = 'nav-link-right nav-map-btn' + (isMap ? ' nav-active' : '');

  var inspirationClass = 'nav-link-right' + ((isInspiration || isStoriesSection) ? ' nav-active' : '');

  var collectionBtn = isIndex
    ? '<a href="#" onclick="event.preventDefault(); showPage(\'home\');" class="nav-cta">Find Your Spot</a>'
    : '<a href="/" class="nav-cta">Find Your Spot</a>';

  // Mobile menu links
  var mobileFaqLink = isIndex
    ? '<a href="#" onclick="goToFaq(); closeNavMobile(); return false;" class="nav-mobile-link">FAQ</a>'
    : '<a href="/#faq" class="nav-mobile-link">FAQ</a>';

  var mobileCtaLink = isIndex
    ? '<a href="#" onclick="event.preventDefault(); showPage(\'home\'); closeNavMobile();" class="nav-mobile-cta-link">Find Your Spot</a>'
    : '<a href="/" class="nav-mobile-cta-link">Find Your Spot</a>';

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
          '<div class="nav-dest-panes">' +
            '<div class="nav-dest-continents" id="nav-dest-continents"></div>' +
            '<div class="nav-dest-spots" id="nav-dest-spots">' + destItems + '</div>' +
          '</div>' +
          '<div class="nav-dest-footer">' + elsewhereLink + viewAllDest + '</div>' +
        '</div>' +
      '</div>' +
      '<a href="/map" class="' + mapClass + '">Map</a>' +
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
        '<a href="/elsewhere" class="nav-mobile-link">Elsewhere</a>' +
        '<a href="/map" class="nav-mobile-link">Map</a>' +
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

  // ── Populate destinations dropdown from Airtable, grouped by continent ───────
  (function loadNavDestinations() {
    // Preferred display order; anything not listed is appended alphabetically so
    // a new/unexpected continent value never disappears from the menu.
    var CONTINENT_ORDER = [
      'Europe',
      'North America',
      'Central America',
      'South America',
      'Asia',
      'Africa',
      'Oceania'
    ];
    var OTHER_LABEL = 'Elsewhere';

    var escAttr = function (s) {
      return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
                      .replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var slugifyContinent = function (name) {
      return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';
    };

    var availableItem = function (d) {
      return '<a href="/destinations/' + encodeURIComponent(d.destination_slug) + '">' +
             (d.display_name || '') + '</a>';
    };
    var comingSoonItem = function (d) {
      return '<a class="coming-soon" href="/destinations/' + encodeURIComponent(d.destination_slug) + '">' +
             (d.display_name || '') +
             ' <span class="nav-soon-tag">Soon</span></a>';
    };

    fetch('/api/destinations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = (data && data.destinations) || [];
        var railEl  = document.getElementById('nav-dest-continents');
        var spotsEl = document.getElementById('nav-dest-spots');
        if (!spotsEl) return;

        // Group destinations by continent, preserving the API's nav_order sort.
        var groups = {};      // continent name -> { available:[], comingSoon:[] }
        list.forEach(function (d) {
          var cont = (d.Continent || '').trim() || OTHER_LABEL;
          if (!groups[cont]) groups[cont] = { available: [], comingSoon: [] };
          (d.coming_soon ? groups[cont].comingSoon : groups[cont].available).push(d);
        });

        // Order the continents: preferred order first, then any extras A–Z.
        var present = Object.keys(groups);
        var ordered = CONTINENT_ORDER.filter(function (c) { return groups[c]; });
        present.filter(function (c) { return CONTINENT_ORDER.indexOf(c) === -1; })
               .sort()
               .forEach(function (c) { ordered.push(c); });

        if (!ordered.length) { spotsEl.innerHTML = ''; return; }

        // Build the spot panel for one continent (available, then coming-soon).
        var panelBody = function (g) {
          var html = g.available.map(availableItem).join('');
          if (g.comingSoon.length) {
            html += '<div class="nav-dest-soon-label">Coming Soon</div>';
            html += g.comingSoon.map(comingSoonItem).join('');
          }
          return html;
        };

        var railHtml  = '';
        var spotsHtml = '';
        ordered.forEach(function (cont, i) {
          var id = 'nav-cont-' + slugifyContinent(cont);
          var active = i === 0 ? ' active' : '';
          var open = i === 0 ? ' open' : '';   // first group starts open on mobile

          // Desktop left-rail button
          railHtml +=
            '<button type="button" class="nav-continent-btn' + active + '" data-panel="' + id + '">' +
              escAttr(cont) +
              '<svg class="nav-continent-caret" width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 2l4 4-4 4"/></svg>' +
            '</button>';

          // Spots column: a mobile accordion header + the panel (shared markup).
          spotsHtml +=
            '<div class="nav-continent-group' + open + '">' +
              '<button type="button" class="nav-continent-accordion-btn" data-group>' +
                escAttr(cont) +
                '<svg class="nav-acc-caret" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>' +
              '</button>' +
              '<div class="nav-dest-panel' + active + '" id="' + id + '">' + panelBody(groups[cont]) + '</div>' +
            '</div>';
        });

        if (railEl) railEl.innerHTML = railHtml;
        spotsEl.innerHTML = spotsHtml;

        // Desktop: hovering (or focusing) a continent swaps the active panel.
        if (railEl) {
          var activatePanel = function (btn) {
            var targetId = btn.getAttribute('data-panel');
            railEl.querySelectorAll('.nav-continent-btn').forEach(function (b) {
              b.classList.toggle('active', b === btn);
            });
            spotsEl.querySelectorAll('.nav-dest-panel').forEach(function (p) {
              p.classList.toggle('active', p.id === targetId);
            });
          };
          railEl.querySelectorAll('.nav-continent-btn').forEach(function (btn) {
            btn.addEventListener('mouseenter', function () { activatePanel(btn); });
            btn.addEventListener('focus', function () { activatePanel(btn); });
            btn.addEventListener('click', function () { activatePanel(btn); });
          });
        }

        // Mobile: tapping an accordion header toggles that continent's group.
        spotsEl.querySelectorAll('.nav-continent-accordion-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var group = btn.parentNode;
            group.classList.toggle('open');
          });
        });
      })
      .catch(function (e) { console.error('[nav] destinations load failed', e); });
  }());

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

  // ── 5b. Filter panel backdrop: wrap filter toggles so backdrop tracks open state ─
  // On destination pages nav.js is deferred, so functions are already defined.
  // On index.html nav.js is NOT deferred, so toggleResultsPanel may not exist yet —
  // in that case we defer the wrap to DOMContentLoaded.
  function wrapWithBackdrop(fnName) {
    function doWrap() {
      var orig = window[fnName];
      if (typeof orig !== 'function') return;
      window[fnName] = function (panelId, pillId) {
        orig(panelId, pillId);
        var anyOpen = document.querySelector('.results-inline-panel.open');
        filterBackdrop.classList.toggle('active', !!anyOpen);
      };
    }
    if (typeof window[fnName] === 'function') {
      doWrap();
    } else {
      document.addEventListener('DOMContentLoaded', doWrap);
    }
  }
  wrapWithBackdrop('toggleDLPanel');
  wrapWithBackdrop('toggleResultsPanel');

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
