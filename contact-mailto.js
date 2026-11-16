/* Formulario de contacto de TIODR: prepara un correo con "mailto:".
   No usa servidor ni base de datos. El envío real lo completa la persona
   desde su aplicación de correo, por eso nunca se muestra "mensaje enviado". */
(function (root) {
  "use strict";

  // ▼▼▼ ÚNICO LUGAR donde se define el correo de destino ▼▼▼
  var CONTACT_EMAIL = "contact@tiodr.site";
  // ▲▲▲ ----------------------------------------------- ▲▲▲

  var SUBJECTS = {
    pregunta: "Pregunta sobre una herramienta",
    sugerencia: "Sugerencia de nueva herramienta",
    error: "Reportar un error",
    colaboracion: "Colaboración o publicidad",
    otro: "Otro"
  };
  var LOCK_MS = 4000;          // evita dobles envíos accidentales
  var DETECT_MS = 2500;        // tiempo para detectar si se abrió una app de correo
  var MAX_URL = 8000;          // por encima, muchos clientes no abren el mailto

  function clean(v) { return String(v == null ? "" : v).replace(/\r\n?/g, "\n").trim(); }

  function validate(d) {
    if (!d.nombre) return { field: "nombre", msg: "Escribe tu nombre." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return { field: "email", msg: "Escribe un correo electrónico válido." };
    if (d.mensaje.length < 10) return { field: "mensaje", msg: "Escribe tu mensaje (mínimo 10 caracteres)." };
    return null;
  }

  function subjectText(key) { return SUBJECTS[key] || "Consulta general"; }

  function buildMessage(d) {
    return "Nombre del visitante: " + d.nombre + "\n\n" +
           "Correo del visitante: " + d.email + "\n\n" +
           "Asunto: " + subjectText(d.asunto) + "\n\n" +
           "Mensaje:\n\n" + d.mensaje;
  }

  function buildMailto(d) {
    var subject = "[TIODR] " + subjectText(d.asunto);
    // Los saltos de línea se codifican como CRLF (%0D%0A), lo que esperan los clientes de correo
    var body = buildMessage(d).replace(/\n/g, "\r\n");
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* Lógica de envío (sin DOM, para poder probarla).
     state = { lockedUntil: 0 }; devuelve la acción que debe ejecutar la interfaz. */
  function submit(state, raw, now) {
    if (now < state.lockedUntil) return { type: "blocked" };
    var d = { nombre: clean(raw.nombre), email: clean(raw.email), asunto: clean(raw.asunto), mensaje: clean(raw.mensaje) };
    var problem = validate(d);
    if (problem) return { type: "invalid", field: problem.field, msg: problem.msg };
    state.lockedUntil = now + LOCK_MS;
    var url = buildMailto(d);
    return { type: url.length > MAX_URL ? "too-long" : "open", url: url, message: buildMessage(d), email: CONTACT_EMAIL };
  }

  var api = { CONTACT_EMAIL: CONTACT_EMAIL, validate: validate, buildMessage: buildMessage, buildMailto: buildMailto, submit: submit, LOCK_MS: LOCK_MS };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ───────── Interfaz (solo navegador) ───────── */
  var doc = root.document;
  var form = doc.getElementById("contact-form");
  if (!form) return;
  var btn = form.querySelector('button[type="submit"]');
  var btnHTML = btn.innerHTML;
  var notice = doc.getElementById("form-notice");
  var errorBox = doc.getElementById("form-error");
  var fallback = doc.getElementById("form-fallback");
  var fbText = doc.getElementById("fallback-text");
  var copyBtn = doc.getElementById("fallback-copy");
  var retryBtn = doc.getElementById("fallback-open");
  var copyStatus = doc.getElementById("fallback-status");
  var ids = { nombre: "contact-name", email: "contact-email", asunto: "contact-subject", mensaje: "contact-message" };
  var state = { lockedUntil: 0 };
  var lastUrl = "", lastMessage = "";

  function el(k) { return doc.getElementById(ids[k]); }
  function hideAll() {
    notice.style.display = "none"; errorBox.style.display = "none"; fallback.style.display = "none";
    Object.keys(ids).forEach(function (k) { el(k).removeAttribute("aria-invalid"); });
  }
  function showError(text, field) {
    hideAll(); errorBox.textContent = text; errorBox.style.display = "block";
    if (field) { var f = el(field); f.setAttribute("aria-invalid", "true"); f.focus(); }
  }
  function showFallback(intro) {
    notice.style.display = "none"; errorBox.style.display = "none";
    fbText.value = "Para: " + CONTACT_EMAIL + "\nAsunto: [TIODR] " + subjectText(el("asunto").value) + "\n\n" + lastMessage;
    doc.getElementById("fallback-intro").textContent = intro;
    fallback.style.display = "block";
  }
  function unlock() { btn.disabled = false; btn.innerHTML = btnHTML; }

  function openMail(url) {
    var left = false;
    function mark() { left = true; }
    root.addEventListener("blur", mark); root.addEventListener("pagehide", mark); doc.addEventListener("visibilitychange", mark);
    root.location.href = url;
    root.setTimeout(function () {
      root.removeEventListener("blur", mark); root.removeEventListener("pagehide", mark); doc.removeEventListener("visibilitychange", mark);
      if (!left) showFallback("Parece que no se abrió ninguna aplicación de correo en este dispositivo. Puedes copiar el mensaje y enviarlo manualmente a " + CONTACT_EMAIL + ".");
    }, DETECT_MS);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.website && form.elements.website.value) return;   // trampa para bots
    var res = submit(state, {
      nombre: el("nombre").value, email: el("email").value, asunto: el("asunto").value, mensaje: el("mensaje").value
    }, Date.now());
    if (res.type === "blocked") return;
    if (res.type === "invalid") { showError(res.msg, res.field); return; }
    hideAll();
    lastUrl = res.url; lastMessage = res.message;
    btn.disabled = true; btn.textContent = "Abriendo tu correo…";
    root.setTimeout(unlock, LOCK_MS);
    if (res.type === "too-long") {
      showFallback("El mensaje es demasiado largo para abrirlo automáticamente. Cópialo y envíalo manualmente a " + CONTACT_EMAIL + ".");
      return;
    }
    notice.textContent = "Tu aplicación de correo se ha abierto con el mensaje preparado. Revisa el contenido y pulsa Enviar para completar el envío.";
    notice.style.display = "block";
    openMail(res.url);
  });

  copyBtn.addEventListener("click", function () {
    var text = fbText.value;
    function done(ok) { copyStatus.textContent = ok ? "Mensaje copiado." : "No se pudo copiar automáticamente: selecciona el texto y cópialo."; }
    if (root.navigator.clipboard && root.navigator.clipboard.writeText) {
      root.navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fbText.select(); done(false); });
    } else { fbText.select(); try { done(doc.execCommand("copy")); } catch (err) { done(false); } }
  });
  retryBtn.addEventListener("click", function () { if (lastUrl) { root.location.href = lastUrl; } });
})(typeof window !== "undefined" ? window : this);
