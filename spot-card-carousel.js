(function () {
  function _getStrip(imgEl) { return imgEl.querySelector('.sc-strip'); }

  // Lazily prepend a clone of the last image to the strip so it can wrap
  // backward (image 0 -> last image), mirroring the trailing clone of
  // image 0 that already lets it wrap forward (last image -> image 0).
  function _ensureWrap(imgEl) {
    if (imgEl.dataset.scWrapped) return;
    var strip = _getStrip(imgEl);
    if (!strip) return;
    var frames = strip.querySelectorAll('.sc-frame');
    if (frames.length < 3) return; // need >=2 real images + the trailing clone
    var lastReal = frames[frames.length - 2];
    strip.insertBefore(lastReal.cloneNode(true), strip.firstChild);
    imgEl.dataset.scWrapped = '1';

    // Everything shifted one frame to the right — keep the currently
    // shown image in place.
    var idx = parseInt(imgEl.dataset.index || '0', 10);
    var w = imgEl.offsetWidth;
    var prevTransition = strip.style.transition;
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(' + (-(idx + 1) * w) + 'px)';
    void strip.offsetHeight;
    strip.style.transition = prevTransition;
  }

  function _setIndex(imgEl, idx, animate) {
    var imgs = JSON.parse(imgEl.dataset.images || '[]');
    var n = imgs.length;
    if (!n) return;

    _ensureWrap(imgEl);

    var strip = _getStrip(imgEl);
    var w = imgEl.offsetWidth;

    if (idx >= n) {
      // Forward wrap: animate to the trailing clone of frame 0, then silently reset
      imgEl.dataset.index = 0;
      imgEl.querySelectorAll('.sc-dot').forEach(function (d, i) { d.classList.toggle('active', i === 0); });
      if (!strip) return;
      strip.style.transition = animate ? 'transform 0.28s ease' : 'none';
      strip.style.transform = 'translateX(' + (-(n + 1) * w) + 'px)';
      if (animate) {
        function onWrapForwardEnd() {
          strip.removeEventListener('transitionend', onWrapForwardEnd);
          strip.style.transition = 'none';
          strip.style.transform = 'translateX(' + (-1 * w) + 'px)';
        }
        strip.addEventListener('transitionend', onWrapForwardEnd);
      }
      return;
    }

    if (idx < 0) {
      // Backward wrap: animate to the leading clone of the last frame, then silently reset
      var lastIdx = n - 1;
      imgEl.dataset.index = lastIdx;
      imgEl.querySelectorAll('.sc-dot').forEach(function (d, i) { d.classList.toggle('active', i === lastIdx); });
      if (!strip) return;
      strip.style.transition = animate ? 'transform 0.28s ease' : 'none';
      strip.style.transform = 'translateX(0px)';
      if (animate) {
        function onWrapBackwardEnd() {
          strip.removeEventListener('transitionend', onWrapBackwardEnd);
          strip.style.transition = 'none';
          strip.style.transform = 'translateX(' + (-n * w) + 'px)';
        }
        strip.addEventListener('transitionend', onWrapBackwardEnd);
      }
      return;
    }

    // Normal case: frame 0 is the leading clone of the last image, so the
    // real image at `idx` sits one frame further along the strip.
    imgEl.dataset.index = idx;
    imgEl.querySelectorAll('.sc-dot').forEach(function (d, i) { d.classList.toggle('active', i === idx); });
    if (strip) {
      strip.style.transition = animate ? 'transform 0.28s ease' : 'none';
      strip.style.transform = 'translateX(' + (-(idx + 1) * w) + 'px)';
    }
  }

  window.scPrev = function (btn) {
    var el = btn.closest('.spot-card-img');
    if (el) _setIndex(el, parseInt(el.dataset.index || '0', 10) - 1, true);
  };

  window.scNext = function (btn) {
    var el = btn.closest('.spot-card-img');
    if (el) _setIndex(el, parseInt(el.dataset.index || '0', 10) + 1, true);
  };

  var _tEl = null, _tx = 0, _ty = 0, _horiz = false;

  document.addEventListener('touchstart', function (e) {
    _tEl = e.target.closest('.spot-card-img[data-images]');
    if (!_tEl) return;
    _tx = e.changedTouches[0].clientX;
    _ty = e.changedTouches[0].clientY;
    _horiz = false;
    _ensureWrap(_tEl);
    var strip = _getStrip(_tEl);
    if (strip) strip.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!_tEl) return;
    var dx = e.changedTouches[0].clientX - _tx;
    var dy = e.changedTouches[0].clientY - _ty;
    if (!_horiz && Math.abs(dy) > Math.abs(dx)) { _tEl = null; return; }
    _horiz = true;
    e.preventDefault();
    var idx = parseInt(_tEl.dataset.index || '0', 10);
    var w = _tEl.offsetWidth;
    var strip = _getStrip(_tEl);
    if (strip) strip.style.transform = 'translateX(' + (-(idx + 1) * w + dx) + 'px)';
  }, { passive: false });

  document.addEventListener('touchend', function (e) {
    if (!_tEl) return;
    var dx = e.changedTouches[0].clientX - _tx;
    var idx = parseInt(_tEl.dataset.index || '0', 10);
    var newIdx = (Math.abs(dx) > 40) ? idx + (dx < 0 ? 1 : -1) : idx;
    _setIndex(_tEl, newIdx, true);
    _tEl = null;
    _horiz = false;
  }, { passive: true });
})();
