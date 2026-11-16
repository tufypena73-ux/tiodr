/* ================================================
   TIODR - script.js
   Global JavaScript for all pages
   ================================================ */

'use strict';

// ── Cookiebot: abrir el panel para cambiar o retirar el consentimiento ──
document.querySelectorAll('[data-cookie-settings]').forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (window.Cookiebot && typeof window.Cookiebot.renew === 'function') {
      window.Cookiebot.renew();
    }
  });
});


// ── Mobile Nav Toggle ──────────────────────────
(function () {
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

// ── Desplegable "Herramientas" (clic, teclado y mouse) ──────────
(function () {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  const setOpen = (dd, open) => {
    dd.classList.toggle('open', open);
    const btn = dd.querySelector('.dropdown-toggle');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => {
    dropdowns.forEach(dd => { if (dd !== except) setOpen(dd, false); });
  };

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropdown-toggle');
    const items = dd.querySelectorAll('.dropdown-item');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dd.classList.contains('open');
      closeAll(dd);
      setOpen(dd, willOpen);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(dd, true);
        if (items[0]) items[0].focus();
      }
    });

    dd.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setOpen(dd, false);
        btn.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const list = Array.from(items);
        const i = list.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
        list[next].focus();
      }
    });

    // Con mouse: al salir del bloque se cierra; aria-expanded se mantiene coherente
    dd.addEventListener('mouseenter', (e) => { if (e.pointerType !== 'touch') btn.setAttribute('aria-expanded', 'true'); });
    dd.addEventListener('mouseleave', () => setOpen(dd, false));

    // Con teclado: si el foco sale del bloque, se cierra
    dd.addEventListener('focusout', (e) => {
      if (!dd.contains(e.relatedTarget)) setOpen(dd, false);
    });
  });

  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => { if (!dd.contains(e.target)) setOpen(dd, false); });
  });
})();

// ── FAQ Accordion ──────────────────────────────
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();

// ── Active Nav Link ────────────────────────────
(function () {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-nav-link, .dropdown-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && path.includes(href) && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' || href === 'index.html') {
      if (path === '/' || path === '/index.html' || path.endsWith('/')) {
        link.classList.add('active');
      }
    }
  });
})();

// ── Smooth Scroll ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Lazy Load Images ───────────────────────────
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  });
  document.querySelectorAll('img[data-src]').forEach(img => obs.observe(img));
}

