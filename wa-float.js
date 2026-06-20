(function() {
  if (document.getElementById('wa-float')) return;

  var style = document.createElement('style');
  style.textContent = '.wa-float{position:fixed;bottom:28px;right:28px;z-index:19000;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:#A55A4A;color:#fff;text-decoration:none;font-family:"Jost",sans-serif;font-size:12px;font-weight:400;letter-spacing:0.06em;border-radius:100px;border:1px solid rgba(255,255,255,0.12);opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0.3s ease,background 0.2s ease}.wa-float.is-visible{opacity:1;visibility:visible}.wa-float:hover{background:#8C4A3D}.wa-float-icon{width:16px;height:16px;flex-shrink:0}@media (max-width:768px){.wa-float{bottom:20px;right:20px;padding:9px 14px;font-size:11px}.wa-float-icon{width:14px;height:14px}}';
  document.head.appendChild(style);

  var a = document.createElement('a');
  a.id = 'wa-float';
  a.className = 'wa-float';
  a.href = 'https://wa.me/32451014608?text=Hi%2C%20I%20need%20help%20finding%20the%20perfect%20proposal%20spot.';
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Contact us on WhatsApp');
  a.innerHTML = '<svg class="wa-float-icon" viewBox="0 0 32 32" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.385.696 4.605 1.892 6.473L4 29l7.74-1.832A11.93 11.93 0 0 0 16.001 28C22.628 28 28 22.627 28 16S22.628 3 16.001 3zm0 22.4a9.36 9.36 0 0 1-4.77-1.305l-.342-.203-4.59 1.087 1.108-4.473-.223-.357A9.36 9.36 0 1 1 16.001 25.4zm5.336-7.027c-.292-.146-1.73-.853-1.998-.95-.268-.097-.463-.146-.658.146-.195.293-.755.95-.926 1.146-.171.195-.341.22-.633.073-.293-.146-1.236-.456-2.354-1.453-.87-.776-1.457-1.736-1.628-2.029-.171-.293-.018-.45.128-.596.131-.131.293-.341.439-.512.146-.171.195-.293.293-.488.097-.195.049-.366-.024-.512-.073-.146-.658-1.587-.902-2.173-.237-.57-.479-.493-.658-.502l-.561-.01c-.195 0-.512.073-.78.366-.268.293-1.024 1.001-1.024 2.441 0 1.44 1.048 2.832 1.194 3.027.146.195 2.063 3.152 5 4.421.699.302 1.244.482 1.669.617.701.223 1.34.191 1.844.116.563-.084 1.73-.707 1.974-1.39.244-.683.244-1.269.171-1.39-.073-.121-.268-.195-.561-.341z"/></svg><span>Ask us anything</span>';
  document.body.appendChild(a);

  var shown = false;
  function reveal() {
    if (shown) return;
    shown = true;
    a.classList.add('is-visible');
    window.removeEventListener('scroll', onScroll);
    if (timer) clearTimeout(timer);
  }
  function onScroll() {
    var doc = document.documentElement;
    var scrolled = window.scrollY || window.pageYOffset || 0;
    var max = (doc.scrollHeight - doc.clientHeight) || 1;
    if (scrolled / max >= 0.4) reveal();
  }
  var timer = setTimeout(reveal, 2000);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
