// Route photo galleries — [largeImage, smallTop, smallBottom]
// Large image is shown prominently; two smaller ones fill the right column.

const BASE = 'https://images.unsplash.com/';
const q = '?w=800&q=75';

const ROUTE_GALLERY = {
  // Kitchen Loop — Bicycle Kitchen, East Hollywood neighbourhood riding
  'rt-kitchen-loop': [
    BASE + 'photo-1571068316344-75bc76f77890' + q, // bike repair workshop
    BASE + 'photo-1517649763962-0c623066013b' + q, // group ride / cycling
    BASE + 'photo-1558618666-fcd25c85cd64' + q,    // urban street cycling
  ],

  // Jefferson Park → Hollywood — city cycling, Hollywood sign territory
  'rt-jefferson-hollywood': [
    BASE + 'photo-1534430480872-3498386e7856' + q, // Hollywood Hills view
    BASE + 'photo-1608838030235-988d113819cc' + q, // LA street / cycling
    BASE + 'photo-1501854140801-50d01698950b' + q, // urban green park
  ],

  // East Hollywood → North Hollywood — LA River bike path
  'rt-easthollywood-nohollywood': [
    BASE + 'photo-1502744688674-c619d1586c9e' + q, // LA River / cycling path
    BASE + 'photo-1558618666-fcd25c85cd64' + q,    // urban cycling
    BASE + 'photo-1529156069898-49953e39b3ac' + q, // NoHo / Valley neighbourhood
  ],

  // Bicycle Kitchen → Re:Ciclos — bike shop to bike shop
  'bicicocina-reciclos': [
    BASE + 'photo-1608838030235-988d113819cc' + q, // East Hollywood streets
    BASE + 'photo-1571068316344-75bc76f77890' + q, // bike repair / shop
    BASE + 'photo-1517649763962-0c623066013b' + q, // community riding
  ],

  // UCLA → Santa Monica Pier — Westside, beach, pier
  'ucla-santamonica': [
    BASE + 'photo-1523430410476-0185cb1f6ff9' + q, // Santa Monica / beach
    BASE + 'photo-1562774053-701939374585' + q,    // UCLA campus
    BASE + 'photo-1507104573935-f2cef5a99b3c' + q, // Santa Monica Pier
  ],

  // Kitchen → Echo Park Lake
  'rt-echo-park': [
    BASE + 'photo-1558618666-fcd25c85cd64' + q,    // Echo Park Lake area
    BASE + 'photo-1501854140801-50d01698950b' + q, // lakeside park
    BASE + 'photo-1517649763962-0c623066013b' + q, // cycling to park
  ],
};

// Generic LA cycling fallback for any route not listed above
const DEFAULT_GALLERY = [
  BASE + 'photo-1517649763962-0c623066013b' + q,
  BASE + 'photo-1558618666-fcd25c85cd64' + q,
  BASE + 'photo-1608838030235-988d113819cc' + q,
];

export function getRouteGallery(routeId) {
  return ROUTE_GALLERY[routeId] ?? DEFAULT_GALLERY;
}
