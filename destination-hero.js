(function () {

  // Inject the hero-video CSS once per page (the rule originally lived only in
  // tulum.html; other destination pages didn't have it, which made an injected
  // <video> render inline and break the layout).
  (function injectStyles() {
    if (document.getElementById('dest-hero-video-style')) return;
    var s = document.createElement('style');
    s.id = 'dest-hero-video-style';
    s.textContent =
      '.dest-landing-hero { position: relative; overflow: hidden; }' +
      '.dest-landing-hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }' +
      '.dest-landing-hero > *:not(.dest-landing-hero-video) { position: relative; z-index: 2; }';
    (document.head || document.documentElement).appendChild(s);
  }());

  // Bump small/low-quality Unsplash thumbnails up to a hero-quality size.
  function upgradeImageUrl(url) {
    if (!url) return url;
    if (!/images\.unsplash\.com/.test(url)) return url;
    try {
      var u = new URL(url);
      u.searchParams.set('w', '2000');
      u.searchParams.set('q', '85');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function slugFromPath() {
    var path = window.location.pathname.replace(/\/+$/, '');
    var m = path.match(/\/destinations\/([^/]+?)(?:\.html)?$/);
    return m ? m[1] : '';
  }

  function applyImage(hero, url) {
    if (!hero || !url) return;
    var video = hero.querySelector('.dest-landing-hero-video');
    if (video) video.remove();
    hero.style.backgroundImage = 'url(' + url + ')';
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }

  function ensureHls(cb) {
    if (window.Hls) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function applyVideo(hero, src) {
    if (!hero || !src) return;
    hero.style.backgroundImage = '';
    var video = hero.querySelector('.dest-landing-hero-video');
    if (!video) {
      video = document.createElement('video');
      video.className = 'dest-landing-hero-video';
      video.id = 'hero-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      hero.insertBefore(video, hero.firstChild);
    }
    var isHls = /\.m3u8(\?|$)/i.test(src);
    if (isHls) {
      ensureHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ lowLatencyMode: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () { video.play().catch(function(){}); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.addEventListener('loadedmetadata', function () { video.play().catch(function(){}); }, { once: true });
        }
      });
    } else {
      video.src = src;
      video.addEventListener('loadedmetadata', function () { video.play().catch(function(){}); }, { once: true });
    }
  }

  function init() {
    var slug = slugFromPath();
    if (!slug) return;
    var hero = document.querySelector('.dest-landing-hero');

    fetch('/api/destinations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = (data && data.destinations) || [];
        var match = list.find(function (d) { return d.destination_slug === slug; });
        if (!match) return;
        match.hero_image_fallback = upgradeImageUrl(match.hero_image_fallback);
        window.__destination = match;
        window.__destFallbackImage = match.hero_image_fallback || '';
        if (hero) {
          if (match.hero_video_url) {
            applyVideo(hero, match.hero_video_url);
          } else if (match.hero_image_fallback) {
            applyImage(hero, match.hero_image_fallback);
          }
        }
        document.dispatchEvent(new CustomEvent('destination:ready', { detail: match }));
      })
      .catch(function (e) { console.error('[destination-hero]', e); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
