# 🎬 RULETA FILOSÓFICA — Director's Playbook

> **Format:** TikTok / Reels / Shorts (9:16 vertical)
> **Framerate:** 60fps · **Resolution:** 1080×1920 (rendered into `recording-pane`)
> **Total Runtime:** ~45–60 seconds (adjustable via Dev Panel)

---

## 📐 Stage Layout

```
┌──────────────────────────────────────────────────────┐
│                  BROWSER WINDOW                      │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │                  │  │                          │  │
│  │  RECORDING PANE  │  │      DEV PANEL           │  │
│  │  (9:16 ratio)    │  │  ┌──────────────────┐    │  │
│  │                  │  │  │ Screen Controls  │    │  │
│  │  ← THIS IS THE   │  │  │  ← Anterior      │    │  │
│  │    VIDEO OUTPUT   │  │  │  Siguiente →     │    │  │
│  │                  │  │  │                  │    │  │
│  │  width:           │  │  │ AUTO-PLAY [▶️]   │    │  │
│  │  min(100vh*9/16,  │  │  │ REINICIAR TODO   │    │  │
│  │      100vw)       │  │  └──────────────────┘    │  │
│  │                  │  │  ┌──────────────────┐    │  │
│  │                  │  │  │ Grabación        │    │  │
│  │                  │  │  └──────────────────┘    │  │
│  │                  │  │  ┌──────────────────┐    │  │
│  │                  │  │  │ Gestión / Config │    │  │
│  │                  │  │  └──────────────────┘    │  │
│  │                  │  │  ┌──────────────────┐    │  │
│  │                  │  │  │ Arrow Designs    │    │  │
│  │  └──────────────────┘  │  └──────────────────┘  │  │
│                        └──────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

- The **Recording Pane** is the only content that gets exported as video.
- All overlays (`WinnerModal`, `PhraseScreen`) use `position: absolute` scoped to this pane.
- The **Dev Panel** is off-screen in the final recording.

---

## 🎞️ SCENE BREAKDOWN

### Phase Pipeline

```
INTRO ──→ WHEEL ──→ WINNER MODAL ──→ MONTHLY OVERVIEW ──→ CANDIDATE REVEAL ──→ CTA
  1          2            2b                  3                    4            5
```

Each phase is advanced from the Dev Panel via **Siguiente →** or automatically via **Reproducir Automático [▶️]**.

---

## 🎬 SCENE 1 — INTRO

> **File:** `page.tsx` · **Phase ID:** `intro`
> **Duration:** 2–3 seconds · **Mood:** Cinematic, mysterious

### What's on screen

| Layer | Element | Position | Style |
|-------|---------|----------|-------|
| BG | Solid black `#000` | Full frame | — |
| FG | **"RULETA FILOSÓFICA"** | Dead center | `Outfit 900`, 3.5rem, white, uppercase, `letterSpacing: 4px` |

### Animation

| Element | Property | From → To | Easing | Duration |
|---------|----------|-----------|--------|----------|
| Title | `opacity` | `0 → 1` | default | 0.3s |

### Sound

| Trigger | Sound | File |
|---------|-------|------|
| Phase enters | Intro ping | `ruleta_filosofica_notification.wav` |

### Transition OUT → Scene 2

| Property | From → To | Type | Notes |
|----------|-----------|------|-------|
| Title | `layoutId="main-title"` | Shared layout | Physically moves and shrinks to header position |
| Entire scene | `opacity: 1 → 0` | `AnimatePresence exit` | Crossfade |

---

## 🎬 SCENE 2 — THE WHEEL

> **File:** `page.tsx` + `Wheel.tsx` · **Phase ID:** `wheel`
> **Duration:** Variable (~10–12s) · **Mood:** Anticipation

### What's on screen

| Layer | Element | Position | Style |
|-------|---------|----------|-------|
| BG | `::before` animated gradient | Full frame | Purple/pink radials, drifting animation |
| BG | `::after` floating particles | Full frame | Dot grid, diagonal drift |
| HEADER | **"RULETA FILOSÓFICA"** | Top center, `paddingTop: 100px` | `Outfit 900`, 2.2rem, shared `layoutId` |
| HEADER | **"¿Cuál será el Tema de hoy?"** | Below title | Fades in with `delay: 0.5` |
| MAIN | **Wheel Canvas** | Center, `width: 90%` | 8 colored segments, Customizable pointer |
| CENTER | **"LIKE PARA GIRAR!"** | Middle of wheel | Multi-line text, pulses when spinning |

### Wheel custom arrow types

Selectable from Dev Panel → **Ajustes**:
- `classic`, `triangle`, `pin`, `hand` (👈), `star` (⭐), `kibo` (icon), `custom` (upload).

### Spin Mechanics (in `Wheel.tsx`)

```
Spin Duration:  4.46s (matches wheel-spin.wav)
Easing:         ease-out-quart — fast start, smooth stop
Min Rotations:  10+ full turns
Tick Sound:     Played whenever crossing a segment boundary
Effect:         TikTok Like hearts [❤️] erupt from center on start
```

### Sound

| Trigger | Sound | File |
|---------|-------|------|
| Phase enters | Wheel appears | `wheel_appears.wav` |
| Spin starts | Looping spin | `wheel-spin.wav` (loop) |
| Each segment | Tick | `tick.wav` |
| Spin ends | Win fanfare | `wheel-win.wav` |
| Spin ends | Applause | `girls_applause.wav` |

---

## 🎬 SCENE 2b — WINNER MODAL (overlay)

> **File:** `WinnerModal.tsx` · **Overlays Scene 2**
> **Duration:** 2.5 seconds · **Mood:** Celebration

