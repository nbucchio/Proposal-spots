(function () {

  function toSlug(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function patchOpenSpotDrawer() {
    if (typeof window.openSpotDrawer !== 'function') return false;

    window.openSpotDrawer = function (recordId) {
      var spots = typeof getFilteredSpots === 'function' ? getFilteredSpots() : [];
      var spot  = spots.find(function (s) { return s.id === recordId; });
      var name  = spot ? (spot.Name || spot.name || '') : '';
      // Prefer the Airtable "Slug" field; fall back to a slug from the name so
      // spots with a blank Slug field (e.g. already-indexed ones) still work.
      var slug  = spot ? (toSlug(spot.Slug || '') || toSlug(name)) : '';

      if (slug) {
        window.location.href = '/spots/' + slug;
      } else {
        console.warn('[spot-links.js] Spot not found for id:', recordId);
      }
    };

    return true;
  }

  var attempts = 0;
  var interval = setInterval(function () {
    attempts++;
    if (patchOpenSpotDrawer()) {
      clearInterval(interval);
    } else if (attempts >= 50) {
      clearInterval(interval);
    }
  }, 100);

})();
