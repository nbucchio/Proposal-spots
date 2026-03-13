(function () {
  var isIndex = window.location.pathname === '/' ||
                window.location.pathname.endsWith('index.html') ||
                window.location.pathname.endsWith('/');

  var currentPage = window.location.pathname;
  var inspirationActive = currentPage.endsWith('inspiration.html') ? 'nav-active' : '';
  var root = isIndex ? '' : 'index.html';

  var logoHref   = isIndex ? '#'              : 'index.html';
  var logoClick  = isIndex ? 'onclick="showPage(\'home\'); return false;"' : '';

  var destLinks = [
    { name: 'Amalfi Coast', sub: 'Italy' },
    { name: 'Santorini',    sub: 'Greece' },
    { name: 'Bali',         sub: 'Indonesia' },
    { name: 'Tulum',        sub: 'Mexico' },
    { name: 'Maldives',     sub: 'Indian Ocean' },
    { name: 'Costa Rica',   sub: 'Central America' },
    { name: 'Nicaragua',    sub: 'Central America' },
    { name: 'Algarve',      sub: 'Portugal' },
    { name: 'South of France', sub: 'France' },
    { name: 'Switzerland',  sub: 'Alps' },
    { name: 'New York',     sub: 'USA' }
  ];

  function destItem(d) {
    if (isIndex) {
      return '<a onclick="goToDestination(\'' + d.name + '\'); return false;" href="#">' +
             d.name + ' <span>' + d.sub + '</span></a>';
    }
    return '<a href="index.html?dest=' + encodeURIComponent(d.name) + '">' +
           d.name + ' <span>' + d.sub + '</span></a>';
  }

  var destItemsHTML = destLinks.map(destItem).join('\n          ');

  var viewAllDest = isIndex
    ? '<a onclick="showPage(\'destinations\'); return false;" href="#" style="color:#A55A4A;font-weight:500">View all destinations →</a>'
    : '<a href="index.html#destinations" style="color:#A55A4A;font-weight:500">View all destinations →</a>';

  var howItWorksLink = isIndex
    ? '<a href="#" id="nav-how-it-works" onclick="showPage(\'how-it-works\'); return false;" class="nav-link-right">How It Works</a>'
    : '<a href="index.html#how-it-works" class="nav-link-right">How It Works</a>';

  var faqLink = isIndex
    ? '<a href="#" id="nav-faq" onclick="goToFaq(); return false;" class="nav-link-right">FAQ</a>'
    : '<a href="index.html#faq" class="nav-link-right">FAQ</a>';

  var collectionBtn = isIndex
    ? '<a href="#" id="nav-collection" onclick="event.preventDefault(); openCollection();" class="nav-cta nav-collection-link">&#9825; My Collection</a>'
    : '<a href="index.html" class="nav-cta">Find a Spot &rarr;</a>';

  var html =
    '<nav id="navbar">' +
    '  <a href="' + logoHref + '" class="nav-logo" ' + logoClick + '>Proposal Spots</a>' +
    '  <div class="nav-links">' +
    '    <div class="nav-destinations-wrap">' +
    '      <a href="#" class="nav-link-right nav-destinations-btn" onclick="toggleDestDropdown(); return false;">' +
    '        Destinations' +
    '        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>' +
    '      </a>' +
    '      <div class="nav-dest-dropdown" id="nav-dest-dropdown">' +
    '        <div class="nav-dest-grid">' +
    '          ' + destItemsHTML +
    '        </div>' +
    '        <div class="nav-dest-footer">' +
    '          ' + viewAllDest +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '    ' + howItWorksLink +
    '    <a href="inspiration.html" class="nav-link-right ' + inspirationActive + '">Inspiration</a>' +
    '    ' + faqLink +
    '  </div>' +
    '  <div class="nav-right">' +
    '    ' + collectionBtn +
    '  </div>' +
    '</nav>';

  var placeholder = document.getElementById('nav-placeholder');
  if (placeholder) {
    placeholder.outerHTML = html;
  }

  // Scroll behaviour — works on any page
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Destinations dropdown toggle — safe to define globally here
  // Only define if not already defined (index.html may define it in app.js)
  if (typeof window.toggleDestDropdown === 'undefined') {
    window.toggleDestDropdown = function () {
      var dd = document.getElementById('nav-dest-dropdown');
      if (dd) dd.classList.toggle('open');
    };
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('nav-dest-dropdown');
      if (!dd) return;
      var btn = document.querySelector('.nav-destinations-btn');
      if (btn && btn.contains(e.target)) return;
      dd.classList.remove('open');
    });
  }

})();
