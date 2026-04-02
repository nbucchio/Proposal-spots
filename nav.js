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
    '.nav-destinations-wrap:hover .nav-dest-dropdown { display: block; }',
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
    '  transition: background 0.15s;',
    '}',
    '.nav-dest-grid a:hover { background: #EDEAE2; }',
    '.nav-dest-grid a span { color: #9E9890; font-size: 10px; font-weight: 300; }',
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
    '@media (max-width: 680px) {',
    '  nav#navbar { padding: 0 6px 0 18px; }',
    '  .nav-link-right { padding: 7px 10px; font-size: 10px; }',
    '  .nav-cta { padding: 9px 16px; font-size: 10px; }',
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
    ['Amalfi Coast', 'Italy', 'amalfi-coast'],
    ['Santorini', 'Greece', 'santorini'],
    ['Bali', 'Indonesia', 'bali'],
    ['Tulum', 'Mexico', 'tulum'],
    ['Maldives', 'Indian Ocean', 'maldives'],
    ['Costa Rica', 'Central America', 'costa-rica'],
    ['Nicaragua', 'Central America', 'nicaragua'],
    ['Algarve', 'Portugal', 'portugal'],
    ['South of France', 'France', 'south-of-france'],
    ['Switzerland', 'Alps', 'switzerland'],
    ['New York', 'USA', 'new-york']
  ];

  var destItems = destinations.map(function (d) {
    return '<a href="/destinations/' + d[2] + '">' + d[0] + ' <span>' + d[1] + '</span></a>';
  }).join('');

  var viewAllDest = '<a href="/destinations" style="color:#A55A4A;font-weight:500">View all destinations \u2192</a>';

  var howItWorksLink = isIndex
    ? '<a href="#" id="nav-how-it-works" onclick="showPage(\'how-it-works\'); return false;" class="nav-link-right">How It Works</a>'
    : '<a href="/#how-it-works" class="nav-link-right">How It Works</a>';

  var faqLink = isIndex
    ? '<a href="#" id="nav-faq" onclick="goToFaq(); return false;" class="nav-link-right">FAQ</a>'
    : '<a href="/#faq" class="nav-link-right">FAQ</a>';

  var inspirationClass = 'nav-link-right' + ((isInspiration || isStoriesSection) ? ' nav-active' : '');

  var collectionBtn = isIndex
    ? '<a href="#" id="nav-collection" onclick="event.preventDefault(); openCollection();" class="nav-cta nav-collection-link">\u2661 My Collection</a>'
    : '<a href="/" class="nav-cta">Find a Spot \u2192</a>';

  var nav = document.createElement('nav');
  nav.id = 'navbar';
  nav.innerHTML =
    '<a href="' + logoHref + '" class="nav-logo"' + logoClick + '>Proposal Spots</a>' +
    '<div class="nav-links">' +
      '<div class="nav-destinations-wrap">' +
        '<a href="/destinations" class="nav-link-right nav-destinations-btn">' +
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
    '<div class="nav-right">' + collectionBtn + '</div>';

  // ── 4. Replace placeholder ────────────────────────────────────────────────────
  var placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.parentNode.replaceChild(nav, placeholder);
  }

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
      if (dd) dd.classList.toggle('open');
    };
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    var dd = document.getElementById('nav-dest-dropdown');
    if (!dd) return;
    var wrap = document.querySelector('.nav-destinations-wrap');
    if (wrap && wrap.contains(e.target)) return;
    dd.classList.remove('open');
  });

  // ── 7. Load spot-links.js on homepage (Phase 1 spot page links) ───────────────
  if (isIndex) {
    var spotLinksEl = document.createElement('script');
    spotLinksEl.src = '/spot-links.js';
    document.body.appendChild(spotLinksEl);
  }

})();
