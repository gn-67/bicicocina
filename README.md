# BiciCocina

## About the Bicycle Kitchen

**The Bicycle Kitchen (La Bicicocina)** is a 501(c)(3) nonprofit community bike shop located at **4429 Fountain Ave, East Hollywood, Los Angeles, CA 90029**.

Run by a dedicated team of volunteers, the Bicycle Kitchen provides tools, repair stands, and donated parts so that anyone — regardless of background or budget — can learn to work on their own bicycle. The shop is a true DIY space: mechanics guide you through fixing your own bike rather than fixing it for you.

### Mission

> *To promote the bicycle as a fun, safe, and accessible form of transportation; to foster healthy urban communities; and to provide a welcoming space to learn about building, maintaining, and riding bicycles.*

The Kitchen has served the East Hollywood community for over 20 years, offering drop-in repair hours, workshops, and educational programming. It is a space built on the belief that cycling should be available to everyone, and that knowing how to maintain your bike is just as important as knowing how to ride it.

- **Website:** [bicyclekitchen.org](https://www.bicyclekitchen.org)
- **Address:** 4429 Fountain Ave, Los Angeles, CA 90029
- **Support:** Donations and volunteering are always welcome

---

## About This App

**BiciCocina** is the digital companion to the Bicycle Kitchen — a React Native mobile app designed to help cyclists in Los Angeles ride with confidence. It is built for community members who are newer to urban cycling or who want to navigate LA's streets more safely, with a focus on the neighborhoods around East Hollywood.

The app extends the Kitchen's hands-on education into the real world: helping riders find safe routes, understand the bike lane network, and stay connected to the Bicycle Kitchen's resources while on the road.

---

## Features

### Safe Route Planning
- Search any destination in LA and receive a curated, safety-scored route
- Routes are evaluated on bike lane coverage, pothole density, and detour ratio
- Filter routes by type: Safest, Scenic, Quickest-but-safe, Beginner-Friendly, Bike Lane Only
- Prioritizes pre-curated community routes before generating new ones

### Live Navigation with Voice Guidance
- Full-screen Mapbox map that follows your location during a ride
- Turn-by-turn voice announcements via text-to-speech
- Real-time bike lane detection using LA's bike lane dataset
- Spoken alerts when entering or leaving a protected bike lane
- Color-coded display of LA's four bike infrastructure classes (protected paths, dedicated lanes, bike routes, cycle tracks)

### Ride Tracking
- Tracks distance, elevation gain, duration, pace, and estimated calories in real-time
- Supports group rides with live co-rider position sharing via Supabase Realtime
- Ride history saved to your profile after each trip

### Emergency Safety Features
- **Shake-to-911**: Detects a hard phone shake via accelerometer, gives a 10-second cancel window before dialing emergency services
- **Panic Button**: One-tap navigation to the Bicycle Kitchen using your phone's native maps app

### Community Feedback
- Rate routes across five dimensions: Safety, Lighting, Beginner-friendliness, Scenery, and Surface Quality
- Tag routes with descriptors (Low Traffic, Well Lit, Group Friendly, Ocean View, etc.)
- Ratings are used to re-score community routes over time

### Bicycle Kitchen Hub
- Mission, hours of operation, and volunteer/donation links
- Upcoming workshop and events calendar
- Bike education library: anatomy, hand signals, left turns, door zones, gear usage
- Partner organizations: Bike Oven, Re:Ciclos, and others

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Routing | Expo Router (file-based) |
| Maps | Mapbox (`@rnmapbox/maps`) |
| Geospatial | Turf.js |
| Backend | Supabase (database, auth, real-time) |
| Location | expo-location |
| Voice | expo-speech |
| Sensors | expo-sensors |
| State | Zustand |
| Local Storage | AsyncStorage |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Mapbox account](https://mapbox.com/) with a public token
- A [Supabase project](https://supabase.com/) with the required tables

### Installation

```bash
git clone https://github.com/gn-67/bicicocina.git
cd bicicocina
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## Project Structure

```
bicicocina/
├── app/                   # Screens (Expo Router file-based routing)
│   ├── (tabs)/            # Tab navigator: Explore, Map, Kitchen, Profile
│   ├── ride/[id].js       # Live navigation screen
│   ├── ride/summary.tsx   # Post-ride feedback
│   └── route/[id].js      # Route detail screen
├── components/            # Reusable UI components
├── hooks/                 # Custom hooks (location, ride tracking, voice nav, safety)
├── lib/                   # Routing algorithm, geocoding, scoring utilities
└── data/                  # GeoJSON datasets (routes, bike lanes, potholes)
```

---

## Contributing

This project is built in support of the Bicycle Kitchen's community mission. Contributions are welcome — whether that's improving route scoring, expanding the education content, or adding support for more LA neighborhoods.

Please open an issue or pull request on GitHub.

---

*Built with care for the cyclists of East Hollywood and beyond.*
