(function () {
  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Contact form
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var button = form.querySelector('button[type="submit"]');
  var EMAIL = 'info@pai-tech-consulting.com';

  function show(kind, html) {
    status.className = 'form-status show ' + kind;
    status.innerHTML = html;
    status.focus();
  }

  // Non-JS fallback lands back here with ?sent=1 / ?error=1
  var params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') {
    show('ok', 'תודה! הפנייה התקבלה ונחזור אליכם בהקדם.');
  } else if (params.get('error') === '1') {
    show('err', 'לא הצלחנו לשלוח את הטופס. אפשר לכתוב לנו ישירות ל־<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    button.disabled = true;
    var original = button.textContent;
    button.textContent = 'שולח...';

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error(data.error || 'send_failed');
        });
      })
      .then(function () {
        form.reset();
        show('ok', 'תודה! הפנייה התקבלה ונחזור אליכם בהקדם.');
      })
      .catch(function () {
        show('err', 'לא הצלחנו לשלוח את הטופס כרגע. אפשר לכתוב לנו ישירות ל־<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });
})();
