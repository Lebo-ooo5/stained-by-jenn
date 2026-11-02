/* Gallery: dynamic cards built from DESIGNS, live search, category filter and an accessible lightbox. */
(function () {
  "use strict";
  var grid = document.getElementById("gallery-grid");
  if (!grid || !window.DESIGNS) return;

  var searchInput = document.getElementById("gallery-search");
  var chipBox = document.getElementById("category-chips");
  var countEl = document.getElementById("result-count");
  var emptyEl = document.getElementById("gallery-empty");

  var activeCategory = "All";
  var visible = DESIGNS.slice();     // what the lightbox steps through
  var lastTrigger = null;

  function money(n) { return "R" + n.toLocaleString("en-ZA"); }

  // ---- Category chips (built from the data, so new categories appear automatically) ----
  var cats = ["All"];
  DESIGNS.forEach(function (d) { if (cats.indexOf(d.category) === -1) cats.push(d.category); });
  cats.forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = c;
    b.setAttribute("aria-pressed", c === "All" ? "true" : "false");
    b.addEventListener("click", function () {
      activeCategory = c;
      Array.prototype.forEach.call(chipBox.children, function (el) {
        el.setAttribute("aria-pressed", el === b ? "true" : "false");
      });
      render();
    });
    chipBox.appendChild(b);
  });

  // ---- Render ----
  function matches(d, q) {
    if (activeCategory !== "All" && d.category !== activeCategory) return false;
    if (!q) return true;
    var hay = (d.name + " " + d.look + " " + d.category + " " + d.price + " " + money(d.price)).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function render() {
    var q = searchInput.value.trim();
    visible = DESIGNS.filter(function (d) { return matches(d, q); });
    grid.innerHTML = "";
    visible.forEach(function (d, i) {
      var li = document.createElement("li");
      li.className = "design-card";
      li.innerHTML =
        '<button type="button" class="design-thumb" data-index="' + i + '" aria-label="View larger photo: ' + d.name + ', ' + d.look + '">' +
        '<img src="' + d.image + '" alt="' + d.alt + '" width="' + d.width + '" height="' + d.height + '" loading="lazy"></button>' +
        '<div class="design-body"><h3>' + d.name + '</h3><p class="design-look">' + d.look + '</p>' +
        '<p class="design-price">' + money(d.price) + '</p>' +
        '<a class="btn btn--small" href="book.html?design=' + encodeURIComponent(d.id) + '">Book this design</a></div>';
      grid.appendChild(li);
    });
    countEl.textContent = visible.length === DESIGNS.length && !q
      ? "Showing all " + DESIGNS.length + " designs"
      : "Showing " + visible.length + " of " + DESIGNS.length + " designs";
    emptyEl.hidden = visible.length !== 0;
  }

  searchInput.addEventListener("input", render);
  document.getElementById("search-form").addEventListener("submit", function (e) { e.preventDefault(); });

  // ---- Lightbox ----
  var box = document.getElementById("lightbox");
  var imgEl = document.getElementById("lightbox-img");
  var nameEl = document.getElementById("lightbox-name");
  var lookEl = document.getElementById("lightbox-look");
  var countLbl = document.getElementById("lightbox-count");
  var bookLink = document.getElementById("lightbox-book");
  var closeBtn = document.getElementById("lightbox-close");
  var idx = 0;

  function show(i) {
    idx = (i + visible.length) % visible.length;
    var d = visible[idx];
    imgEl.src = d.image; imgEl.alt = d.alt;
    nameEl.textContent = d.name + " · " + money(d.price);
    lookEl.textContent = d.look;
    countLbl.textContent = (idx + 1) + " of " + visible.length;
    bookLink.href = "book.html?design=" + encodeURIComponent(d.id);
  }

  function open(i, trigger) {
    lastTrigger = trigger;
    show(i);
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    box.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  }

  grid.addEventListener("click", function (e) {
    var t = e.target.closest(".design-thumb");
    if (t) open(parseInt(t.getAttribute("data-index"), 10), t);
  });
  document.getElementById("lightbox-prev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { show(idx + 1); });
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });

  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "Tab") {           // keep keyboard focus inside the dialog
      var f = box.querySelectorAll("button, a[href]");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Touch swipe
  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    startX = null;
  });

  // Allow links like gallery.html?q=french to pre-fill the search
  var params = new URLSearchParams(window.location.search);
  if (params.get("q")) searchInput.value = params.get("q");
  render();
})();
