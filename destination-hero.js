(function () {

  // Inject the hero-video CSS once per page (the rule originally lived only in
  // tulum.html; other destination pages didn't have it, which made an injected
  // <video> render inline and break the layout).
  // .dest-landing-hero-video[data-video-loading] keeps the video transparent
  // until canplay fires, so the poster (= listing-card image) stays painted
  // underneath and the video crossfades in instead of hard-cutting on first frame.
  (function injectStyles() {
    if (document.getElementById('dest-hero-video-style')) return;
    var s = document.createElement('style');
    s.id = 'dest-hero-video-style';
    s.textContent =
      '.dest-landing-hero { position: relative; overflow: hidden; }' +
      '.dest-landing-hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; transition: opacity 260ms ease; }' +
      '.dest-landing-hero-video[data-video-loading] { opacity: 0; }' +
      '.dest-landing-hero > .dest-landing-hero-content { position: relative; z-index: 2; }';
    (document.head || document.documentElement).appendChild(s);
  }());

  // Preload an image URL and call cb when it's decoded (or errored/timed out).
  // Used so we only swap the hero background in once the new image is in cache,
  // avoiding a flash of broken/loading image.
  function preload(url, cb) {
    if (!url) { cb(); return; }
    var img = new Image();
    var done = false;
    var finish = function () { if (done) return; done = true; cb(); };
    img.onload = finish;
    img.onerror = finish;
    img.src = url;
    setTimeout(finish, 1500);
  }

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

  function applyVideo(hero, src, poster) {
    if (!hero || !src) return;
    if (poster) {
      hero.style.backgroundImage = 'url(' + poster + ')';
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
    } else {
      hero.style.backgroundImage = '';
    }
    var video = hero.querySelector('.dest-landing-hero-video');
    var isNew = !video;
    if (isNew) {
      video = document.createElement('video');
      video.className = 'dest-landing-hero-video';
      video.id = 'hero-video';
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('playsinline', '');
      if (poster) video.poster = poster;
      // Start invisible — fades in on canplay so we never hard-cut from
      // poster to the video's first frame.
      video.setAttribute('data-video-loading', '');
      hero.insertBefore(video, hero.firstChild);
    } else {
      if (poster) video.poster = poster;
      video.setAttribute('data-video-loading', '');
    }
    var reveal = function () { video.removeAttribute('data-video-loading'); };
    video.addEventListener('canplay', reveal, { once: true });
    // Safety net so we don't leave the video invisible forever if canplay never fires.
    setTimeout(reveal, 2500);

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

  function applyHeroPosition(position) {
    if (!position || position === 'center') return;
    var s = document.createElement('style');
    s.textContent = '.dest-landing-hero { background-position: ' + position + ' !important; }';
    (document.head || document.documentElement).appendChild(s);
  }

  // Last-resort hero image: the page's own <meta property="og:image"> tag.
  // Used when the API returns no match (e.g. Airtable slug mismatch like
  // 'Hawaii' vs 'hawaii') or the matched record has no hero image at all,
  // so the page is never left as a blank dark hero.
  function ogImageFallback() {
    var m = document.querySelector('meta[property="og:image"]');
    return (m && m.getAttribute('content')) || '';
  }

  function init() {
    var urlSlug = slugFromPath();
    if (!urlSlug && !window.__destSlug) return;
    var hero = document.querySelector('.dest-landing-hero');

    fetch('/api/destinations')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = (data && data.destinations) || [];
        var lower = function (s) { return String(s || '').toLowerCase(); };
        // Try the URL-derived slug first; if no match and the page declares
        // window.__destSlug (for cases where the Airtable slug differs from the
        // URL path, e.g. Airtable uses 'france' but the page is at /south-of-france),
        // try that as a fallback. Finally, fall back to a case-insensitive
        // match so e.g. an Airtable slug of 'Hawaii' still matches /destinations/hawaii.
        var match = list.find(function (d) { return d.destination_slug === urlSlug; });
        if (!match && window.__destSlug) {
          match = list.find(function (d) { return d.destination_slug === window.__destSlug; });
        }
        if (!match) {
          var lowerUrl = lower(urlSlug);
          var lowerOverride = lower(window.__destSlug);
          match = list.find(function (d) {
            var s = lower(d.destination_slug);
            return s && (s === lowerUrl || (lowerOverride && s === lowerOverride));
          });
        }
        if (!match) {
          // No Airtable record at all — paint the og:image so the hero
          // isn't a blank dark block.
          if (hero) {
            var og = ogImageFallback();
            if (og) preload(og, function () { applyImage(hero, og); });
          }
          return;
        }
        match.hero_image_fallback = upgradeImageUrl(match.hero_image_fallback) || ogImageFallback();
        window.__destination = match;
        window.__destFallbackImage = match.hero_image_fallback || '';
        if (hero) {
          if (match.hero_video_url) {
            // Preload the poster so the dark loading color → poster swap doesn't
            // briefly show a half-loaded image while the video itself buffers.
            preload(match.hero_image_fallback, function () {
              applyVideo(hero, match.hero_video_url, match.hero_image_fallback);
            });
          } else if (match.hero_image_fallback) {
            preload(match.hero_image_fallback, function () {
              applyImage(hero, match.hero_image_fallback);
              // Pages can set window.__destHeroPosition to override the default 'center'.
              applyHeroPosition(window.__destHeroPosition);
            });
          }
        }
        document.dispatchEvent(new CustomEvent('destination:ready', { detail: match }));
      })
      .catch(function (e) {
        console.error('[destination-hero]', e);
        // Same fallback on API failure.
        if (hero) {
          var og = ogImageFallback();
          if (og) preload(og, function () { applyImage(hero, og); });
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
