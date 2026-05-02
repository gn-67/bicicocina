# BiciCocina — Project Documentation

## Mission

The Bicycle Kitchen (La Bicicocina) is a 501(c)(3) nonprofit in East Hollywood, Los Angeles (4429 Fountain Ave). Run by ~15 volunteers, it provides tools, stands, and donated parts so anyone can learn to work on their own bike — regardless of background or budget. Its mission: promote the bicycle as fun, safe, and accessible transportation, foster healthy urban communities, and provide a welcoming space for learning.

## Problem

Many community members who visit the Kitchen are newer cyclists who feel uncertain or intimidated about riding in LA once they leave. The Kitchen teaches people to *fix* bikes, but there's no resource to help them feel confident *riding* them — navigating traffic, finding safe routes, or understanding basic cycling safety.

## Solution

A mobile app that serves as the digital extension of the Bicycle Kitchen's hands-on education. When someone rolls out the door on a newly repaired bike, they have the knowledge, routes, and community support to ride confidently.

---

## Core Pillars

### 1. Plan — Finding a route you trust
- Beginner-friendly route planner with three modes: **Safest** (max bike lane coverage), **Scenic**, **Quickest-but-safe**
- Filter by lighting, elevation, traffic stress, neighborhood
- Browse community-rated routes near you
- Save routes offline (phones die, signal drops)

### 2. Ride — Feeling supported in the saddle
- Turn-by-turn navigation with audio cues (announces when bike lanes start/end)
- Friends/group ride view: see where co-riders are in real time
- Phone-shake → 911 with 10-second cancel countdown (only armed mid-ride)
- One-tap "Route me to the Kitchen" panic button

### 3. Reflect & Rate — Closing the loop
- Ride summary (distance, pace, elevation, calories, optional Strava export)
- Rate the route on a structured rubric: safety, lighting, beginner-friendliness, scenic value, surface quality
- Ratings re-weight the public score so the map gets smarter over time
- Add photos to routes

### 4. Learn & Belong — The Bicycle Kitchen layer
- Bike anatomy explorer (ties hands-on Kitchen learning to digital reference)
- Safety microvideos (signaling, door zones, left turns, how to take the lane)
- Kitchen hours, workshop calendar, "call before you come" reminder, donation link, volunteer signup
- FTWNB hours surfaced clearly with context, not buried

---

## Pages & Features

### Explore Tab (`app/(tabs)/index.js`)

The home screen. Users discover and browse bike routes.

- **Filter tags**: Scenic, Quickest-but-safe, Safest, Beginner, Bike Lane Only
- **Route list**: Cards showing route name, distance, rating, tags
- **Active vs. Non-active routes**:
  - **Active**: A route leader has scheduled a group ride at a specific time and meeting spot. Users can join and will see co-riders in real time during the ride.
  - **Non-active**: A saved route anyone can ride solo at any time.
- **Posting a route**: Users can post routes as active or non-active, specifying time and starting location for active rides.

### Route Detail Page (`app/route/[id].js`)

Tapping a route card opens the full route page. This is the richest screen in the app.

**Sections:**
- **Map preview**: Shows the route on a map
- **Route info**: Distance, estimated time, elevation, bike lane coverage
- **Start Ride button**: Launches turn-by-turn navigation with audio cues
- **Audio cues during ride**: "Bike lane ends in 200 feet", "Protected lane ahead"
- **Ride completion summary**: Distance, pace, elevation, calories (Strava-style). Optional Strava export.
- **Structured rating rubric** (post-ride survey):
  - Safety (1–5)
  - Lighting (1–5)
  - Beginner-friendliness (1–5)
  - Scenic value (1–5)
  - Surface quality (1–5)
  - Easy to submit — designed to be quick, not tedious
- **Photos**: Users can add photos to the route (street views, hazards, scenery)
- **Reviews**: Google Reviews-style section — text reviews with ratings underneath route info
- **Friends/group ride view**: During an active ride, see where co-riders are in real time on the map
- **Safety features (mid-ride only)**:
  - Phone-shake → 911 call with 10-second cancel countdown
  - One-tap "Route me to the Kitchen" panic button

### Map Tab (`app/(tabs)/map.js`)

Full-screen map showing all routes near the user.

