/* Interactive map on the Contact page. Uses Leaflet + OpenStreetMap; falls back to the Google Maps embed if the library cannot load. */
(function () {
  "use strict";
  var el = document.getElementById("map");
  if (!el || !window.BUSINESS) return;

  function fallback() {
    el.innerHTML = '<iframe class="map-fallback" title="Map showing Stained.By.Jenn in Protea Glen, Soweto" loading="lazy" ' +
      'src="https://www.google.com/maps?q=' + BUSINESS.lat + ',' + BUSINESS.lng + '&z=16&output=embed"></iframe>';
  }
  if (!window.L) { fallback(); return; }

  var pos = [BUSINESS.lat, BUSINESS.lng];
  var map = L.map(el, { scrollWheelZoom: false }).setView(pos, 16);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var marker = L.marker(pos, { title: BUSINESS.name, alt: "Map pin for " + BUSINESS.name }).addTo(map);
  marker.bindPopup("<strong>" + BUSINESS.name + "</strong><br>" + BUSINESS.address).openPopup();

  // Scroll-zoom only after the visitor clicks the map, so the page can still scroll on touch and trackpads
  map.on("focus", function () { map.scrollWheelZoom.enable(); });
  map.on("blur", function () { map.scrollWheelZoom.disable(); });

  var locate = document.getElementById("locate-me");
  var note = document.getElementById("map-note");
  if (locate) {
    locate.addEventListener("click", function () {
      if (!navigator.geolocation) { note.textContent = "Your browser does not support location."; return; }
      note.textContent = "Finding you…";
      navigator.geolocation.getCurrentPosition(function (p) {
        var me = [p.coords.latitude, p.coords.longitude];
        L.circleMarker(me, { radius: 8, color: "#8f4a63", fillColor: "#be8296", fillOpacity: 0.9 }).addTo(map).bindPopup("You are here");
        map.fitBounds([me, pos], { padding: [40, 40] });
        var km = (map.distance(me, pos) / 1000).toFixed(1);
        note.textContent = "You are about " + km + " km from the studio (straight line).";
      }, function () {
        note.textContent = "We could not get your location. Use the directions button instead.";
      }, { timeout: 8000 });
    });
  }
})();
