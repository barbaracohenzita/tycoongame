# 🏛️ Empire Wars — Tycoon

**A mobile-first business tycoon game. Build your empire, crush AI rivals, dominate the market.**

Pure HTML + CSS + vanilla JavaScript. No build tools. No dependencies. Works offline as a PWA. Ready to ship to Google Play via PWABuilder.

---

## 🎮 Play Now (Local)

```bash
# In the repo folder:
python3 -m http.server 8765
# then open http://localhost:8765 in your phone or browser
```

That's it. No npm, no build, no server-side code.

---

## 📱 Game Features

- **4-player tycoon sim:** you vs. 3 AI opponents
- **6 factions** with home-sector bonuses: Tech, Finance, Industrial, Media, Energy, Retail
- **12 buyable industries** across sectors
- **Turn-based strategy:** buy businesses, upgrade them, research 9 techs
- **Dynamic market:** Boom / Normal / Recession / Crash phases, sector swings, 12 random events
- **Victory conditions:** $1M net worth, or highest after 60 turns
- **Offline PWA:** installable on Android home screen, works without internet
- **Local save:** progress persists via localStorage

## 🗂️ Project Structure

```
tycoongame/
├── index.html          # Main HTML shell
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline caching)
├── css/
│   └── style.css       # Mobile-first dark theme
├── js/
│   ├── data.js         # Static game data (industries, techs, events)
│   ├── game.js         # Game engine: state, turn resolution, AI
│   ├── ui.js           # DOM rendering
│   └── app.js          # Event handlers, screen routing
└── icons/
    ├── icon.svg
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

## 🏗️ Tech Notes

**Why vanilla JS:**
- Zero build step — edit file, refresh browser, done
- Loads instantly on phones
- Easy for anyone to read and modify
- Perfect for PWA wrapping

**Game engine design:**
- Single global `Game.state` object holds all game data
- `Game.endTurn()` advances all players (AI acts, income pays, market shifts, events fire, victory check)
- State auto-saves to `localStorage` after every action

**AI strategy (in `game.js` → `_aiTurn`):**
- Aggressive AI: 3 actions/turn. Steady: 2.
- Priorities: (1) buy cheap business if under 4 owned, (2) upgrade highest-income, (3) research home-sector tech
- Different personalities: aggressive / steady / growth

## 🚀 Publish to Google Play Store (PWA route)

This game is built as a **PWA (Progressive Web App)**, which means you can ship it to the Play Store without touching native Android code.

### Path 1: PWABuilder (easiest)

1. **Deploy the game online** — use GitHub Pages (free):
   - In your GitHub repo → Settings → Pages → Source: `main` branch, `/ (root)`
   - Your game goes live at `https://barbaracohenzita.github.io/tycoongame/`

2. **Go to https://www.pwabuilder.com/**

3. Paste your GitHub Pages URL → click **Package for Android**

4. Download the generated `.aab` (Android App Bundle)

5. **Google Play Console** (requires $25 one-time developer fee):
   - Create a new app
   - Upload the `.aab`
   - Fill out store listing (title, description, screenshots, category: Games → Strategy)
   - Submit for review (1-7 days)

### Path 2: Trusted Web Activity (TWA)

If you want more native features later (push notifications, in-app purchases), follow the TWA/Bubblewrap guide: https://developer.chrome.com/docs/android/trusted-web-activity

### Required store listing assets

- **App icon:** `icons/icon-512.png` (already in this repo)
- **Feature graphic:** 1024×500 PNG (you'll need to create this)
- **Screenshots:** At least 2, phone screen size (take from the running game)
- **Short description** (80 chars): "Build your business empire. Crush AI tycoon rivals."
- **Full description** (4000 chars): see `store-listing.md` (to be added)
- **Category:** Games → Strategy or Simulation
- **Content rating:** Everyone

## 🧪 Local Testing

```bash
# Start server
python3 -m http.server 8765

# Then on phone, go to http://YOUR-COMPUTER-IP:8765
# Install as PWA: browser menu → "Add to Home Screen"
```

## 🔧 Customizing

All game tuning lives in `js/data.js`:
- `CONFIG.startCash` — starting cash
- `CONFIG.maxTurns` — game length
- `CONFIG.victoryNetWorth` — winning threshold
- `INDUSTRIES` — add/remove/tweak sectors
- `TECHS` — add new research
- `EVENTS` — add more random events

## 📄 License

MIT — do whatever you want.