- **Route density heatmap**: Light up areas where most users are actively riding
- **Tap a route on the map** → popup with route info card (name, rating, distance, active status)
- **Tap the popup** → navigates to the full route detail page
- **Filter overlay**: Same filters as Explore (Scenic, Safest, etc.)
- Future: LA Metro Bike Share / GIS integration (LA City publishes bike lane GeoJSON)

### Kitchen Tab (`app/(tabs)/kitchen.js`)

The Bicycle Kitchen's digital home. Connects the app back to the physical space.

- **Visit Us**: Address (4429 Fountain Ave), hours, "call before you come" reminder
- **FTWNB hours**: Surfaced clearly with context, not buried in a submenu
- **Workshop calendar**: Upcoming events and classes
- **Safety microvideos**: Signaling, door zones, left turns, how to take the lane
- **Bike anatomy explorer**: Interactive reference tying Kitchen hands-on learning to digital
- **Volunteer signup**: Sign up to help at the Kitchen
- **Donation link**: Support the nonprofit
- **"Ride with a Cook"**: Tag Kitchen volunteers as ride buddies for scheduled group rides leaving from 4429 Fountain — makes the app a direct extension of the physical space
- **Project Bikes info**: How the Kitchen's build-a-bike program works

### Profile Tab (`app/(tabs)/profile.js`)

Personal dashboard.

- **Ride history**: Past rides with date, distance, route name
- **Saved routes**: Bookmarked routes for later
- **"What I learned today"**: Post-ride micro-reflection prompt ("I practiced signaling left turns") — builds a personal learning log connecting riding back to Kitchen education
- **Your reviews/ratings**: Routes you've reviewed
- **Settings**: Language toggle (EN/ES), notification preferences

---

## Where Do People Write Reviews?

Reviews and ratings are submitted on the **Route Detail Page** (`app/route/[id].js`) — specifically after completing a ride. The flow:

1. User taps "Start Ride" on a route
2. Turn-by-turn navigation with audio cues
3. Ride completes → summary screen
4. Prompted with the structured rating rubric (safety, lighting, etc.)
5. Optional: add photos, write a text review
6. Review appears on the route detail page for all users to see

Users can also access the review section by scrolling down on any route detail page (similar to Google Maps reviews) and submit a review without riding — but post-ride reviews are encouraged and weighted higher.

---

## Tech Stack

- **Framework**: React Native / Expo (SDK 54)
- **Routing**: Expo Router (file-based)
- **Backend**: Supabase (auth, database, real-time, storage)
- **Maps**: `react-native-maps` + `expo-location`
- **Language**: JavaScript (not TypeScript — hackathon speed)
- **i18n**: Bilingual from day one (English + Spanish) — East Hollywood is heavily Spanish-speaking, and it's literally called La Bicicocina

---

## Project Structure

```
bicicocina/
├── app/                          # Expo Router — file-based routes
│   ├── _layout.js                # Root layout (Stack navigator)
│   ├── (tabs)/                   # Tab group
│   │   ├── _layout.js            # Tab bar config (Explore, Map, Kitchen, Profile)
│   │   ├── index.js              # Explore tab
│   │   ├── map.js                # Map tab
│   │   ├── kitchen.js            # Bicycle Kitchen tab
│   │   └── profile.js            # Profile tab
│   └── route/
│       └── [id].js               # Route detail page
│
├── components/                   # Reusable UI components
│   ├── RouteCard.js              # Route preview card
│   ├── FilterBar.js              # Filter tags
│   ├── RatingStars.js            # Star rating display
│   ├── MapView.js                # Map wrapper component
│   └── SafetyBanner.js           # Safety info banner
│
├── lib/                          # Shared utilities & backend
│   ├── supabase.js               # Supabase client init
│   ├── constants.js              # Colors, Kitchen address, etc.
│   └── i18n.js                   # Bilingual support (EN/ES)
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.js                # Supabase auth hook
│   ├── useRoutes.js              # Fetch/filter routes
│   └── useLocation.js            # User location hook
│
├── assets/                       # Icons, splash, images
├── app.json                      # Expo config
├── package.json                  # Dependencies
├── babel.config.js               # Babel config
├── metro.config.js               # Metro bundler config
└── PROJECT.md                    # This file
```

---

## Work Division

### Backend Developer (Gokul)