// ── Age Calculator ─────────────────────────────
(function () {
  const form = document.getElementById('age-form');
  if (!form) return;

  form.addEventListener('submit', (e) => { e.preventDefault(); if (!form.reportValidity()) return; calcAge(); });

  const birthInput = document.getElementById('birth-date');
  const toInput = document.getElementById('to-date');
  function localISODate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (toInput) {
    const today = localISODate();
    toInput.value = today;
    toInput.max = today;
    if (birthInput) birthInput.max = today;
    birthInput?.addEventListener('change', () => {
      if (toInput) toInput.min = birthInput.value || '';
      if (toInput && toInput.value && birthInput.value && toInput.value < birthInput.value) {
        toInput.value = birthInput.value;
      }
    });
  }

  // Las fechas "YYYY-MM-DD" se interpretan como fecha local (no UTC); con UTC, en zonas
  // horarias detrás de Greenwich (por ejemplo República Dominicana) el día se corría -1.
  function parseLocalDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!m) return new Date(NaN);
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return (d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3])) ? d : new Date(NaN);
  }

  function calcAge() {
    const birth = parseLocalDate(birthInput.value);
    let to;
    if (toInput && toInput.value) {
      to = parseLocalDate(toInput.value);
    } else {
      const now = new Date();
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (!birthInput.value || isNaN(birth) || isNaN(to)) return;
    const error = document.getElementById('age-error');
    if (error) error.style.display = 'none';
    if (birth > to) {
      if (error) { error.textContent = 'La fecha de nacimiento no puede ser posterior a la fecha de cálculo.'; error.style.display = 'block'; }
      return;
    }

    const result = document.getElementById('age-result');
    if (!result) return;

    let years = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth() - birth.getMonth();
    let days = to.getDate() - birth.getDate();

    if (days < 0) { months--; const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.round((to - birth) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    document.getElementById('age-years').textContent = years;
    document.getElementById('age-months').textContent = months;
    document.getElementById('age-days').textContent = days;
    document.getElementById('age-total-days').textContent = totalDays.toLocaleString('es-ES');
    document.getElementById('age-total-weeks').textContent = totalWeeks.toLocaleString('es-ES');
    document.getElementById('age-total-months').textContent = totalMonths.toLocaleString('es-ES');

    // For a Feb 29 birth date in a non-leap year, the JS calendar rolls the
    // anniversary to March 1; this is a practical display convention.
    let nextBirthday = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    const isBirthday = nextBirthday.getFullYear() === to.getFullYear()
      && nextBirthday.getMonth() === to.getMonth()
      && nextBirthday.getDate() === to.getDate();
    if (!isBirthday && nextBirthday < to) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    if (isBirthday) nextBirthday = to;
    const daysToB = Math.round((nextBirthday - to) / 86400000);
    const el = document.getElementById('age-next-bday');
    if (el) el.textContent = isBirthday ? '¡Hoy es tu cumpleaños! 🎉' : `Faltan ${daysToB} días`;

    result.classList.add('show');
  }
})();

// ── Percentage Calculator ──────────────────────
(function () {
  const form = document.getElementById('pct-form');
  if (!form) return;

  const tabs = document.querySelectorAll('.pct-tab');
  let mode = 'basic';

  // Solo el panel visible participa en la validación: los campos "required" de los
  // paneles ocultos bloqueaban el envío del formulario y la calculadora no respondía.
  function syncPanels() {
    document.querySelectorAll('.pct-panel').forEach(panel => {
      const active = panel.id === `pct-${mode}`;
      panel.querySelectorAll('input').forEach(input => { input.disabled = !active; });
    });
  }
  syncPanels();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.mode;
      document.querySelectorAll('.pct-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`pct-${mode}`)?.classList.add('active');
      document.getElementById('pct-result')?.classList.remove('show');
      tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
      syncPanels();
    });
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); if (!form.reportValidity()) return; calcPct(); });

  function calcPct() {
    const result = document.getElementById('pct-result');
    if (!result) return;
    let value, detail;

    if (mode === 'basic') {
      const pct = parseFloat(document.getElementById('pct-percent')?.value);
      const total = parseFloat(document.getElementById('pct-total')?.value);
      if (isNaN(pct) || isNaN(total)) return;
      value = ((pct / 100) * total);
      detail = `El ${pct}% de ${fmt(total)} es <strong>${fmt(value)}</strong>`;
    } else if (mode === 'what') {
      const part = parseFloat(document.getElementById('pct-part')?.value);
      const whole = parseFloat(document.getElementById('pct-whole')?.value);
      if (isNaN(part) || isNaN(whole)) return;
      if (whole === 0) { showMessage('El número de referencia no puede ser cero: no se puede dividir entre 0.'); return; }
      value = (part / whole) * 100;
      detail = `${fmt(part)} es el <strong>${fmt(value)}%</strong> de ${fmt(whole)}`;
    } else if (mode === 'change') {
      const from = parseFloat(document.getElementById('pct-from')?.value);
      const to = parseFloat(document.getElementById('pct-to')?.value);
      if (isNaN(from) || isNaN(to)) return;
      if (from === 0) { showMessage('El valor inicial no puede ser cero: la variación porcentual necesita una base distinta de 0.'); return; }
      value = ((to - from) / from) * 100;
      if (value === 0) {
        detail = `No hay variación: el valor se mantiene en ${fmt(from)}`;
      } else {
        const dir = value > 0 ? 'un aumento' : 'una disminución';
        detail = `Hay <strong>${dir} del ${fmt(Math.abs(value))}%</strong> (de ${fmt(from)} a ${fmt(to)})`;
      }
    }

    document.getElementById('pct-value').textContent = mode === 'basic' ? fmt(value) : `${fmt(value)}%`;
    document.getElementById('pct-detail').innerHTML = detail;
    result.classList.add('show');
  }

  function showMessage(text) {
    document.getElementById('pct-value').textContent = '—';
    document.getElementById('pct-detail').textContent = text;
    document.getElementById('pct-result')?.classList.add('show');
  }

  function fmt(n) { return parseFloat(n.toFixed(2)).toLocaleString('es-ES'); }
})();

