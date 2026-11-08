/* TimZ Cleanpro Services — site behaviour */
(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Footer year
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Quote forms → emailed to the business via FormSubmit (formsubmit.co).
  // The very first submission sends an activation email to the inbox; after it's
  // confirmed, every quote request arrives as an email.
  document.querySelectorAll('form[data-quote-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var email = form.getAttribute('data-email');
    var phone = form.getAttribute('data-phone');
    var endpoint = 'https://formsubmit.co/ajax/' + (form.getAttribute('data-formsubmit') || email);

    function show(type, msg) {
      status.className = 'form-status is-' + type;
      status.textContent = msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      if (data.get('botcheck')) return; // spam honeypot

      var name = (data.get('first_name') + ' ' + data.get('last_name')).trim();
      var payload = {
        Name: name,
        Email: data.get('email'),
        Phone: data.get('phone'),
        Service: data.get('service'),
        Property: data.get('property'),
        Message: data.get('message') || '',
        Page: window.location.pathname,
        _subject: 'New quote request: ' + data.get('service') + ' \u2014 ' + name,
        _replyto: data.get('email'),
        _template: 'table',
        _captcha: 'false'
      };

      button.disabled = true;
      var label = button.textContent;
      button.textContent = 'Sending\u2026';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          var msg = String(res.message || '');
          if (/activat/i.test(msg)) {
            show('success', 'Form not activated yet \u2014 check ' + email + ' for the FormSubmit activation email and click the link.');
            return;
          }
          if (String(res.success) !== 'true') throw new Error(msg || 'Failed');
          form.reset();
          show('success', 'Thanks! Your request is in \u2014 we\u2019ll reply within a few hours.');
        })
        .catch(function () {
          show('error', 'Sorry, that didn\u2019t send. Please call ' + phone + ' or email ' + email + '.');
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = label;
        });
    });
  });
})();
