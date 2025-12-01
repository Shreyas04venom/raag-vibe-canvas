# RaagWeather - Weather-Driven Music Streaming Platform

A fully interactive, production-ready music streaming application that curates playlists based on real-time weather conditions. Built with React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, and Framer Motion.

## ✨ Features

### 🎵 Core Music Features
- **Interactive Music Player**: Full-featured player with play/pause, skip, shuffle, repeat, and queue management
- **Queue Management**: Add, remove, and reorder songs in your queue with drag-and-drop
- **Playlists**: Create, edit, and manage custom playlists
- **Favorites**: Like songs and build your favorites collection
- **Recently Played**: Track your listening history
- **Search**: Real-time search with autocomplete for songs, artists, and albums

### 🌤️ Weather Integration
- **Weather-Based Recommendations**: Music suggestions based on current weather conditions
- **Animated Weather Cards**: Beautiful weather visualizations with real-time updates
- **Location-Based Content**: Personalized content based on your location

### 👥 Social Features
- **Listening Parties**: Host or join real-time listening sessions with friends
- **Live Chat**: Interactive chat in party rooms
- **User Profiles**: Customizable profiles with listening stats and achievements
- **Sharing**: Share songs, playlists, and parties

### ⚙️ Customization
- **Settings**: Comprehensive settings for audio quality, language, theme, and notifications
- **Multiple Languages**: Support for English, Hindi, Marathi, Tamil, Telugu, Punjabi, and Bengali
- **Dark/Light Mode**: Toggle between themes
- **Audio Quality**: Choose from Low, Medium, High, and Lossless (Premium)

### 🎨 UI/UX
- **Glassmorphism Design**: Modern, translucent UI with blur effects
- **Smooth Animations**: Framer Motion animations throughout
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Interactive Feedback**: Toast notifications and visual feedback for all actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raagweather
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
# or
bun dev
```

5. Open your browser to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── Navigation.tsx  # App navigation
│   ├── MiniPlayer.tsx  # Persistent mini player
│   ├── SongCard.tsx    # Song display card
│   ├── WeatherCard.tsx # Weather widget
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── PlayerContext.tsx   # Music player state
│   └── PlaylistContext.tsx # Playlist management
├── pages/              # Application pages
│   ├── Splash.tsx      # Splash screen
│   ├── Auth.tsx        # Login/Signup
│   ├── Home.tsx        # Main dashboard
│   ├── Player.tsx      # Full-screen player
│   ├── Search.tsx      # Search page
│   ├── Library.tsx     # User library
│   ├── Party.tsx       # Listening parties
│   ├── Profile.tsx     # User profile
│   ├── Settings.tsx    # App settings
│   ├── Queue.tsx       # Queue management
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── assets/             # Images and static files
├── App.tsx             # Root component with routing
└── main.tsx            # Application entry point
```

## 🎯 Key Technologies

- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Utility-first CSS framework
- **Shadcn UI**: Beautiful, accessible component library
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing
- **Context API**: Global state management
- **Lucide React**: Icon library

## 🔐 Authentication

The app includes a demo authentication system with:
- Email/password login and signup
- Google sign-in (demo)
- Password reset flow
- Session persistence with localStorage
- Protected routes

**Note**: This is a frontend demo. For production, integrate with your backend authentication service.

## 🎵 Player State Management

The `PlayerContext` provides:
- Current song and playback state
- Play, pause, skip controls
- Queue management (add, remove, reorder)
- Shuffle and repeat modes
- Volume control
- Progress tracking

## 📝 Playlist Management

The `PlaylistContext` handles:
- Create, edit, delete playlists
- Add/remove songs from playlists
- Favorites management
- Recently played tracking
- Drag-and-drop reordering

## 🎨 Theming

The app uses a custom design system with:
- CSS variables for colors
- Semantic color tokens
- Glassmorphism utilities
- Gradient utilities
- Custom animations

Colors and themes are defined in `src/index.css` and `tailwind.config.ts`.

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration (for future backend integration)
VITE_API_BASE_URL=https://api.yourbackend.com
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Feature Flags
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_PARTY_MODE=true
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

The production build will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set build command to `npm run build` or `bun run build`
3. Set output directory to `dist`
4. Add environment variables in the platform settings

## 🔌 Backend Integration

To connect to a real backend:

1. **Authentication**: Replace the demo auth logic in `AuthContext.tsx` with your API calls
2. **Music Data**: Fetch songs, playlists, and albums from your API
3. **Weather**: Integrate with a weather API (OpenWeatherMap, WeatherAPI, etc.)
4. **Real-time**: Use WebSockets for listening party synchronization
5. **Storage**: Use cloud storage (S3, Cloudinary) for album art and user avatars

## 📱 Progressive Web App (PWA)

To enable PWA features:

1. Install `vite-plugin-pwa`:
```bash
npm install vite-plugin-pwa -D
```

2. Configure in `vite.config.ts`
3. Add manifest and service worker
4. Enable offline support

## 🎭 Demo Data

The app uses mock data for demonstration. Replace with real API calls:

- **Songs**: See `mockSongs` in various pages
- **Playlists**: Stored in `PlaylistContext`
- **Weather**: Mock weather data in `WeatherCard`
- **Users**: Demo users in `AuthContext`

## 🧪 Testing

Add tests with your preferred framework:

```bash
# Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# React Testing Library
npm install -D @testing-library/react @testing-library/user-event
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@raagweather.com (demo)

## 🎉 Acknowledgments

- UI inspiration from Spotify, Apple Music, and modern weather apps
- Icons by Lucide React
- Components by Shadcn UI
- Animations by Framer Motion

---

Built with ❤️ by the RaagWeather Team
