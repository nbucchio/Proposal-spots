(function () {

  function buildItem(img) {
    var url = (img && img.url) || '';
    var alt = (img && img.alt) || '';
    if (!url) return '';
    // Escape quotes/brackets in alt to keep the attribute safe.
    var safeAlt = String(alt).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var safeUrl = String(url).replace(/"/g, '&quot;');
    // loading="eager" + fetchpriority="high" override any browser auto-lazy
    // intervention (Edge/Chromium will sometimes defer off-screen images and
    // then never load them inside CSS columns when intrinsic sizing is unknown).
    return (
      '<a onclick="openLightbox(\'' + safeUrl.replace(/'/g, "\\'") + '\'); return false;" href="#">' +
        '<img src="' + safeUrl + '" alt="' + safeAlt + '" loading="eager" fetchpriority="high" decoding="async">' +
      '</a>'
    );
  }

  function renderGallery(images) {
    if (!Array.isArray(images) || images.length === 0) return;
    var masonry = document.querySelector('.dest-gallery-masonry');
    if (!masonry) return;
    var html = images.map(buildItem).join('');
    if (!html) return;

    // Preload all images so the browser knows their intrinsic dimensions
    // before they're inserted into the masonry. Without this, CSS `columns`
    // layout can compute zero height for unloaded imgs and the browser then
    // refuses to upgrade them (the "lazy intervention" behaviour).
    var pending = images.length;
    var swapped = false;
    var swap = function () {
      if (swapped) return;
      swapped = true;
      masonry.innerHTML = html;
    };
    images.forEach(function (img) {
      var pre = new Image();
      pre.onload = pre.onerror = function () {
        pending--;
        if (pending === 0) swap();
      };
      pre.src = img.url;
    });
    // Safety net: render anyway after 2s in case some images are slow.
    setTimeout(swap, 2000);
  }

  function fromDestination(dest) {
    if (!dest) return;
    renderGallery(dest.gallery_images);
  }

  function init() {
    // If destination-hero.js already fetched and stored the record, use it now.
    if (window.__destination) {
      fromDestination(window.__destination);
    }
    // Otherwise (or as a backup), wait for the shared event from destination-hero.js.
    document.addEventListener('destination:ready', function (e) {
      fromDestination(e && e.detail);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
