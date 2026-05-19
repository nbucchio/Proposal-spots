(function () {
  function _getStrip(imgEl) {
    return imgEl.querySelector('.sc-strip');
  }

  function _setIndex(imgEl, idx, animate) {
    var imgs = JSON.parse(imgEl.dataset.images || '[]');
    if (!imgs.length) return;
    idx = ((idx % imgs.length) + imgs.length) % imgs.length;
    imgEl.dataset.index = idx;
    var strip = _getStrip(imgEl);
    if (strip) {
      var w = imgEl.offsetWidth;
      strip.style.transition = animate ? 'transform 0.28s ease' : 'none';
      strip.style.transform = 'translateX(' + (-idx * w) + 'px)';
    }
    imgEl.querySelectorAll('.sc-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
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
    if (!_horiz && Math.abs(dy) > Math.abs(dx)) {
      _tEl = null;
      return;
    }
    _horiz = true;
    e.preventDefault();
    var idx = parseInt(_tEl.dataset.index || '0', 10);
    var w = _tEl.offsetWidth;
    var strip = _getStrip(_tEl);
    if (strip) strip.style.transform = 'translateX(' + (-idx * w + dx) + 'px)';
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
