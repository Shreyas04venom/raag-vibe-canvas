# RaagWeather — Production Overhaul Plan

You currently can't hear music because the app calls Spotify's `/search` endpoint with client-credentials, and Spotify is returning **403 "Active premium subscription required for the owner of the app"** (visible in the network logs). Even if that worked, Spotify's Web API does not return playable audio URLs on the free tier — only 30s preview snippets, and only sometimes. This has to be replaced with a real, free, playable source.

## Strategy

Rebuild the data + playback layer on **iTunes Search API + Deezer API** (both free, no key, both return 30s high-quality preview MP3s that play in `<audio>`), and back everything else with **Lovable Cloud (Supabase)** so the app is stateful and multi-user. Frontend stays React 18 + Vite + Tailwind + shadcn + Framer Motion, but every screen gets wired to real data.

## Architecture

```text
┌─────────────── Frontend (React) ───────────────┐
│  Pages → Contexts → Services → Edge Functions  │
│                       ↓                        │
│              iTunes / Deezer / OpenWeather     │
│                       ↓                        │
│                 Lovable Cloud DB               │
└────────────────────────────────────────────────┘
```

- **Music source**: iTunes Search API (primary, CORS-enabled, returns `previewUrl` MP3) with Deezer fallback via edge function proxy.
- **Weather**: OpenWeather (key already in env) via edge function so the key stays server-side.
- **AI recommendations**: Lovable AI Gateway (Gemini) via edge function — generate weather-mood → search-query mapping and smart playlist descriptions.
- **Auth**: Lovable Cloud email/password + Google, with `profiles` table.
- **Realtime**: Supabase Realtime for party rooms + chat.

## Database (single migration)

- `profiles` (display_name, avatar_url, bio, country, premium)
- `favorites` (user_id, track_id, track_json)
- `history` (user_id, track_id, track_json, played_at)
- `playlists` (user_id, name, description, cover_url, is_public)
- `playlist_tracks` (playlist_id, track_id, track_json, position)
- `parties` (host_id, name, invite_code, current_track_json, position_ms, is_playing)
- `party_members` (party_id, user_id)
- `party_messages` (party_id, user_id, content)
- `party_reactions` (party_id, user_id, emoji)
- `user_settings` (user_id, theme, audio_quality, language, notifications, equalizer_json)
- `follows` (follower_id, following_id)
- `user_roles` + `has_role()` (admin support)

All with RLS, GRANTs, and `updated_at` triggers.

## Edge Functions

1. `music-search` — proxies iTunes + Deezer, normalizes into unified `Track` shape.
2. `weather` — OpenWeather proxy (by coords or city), returns weather + mood mapping.
3. `ai-recommend` — Lovable AI: given weather + mood + history, returns search queries + playlist copy.
4. `lyrics` — lyrics.ovh proxy (free, no key).
5. `mcp` — already exists, keep.

## Real Playback Engine

Rewrite `PlayerContext` around a single `<audio>` element:
- Actually plays `track.previewUrl`
- Real progress, seek, volume, mute
- Queue with shuffle/repeat (off/one/all)
- Auto-advance on `ended`
- Media Session API (lockscreen controls on mobile)
- Crossfade toggle, gapless attempt
- Persists last track + queue to localStorage + DB

## 50 Features (implemented)

Playback: 1) Real audio playback  2) Global mini-player  3) Full-screen player  4) Seek scrubber  5) Volume + mute  6) Shuffle  7) Repeat off/one/all  8) Queue reorder (drag)  9) Add-to-queue  10) Play-next  11) Media Session lockscreen  12) Keyboard shortcuts (space, ←/→, ↑/↓, M, N, P)  13) Sleep timer  14) Crossfade toggle  15) Playback speed

Discovery: 16) Weather-adaptive home feed  17) Live geolocation weather  18) Manual city search  19) AI mood recommendations  20) Trending (iTunes top)  21) New releases  22) Genre browse (Bollywood, Indie, Classical, Sufi, Pop, Rock, Lo-fi, EDM, Devotional)  23) Universal search (tracks/artists/albums)  24) Search history + suggestions  25) "Because you liked…" row

Library: 26) Favorites (DB-backed)  27) Recently played  28) Custom playlists CRUD  29) Add/remove/reorder in playlist  30) Public/private playlists  31) Import from search  32) Playlist share link

Social: 33) Auth (email + Google)  34) Profile page w/ avatar upload  35) Follow users  36) Public playlist feed  37) Party rooms (realtime sync)  38) Party chat  39) Party reactions  40) Invite codes

UX: 41) Dark/light theme  42) Language switch (EN/HI)  43) Lyrics viewer  44) Equalizer presets (visual + Web Audio biquad)  45) PWA installable + offline shell  46) Toast notifications  47) Loading/empty/error states everywhere  48) Fully responsive (mobile→desktop)  49) Framer Motion transitions  50) Command palette (⌘K) for quick nav/search

## Technical Details

- **Track type** unified in `src/types/track.ts`: `{ id, name, artist, album, image, previewUrl, duration, source }`.
- **Services**: `music.service.ts` (calls edge function), `weather.service.ts`, `ai.service.ts`, `lyrics.service.ts`, `db.service.ts` (favorites/history/playlists).
- **Contexts** rewritten: `AuthContext` (Supabase), `PlayerContext` (real audio), `LibraryContext` (favorites/playlists/history, DB-backed), `WeatherContext` (geo + city), `PartyContext` (Realtime).
- **PWA**: `vite-plugin-pwa` with manifest + service worker.
- **Command palette**: shadcn `cmdk`.
- **Equalizer**: Web Audio `BiquadFilter` chain on the audio element.
- **Media Session**: `navigator.mediaSession.setActionHandler`.
- **Responsive**: mobile bottom nav, tablet rail, desktop sidebar (already partly there — polished).

## Execution Order

1. DB migration (all tables + RLS + GRANTs + triggers + roles).
2. Edge functions (`music-search`, `weather`, `ai-recommend`, `lyrics`).
3. Types + services layer.
4. Rewrite `AuthContext` (Supabase) + `Auth` page.
5. Rewrite `PlayerContext` with real `<audio>` + Media Session + EQ.
6. Rewrite `LibraryContext` (DB-backed) and `WeatherContext`.
7. Wire Home, Search, Player, Library, Queue, Trending, Profile, Settings to real data.
8. Party rooms via Realtime + chat/reactions.
9. PWA + command palette + keyboard shortcuts + sleep timer.
10. Polish, empty/error states, responsive pass.

## Notes / Trade-offs

- iTunes/Deezer previews are **30 seconds** — that's the legal free option without a paid streaming license. Full tracks require a Spotify/Apple Music Premium SDK with the end user's own login; can be added later behind a "Connect Spotify" button.
- OpenWeather key moves from `.env` to edge-function secret for safety (I'll set it up).
- Existing Firebase / old backend API code will be removed; single source of truth is Lovable Cloud.

Approve and I'll ship it end-to-end.
