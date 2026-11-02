/* Shared design data. The gallery, homepage highlights and booking form are all built from this list,
   so a price or photo only has to be changed in one place. */
window.DESIGNS = [
  { id: "gel-overlay", name: "Classic Gel Overlay", look: "Pink french tips with a white flower", category: "Gel", price: 250, image: "images/pink-french-stiletto-nails-white-flower.webp", width: 474, height: 479, alt: "Stiletto nails with pink french tips, a white 3D flower and a gold ring detail" },
  { id: "acrylic-sculpting", name: "Acrylic Sculpting", look: "Black and teal french tips", category: "Acrylic", price: 350, image: "images/black-teal-french-tip-stiletto-nails.webp", width: 474, height: 632, alt: "Sculpted acrylic stiletto nails with black and teal french tips" },
  { id: "french-tips", name: "French Tips", look: "Nude with black bows and bunny charms", category: "French", price: 700, image: "images/nude-almond-nails-black-bow-bunny-charms.webp", width: 474, height: 474, alt: "Nude almond nails with black bow and bunny charm nail art" },
  { id: "stiletto-gold", name: "Stiletto", look: "Nude with gold accents", category: "Stiletto", price: 400, image: "images/nude-stiletto-nails-gold-accents.webp", width: 619, height: 1100, alt: "Nude stiletto nails with gold line art and orange detail, worn with gold rings" },
  { id: "almond-white-french", name: "Almond Set", look: "White french tips and flower", category: "Almond", price: 900, image: "images/white-french-tip-stiletto-nails-flower.webp", width: 474, height: 592, alt: "Long almond nails with white french tips and a white flower" },
  { id: "high-set", name: "High Set", look: "Pink butterfly art", category: "Custom art", price: 900, image: "images/pink-butterfly-stiletto-nail-art.webp", width: 887, height: 852, alt: "Pink stiletto nails with hand-painted butterfly nail art" },
  { id: "almond-orange", name: "Almond Set", look: "Orange, checkered and pink flowers", category: "Almond", price: 600, image: "images/orange-checkered-nail-art-pink-flowers.webp", width: 676, height: 843, alt: "Almond nails with orange, checkered and pink flower nail art" },
  { id: "french-set", name: "French Set", look: "White 3D charms", category: "French", price: 750, image: "images/white-3d-charm-long-nails.webp", width: 714, height: 870, alt: "Long nails with white french tips and 3D white charms" },
  { id: "marble-set", name: "Marble Set", look: "Nude with gold flake", category: "Custom art", price: 1000, image: "images/nude-nails-gold-flake-green-wall.webp", width: 712, height: 841, alt: "Nude nails with white marble and gold flake design" },
  { id: "stiletto-red", name: "Stiletto", look: "Red patterns", category: "Stiletto", price: 800, image: "images/red-pattern-stiletto-nails-green-wall.webp", width: 860, height: 863, alt: "Long stiletto nails with red and black pattern nail art" },
  { id: "ombre-set", name: "Ombre Set", look: "Pink ombre, zebra and swirls", category: "Custom art", price: 850, image: "images/pink-ombre-zebra-swirl-long-nails.webp", width: 805, height: 856, alt: "Long pink ombre nails with zebra stripes and white swirl art" },
  { id: "red-bottom", name: "Red Bottom", look: "Black french tips, red underside", category: "French", price: 700, image: "images/black-french-tip-red-square-nails.webp", width: 721, height: 876, alt: "Square nails with black french tips and red accents" }
];

window.BUSINESS = {
  name: "Stained.By.Jenn",
  email: "StainedByJenn@gmail.com",
  phoneDisplay: "067 058 0329",
  whatsapp: "27670580329",
  address: "23 Thistle Street, Protea Glen, Soweto, 1819",
  lat: -26.278984,
  lng: 27.800941,
  timeZone: "Africa/Johannesburg",
  /* day index: 0 = Sunday ... 6 = Saturday. open/close are 24h decimal hours. null = by appointment */
  hours: { 0: null, 1: [9, 17.5], 2: [9, 17.5], 3: [9, 17.5], 4: [9, 17.5], 5: [9, 17.5], 6: [9, 15] }
};
