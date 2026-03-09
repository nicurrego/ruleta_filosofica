# 🎡 Ruleta Filosófica

An autonomous TikTok/Reels/Shorts content generator built with Next.js. A beautiful spinner wheel reveals daily philosophical phrases across 8 life topics with cinematic animations, scarcity mechanics, and engagement-driven CTAs.

## ✨ Features

- **Canvas Spinner Wheel** — Custom `<canvas>` implementation with crisp HiDPI rendering and 8 vibrant topic segments
- **6-Scene Recording Flow** — Intro → Wheel → Winner → Monthly Overview → Phrase Reveal → CTA
- **Monthly Scarcity System** — 4 phrases per topic per month; exhausted topics are removed from the wheel
- **Director's Panel** — Side-by-side dev controls + 9:16 recording pane for easy screen recording
- **Immersive Animations** — Framer Motion shared layouts, staggered entries, spring physics, and pulsing CTAs
- **SFX System** — 8 synchronized sound effects (spin, tick, win, applause, transitions)
- **Bot Mode** — Headless autonomous mode via `?bot=true` URL param
- **Localized Canvas Confetti** — Confetti contained within the recording pane (not full-page)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Confetti | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| Icons | [Lucide React](https://lucide.dev/) |
| CSV Parsing | [PapaParse](https://www.papaparse.com/) |
| Styling | Vanilla CSS |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
src/
├── app/
│   ├── api/phrases/route.ts   # CSV read/write API
│   ├── phrases/page.tsx       # Phrase management page
│   ├── globals.css            # All styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main app (orchestrator + dev panel)
├── components/
│   ├── Wheel.tsx              # Canvas wheel with spin mechanics
│   ├── WinnerModal.tsx        # Confetti overlay
│   └── PhraseScreen.tsx       # Phases 3–6 (overview, reveal, scarcity, CTA)
└── utils/
    └── sounds.ts              # SoundManager singleton

public/                        # Audio assets (.wav)
scripts/
├── export-tiktok.js           # Headless browser recording script
└── init-csv.ts                # CSV database initializer

database.csv                   # Phrase database (CSV)
flow.md                        # Director's Playbook (scene-by-scene documentation)
```

## 🎬 Recording a Video

See [`flow.md`](./flow.md) for the complete Director's Playbook with scene breakdowns, animation specs, and sound cue maps.

**Quick steps:**
1. Open the app → Dev Panel is on the right
2. Click **Siguiente** to advance through each scene
3. Screen-record the left pane (9:16 ratio)
4. Click **REINICIAR TODO** to loop

## 🤖 Bot Mode

Append `?bot=true` to the URL for fully autonomous content generation. The wheel will auto-spin and the flow will advance without human interaction.

## 📊 Managing Phrases

- Navigate to `/phrases` for the phrase management UI
- Use **Reset BD** in the Dev Panel to mark all phrases as unused
- The CSV database (`database.csv`) tracks: `TEMA`, `FRASE`, `USADA`, `FECHA_USADA`
