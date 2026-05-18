# BM Guitar

A React guitar learning app with three interactive tools:

- **Fretboard Trainer** — quiz yourself on note names and fret positions
- **Scale Visualizer** — see any scale across the full fretboard
- **Chord Library** — explore diatonic chords with diagrams and audio playback

---

## Tech stack

| Dependency | Purpose |
|---|---|
| React 18 (hooks) | UI & state |
| Tone.js 15 | Audio synthesis for chord strumming |
| Vite 5 | Dev server & bundler |

No CSS frameworks, no component libraries, no runtime dependencies beyond React and Tone.js.

---

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## Dropping `GuitarApp` into an existing React project

1. **Copy the component folder** into your project:

   ```
   src/
     components/
       guitar/
         musicTheory.js       ← all music theory logic
         FretboardSVG.jsx     ← shared fretboard SVG
         FretboardTrainer.jsx
         ScaleVisualizer.jsx
         ChordLibrary.jsx
         GuitarApp.jsx        ← root component
   ```

2. **Add Tone.js** to your project (if not already present):

   ```bash
   npm install tone
   ```

3. **Inject the CSS variables** somewhere in your app (or merge them into your existing `:root`). The variables GuitarApp injects via `<style>` are:

   ```css
   :root {
     --color-bg, --color-surface, --color-card, --color-card-active,
     --color-border, --color-text, --color-muted, --color-accent,
     --color-correct, --color-wrong, --color-scale, --color-root,
     --color-fretboard, --color-string, --color-fret, --color-marker
   }
   ```

   If your project already has a design system, override these variables in your own `:root` block and remove the `<GlobalStyles />` call from `GuitarApp.jsx`.

4. **Render it anywhere:**

   ```jsx
   import GuitarApp from './components/guitar/GuitarApp.jsx';

   export default function App() {
     return <GuitarApp />;
   }
   ```

   Or embed it as a page/section:

   ```jsx
   import GuitarApp from './components/guitar/GuitarApp.jsx';

   export default function LearnPage() {
     return (
       <div style={{ maxWidth: 900, margin: '0 auto' }}>
         <GuitarApp />
       </div>
     );
   }
   ```

---

## Feature overview

### Fretboard Trainer

Toggle between two quiz modes with the **Mode** button:

| Mode | How it works |
|---|---|
| **Find the Note** | A note name appears; click every fret on the SVG that plays that note. Correct clicks turn green; wrong clicks reveal all correct positions in green. |
| **Name the Fret** | A random fret is highlighted with `?`; click the correct note name from the 12-button grid. |

A running **correct / total** score with accuracy percentage is shown in the header.

### Scale Visualizer

Choose a **root note** and **scale type** from the dropdowns:

- Major
- Minor
- Pentatonic Major
- Pentatonic Minor

All matching notes light up on the fretboard. Root notes use a distinct orange color; other scale notes use teal. The note name set is listed below the controls.

### Chord Library

1. Select a **key** (all 12 chromatic roots supported).
2. The 7 **diatonic chords** (I–VII) are displayed in a grid with Roman numerals and quality labels (major / minor / diminished).
3. Click a chord card to expand a **detail panel** showing:
   - An SVG chord diagram with finger dots, open-string circles, and muted-string X marks
   - String-by-string fret number reference (E A D G B e)
   - A **▶ Play** button that strums the chord through Tone.js PolySynth with a slight inter-note delay to simulate strumming

---

## File reference

| File | Responsibility |
|---|---|
| `musicTheory.js` | Note names, fretboard note mapping, scale formulas, diatonic chord logic, chord voicings, Tone.js note conversion |
| `FretboardSVG.jsx` | Reusable SVG fretboard: strings, frets, position markers, clickable areas, highlight dots |
| `FretboardTrainer.jsx` | Quiz state machine, mode toggle, score tracking |
| `ScaleVisualizer.jsx` | Scale note computation, highlight array derivation |
| `ChordLibrary.jsx` | Diatonic chord grid, chord diagram SVG, Tone.js PolySynth strum |
| `GuitarApp.jsx` | Tab bar shell, CSS variable injection |
