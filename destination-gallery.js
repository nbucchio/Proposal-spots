(function () {

  function buildItem(img) {
    var url = (img && img.url) || '';
    var alt = (img && img.alt) || '';
    if (!url) return '';
    // Escape quotes/brackets in alt to keep the attribute safe.
    var safeAlt = String(alt).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var safeUrl = String(url).replace(/"/g, '&quot;');
    return (
      '<a onclick="openLightbox(\'' + safeUrl.replace(/'/g, "\\'") + '\'); return false;" href="#">' +
        '<img src="' + safeUrl + '" alt="' + safeAlt + '">' +
      '</a>'
    );
  }

  function renderGallery(images) {
    if (!Array.isArray(images) || images.length === 0) return;
    var masonry = document.querySelector('.dest-gallery-masonry');
    if (!masonry) return;
    var html = images.map(buildItem).join('');
    if (!html) return;
    masonry.innerHTML = html;
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
