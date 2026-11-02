/* Booking (enquiry) and Contact forms: controls, validation, and processing.
   Email is sent with the FormSubmit AJAX endpoint (no server needed, works on GitHub Pages). */
(function () {
  "use strict";
  var B = window.BUSINESS || {};

  // ---------- Shared validation helpers ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function cleanPhone(v) { return v.replace(/[\s\-().]/g, ""); }
  function validPhone(v) { return /^(\+27|0)[1-9]\d{8}$/.test(cleanPhone(v)); }

  function fieldEl(input) { return input.closest(".field"); }

  function setError(input, msg) {
    var field = fieldEl(input);
    var err = field.querySelector(".field-error");
    field.classList.toggle("has-error", !!msg);
    field.classList.toggle("is-valid", !msg && input.value !== "");
    if (input.type !== "radio" && input.type !== "checkbox") input.setAttribute("aria-invalid", msg ? "true" : "false");
    err.textContent = msg || "";
  }

  // rules: each returns an error message or "" when fine
  var rules = {
    name: function (v) {
      v = v.trim();
      if (!v) return "Enter your full name.";
      if (v.length < 2) return "Your name must be at least 2 characters.";
      if (!/^[A-Za-zÀ-ÿ' .\-]+$/.test(v)) return "Use letters only in your name (no numbers or symbols).";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Enter your email address.";
      if (!EMAIL_RE.test(v)) return "Enter a valid email address, like name@example.com.";
      return "";
    },
    phone: function (v, required) {
      v = v.trim();
      if (!v) return required ? "Enter your phone number." : "";
      if (!validPhone(v)) return "Enter a valid South African number, like 067 058 0329 or +27 67 058 0329.";
      return "";
    },
    select: function (v, label) { return v ? "" : "Choose " + label + "."; },
    message: function (v, min, max) {
      v = v.trim();
      if (!v) return "Enter your message.";
      if (v.length < min) return "Your message needs at least " + min + " characters (you have " + v.length + ").";
      if (v.length > max) return "Your message is too long. Keep it under " + max + " characters.";
      return "";
    }
  };

  function showSummary(summaryEl, errors) {
    var ul = summaryEl.querySelector("ul");
    ul.innerHTML = "";
    errors.forEach(function (e) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + e.id; a.textContent = e.msg;
      a.addEventListener("click", function (ev) { ev.preventDefault(); document.getElementById(e.id).focus(); });
      li.appendChild(a); ul.appendChild(li);
    });
    summaryEl.hidden = errors.length === 0;
    if (errors.length) { summaryEl.focus(); }
  }

  function sendEmail(payload) {
    return fetch("https://formsubmit.co/ajax/" + B.email, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (j) {
      if (j.success === false || j.success === "false") throw new Error(j.message || "Not accepted");
      return j;
    });
  }

  function money(n) { return "R" + n.toLocaleString("en-ZA"); }
  function pretty(dateStr) {
    var d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function waLink(text) { return "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent(text); }

  // =====================================================================
  // BOOKING FORM
  // =====================================================================
  var bf = document.getElementById("booking-form");
  if (bf) {
    var els = {
      name: bf.elements["name"], email: bf.elements["email"], phone: bf.elements["phone"],
      service: bf.elements["service"], date: bf.elements["date"], time: bf.elements["time"],
      notes: bf.elements["notes"]
    };
    var summaryEl = document.getElementById("error-summary");
    var confirmEl = document.getElementById("confirmation");
    var statusEl = document.getElementById("form-status");
    var submitBtn = document.getElementById("submit-btn");
    var estimate = document.getElementById("estimate");

    // Populate service dropdown from the shared design list
    DESIGNS.forEach(function (d) {
      var o = document.createElement("option");
      o.value = d.id;
      o.textContent = d.name + " – " + d.look + " (" + money(d.price) + ")";
      els.service.appendChild(o);
    });
    var pre = new URLSearchParams(window.location.search).get("design");
    if (pre && DESIGNS.some(function (d) { return d.id === pre; })) els.service.value = pre;

    function selectedDesign() {
      return DESIGNS.filter(function (d) { return d.id === els.service.value; })[0];
    }
    function updateEstimate() {
      var d = selectedDesign();
      estimate.hidden = !d;
      if (d) estimate.querySelector("strong").textContent = money(d.price);
      if (d) estimate.querySelector(".est-name").textContent = d.name + " (" + d.look + ")";
    }

    // Date limits: tomorrow to 6 months ahead
    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    var max = new Date(); max.setMonth(max.getMonth() + 6);
    els.date.min = iso(tomorrow); els.date.max = iso(max);

    // Time slots depend on the day (Saturday closes earlier, Sunday is by appointment)
    function buildTimes() {
      var keep = els.time.value;
      els.time.innerHTML = '<option value="">Choose a time</option>';
      var hint = document.getElementById("time-hint");
      if (!els.date.value) { hint.textContent = "Pick a date first to see available times."; return; }
      var day = new Date(els.date.value + "T12:00:00").getDay();
      var hrs = B.hours[day];
      if (!hrs) {
        hint.textContent = "Sundays are by appointment. Choose a time and Jenn will confirm if she can fit you in.";
        hrs = [10, 15];
      } else {
        hint.textContent = "Last booking is 1 hour before closing.";
      }
      for (var h = hrs[0]; h <= hrs[1] - 1; h += 1) {
        var label = String(h).padStart(2, "0") + ":00";
        var o = document.createElement("option"); o.value = label; o.textContent = label;
        els.time.appendChild(o);
      }
      if (keep) els.time.value = keep;
    }

    // Character counter
    var counter = document.getElementById("notes-count");
    function updateCount() { counter.textContent = els.notes.value.length + " / 500"; }

    // Validation per field
    function check(input) {
      var msg = "";
      switch (input.name) {
        case "name": msg = rules.name(input.value); break;
        case "email": msg = rules.email(input.value); break;
        case "phone": msg = rules.phone(input.value, true); break;
        case "service": msg = rules.select(input.value, "a design or service"); break;
        case "date":
          if (!input.value) msg = "Choose your preferred date.";
          else if (input.value < els.date.min) msg = "Choose a date from tomorrow onwards.";
          else if (input.value > els.date.max) msg = "Bookings open up to 6 months ahead. Choose an earlier date.";
          break;
        case "time": msg = rules.select(input.value, "a preferred time"); break;
        case "notes": msg = input.value.length > 500 ? "Notes must be 500 characters or fewer." : ""; break;
      }
      setError(input, msg);
      return msg;
    }
    function checkRadio() {
      var any = bf.querySelector('input[name="length"]:checked');
      var group = document.getElementById("length-field");
      var err = group.querySelector(".field-error");
      group.classList.toggle("has-error", !any);
      err.textContent = any ? "" : "Choose a nail length.";
      return any ? "" : "Choose a nail length.";
    }
    function checkConsent() {
      var c = bf.elements["consent"];
      var field = fieldEl(c);
      field.classList.toggle("has-error", !c.checked);
      field.querySelector(".field-error").textContent = c.checked ? "" : "Tick the box so we can contact you about this booking.";
      return c.checked ? "" : "Tick the box so we can contact you about this booking.";
    }

    // Immediate feedback: validate on blur, then re-validate while typing
    ["name", "email", "phone", "service", "date", "time", "notes"].forEach(function (k) {
      var input = els[k];
      input.addEventListener("blur", function () { if (k !== "notes" || input.value) check(input); });
      input.addEventListener(k === "service" || k === "date" || k === "time" ? "change" : "input", function () {
        if (fieldEl(input).classList.contains("has-error") || fieldEl(input).classList.contains("is-valid")) check(input);
      });
    });
    els.service.addEventListener("change", updateEstimate);
    els.date.addEventListener("change", function () { buildTimes(); });
    els.notes.addEventListener("input", updateCount);
    Array.prototype.forEach.call(bf.querySelectorAll('input[name="length"]'), function (r) { r.addEventListener("change", checkRadio); });
    bf.elements["consent"].addEventListener("change", checkConsent);

    bf.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      var errors = [];
      ["name", "email", "phone", "service", "date", "time", "notes"].forEach(function (k) {
        var m = check(els[k]); if (m) errors.push({ id: els[k].id, msg: m });
      });
      var lm = checkRadio(); if (lm) errors.push({ id: "length-short", msg: lm });
      var cm = checkConsent(); if (cm) errors.push({ id: "consent", msg: cm });
      showSummary(summaryEl, errors);
      if (errors.length) return;

      // Spam trap: real visitors never fill this in
      if (bf.elements["website"].value) return;

      var d = selectedDesign();
      var addons = Array.prototype.map.call(bf.querySelectorAll('input[name="addons"]:checked'), function (c) { return c.value; });
      var ref = "SBJ-" + iso(new Date()).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      var data = {
        reference: ref,
        name: els.name.value.trim(),
        email: els.email.value.trim(),
        phone: cleanPhone(els.phone.value),
        design: d.name + " – " + d.look,
        listed_price: money(d.price),
        date: pretty(els.date.value),
        time: els.time.value,
        nail_length: bf.querySelector('input[name="length"]:checked').value,
        add_ons: addons.length ? addons.join(", ") : "None",
        notes: els.notes.value.trim() || "None"
      };

      submitBtn.disabled = true; submitBtn.textContent = "Sending your request…";
      statusEl.textContent = "Sending your request…";

      var payload = Object.assign({ _subject: "New booking request " + ref + " from " + data.name, _template: "table", _captcha: "false", _replyto: data.email }, data);
      sendEmail(payload).then(function () {
        renderConfirmation(data, true);
      }).catch(function () {
        renderConfirmation(data, false);
      });
    });

    function renderConfirmation(data, sent) {
      var dl = document.getElementById("confirm-list");
      dl.innerHTML = "";
      [["Reference", data.reference], ["Design", data.design], ["Listed price", data.listed_price],
       ["Date", data.date], ["Time", data.time], ["Nail length", data.nail_length], ["Add-ons", data.add_ons],
       ["Your email", data.email], ["Your phone", data.phone]].forEach(function (row) {
        var dt = document.createElement("dt"); dt.textContent = row[0];
        var dd = document.createElement("dd"); dd.textContent = row[1];
        dl.appendChild(dt); dl.appendChild(dd);
      });
      var msg = "Hi Jenn, I'd like to book: " + data.design + " on " + data.date + " at " + data.time +
        ". Reference " + data.reference + ". My name is " + data.name + ".";
      document.getElementById("confirm-whatsapp").href = waLink(msg);
      document.getElementById("confirm-title").textContent = sent ? "Thank you, " + data.name.split(" ")[0] + ". Your request is in." : "We could not send that automatically";
      document.getElementById("confirm-text").textContent = sent
        ? "Jenn will confirm your time by email or WhatsApp. Jenn confirms the final price when she confirms your time."
        : "Your details are safe below. Send them to Jenn on WhatsApp instead, or try again in a moment.";
      document.getElementById("confirm-retry").hidden = sent;
      confirmEl.classList.toggle("notice-fail", !sent);
      confirmEl.hidden = false;
      bf.hidden = true;
      confirmEl.querySelector("h2").focus();
      confirmEl.scrollIntoView({ behavior: "smooth", block: "start" });
      submitBtn.disabled = false; submitBtn.textContent = "Send booking request";
    }

    document.getElementById("confirm-retry").addEventListener("click", function () {
      confirmEl.hidden = true; bf.hidden = false; els.name.focus();
    });
    document.getElementById("new-booking").addEventListener("click", function () {
      bf.reset(); confirmEl.hidden = true; bf.hidden = false;
      Array.prototype.forEach.call(bf.querySelectorAll(".field"), function (f) { f.classList.remove("has-error", "is-valid"); });
      buildTimes(); updateEstimate(); updateCount(); els.name.focus();
    });

    buildTimes(); updateEstimate(); updateCount();
  }

  // =====================================================================
  // CONTACT FORM
  // =====================================================================
  var cf = document.getElementById("contact-form");
  if (cf) {
    var c = {
      name: cf.elements["name"], email: cf.elements["email"], phone: cf.elements["phone"],
      topic: cf.elements["topic"], message: cf.elements["message"]
    };
    var cSummary = document.getElementById("c-error-summary");
    var cConfirm = document.getElementById("c-confirmation");
    var cBtn = document.getElementById("c-submit");
    var cCount = document.getElementById("c-count");

    function cCheck(input) {
      var m = "";
      if (input.name === "name") m = rules.name(input.value);
      else if (input.name === "email") m = rules.email(input.value);
      else if (input.name === "phone") m = rules.phone(input.value, false);
      else if (input.name === "topic") m = rules.select(input.value, "what your message is about");
      else if (input.name === "message") m = rules.message(input.value, 10, 1000);
      setError(input, m);
      return m;
    }
    function cReply() {
      var any = cf.querySelector('input[name="reply"]:checked');
      var group = document.getElementById("reply-field");
      group.classList.toggle("has-error", !any);
      group.querySelector(".field-error").textContent = any ? "" : "Choose how you would like us to reply.";
      return any ? "" : "Choose how you would like us to reply.";
    }
    Object.keys(c).forEach(function (k) {
      var input = c[k];
      input.addEventListener("blur", function () { if (input.value || k !== "phone") cCheck(input); });
      input.addEventListener(k === "topic" ? "change" : "input", function () {
        var f = fieldEl(input);
        if (f.classList.contains("has-error") || f.classList.contains("is-valid")) cCheck(input);
      });
    });
    c.message.addEventListener("input", function () { cCount.textContent = c.message.value.length + " / 1000"; });
    Array.prototype.forEach.call(cf.querySelectorAll('input[name="reply"]'), function (r) { r.addEventListener("change", cReply); });

    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = [];
      Object.keys(c).forEach(function (k) { var m = cCheck(c[k]); if (m) errors.push({ id: c[k].id, msg: m }); });
      var rm = cReply(); if (rm) errors.push({ id: "reply-email", msg: rm });
      showSummary(cSummary, errors);
      if (errors.length) return;
      if (cf.elements["website"].value) return;

      var data = {
        name: c.name.value.trim(), email: c.email.value.trim(), phone: cleanPhone(c.phone.value) || "Not given",
        topic: c.topic.value, preferred_reply: cf.querySelector('input[name="reply"]:checked').value,
        message: c.message.value.trim()
      };
      cBtn.disabled = true; cBtn.textContent = "Sending…";
      var payload = Object.assign({ _subject: "Website message: " + data.topic + " (" + data.name + ")", _template: "table", _captcha: "false", _replyto: data.email }, data);

      sendEmail(payload).then(function () {
        document.getElementById("c-confirm-title").textContent = "Message sent. Thank you, " + data.name.split(" ")[0] + ".";
        document.getElementById("c-confirm-text").textContent = "Jenn replies by " + data.preferred_reply.toLowerCase() + ", usually within one working day.";
        document.getElementById("c-whatsapp").hidden = true;
        cf.hidden = true; cConfirm.hidden = false; cConfirm.querySelector("h2").focus();
      }).catch(function () {
        document.getElementById("c-confirm-title").textContent = "We could not send that automatically";
        document.getElementById("c-confirm-text").textContent = "Send your message on WhatsApp instead, or try again in a moment.";
        var wa = document.getElementById("c-whatsapp");
        wa.href = waLink("Hi Jenn, " + data.message + " (from " + data.name + ", " + data.email + ")");
        wa.hidden = false;
        cf.hidden = true; cConfirm.hidden = false; cConfirm.querySelector("h2").focus();
      }).then(function () { cBtn.disabled = false; cBtn.textContent = "Send message"; });
    });

    document.getElementById("c-again").addEventListener("click", function () {
      cf.reset(); cf.hidden = false; cConfirm.hidden = true;
      Array.prototype.forEach.call(cf.querySelectorAll(".field"), function (f) { f.classList.remove("has-error", "is-valid"); });
      c.name.focus();
    });
  }
})();
