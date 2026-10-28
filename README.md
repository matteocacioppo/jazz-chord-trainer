# 🎹 Jazz Chord Trainer

**Try it online: https://matteocacioppo.github.io/jazz-chord-trainer/**

A web app for learning jazz piano chords: sevenths, ninths, elevenths, thirteenths, altered dominants and mixed tension combinations.

## Features

- **Explore**: pick a root and a chord type, then see it on the keyboard with color-coded degrees (root, guide tones, fifth, tensions) and on the grand staff, and hear it played on a sampled piano (Salamander Grand Piano).
- **MIDI recognition**: play a chord on your MIDI keyboard and the app tells you what it is, rootless voicings included.
- **Quiz**: the app shows a chord (as a symbol or on the staff) and you play it.
  - with MIDI, answers are checked automatically: any voicing works, the fifth is optional and, if you like, so is the root;
  - without MIDI, click the on-screen keys to select notes, or play it on your piano and reveal the solution;
  - browse the chords you've already played with the session history;
  - *smart review* brings back the chords you miss more often.
- **Stats** per chord type: first-try accuracy, average time and best streak.
- English (default) and Italian interface, with a language menu in the top right.
- Correct enharmonic spelling (e.g. B♭♭ in G♭°7, E♯ in Bmaj7♯11), letter-name notation with an optional Do Re Mi mode.

No backend, login or database: settings and stats are stored in your browser's `localStorage`.

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or later.

```bash
npm install
npm run dev      # opens http://localhost:5173
npm test         # music theory tests
npm run build    # production build in dist/
npm run deploy   # test + build + publish to GitHub Pages
```

**MIDI**: use Chrome or Edge (Firefox and Safari don't support the Web MIDI API). Connect your keyboard and allow access when the browser asks. If your controller has no built-in speakers, turn on "MIDI sound" at the top to hear it through the app's piano.

**Quiz shortcuts**: `Enter`/`Space` to reveal or go to the next chord, `←`/`→` to review previous chords, `A` to listen, `Backspace` to remove the last selected note, `Esc` to clear them all.

## Project structure

```
src/
  theory/      notes, intervals, chords, voicings, checking and recognition (+ tests)
  audio/       sampled piano (Tone.js)
  midi/        Web MIDI hook
  components/  SVG keyboard, grand staff (VexFlow), degree chips, language menu
  pages/       Explore, Quiz, Stats
  i18n.tsx     English and Italian UI strings
```

Adding a chord takes one line in `src/theory/chords.ts`, e.g. `def('id', 'symbol', 'English name', 'Italian name', 'category', '1 3 5? b7 9')`, where `?` marks an optional note.
