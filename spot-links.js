/**
 * spot-links.js  —  Phase 1 SEO spot pages
 *
 * Intercepts openSpotDrawer() so that clicking any spot card on the
 * homepage navigates to its dedicated SEO page (/spots/slug) instead
 * of opening the in-page drawer.
 *
 * No changes to index.html needed — nav.js loads this automatically
 * on the homepage.
 */
(function () {

  // ── Slug helper (must match spot.html exactly) ──────────────────────────
  function toSlug(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ── Override openSpotDrawer to navigate to the dedicated spot page ───────
  function patchOpenSpotDrawer() {
    if (typeof window.openSpotDrawer !== 'function') return false;

    window.openSpotDrawer = function (recordId) {
      // Find the spot name from the allSpots global (populated by index.html)
      var spots = window.allSpots || [];
      var spot  = spots.find(function (s) { return s.id === recordId; });
      var name  = spot ? (spot.Name || spot.name || '') : '';

      if (name) {
        window.location.href = '/spots/' + toSlug(name);
      } else {
        console.warn('[spot-links.js] Spot name not found for id:', recordId);
        window.location.href = '/spots/' + recordId;
      }
    };

    return true;
  }

  // ── Wait up to 5s for openSpotDrawer to be defined ──────────────────────
  var attempts    = 0;
  var maxAttempts = 50;
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
