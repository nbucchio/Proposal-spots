/**
 * spot-links.js
 * Adds a "View Full Spot Page →" link to the existing spot drawer
 * without touching any existing code in index.html.
 *
 * HOW IT WORKS:
 * Wraps the existing openSpotDrawer() function so that every time
 * the drawer opens, it automatically injects the correct /spots/[slug]
 * link. Zero changes needed to the drawer HTML or the original function.
 *
 * TO INSTALL:
 * Add this ONE line to index.html, just before </body>:
 *   <script src="/spot-links.js"></script>
 */

(function () {

  // ── Slug helper (must match toSlug in spot.html exactly) ────────────
  function toSlug(name) {
    return (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ── Create the "View Full Page" link element (done once) ─────────────
  var link = document.createElement('a');
  link.id        = 'sd-full-page-link';
  link.href      = '#';
  link.target    = '_self';
  link.innerText = 'View Full Spot Page →';
  link.style.cssText = [
    'display:block',
    'font-family:"Jost",sans-serif',
    'font-size:11px',
    'font-weight:500',
    'letter-spacing:0.14em',
    'text-transform:uppercase',
    'color:var(--accent,#8C7B64)',
    'text-decoration:none',
    'padding:14px 0 2px',
    'border-top:1px solid var(--divider,#E4E0D8)',
    'margin-top:16px',
    'transition:color 0.18s',
    'cursor:pointer'
  ].join(';');
  link.addEventListener('mouseover', function () { this.style.color = 'var(--ink,#1C1C1C)'; });
  link.addEventListener('mouseout',  function () { this.style.color = 'var(--accent,#8C7B64)'; });

  // ── Inject the link into the drawer body when the DOM is ready ───────
  function injectLink() {
    // Try to find the drawer's body/content area
    // Looks for the section that contains sd-map-btn (last CTA button)
    var mapBtn  = document.getElementById('sd-map-btn');
    var bookBtn = document.getElementById('sd-book-btn');
    var anchor  = mapBtn || bookBtn;

    if (anchor && anchor.parentNode && !document.getElementById('sd-full-page-link')) {
      anchor.parentNode.appendChild(link);
    }
  }

  // ── Wrap openSpotDrawer to update the link href each time ────────────
  function patchOpenSpotDrawer() {
    if (typeof window.openSpotDrawer !== 'function') return false;

    var _original = window.openSpotDrawer;
    window.openSpotDrawer = function (recordId) {
      // Call the original first so the drawer populates normally
      _original.apply(this, arguments);

      // After the drawer has populated, find the spot name and build the URL
      var nameEl = document.getElementById('sd-name');
      if (nameEl) {
        var slug = toSlug(nameEl.textContent || nameEl.innerText || '');
        if (slug) {
          injectLink(); // ensure link is in the DOM
          var linkEl = document.getElementById('sd-full-page-link');
          if (linkEl) linkEl.href = '/spots/' + slug;
        }
      }
    };

    return true;
  }

  // ── Wait for openSpotDrawer to exist (it may be defined later) ───────
  var attempts = 0;
  var maxAttempts = 50; // 5 seconds total
  var interval = setInterval(function () {
    attempts++;
    if (patchOpenSpotDrawer()) {
      clearInterval(interval);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      console.warn('[spot-links.js] openSpotDrawer not found after 5s');
    }
  }, 100);

})();
