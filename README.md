# 🎹 Jazz Chord Trainer

Web app locale per imparare gli accordi jazz al pianoforte: settime, none, undicesime, tredicesime, dominanti alterati e combinazioni di tensioni.

## Funzionalità

- **Esplora**: scegli la fondamentale e il tipo di accordo, poi guardalo sulla tastiera con i gradi colorati (fondamentale, note guida, quinta, tensioni) e sul grande rigo, e ascoltalo con un piano campionato (Salamander Grand Piano).
- **Riconoscimento MIDI**: suona un accordo sulla tastiera MIDI e l'app ti dice quale è, anche se è rootless.
- **Quiz**: l'app propone un accordo (come sigla oppure sullo spartito) e tu lo suoni.
  - con il MIDI la verifica è automatica, con voicing libero, quinta opzionale e, se vuoi, anche la fondamentale;
  - senza MIDI puoi selezionare le note cliccando la tastiera, oppure rivelare la soluzione e autovalutarti;
  - il *ripasso intelligente* ripropone più spesso gli accordi che sbagli.
- **Statistiche** per tipo di accordo: precisione al primo colpo, tempo medio e serie record.
- Interfaccia in inglese (default) e italiano, con menu lingua in alto a destra.
- Spelling enarmonico corretto (es. B♭♭ in G♭°7, E♯ in Bmaj7♯11), notazione anglosassone con opzione Do Re Mi.

Nessun backend, login o database: impostazioni e statistiche restano nel `localStorage` del browser.

## Avvio

Serve [Node.js](https://nodejs.org/) 20 o superiore.

```bash
npm install
npm run dev      # apre http://localhost:5173
npm test         # test della teoria musicale
npm run build    # build di produzione in dist/
```

**MIDI**: usa Chrome o Edge (Firefox e Safari non supportano la Web MIDI API). Collega la tastiera e consenti l'accesso quando il browser lo chiede. Se il controller non ha altoparlanti, attiva "Suono MIDI" in alto per sentirlo tramite il piano dell'app.

**Scorciatoie nel quiz**: `Invio`/`Spazio` per rivelare o passare al prossimo, `←`/`→` per rivedere gli accordi precedenti, `A` per ascoltare, `Backspace` per togliere l'ultima nota selezionata, `Esc` per cancellarle tutte.

## Struttura

```
src/
  theory/      note, intervalli, accordi, voicing, verifica e riconoscimento (+ test)
  audio/       piano campionato (Tone.js)
  midi/        hook Web MIDI
  components/  tastiera SVG, grande rigo (VexFlow), chip dei gradi
  pages/       Esplora, Quiz, Statistiche
```

Per aggiungere un accordo basta una riga in `src/theory/chords.ts`, ad esempio `def('id', 'sigla', 'Nome', 'categoria', '1 3 5? b7 9')`, dove `?` indica una nota opzionale.
