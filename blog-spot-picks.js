/*
 * blog-spot-picks.js — reusable "featured spots" row for blog posts.
 *
 * Drop-in usage inside any blog post body:
 *
 *   <section class="blog-spot-row"
 *            data-spots="slug-one, slug-two, slug-three"
 *            data-eyebrow="A few of our favorites"
 *            data-title="Where these setups come to life"></section>
 *   <script src="/blog-spot-picks.js" defer></script>
 *
 * - data-spots : comma-separated spot slugs (the Airtable "Slug" field is
 *   preferred; a name-based slug also resolves, so either form works).
 * - data-eyebrow / data-title : optional. Sensible defaults are used if omitted.
 *
 * The row pulls live from /api/spots, so photos / prices / names stay in sync
 * with Airtable automatically — nothing about a spot is hard-coded here. Cards
 * mirror the destination-page spot cards and link to /spots/{slug}.
 */
(function () {
  'use strict';

  var rows = Array.prototype.slice.call(document.querySelectorAll('.blog-spot-row'));
  if (!rows.length) return;

  injectStyles();

  // ---- helpers (mirrored from the destination pages) ----------------------

  function toSlug(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function optimizeAirtableImage(url, width) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('airtableusercontent.com')) return url;
    var onProd = /(^|\.)proposalspots\.com$/.test(location.hostname);
    var base = onProd ? '' : 'https://www.proposalspots.com';
    return base + '/cdn-cgi/image/width=' + (width || 800) + ',format=webp,quality=80/' + url;
  }

  var FX_TO_USD = {
    USD: 1, EUR: 1.08, GBP: 1.27, IDR: 0.000063, MXN: 0.055, CHF: 1.13,
    CRC: 0.0019, NIO: 0.027, AUD: 0.66, CAD: 0.74, JPY: 0.0067, THB: 0.028, MVR: 0.065
  };
  function formatStartingPrice(amount, ccy) {
    var usd = amount * (FX_TO_USD[ccy] != null ? FX_TO_USD[ccy] : 1);
    var floored = Math.floor(usd / 10) * 10;
    return '$' + floored.toLocaleString() + '+';
  }
  function momentStartingPriceText(s) {
    var pkgs = Array.isArray(s.packages) ? s.packages : [];
    var moment = pkgs.find(function (p) { return p && p['Tier Name'] === 'The Moment'; });
    var price = (moment && moment.Price != null && moment.Price !== '') ? moment.Price : null;
    if (price == null && s['Price Moment'] != null && s['Price Moment'] !== '') price = s['Price Moment'];
    if (price == null) return '';
    return formatStartingPrice(Number(price), s['Price Currency']);
  }

  function attachUrl(v) {
    if (!v) return null;
    if (Array.isArray(v)) return (v[0] && (v[0].url || v[0])) || null;
    if (typeof v === 'object') return v.url || null;
    return v;
  }

  function normalizeSpot(r) {
    var f = r.fields || r;
    var rawPrivacy = f['Privacy'] || '';
    var privacy = rawPrivacy.includes('Private') ? 'Private'
      : rawPrivacy.includes('Light') ? 'Light Crowd'
      : rawPrivacy.includes('Moderate') ? 'Moderate Crowd'
      : rawPrivacy.includes('Everyone') ? 'Everyone Will See'
      : rawPrivacy;
    var rawBudget = f['Budget'] || '';
    var budget = rawBudget === 'Moderate' ? 'Premium'
      : rawBudget === 'Expensive' ? 'Luxury'
      : rawBudget;
    return {
      id: r.id || '',
      Slug: f['Slug'] || f['slug'] || '',
      Name: f['Spot Name'] || f['Name'] || '',
      Country: f['Country'] || '',
      Region: f['Region / Town'] || f['Region'] || '',
      Vibe: f['Vibe'] || '',
      Privacy: privacy,
      Budget: budget,
      'Price Moment': f['Price Moment'] != null ? f['Price Moment'] : null,
      'Price Currency': f['Price Currency'] || null,
      'Spot Card Photo': attachUrl(f['Spot Card Photo']),
      'Cover Photo': attachUrl(f['Cover Photo']),
      'Card Position': f['Card Position'] || 'center center',
      badge: f['Badge'] || null,
      coverGradient: f['Cover Gradient'] || 'linear-gradient(160deg,#28342c,#1e2835)',
      packages: Array.isArray(r.packages) ? r.packages : []
    };
  }

  function buildCard(s) {
    var cardPhoto = optimizeAirtableImage(s['Spot Card Photo'] || s['Cover Photo'] || '');
    var imgStyle = cardPhoto
      ? "background-image:url('" + cardPhoto.replace(/'/g, "\\'") + "');background-size:cover;background-position:" + s['Card Position'] + ";"
      : 'background:' + s.coverGradient + ';';
    var badge = s.badge ? '<span class="bsp-badge">' + esc(s.badge) + '</span>' : '';
    var vibe = Array.isArray(s.Vibe) ? s.Vibe[0] : (s.Vibe || '');
    var price = momentStartingPriceText(s) || s.Budget || '';
    var slug = toSlug(s.Slug) || toSlug(s.Name) || s.id;
    var loc = [s.Region, s.Country].filter(Boolean).join(', ');

    return '' +
      '<a class="bsp-card" href="/spots/' + slug + '">' +
        '<div class="bsp-card-img" style="' + imgStyle + '">' + badge + '</div>' +
        '<div class="bsp-card-name">' + esc(s.Name) + '</div>' +
        '<div class="bsp-card-location">' + esc(loc) + '</div>' +
        '<div class="bsp-card-body">' +
          '<div class="bsp-strip-item"><span>' + esc(s.Privacy) + '</span></div>' +
          '<div class="bsp-strip-divider"></div>' +
          '<div class="bsp-strip-item"><span>' + esc(price) + '</span></div>' +
          '<div class="bsp-strip-divider"></div>' +
          '<div class="bsp-strip-item"><span>' + esc(vibe) + '</span></div>' +
        '</div>' +
      '</a>';
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- fetch once, then render every row ----------------------------------

  fetch('/api/spots')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var records = (data && data.records) || data || [];
      var spots = records.map(normalizeSpot);

      // Index by both the Slug field and a name-derived slug for robust lookup.
      var byKey = {};
      spots.forEach(function (s) {
        if (s.Slug) byKey[toSlug(s.Slug)] = s;
        if (s.Name) { var nk = toSlug(s.Name); if (!byKey[nk]) byKey[nk] = s; }
      });

      rows.forEach(function (row) { renderRow(row, byKey); });
    })
    .catch(function (err) {
      console.error('[blog-spot-picks] Failed to load spots:', err);
      rows.forEach(function (row) { row.style.display = 'none'; });
    });

  function renderRow(row, byKey) {
    var wanted = (row.getAttribute('data-spots') || '')
      .split(',').map(function (x) { return toSlug(x.trim()); }).filter(Boolean);

    var picked = [];
    wanted.forEach(function (key) {
      var s = byKey[key];
      if (s && picked.indexOf(s) === -1) picked.push(s);
      else if (!s) console.warn('[blog-spot-picks] No published spot for slug:', key);
    });

    if (!picked.length) { row.style.display = 'none'; return; }

    var eyebrow = row.getAttribute('data-eyebrow') || 'A few of our favorites';
    var title = row.getAttribute('data-title') || 'Where these setups come to life';

    row.innerHTML = '' +
      '<div class="bsp-inner">' +
        '<div class="bsp-head">' +
          '<span class="bsp-eyebrow">' + esc(eyebrow) + '</span>' +
          '<h2 class="bsp-title">' + esc(title) + '</h2>' +
        '</div>' +
        '<div class="bsp-grid" data-count="' + picked.length + '">' +
          picked.map(buildCard).join('') +
        '</div>' +
      '</div>';
    row.classList.add('bsp-ready');
  }

  // ---- styles (injected once) ---------------------------------------------

  function injectStyles() {
    if (document.getElementById('bsp-styles')) return;
    var css = [
      '.blog-spot-row{ display:none; }',
      '.blog-spot-row.bsp-ready{ display:block; position:relative; left:50%; right:50%; width:100vw; margin:56px -50vw; padding:56px 0; background:var(--bg2,#EDEAE2); border-top:1px solid var(--hairline,#D8D2C8); border-bottom:1px solid var(--hairline,#D8D2C8); }',
      '.bsp-inner{ max-width:1040px; margin:0 auto; padding:0 40px; }',
      '.bsp-head{ text-align:center; margin-bottom:36px; }',
      '.bsp-eyebrow{ font-family:"Jost",sans-serif; font-size:9px; font-weight:500; letter-spacing:0.28em; text-transform:uppercase; color:var(--muted,#9E9890); display:block; margin-bottom:14px; }',
      '.bsp-title{ font-family:"Cormorant",serif; font-size:clamp(24px,3vw,34px); font-weight:400; color:var(--ink,#1C1C1C); line-height:1.15; margin:0; letter-spacing:0.01em; }',
      '.bsp-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }',
      '.bsp-card{ display:block; text-decoration:none; color:inherit; overflow:hidden; cursor:pointer; }',
      '.bsp-card-img{ aspect-ratio:4/5; min-height:200px; background:var(--bg3,#E8E4DB); position:relative; overflow:hidden; border-radius:4px; transition:transform .5s cubic-bezier(.25,.46,.45,.94); }',
      '.bsp-card-img::after{ content:""; position:absolute; inset:0; background:linear-gradient(to bottom,transparent 35%,rgba(18,14,10,0.72) 100%); pointer-events:none; }',
      '.bsp-card:hover .bsp-card-img{ transform:scale(1.02); }',
      '.bsp-badge{ position:absolute; top:12px; left:12px; background:rgba(165,90,74,0.82); backdrop-filter:blur(8px); color:#fff; font-family:"Jost",sans-serif; font-size:8px; letter-spacing:0.16em; text-transform:uppercase; padding:4px 11px; border-radius:100px; z-index:2; }',
      '.bsp-card-name{ font-family:"Cormorant",serif; font-size:22px; font-weight:400; color:#1a1612; text-align:center; line-height:1.2; padding:18px 12px 3px; margin:0; }',
      '.bsp-card-location{ display:block; font-family:"Jost",sans-serif; font-size:10px; font-weight:400; letter-spacing:0.22em; text-transform:uppercase; color:rgb(150,145,140); text-align:center; padding:0 12px; }',
      '.bsp-card-location::after{ content:""; display:block; height:1px; background:rgba(26,22,18,0.12); margin:14px auto 0; max-width:220px; }',
      '.bsp-card-body{ display:flex; align-items:center; height:30px; padding:4px 12px 12px; }',
      '.bsp-strip-item{ display:flex; align-items:center; justify-content:center; flex:1; min-width:0; }',
      '.bsp-strip-item span{ font-family:"Jost",sans-serif; font-size:11px; font-weight:400; color:rgba(28,28,28,0.65); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
      '.bsp-strip-divider{ width:0.5px; height:14px; background:rgba(28,28,28,0.15); flex-shrink:0; }',
      '@media(max-width:760px){',
      '  .blog-spot-row.bsp-ready{ padding:44px 0; margin:40px -50vw; }',
      '  .bsp-inner{ padding:0; }',
      '  .bsp-head{ padding:0 24px; margin-bottom:26px; }',
      '  .bsp-grid{ grid-template-columns:none; grid-auto-flow:column; grid-auto-columns:76%; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; padding:0 24px 6px; scrollbar-width:none; }',
      '  .bsp-grid::-webkit-scrollbar{ display:none; }',
      '  .bsp-grid .bsp-card{ scroll-snap-align:start; }',
      '}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'bsp-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }
})();