// ── Discount Calculator ────────────────────────
(function () {
  const form = document.getElementById('disc-form');
  if (!form) return;

  form.addEventListener('submit', (e) => { e.preventDefault(); if (!form.reportValidity()) return; calcDiscount(); });

  function calcDiscount() {
    const price = parseFloat(document.getElementById('disc-price')?.value);
    const disc = parseFloat(document.getElementById('disc-pct')?.value);
    if (isNaN(price) || isNaN(disc)) return;

    const saved = (price * disc) / 100;
    const final = price - saved;

    document.getElementById('disc-final').textContent = fmt(final);
    document.getElementById('disc-saved').textContent = fmt(saved);
    document.getElementById('disc-original').textContent = fmt(price);
    document.getElementById('disc-pct-shown').textContent = `${disc}%`;
    document.getElementById('disc-result')?.classList.add('show');
  }

  function fmt(n) { return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
})();

// ── IVA Calculator ─────────────────────────────
(function () {
  const form = document.getElementById('iva-form');
  if (!form) return;

  const rateSelect = document.getElementById('iva-rate');
  const customGroup = document.getElementById('iva-custom-group');
  const customInput = document.getElementById('iva-custom-rate');

  // La tasa personalizada solo se muestra (y valida) cuando se elige "Otra tasa"
  function syncRate() {
    const custom = rateSelect?.value === 'custom';
    if (customGroup) customGroup.style.display = custom ? 'block' : 'none';
    if (customInput) { customInput.disabled = !custom; customInput.required = custom; }
  }
  rateSelect?.addEventListener('change', syncRate);
  syncRate();

  form.addEventListener('submit', (e) => { e.preventDefault(); if (!form.reportValidity()) return; calcIva(); });

  function calcIva() {
    const amount = parseFloat(document.getElementById('iva-amount')?.value);
    const rate = rateSelect?.value === 'custom' ? parseFloat(customInput?.value) : parseFloat(rateSelect?.value);
    const type = document.getElementById('iva-type')?.value;
    if (isNaN(amount) || isNaN(rate)) return;

    let base, iva, total;
    if (type === 'add') {
      base = amount; iva = amount * rate / 100; total = amount + iva;
    } else {
      total = amount; base = amount / (1 + rate / 100); iva = amount - base;
    }

    document.getElementById('iva-base').textContent = fmt(base);
    document.getElementById('iva-amount-shown').textContent = fmt(iva);
    document.getElementById('iva-total').textContent = fmt(total);
    document.getElementById('iva-rate-shown').textContent = `${parseFloat(rate.toFixed(2)).toLocaleString('es-ES')}%`;
    document.getElementById('iva-result')?.classList.add('show');
  }

  function fmt(n) { return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
})();

// ── QR Generator (Fixed & Improved) ───────────
(function () {
  if (!document.getElementById('qr-form')) return;

  const tabs = document.querySelectorAll('.qr-tab');
  let qrType = 'url';

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      qrType = tab.dataset.type;
      document.querySelectorAll('.qr-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`qr-panel-${qrType}`);
      if (panel) panel.classList.add('active');
    });
  });

  document.getElementById('qr-form').addEventListener('submit', (e) => {
    e.preventDefault();
    generateQR();
  });

  function getQRContent() {
    if (qrType === 'url') {
      let val = document.getElementById('qr-url-input')?.value.trim() || '';
      if (!val) return '';
      if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
      try {
        const parsed = new URL(val);
        if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) return '';
        return parsed.href;
      } catch { return ''; }
    } else if (qrType === 'whatsapp') {
      const phone = (document.getElementById('qr-phone')?.value.trim() || '').replace(/\D/g, '');
      const msg = document.getElementById('qr-msg')?.value.trim() || '';
      if (phone.length < 7 || phone.length > 15) return '';
      return `https://wa.me/${phone}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
    } else if (qrType === 'text') {
      return document.getElementById('qr-text-input')?.value.trim() || '';
    }
    return '';
  }

  function showError(msg) {
    const err = document.getElementById('qr-error');
    if (err) { err.textContent = msg; err.style.display = 'block'; }
  }

  function hideError() {
    const err = document.getElementById('qr-error');
    if (err) err.style.display = 'none';
  }

  function generateQR() {
    hideError();
    const content = getQRContent();

    if (!content) {
      if (qrType === 'url') showError('Introduce una dirección web válida, por ejemplo https://ejemplo.com.');
      else if (qrType === 'whatsapp') showError('Introduce un número internacional válido de entre 7 y 15 dígitos, incluido el código de país.');
      else showError('Por favor ingresa el texto para generar el código QR.');
      return;
    }

    const display = document.getElementById('qr-display');
    const placeholder = document.getElementById('qr-placeholder');
    const downloadBtn = document.getElementById('qr-download-btn');
    const output = document.getElementById('qr-output');

    if (!output) return;

    // Show loading state
    output.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:.875rem;">Generando QR...</div>';
    if (display) display.style.display = 'flex';
    if (placeholder) placeholder.style.display = 'none';
    if (downloadBtn) downloadBtn.style.display = 'none';

    // Use QR Server API — reliable, no JS library needed, works on all devices
    const size = window.devicePixelRatio >= 2 ? 400 : 300;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=H&margin=2&data=${encodeURIComponent(content)}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.alt = 'Código QR generado';
    img.style.cssText = 'border-radius:12px;border:1px solid var(--border);max-width:220px;width:100%;height:auto;display:block;margin:0 auto;';

    img.onload = function () {
      output.innerHTML = '';
      output.appendChild(img);
      // Store for download
      output.dataset.imgSrc = apiUrl;
      output.dataset.content = content;
      if (downloadBtn) downloadBtn.style.display = 'inline-flex';
    };

    img.onerror = function () {
      // Fallback: try without crossOrigin
      output.innerHTML = `<img src="${apiUrl}" alt="Código QR generado" style="border-radius:12px;border:1px solid var(--border);max-width:220px;width:100%;height:auto;display:block;margin:0 auto;" onload="document.getElementById('qr-download-btn').style.display='inline-flex'" onerror="document.getElementById('qr-output').innerHTML='<p style=color:var(--error);font-size:.875rem>Error al generar el QR. Por favor intenta de nuevo.</p>'">`;
    };

    img.src = apiUrl;
  }

  // Download QR
  document.getElementById('qr-download-btn')?.addEventListener('click', async () => {
    const output = document.getElementById('qr-output');
    const img = output?.querySelector('img');
    if (!img) return;

    const btn = document.getElementById('qr-download-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Preparando...';
    btn.disabled = true;

    try {
      // Fetch image and convert to blob for download
      const response = await fetch(img.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'tiodr-qr.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Fallback: open image in new tab
      window.open(img.src, '_blank');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
})();

// ── Password Generator ─────────────────────────
(function () {
  const form = document.getElementById('pwd-form');
  if (!form) return;

  const lengthSlider = document.getElementById('pwd-length');
  const lengthDisplay = document.getElementById('pwd-length-display');
  const resultBox = document.getElementById('pwd-result');
  const outputEl = document.getElementById('pwd-output');
  const strengthBar = document.getElementById('pwd-strength-bar');
  const strengthText = document.getElementById('pwd-strength-text');

  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  if (lengthSlider && lengthDisplay) {
    lengthSlider.addEventListener('input', () => {
      lengthDisplay.textContent = lengthSlider.value;
    });
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); generate(); });

  // Also generate on button click directly
  document.getElementById('pwd-generate-btn')?.addEventListener('click', (e) => {
    e.preventDefault(); generate();
  });

  function generate() {
    const length = parseInt(lengthSlider?.value || 16);
    const useUpper = document.getElementById('pwd-upper')?.checked;
    const useLower = document.getElementById('pwd-lower')?.checked;
    const useNumbers = document.getElementById('pwd-numbers')?.checked;
    const useSymbols = document.getElementById('pwd-symbols')?.checked;

    let charset = '';
    const requiredSets = [];

    if (useUpper) { charset += CHARS.upper; requiredSets.push(CHARS.upper); }
    if (useLower) { charset += CHARS.lower; requiredSets.push(CHARS.lower); }
    if (useNumbers) { charset += CHARS.numbers; requiredSets.push(CHARS.numbers); }
    if (useSymbols) { charset += CHARS.symbols; requiredSets.push(CHARS.symbols); }

    if (!charset) {
      alert('Selecciona al menos un tipo de caracteres.');
      return;
    }
    if (requiredSets.length > length) {
      alert('Aumenta la longitud para incluir todos los tipos de caracteres seleccionados.');
      return;
    }

    // Rejection sampling avoids modulo bias; all random choices use Web Crypto.
    function secureRandomInt(max) {
      if (!Number.isInteger(max) || max < 1) throw new RangeError('Límite aleatorio no válido.');
      const range = 0x100000000;
      const limit = Math.floor(range / max) * max;
      const buffer = new Uint32Array(1);
      let value;
      do { crypto.getRandomValues(buffer); value = buffer[0]; } while (value >= limit);
      return value % max;
    }

    let password = requiredSets.map(set => set[secureRandomInt(set.length)]).join('');
    while (password.length < length) password += charset[secureRandomInt(charset.length)];

    // Fisher–Yates shuffle with cryptographically secure randomness.
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    password = chars.join('');

    if (outputEl) outputEl.textContent = password;
    if (resultBox) resultBox.style.display = 'block';

    updateStrength(password);
  }

  function updateStrength(pwd) {
    if (!strengthBar || !strengthText) return;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: 'Muy débil', color: '#ea4335', width: '15%' },
      { label: 'Débil', color: '#ff6d00', width: '30%' },
      { label: 'Regular', color: '#fbbc04', width: '50%' },
      { label: 'Buena', color: '#34a853', width: '75%' },
      { label: 'Fuerte', color: '#1a73e8', width: '90%' },
      { label: 'Muy fuerte', color: '#0d47a1', width: '100%' }
    ];

    const idx = Math.min(Math.floor(score * levels.length / 8), levels.length - 1);
    const level = levels[idx];
    strengthBar.style.width = level.width;
    strengthBar.style.background = level.color;
    strengthText.textContent = level.label;
    strengthText.style.color = level.color;
  }

  // Copy password
  document.getElementById('pwd-copy-btn')?.addEventListener('click', () => {
    const text = outputEl?.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('pwd-copy-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ ¡Copiado!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }).catch(() => {
      const range = document.createRange();
      range.selectNode(outputEl);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    });
  });

  // Regenerate
  document.getElementById('pwd-regen-btn')?.addEventListener('click', () => generate());
})();

// ── Character Counter ──────────────────────────
(function () {
  const textarea = document.getElementById('char-input');
  if (!textarea) return;

  function update() {
    const text = textarea.value;
    const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
      ? new Intl.Segmenter('es', { granularity: 'grapheme' })
      : null;
    const countChars = value => segmenter
      ? Array.from(segmenter.segment(value)).length
      : Array.from(value).length;
    const chars = countChars(text);
    const charsNoSpaces = countChars(text.replace(/\s/g, ''));
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) || []).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length;
    // Reading time: ~200 words/min
    const readingSeconds = Math.ceil(words / 200 * 60);
    const readingMin = Math.floor(readingSeconds / 60);
    const readingSec = readingSeconds % 60;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('char-count', chars.toLocaleString('es-ES'));
    set('char-count-nospace', charsNoSpaces.toLocaleString('es-ES'));
    set('word-count', words.toLocaleString('es-ES'));
    set('line-count', lines.toLocaleString('es-ES'));
    set('sentence-count', sentences.toLocaleString('es-ES'));
    set('para-count', paragraphs.toLocaleString('es-ES'));
    set('reading-time', readingMin > 0 ? `${readingMin}m ${readingSec}s` : `${readingSec}s`);

    // Twitter limit indicator
    const twitterBar = document.getElementById('twitter-bar');
    const twitterCount = document.getElementById('twitter-count');
    if (twitterBar && twitterCount) {
      const pct = Math.min(chars / 280 * 100, 100);
      twitterBar.style.width = pct + '%';
      twitterBar.style.background = chars > 280 ? '#ea4335' : chars > 250 ? '#fbbc04' : '#1a73e8';
      twitterCount.textContent = `${chars}/280`;
      twitterCount.style.color = chars > 280 ? '#ea4335' : 'var(--text-muted)';
    }
  }

  textarea.addEventListener('input', update);
  textarea.addEventListener('paste', () => setTimeout(update, 10));

  // Clear button
  document.getElementById('char-clear-btn')?.addEventListener('click', () => {
    textarea.value = '';
    update();
    textarea.focus();
  });

  // Copy button
  document.getElementById('char-copy-btn')?.addEventListener('click', () => {
    if (!textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
      const btn = document.getElementById('char-copy-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ ¡Copiado!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  });

  update();
})();

// ── Text Converter ─────────────────────────────
(function () {
  const inputEl = document.getElementById('conv-input');
  if (!inputEl) return;

  const outputEl = document.getElementById('conv-output');
  let currentMode = 'upper';

  // Mode buttons
  document.querySelectorAll('.conv-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.conv-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      convert();
    });
  });

  inputEl.addEventListener('input', convert);

  // Capitaliza la primera letra de cada palabra, respetando signos de apertura (¿ ¡ comillas, paréntesis)
  // y letras acentuadas o ñ. Reconoce cualquier tipo de espacio, incluidos los saltos de línea.
  const WORD_START = /(^|\s)([¿¡"'“‘«(\[]*)(\p{L})/gu;

  function toCapitalize(str) {
    return str.toLowerCase().replace(WORD_START, (m, sp, open, letter) => sp + open + letter.toUpperCase());
  }

  function toTitleCase(str) {
    const SMALL = new Set(['de','del','la','el','los','las','en','con','por','para','y','o','a','un','una','unos','unas','al','lo','e','u','ni','que','se','sin','sobre']);
    let first = true;
    let afterSentence = false;
    return str.toLowerCase().split(/(\s+)/).map(token => {
      if (!token || /^\s+$/.test(token)) return token;
      const m = /^([¿¡"'“‘«(\[]*)(\p{L})(.*)$/u.exec(token);
      const bare = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
      const keepLower = !first && !afterSentence && SMALL.has(bare);
      const out = (m && !keepLower) ? m[1] + m[2].toUpperCase() + m[3] : token;
      first = false;
      afterSentence = /[.!?]$/.test(token);
      return out;
    }).join('');
  }

  function toSentenceCase(str) {
    return str.toLowerCase().replace(/(^\s*|[.!?]+\s+)([¿¡"'“‘«(\[]*)(\p{L})/gu, (m, lead, open, letter) => lead + open + letter.toUpperCase());
  }

  function toAlternating(str) {
    return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  function toInverse(str) {
    return str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  function toSlug(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function convert() {
    const text = inputEl.value;
    if (!outputEl) return;

    let result = '';
    switch (currentMode) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'capitalize': result = toCapitalize(text); break;
      case 'title': result = toTitleCase(text); break;
      case 'sentence': result = toSentenceCase(text); break;
      case 'alternating': result = toAlternating(text); break;
      case 'inverse': result = toInverse(text); break;
      case 'slug': result = toSlug(text); break;
      default: result = text;
    }

    outputEl.value = result;

    // Update char counts
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('conv-char-count', text.length);
    set('conv-word-count', text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
  }

  // Copy output
  document.getElementById('conv-copy-btn')?.addEventListener('click', () => {
    if (!outputEl?.value) return;
    navigator.clipboard.writeText(outputEl.value).then(() => {
      const btn = document.getElementById('conv-copy-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ ¡Copiado!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  });

  // Clear
  document.getElementById('conv-clear-btn')?.addEventListener('click', () => {
    inputEl.value = ''; outputEl.value = '';
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('conv-char-count', 0); set('conv-word-count', 0);
    inputEl.focus();
  });

  // Swap
  document.getElementById('conv-swap-btn')?.addEventListener('click', () => {
    if (outputEl?.value) {
      inputEl.value = outputEl.value;
      convert();
    }
  });
})();

// (El formulario de contacto se gestiona en contact-mailto.js)
