(function () {
  function _getStrip(imgEl) { return imgEl.querySelector('.sc-strip'); }

  function _setIndex(imgEl, idx, animate) {
    var imgs = JSON.parse(imgEl.dataset.images || '[]');
    var n = imgs.length;
    if (!n) return;

    var strip = _getStrip(imgEl);
    var w = imgEl.offsetWidth;

    if (idx >= n) {
      // Forward wrap: animate to the appended clone of frame 0, then silently reset to frame 0
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
      // Backward wrap: animate to the prepended clone of the last frame, then silently reset to the last frame
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

    // Normal case: frame 0 is the prepended clone of the last image, so the
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
