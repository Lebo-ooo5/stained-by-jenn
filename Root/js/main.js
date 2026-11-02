/* Site-wide behaviour: mobile menu, open/closed status, today's hours. */
(function () {
  "use strict";

  // ---- Mobile navigation toggle ----
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        toggle.focus();
      }
    });
  }

  // ---- Open / closed status (uses South African time, whatever the visitor's timezone) ----
  function saNow() {
    var tz = (window.BUSINESS && BUSINESS.timeZone) || "Africa/Johannesburg";
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
    var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: dayMap[get("weekday")], hour: parseInt(get("hour"), 10) % 24 + parseInt(get("minute"), 10) / 60 };
  }

  function fmt(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return hh + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function statusText() {
    var now = saNow(), today = BUSINESS.hours[now.day];
    if (!today) return { open: false, text: "Closed today. Sunday bookings are by appointment." };
    if (now.hour >= today[0] && now.hour < today[1]) return { open: true, text: "Open now, until " + fmt(today[1]) };
    if (now.hour < today[0]) return { open: false, text: "Closed. Opens today at " + fmt(today[0]) };
    return { open: false, text: "Closed for today." };
  }

  var pill = document.getElementById("open-status");
  if (pill && window.BUSINESS) {
    var s = statusText();
    pill.classList.add(s.open ? "is-open" : "is-closed");
    pill.querySelector(".status-text").textContent = s.text;
  }

  var todayRow = document.querySelector('.hours li[data-day="' + (window.BUSINESS ? saNow().day : "") + '"]');
  if (todayRow) todayRow.classList.add("is-today");
})();
