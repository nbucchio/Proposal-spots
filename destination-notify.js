// Shared "Coming Soon" notify flow for destination landing pages.
// Wires up the inline email form inside #dest-landing-coming-soon and a
// matching modal (mirrors the original Hawaii implementation), POSTing to
// /api/join with the destination name read from data-destination-name.
(function () {
  function buildModal(destName) {
    var overlay = document.createElement('div');
    overlay.id = 'dn-modal-overlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(28,28,28,0.5);z-index:20000;opacity:0;transition:opacity 0.3s;';

    var modal = document.createElement('div');
    modal.id = 'dn-modal';
    modal.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-48%);z-index:20001;background:var(--white);border-radius:16px;padding:52px 48px;max-width:460px;width:calc(100% - 48px);box-shadow:0 24px 80px rgba(28,28,28,0.18);transition:transform 0.3s ease, opacity 0.3s ease;opacity:0;';

    modal.innerHTML =
      '<button id="dn-modal-close" style="position:absolute;top:20px;right:20px;background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px;line-height:1;">✕</button>' +
      '<span style="font-family:\'Jost\',sans-serif;font-size:9px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;color:#A55A4A;display:block;margin-bottom:14px;text-align:center;">Be first when ' + destName + ' launches</span>' +
      '<h2 style="font-family:\'Cormorant\',serif;font-size:28px;font-weight:300;color:var(--ink);line-height:1.2;margin-bottom:10px;text-align:center;">Get notified about <em>' + destName + '.</em></h2>' +
      '<p style="font-family:\'Jost\',sans-serif;font-size:13px;font-weight:300;color:var(--mid);line-height:1.8;letter-spacing:0.02em;margin-bottom:28px;text-align:center;">We\'ll let you know the moment new spots are live.</p>' +
      '<div id="dn-modal-form" style="display:flex;flex-direction:column;gap:12px;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<input id="dn-first" type="text" placeholder="First name" style="font-family:\'Jost\',sans-serif;font-size:13px;font-weight:300;color:var(--ink);background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:15px 18px;outline:none;letter-spacing:0.02em;transition:border-color 0.2s;width:100%;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--ink)\'" onblur="this.style.borderColor=\'var(--hairline)\'">' +
          '<input id="dn-last" type="text" placeholder="Last name" style="font-family:\'Jost\',sans-serif;font-size:13px;font-weight:300;color:var(--ink);background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:15px 18px;outline:none;letter-spacing:0.02em;transition:border-color 0.2s;width:100%;box-sizing:border-box;" onfocus="this.style.borderColor=\'var(--ink)\'" onblur="this.style.borderColor=\'var(--hairline)\'">' +
        '</div>' +
        '<input id="dn-phone" type="tel" placeholder="Phone number" style="font-family:\'Jost\',sans-serif;font-size:13px;font-weight:300;color:var(--ink);background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:15px 18px;outline:none;letter-spacing:0.02em;transition:border-color 0.2s;" onfocus="this.style.borderColor=\'var(--ink)\'" onblur="this.style.borderColor=\'var(--hairline)\'">' +
        '<input id="dn-email" type="email" placeholder="Email address" style="font-family:\'Jost\',sans-serif;font-size:13px;font-weight:300;color:var(--ink);background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:15px 18px;outline:none;letter-spacing:0.02em;transition:border-color 0.2s;" onfocus="this.style.borderColor=\'var(--ink)\'" onblur="this.style.borderColor=\'var(--hairline)\'">' +
        '<div id="dn-error" style="display:none;font-family:\'Jost\',sans-serif;font-size:11px;color:#A55A4A;letter-spacing:0.04em;padding:0 2px;">Please fill in all required fields.</div>' +
        '<button id="dn-submit" style="font-family:\'Jost\',sans-serif;font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;background:var(--ink);color:var(--bg);border:none;border-radius:8px;padding:16px;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background=\'#A55A4A\'" onmouseout="this.style.background=\'var(--ink)\'">Notify me</button>' +
      '</div>' +
      '<div id="dn-modal-confirm" style="display:none;text-align:center;padding:20px 0 0;">' +
        '<div style="font-size:22px;margin-bottom:12px;">♥</div>' +
        '<p style="font-family:\'Cormorant\',serif;font-size:20px;font-weight:300;color:var(--ink);">You\'re on the list.</p>' +
        '<p style="font-family:\'Jost\',sans-serif;font-size:12px;font-weight:300;color:var(--mid);margin-top:8px;letter-spacing:0.04em;">We\'ll be in touch the moment ' + destName + ' launches.</p>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    overlay.addEventListener('click', closeModal);
    modal.querySelector('#dn-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#dn-submit').addEventListener('click', function () {
      submitNotify(destName);
    });
  }

  function openModal() {
    var prefill = document.getElementById('dn-notify-email');
    if (prefill && prefill.value) {
      var emailInput = document.getElementById('dn-email');
      if (emailInput) emailInput.value = prefill.value;
    }
    var overlay = document.getElementById('dn-modal-overlay');
    var modal   = document.getElementById('dn-modal');
    if (!overlay || !modal) return;
    overlay.style.display = 'block';
    modal.style.display   = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      modal.style.opacity   = '1';
      modal.style.transform = 'translate(-50%,-50%)';
    });
    document.getElementById('dn-modal-form').style.display    = 'flex';
    document.getElementById('dn-modal-confirm').style.display = 'none';
  }

  function closeModal() {
    var overlay = document.getElementById('dn-modal-overlay');
    var modal   = document.getElementById('dn-modal');
    if (!overlay || !modal) return;
    overlay.style.opacity = '0';
    modal.style.opacity   = '0';
    modal.style.transform = 'translate(-50%,-48%)';
    setTimeout(function () {
      overlay.style.display = 'none';
      modal.style.display   = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  function submitNotify(destName) {
    var first = document.getElementById('dn-first').value.trim();
    var last  = document.getElementById('dn-last').value.trim();
    var phone = document.getElementById('dn-phone').value.trim();
    var email = document.getElementById('dn-email').value.trim();
    var errEl = document.getElementById('dn-error');
    var emailOk = email.includes('@') && email.includes('.');
    if (!first || !last || !phone || !emailOk) {
      errEl.style.display = 'block';
      if (!emailOk) document.getElementById('dn-email').style.borderColor = '#A55A4A';
      if (!phone)  document.getElementById('dn-phone').style.borderColor = '#A55A4A';
      return;
    }
    errEl.style.display = 'none';
    var btn = document.getElementById('dn-submit');
    btn.textContent = 'Saving...';
    btn.disabled = true;
    try { localStorage.setItem('ps_email', email); } catch (e) {}
    fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first: first, last: last, email: email, phone: phone, destination: destName })
    }).catch(function () {});
    document.getElementById('dn-modal-form').style.display    = 'none';
    document.getElementById('dn-modal-confirm').style.display = 'block';
    var inlineForm    = document.getElementById('dn-notify-form');
    var inlineConfirm = document.getElementById('dn-notify-confirm');
    if (inlineForm)    inlineForm.style.display    = 'none';
    if (inlineConfirm) inlineConfirm.style.display = 'block';
    setTimeout(closeModal, 2400);
  }

  function init() {
    var section = document.getElementById('dest-landing-coming-soon');
    if (!section) return;
    var destName = section.getAttribute('data-destination-name');
    var form = document.getElementById('dn-notify-form');
    if (!destName || !form) return;

    buildModal(destName);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      openModal();
    });

    var enquireLink = document.getElementById('dn-enquire-link');
    if (enquireLink) {
      enquireLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
