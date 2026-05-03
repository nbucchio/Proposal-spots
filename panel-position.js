/**
 * panel-position.js
 *
 * On mobile, filter-bar inline panels are position:fixed. The hardcoded
 * top:160px works when the filter bar is sticky at the top, but fails when
 * the bar is still in its natural flow position (e.g. hero still visible).
 * This script repositions every panel to just below its filter bar the
 * moment it opens, based on the bar's actual getBoundingClientRect().
 */
(function () {
  function positionPanel(panel) {
    // Only adjust fixed panels (mobile breakpoint sets position:fixed)
    if (window.getComputedStyle(panel).position !== 'fixed') return;
    var bar = panel.closest('.results-topbar') ||
              panel.closest('.dest-landing-filter-bar') ||
              document.querySelector('.results-topbar, .dest-landing-filter-bar');
    if (!bar) return;
    var rect = bar.getBoundingClientRect();
    panel.style.top = Math.round(rect.bottom + 8) + 'px';
  }

  function observe(panel) {
    new MutationObserver(function () {
      if (panel.classList.contains('open')) positionPanel(panel);
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    document.querySelectorAll('.results-inline-panel').forEach(observe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