### What's on screen

- **Darkness Blur:** `rgba(0,0,0,0.8)` backdrop.
- **Immersive Glow:** Radial gradient centered on the winner name using `winnerColor`.
- **Glass Card:** Shimmering title "TEMA GANADOR" + Winner Name in a high-contrast gradient.
- **Confetti:** Automatic canvas confetti erupting from sides.

---

## 🎬 SCENE 3 — MONTHLY OVERVIEW (Dynamic Sequence)

> **File:** `PhraseScreen.tsx` · **Phase ID:** `monthly-overview`
> **Duration:** ~8–10 seconds · **Mood:** Reveal, progression

This scene has a complex choreographed sequence:

### 1. Entrance & ScrollUp
- Background drops in with a "Air Whoosh" (`air_whoosh_to_mothly_overview.wav`).
- Component starts **scrolled to the bottom**.
- After 1.5s, it **automatically scrolls up** to the top with a cinematic swoosh (`scroll_up_swoosh.wav`).

### 2. Winner Expansion
- Near the end of the scroll, the **Winner Topic** expands.
- Animation: Transitions from 2-column to a 1-column layout, growing in height (`minHeight: 60vh`).
- Sound: `winner_topic_2colum_1column.wav`.

### 3. Highlight Sequence & Anticipation
- **Leading Count Pulse:** The "X/4 REVELADAS" badge pulses and increases by 1 *first* to announce the discovery.
- **Historical Highlights:** Each previously revealed phrase highlights one-by-one with a `tick.wav`.
- **Today's Unblur:** Finally, today's phrase (initially blurred) highlights, grows, and **unblurs** with a transition sound.
- **Manual Transition:** After showing the revealed quote, the system waits for the user to press **Siguiente** to move to **Scene 4**.

### Visual Elements
- **Historical Emojis:** Phrases from previous days have thematic emojis injected (e.g., 💰 for Dinero).
- **Glass Styling:** Rainbow borders and pulsing glows for the winner.

---

## 🎬 SCENE 4 — CANDIDATE REVEAL

> **File:** `PhraseScreen.tsx` · **Phase ID:** `candidate-reveal`
> **Duration:** 5 seconds · **Mood:** Dramatic spotlight

### Highlights
- **Entry Sound:** Plays `wheel-win.wav` during the phase transition.
- **Badge Reveal:** "Ganador: {Tema}" appears at 0.5s with `ruleta_filosofica_notification.wav`.
- **Phrase Spotlight:** The full quote and author reveal at 1.5s with a dramatic `phrase_sound.wav`.
- **Bounce Hint:** A white chevron bounces at the bottom to lead into the final CTA.

---

## 🎬 SCENE 5 — CTA (Call To Action)

> **File:** `PhraseScreen.tsx` · **Phase ID:** `cta`
> **Duration:** 5+ seconds · **Mood:** Urgency, conversion

### Variants
1. **Regular Scarcity:** "Faltan {N} días... ¡Sígueme para no perdértelas!" (for the remaining phrases).
2. **Exhausted (FOMO):** "¡TEMA AGOTADO! ... ¡Sígueme para el próximo mes!" (if 4/4 reached).

---

## 🔊 Complete SFX Map

| # | Event | File | Volume | Notes |
|---|-------|------|--------|-------|
| 1 | Intro screen | `ruleta_filosofica_notification.wav` | 1.0 | Phase → `intro` |
| 2 | Wheel appears | `wheel_appears.wav` | 1.0 | Phase → `wheel` |
| 3 | Spin start | `wheel-spin.wav` | 0.7 | Loop |
| 4 | Segment tick | `tick.wav` | 0.4 | |
| 5 | Win fanfare | `wheel-win.wav` | 0.9 | |
| 6 | Applause | `girls_applause.wav` | 1.0 | |
| 7 | Overview Entry | `air_whoosh_to_mothly_overview.wav` | 0.9 | |
| 8 | Auto Scroll Up | `scroll_up_swoosh.wav` | 0.9 | |
| 9 | Winner Grow | `winner_topic_2colum_1column.wav` | 1.0 | Expansion to 1-col |
| 10 | Unblur/Trans | `screen-transition.wav` | 0.85 | Used for today's reveal |

---

## 🤖 Automations

- **REPRODUCIR AUTOMÁTICO [▶️]**: Runs the entire pipeline with precise delays between each scene for a "perfect take".
- **Bot Mode (`?bot=true`)**: Similar to auto-play but triggered by URL, optimized for headless recording.

---

## 📋 Dev Panel Reference

- **Anterior / Siguiente**: Manual phase navigation.
- **Siguiente (GIRAR)**: Contextual button that spins the wheel if no winner is chosen.
- **REPRODUCIR AUTOMÁTICO**: The primary button for recording sessions.
- **Reset BD**: Resets all phrases to "un-used" in `database.csv`.
- **Ajustes**: Design selector for the wheel pointer.

---

## 📁 File Map

| File | Role |
|------|------|
| `src/app/page.tsx` | Main orchestrator & Phase state machine |
| `src/components/Wheel.tsx` | Canvas wheel & TikTok hearts animation |
| `src/components/WinnerModal.tsx` | Confetti celebrating the win |
| `src/components/PhraseScreen.tsx` | Monthly table, Scroll effects, Highlights, Reveal, Scarcity, CTA |
| `src/utils/sounds.ts` | SoundManager with all logic |
| `src/app/api/phrases/route.ts` | CSV Backend (GET/POST/PATCH) |
| `database.csv` | The phrase repository |