| Area | File(s) | What to build |
|------|---------|---------------|
| Supabase setup | `lib/supabase.js` + Supabase dashboard | Tables, RLS policies, auth config |
| Auth flow | `hooks/useAuth.js` | Sign up, sign in, session management |
| Routes data | `hooks/useRoutes.js` | Real Supabase queries, filters, search |
| Route posting | `app/route/[id].js` | Submit ratings, reviews, photos to Supabase |
| Real-time | Supabase Realtime | Active ride positions, group ride tracking |
| Location tracking | `hooks/useLocation.js` | Background location during rides |
| Safety features | New files as needed | Shake-to-911, panic button logic |

### Frontend/Map Developer (Partner)

| Area | File(s) | What to build |
|------|---------|---------------|
| Map view | `app/(tabs)/map.js` + `components/MapView.js` | Route display, pins, polylines, heatmap |
| Explore UI | `app/(tabs)/index.js` + `components/RouteCard.js` | Route cards, filtering, active/non-active |
| Filter bar | `components/FilterBar.js` | Connect filters to route data |
| Route detail UI | `app/route/[id].js` | Map preview, rating UI, photo grid, reviews |
| Kitchen page | `app/(tabs)/kitchen.js` | Kitchen info layout, video embeds, calendar |
| Profile page | `app/(tabs)/profile.js` | Ride history, saved routes, learning log |
| Navigation UI | New files as needed | Turn-by-turn overlay, audio cue triggers |

### Shared / Both

- `lib/constants.js` — Add new constants as needed
- `lib/i18n.js` — Add new string keys as you build screens
- `components/` — Create new shared components as needed

---

## Supabase Schema (Planned)

These are the core tables to set up in Supabase:

**`profiles`** — User profiles (extends Supabase auth)
- `id` (uuid, FK to auth.users)
- `display_name`, `avatar_url`, `preferred_language` (en/es)

**`routes`** — Bike routes
- `id`, `name`, `description`, `distance_miles`, `elevation_ft`
- `coordinates` (jsonb — array of lat/lng points)
- `tags` (text array — scenic, safest, beginner, etc.)
- `created_by` (FK to profiles), `created_at`

**`active_rides`** — Scheduled group rides
- `id`, `route_id` (FK), `leader_id` (FK to profiles)
- `start_time`, `meeting_point` (lat/lng), `status` (upcoming/active/completed)

**`ride_participants`** — Who's on an active ride
- `ride_id` (FK), `user_id` (FK), `current_lat`, `current_lng`, `last_updated`

**`ratings`** — Structured route ratings
- `id`, `route_id` (FK), `user_id` (FK)
- `safety`, `lighting`, `beginner_friendliness`, `scenic_value`, `surface_quality` (each 1–5)
- `review_text`, `created_at`

**`route_photos`** — Photos attached to routes
- `id`, `route_id` (FK), `user_id` (FK), `photo_url`, `created_at`

**`ride_history`** — Completed ride logs
- `id`, `user_id` (FK), `route_id` (FK)
- `started_at`, `completed_at`, `distance`, `pace`, `elevation`, `calories`

**`reflections`** — "What I learned today" post-ride prompts
- `id`, `user_id` (FK), `ride_id` (FK), `text`, `created_at`

---

## Additional Ideas for Demo Day

- **"Ride with a Cook"**: Tag Kitchen volunteers as ride buddies for scheduled group rides from 4429 Fountain. Makes the app a direct extension of the physical space.
- **LA Metro / GIS integration**: LA City and Metro publish bike lane GeoJSON. Pull it directly — judges love seeing real civic data.
- **"What I learned today"**: Post-ride micro-reflection connecting riding back to learning (the Kitchen's ethos).
- **Bilingual**: English + Spanish from day one. East Hollywood is heavily Spanish-speaking. Judges will notice.
- **Offline support**: Save routes for offline use. Phones die, signal drops.
- **Strava export**: Optional export of ride data. Low effort, high demo impact.

---

## How to Run

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the dev server
npx expo start -c

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

**Environment variables** (create a `.env` file or set in Expo):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Key Decisions

- **Expo Router** for file-based routing (not React Navigation manually)
- **Supabase** for everything backend (auth, DB, real-time, storage) — no custom server
- **JavaScript** (not TypeScript) — hackathon speed over type safety
- **`--legacy-peer-deps`** needed for npm installs due to react-dom peer conflict from expo-router's web dependencies. This is cosmetic and doesn't affect the native app.
