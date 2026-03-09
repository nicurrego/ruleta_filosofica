# Ruleta Filosófica (Spinner Wheel)

A beautiful, high-performance spinner wheel built with Next.js, React, and HTML5 Canvas.

## Features

- **High-Performance Canvas Spinner**: Custom `<canvas>` implementation with crisp rendering on all screen sizes, including high-DPI displays.
- **Glassmorphic Design**: Modern, premium dark mode UI with glass effects and subtle glowing gradients.
- **Dynamic Entries**: Add, edit, or remove entries in real-time via the sidebar.
- **Smooth Animation**: Satisfying easing functions (`easeOutQuart`) for the wheel spin.
- **Winner Celebration**: Animated modal with confetti effects when a winner is chosen.
- **Responsive**: Fully responsive layout for desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules & Global Styles)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) for winner modal

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Enter names or options in the text area on the right (one per line).
2. Click the central wheel to start the spin.
3. When the wheel stops, a modal will announce the winner.
4. You can choose to "Remove" the winner from the list or just "Close" the modal.
5. Use the "Shuffle Names" button to randomize the order of options on the wheel.
