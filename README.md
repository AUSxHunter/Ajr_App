# Ajr - Spiritual Progress Tracker

A React Native (Expo) mobile app for tracking Islamic worship practices using progressive overload methodology.

## Overview

Ajr helps Muslims track and grow their daily ibadah (worship) practices with a structured approach inspired by strength training principles. Instead of gamifying hasanat (spiritual rewards), Ajr focuses on tracking effort, consistency, and sustainable growth.

## Features

### Core Features
- **Today Session** - Hevy-style stacked cards for logging daily ibadah
- **Set-Based Logging** - Track individual sets with values and optional timer integration
- **Timer** - Stopwatch and countdown modes for time-based worship
- **Session History** - Calendar view with weekly navigation
- **Analytics Dashboard** - Charts, trends, and personal records
- **Custom Ibadah** - Create your own ibadah types with custom icons and colors

### Intelligence Features
- **Progressive Overload Suggestions** - Gentle nudges to increase when ready
- **Burnout Detection** - Identifies declining trends and suggests deload periods
- **Minimum Viable Day** - Set baseline targets for maintaining consistency
- **Personal Records** - Track your best days for each ibadah type

### Default Ibadah Types
- Quran (pages)
- Qiyam (minutes)
- Dhikr (count)
- Sadaqah (currency)
- Fasting (count)
- Dua (minutes)

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm or yarn
- Expo Go app (for development)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Device
- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Or press `a` for Android emulator, `i` for iOS simulator

## Project Structure

```
ajr-app/
├── app/                      # Expo Router screens
│   ├── (tabs)/               # Tab screens
│   ├── session/              # Session detail screens
│   ├── settings/             # Settings sub-screens
│   └── onboarding/           # Onboarding flow
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── session/              # Session-related components
│   ├── timer/                # Timer components
│   ├── analytics/            # Analytics components
│   ├── history/              # History components
│   └── insights/             # Suggestions & warnings
├── store/                    # Zustand stores
├── utils/                    # Utility functions
├── constants/                # Theme and defaults
├── types/                    # TypeScript types
└── db/                       # Database/sync logic
```

## Technology Stack

- **Framework:** React Native with Expo SDK 55
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand with AsyncStorage persistence
- **Styling:** React Native StyleSheet with custom design system
- **Animations:** React Native Reanimated
- **Icons:** Expo Vector Icons (Feather)

## Design System

### Colors
- Background: Pure black (#000000) with dark gray accents
- Accent: Blue (#3B82F6)
- Each ibadah type has a unique color for visual distinction

### Typography
- Clean, modern sans-serif fonts
- Large numbers for stats and timer
- Hierarchical text sizing

## Key Concepts

### Progressive Overload
Small, sustainable increases in worship volume over time. When consistency is high, the app suggests modest increases (5-10%).

### Deload
Intentional reduction in volume to prevent burnout. The app detects declining trends and recommends recovery periods.

### Minimum Viable Day (MVD)
The absolute minimum ibadah you commit to on your worst days. Preserves consistency without guilt.

## Privacy

- All data stored locally on device
- No accounts required
- Optional cloud sync (coming soon)
- Privacy mode for sensitive content

## Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

## License

MIT

## Acknowledgments

- Inspired by [Hevy](https://www.hevyapp.com/) workout tracker
- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
