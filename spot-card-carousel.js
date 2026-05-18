(function () {
  function _scApply(imgEl, idx) {
    var imgs = JSON.parse(imgEl.dataset.images || '[]');
    if (!imgs.length) return;
    idx = ((idx % imgs.length) + imgs.length) % imgs.length;
    imgEl.dataset.index = idx;
    var bg = imgEl.querySelector('.img-bg');
    if (bg) bg.style.backgroundImage = "url('" + imgs[idx] + "')";
    imgEl.querySelectorAll('.sc-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  window.scPrev = function (btn) {
    var el = btn.closest('.spot-card-img');
    if (el) _scApply(el, parseInt(el.dataset.index || '0', 10) - 1);
  };

  window.scNext = function (btn) {
    var el = btn.closest('.spot-card-img');
    if (el) _scApply(el, parseInt(el.dataset.index || '0', 10) + 1);
  };

  var _tEl = null, _tx = 0, _ty = 0;

  document.addEventListener('touchstart', function (e) {
    _tEl = e.target.closest('.spot-card-img[data-images]');
    if (!_tEl) return;
    _tx = e.changedTouches[0].clientX;
    _ty = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!_tEl) return;
    var dx = e.changedTouches[0].clientX - _tx;
    var dy = e.changedTouches[0].clientY - _ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      _scApply(_tEl, parseInt(_tEl.dataset.index || '0', 10) + (dx < 0 ? 1 : -1));
    }
    _tEl = null;
  }, { passive: true });
})();
