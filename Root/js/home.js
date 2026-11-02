/* Homepage: build the "popular designs" row from the shared data. */
(function () {
  "use strict";
  var row = document.getElementById("featured-grid");
  if (!row || !window.DESIGNS) return;
  var ids = ["stiletto-gold", "high-set", "marble-set", "ombre-set"];
  ids.forEach(function (id) {
    var d = DESIGNS.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    var li = document.createElement("li");
    li.className = "design-card";
    li.innerHTML =
      '<a class="design-thumb" href="gallery.html?q=' + encodeURIComponent(d.category) + '" aria-label="See more ' + d.category + ' designs">' +
      '<img src="' + d.image + '" alt="' + d.alt + '" width="' + d.width + '" height="' + d.height + '" loading="lazy"></a>' +
      '<div class="design-body"><h3>' + d.name + '</h3><p class="design-look">' + d.look + '</p>' +
      '<p class="design-price">R' + d.price.toLocaleString("en-ZA") + '</p></div>';
    row.appendChild(li);
  });
})();
