const strings = {
  en: {
    explore: 'Explore Routes',
    map: 'Map',
    kitchen: 'The Bicycle Kitchen',
    profile: 'Your Profile',
    startRide: 'Start Ride',
    noReviews: 'No reviews yet — be the first!',
    safety: 'Always wear a helmet. Stay visible. Ride predictably.',
    visitUs: 'Visit Us',
    learn: 'Learn',
    getInvolved: 'Get Involved',
  },
  es: {
    explore: 'Explorar Rutas',
    map: 'Mapa',
    kitchen: 'La Bicicocina',
    profile: 'Tu Perfil',
    startRide: 'Iniciar Ruta',
    noReviews: 'No hay reseñas todavía — ¡sé el primero!',
    safety: 'Siempre usa casco. Sé visible. Pedalea de forma predecible.',
    visitUs: 'Visítanos',
    learn: 'Aprende',
    getInvolved: 'Participa',
  },
};

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = lang;
}

export function t(key) {
  return strings[currentLang]?.[key] || strings.en[key] || key;
}
