import { useEffect, useMemo, useRef, useState } from 'react';
import { playChord } from '../audio/piano';
import { Legend, ToneChips, voicingMarks } from '../components/ChordParts';
import { Keyboard, type KeyMark } from '../components/Keyboard';
import { Staff } from '../components/Staff';
import type { MidiState } from '../midi/useMidi';
import { generateChord } from '../quiz';
import type { PromptMode, QuizSettings, Settings, Stats } from '../settings';
import { checkChord, type CheckResult } from '../theory/check';
import { CATEGORIES, chordSymbol, chordTones, type Chord } from '../theory/chords';
import { mod, noteKey, noteName, ROOTS, spellPc } from '../theory/notes';
import { VOICING_LABELS, voiceChord, type VoicingStyle } from '../theory/voicing';

interface Props {
  settings: Settings;
  setSettings: (fn: (s: Settings) => Settings) => void;
  stats: Stats;
  setStats: (fn: (s: Stats) => Stats) => void;
  midi: MidiState;
  onPlayNote: (midi: number) => void;
}

type Phase = 'asking' | 'correct' | 'revealed';
type Outcome = 'pending' | 'correct' | 'wrong';

export function Quiz({ settings, setSettings, stats, setStats, midi, onPlayNote }: Props) {
  const q = settings.quiz;
  const { italian } = settings;
  const [round, setRound] = useState<{ chord: Chord; started: number }>(() => ({
    chord: generateChord(q, stats),
    started: Date.now(),
  }));
  const [phase, setPhase] = useState<Phase>('asking');
  const [feedback, setFeedback] = useState<CheckResult | null>(null);
  const [played, setPlayed] = useState<number[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [session, setSession] = useState({ total: 0, correct: 0, streak: 0 });
  const [outcome, setOutcome] = useState<Outcome>('pending');
  const outcomeRef = useRef<Outcome>('pending');
  const gesture = useRef(new Set<number>());

  const voicing = useMemo(() => voiceChord(round.chord, settings.voicing), [round.chord, settings.voicing]);
  const tones = useMemo(() => chordTones(round.chord), [round.chord]);
  const voicingMidis = voicing.map((n) => n.midi);

  const updateQuiz = (patch: Partial<QuizSettings>) => setSettings((s) => ({ ...s, quiz: { ...s.quiz, ...patch } }));

  const record = (ok: boolean) => {
    if (outcomeRef.current !== 'pending') return;
    outcomeRef.current = ok ? 'correct' : 'wrong';
    setOutcome(outcomeRef.current);
    const { type } = round.chord;
    const ms = Date.now() - round.started;
    if (ok) setElapsed(ms);
    setSession((s) => ({ total: s.total + 1, correct: s.correct + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0 }));
    setStats((s) => {
      const e = s.types[type.id] ?? {
        label: type.suffix || 'maggiore',
        name: type.name,
        category: type.category,
        attempts: 0,
        correct: 0,
        totalMs: 0,
      };
      return {
        ...s,
        types: { ...s.types, [type.id]: { ...e, attempts: e.attempts + 1, correct: e.correct + (ok ? 1 : 0), totalMs: e.totalMs + (ok ? ms : 0) } },
      };
    });
  };

  /** `final`: il gesto è concluso (tasti rilasciati / "Verifica"), quindi un errore conta. */
  const evaluate = (notes: number[], final: boolean) => {
    const r = checkChord(notes, round.chord, { rootOptional: q.rootOptional });
    if (r.correct) {
      setPlayed(notes);
      setFeedback(r);
      setPhase('correct');
      record(true);
    } else if (final) {
      setPlayed(notes);
      setFeedback(r);
      record(false);
    }
  };

  const next = () => {
    setRound((r) => ({ chord: generateChord(q, stats, r.chord), started: Date.now() }));
    setPhase('asking');
    setFeedback(null);
    setPlayed([]);
    setSelection([]);
    setHint(false);
    outcomeRef.current = 'pending';
    setOutcome('pending');
    gesture.current.clear();
  };

  const reveal = () => setPhase('revealed');
  const listen = () => playChord(voicingMidis);

  // Verifica live dal MIDI: corretto appena le note tenute formano l'accordo,
  // sbagliato solo quando rilasci tutto senza averlo mai centrato.
  useEffect(() => {
    if (phase !== 'asking') {
      if (!midi.active.length) gesture.current.clear();
      return;
    }
    if (midi.active.length) {
      midi.active.forEach((n) => gesture.current.add(n));
      evaluate(midi.active, false);
    } else if (gesture.current.size) {
      const notes = [...gesture.current].sort((a, b) => a - b);
      gesture.current.clear();
      if (notes.length >= 2) evaluate(notes, true);
    }
  }, [midi.active]);

  useEffect(() => {
    if (session.streak > stats.bestStreak) setStats((s) => ({ ...s, bestStreak: session.streak }));
  }, [session.streak]);

  useEffect(() => {
    if (phase !== 'correct' || !q.autoAdvance) return;
    const t = setTimeout(next, 1600);
    return () => clearTimeout(t);
  }, [phase, round]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (phase === 'asking') reveal();
        else next();
      } else if (e.key.toLowerCase() === 'a') listen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onKeyDown = (m: number) => {
    onPlayNote(m);
    if (phase === 'asking') setSelection((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m].sort((a, b) => a - b)));
  };

  // --- marcature tastiera ---
  const chordPcs = new Set(tones.map((t) => t.pc));
  let marks: Record<number, KeyMark> = {};
  const markPlayed = (m: number) => {
    marks[m] = chordPcs.has(mod(m, 12)) ? { ...marks[m], dot: 'var(--ok)' } : { fill: 'var(--bad)', label: '✗', dot: undefined };
  };
  if (phase === 'asking') {
    if (feedback) played.forEach(markPlayed);
    for (const m of selection) marks[m] = { ...marks[m], fill: 'var(--select)' };
    for (const m of midi.active) marks[m] = { ...marks[m], fill: 'var(--played)' };
  } else {
    marks = voicingMarks(voicing, italian);
    new Set([...played, ...midi.active]).forEach(markPlayed);
  }

  const revealed = phase !== 'asking';
  const showSymbol = revealed || q.prompt !== 'staff';
  const showStaff = revealed || q.prompt !== 'symbol';
  const accuracy = session.total ? Math.round((session.correct / session.total) * 100) : 0;
  const midiReady = midi.status === 'ready' && midi.inputs.length > 0;

  return (
    <div className="quiz">
      <section className="main-col">
        <div className={`card prompt ${phase}`}>
          <div className="prompt-body">
            {showSymbol && (
              <div className="prompt-symbol">
                <div className="symbol xl">{chordSymbol(round.chord, italian)}</div>
                <div className="subtitle">
                  {round.chord.type.name}
                  {!italian && <span className="muted"> · {chordSymbol(round.chord, true)}</span>}
                </div>
              </div>
            )}
            {showStaff && (
              <div className="paper-card inset">
                <Staff notes={voicing} />
              </div>
            )}
          </div>

          <Status
            phase={phase}
            feedback={feedback}
            elapsed={elapsed}
            hint={hint}
            onHint={() => setHint(true)}
            italian={italian}
            midiReady={midiReady}
          />

          {revealed && <ToneChips tones={tones} italian={italian} />}

          <div className="actions center">
            {phase === 'asking' ? (
              <>
                {selection.length > 0 && (
                  <button className="btn primary" onClick={() => evaluate(selection, true)}>
                    ✓ Verifica selezione
                  </button>
                )}
                <button className="btn primary" onClick={reveal}>
                  Rivela <kbd>Invio</kbd>
                </button>
              </>
            ) : (
              <>
                {outcome === 'pending' && (
                  <>
                    <button className="btn ok" onClick={() => record(true)}>
                      L'ho suonato giusto
                    </button>
                    <button className="btn bad" onClick={() => record(false)}>
                      Sbagliato
                    </button>
                  </>
                )}
                <button className="btn primary" onClick={next}>
                  Prossimo <kbd>Invio</kbd>
                </button>
              </>
            )}
            <button className="btn" onClick={listen}>
              ▶ Ascolta <kbd>A</kbd>
            </button>
            {phase === 'asking' && (
              <button className="btn ghost" onClick={next}>
                Salta
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <Keyboard marks={marks} onKeyDown={onKeyDown} />
          {revealed ? (
            <Legend />
          ) : (
            <p className="muted small center">
              {midiReady
                ? 'Suona l’accordo sulla tastiera MIDI: la verifica è automatica.'
                : 'Senza MIDI: clicca i tasti per selezionare le note e premi “Verifica”, oppure suona al piano e premi “Rivela”.'}
            </p>
          )}
        </div>
      </section>

      <aside className="side-col">
        <div className="card session">
          <div className="stat">
            <span>{session.correct}/{session.total}</span>
            <small>corretti</small>
          </div>
          <div className="stat">
            <span>{accuracy}%</span>
            <small>precisione</small>
          </div>
          <div className="stat">
            <span>{session.streak}</span>
            <small>serie (record {stats.bestStreak})</small>
          </div>
        </div>

        <QuizSettingsPanel q={q} update={updateQuiz} italian={italian} voicing={settings.voicing}
          setVoicing={(v) => setSettings((s) => ({ ...s, voicing: v }))} />
      </aside>
    </div>
  );
}

function Status(props: {
  phase: Phase;
  feedback: CheckResult | null;
  elapsed: number;
  hint: boolean;
  onHint: () => void;
  italian: boolean;
  midiReady: boolean;
}) {
  const { phase, feedback, elapsed, hint, onHint, italian, midiReady } = props;
  if (phase === 'correct') return <div className="status ok">✓ Corretto! <span className="muted">{(elapsed / 1000).toFixed(1)} s</span></div>;
  if (feedback && !feedback.correct) {
    const n = feedback.missing.length;
    return (
      <div className="status bad">
        ✗ Non ancora.
        {n > 0 && <span> {n === 1 ? 'Manca 1 nota' : `Mancano ${n} note`}{hint && `: ${feedback.missing.map((t) => t.label).join(', ')}`}.</span>}
        {feedback.extras.length > 0 && <span> Note estranee: {feedback.extras.map((pc) => noteName(spellPc(pc), italian)).join(', ')}.</span>}
        {n > 0 && !hint && (
          <button className="link" onClick={onHint}>
            quali gradi?
          </button>
        )}
      </div>
    );
  }
  if (phase === 'revealed') return <div className="status">Ecco la soluzione.</div>;
  return <div className="status muted">{midiReady ? 'In ascolto sul MIDI…' : 'Suonalo al piano!'}</div>;
}

const PROMPTS: { id: PromptMode; label: string }[] = [
  { id: 'symbol', label: 'Sigla' },
  { id: 'staff', label: 'Spartito' },
  { id: 'both', label: 'Entrambi' },
];

const WHITE_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function QuizSettingsPanel(props: {
  q: QuizSettings;
  update: (p: Partial<QuizSettings>) => void;
  italian: boolean;
  voicing: VoicingStyle;
  setVoicing: (v: VoicingStyle) => void;
}) {
  const { q, update, italian, voicing, setVoicing } = props;
  const toggle = <T,>(list: T[], item: T) => {
    const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
    return next.length ? next : list; // almeno un elemento selezionato
  };

  return (
    <div className="card settings">
      <h3>Impostazioni quiz</h3>

      <label className="field-label">Categorie</label>
      <div className="chip-toggles">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`pill${q.categories.includes(c.id) ? ' active' : ''}`}
            onClick={() => update({ categories: toggle(q.categories, c.id) })}>
            {c.label}
          </button>
        ))}
      </div>

      <label className="field-label">
        Fondamentali
        <span className="quick">
          <button className="link" onClick={() => update({ roots: ROOTS.map(noteKey) })}>tutte</button>
          <button className="link" onClick={() => update({ roots: WHITE_ROOTS })}>solo naturali</button>
        </span>
      </label>
      <div className="chip-toggles roots">
        {ROOTS.map((r) => (
          <button key={noteKey(r)} className={`pill${q.roots.includes(noteKey(r)) ? ' active' : ''}`}
            onClick={() => update({ roots: toggle(q.roots, noteKey(r)) })}>
            {noteName(r, italian)}
          </button>
        ))}
      </div>

      <label className="field-label">Mostra</label>
      <div className="segmented">
        {PROMPTS.map((p) => (
          <button key={p.id} className={q.prompt === p.id ? 'active' : ''} onClick={() => update({ prompt: p.id })}>
            {p.label}
          </button>
        ))}
      </div>

      <label className="field-label">Voicing della soluzione</label>
      <div className="segmented">
        {(Object.keys(VOICING_LABELS) as VoicingStyle[]).map((v) => (
          <button key={v} className={voicing === v ? 'active' : ''} onClick={() => setVoicing(v)}>
            {VOICING_LABELS[v]}
          </button>
        ))}
      </div>

      <Switch checked={q.rootOptional} onChange={(v) => update({ rootOptional: v })}
        label="Fondamentale opzionale" hint="Accetta voicing rootless" />
      <Switch checked={q.autoAdvance} onChange={(v) => update({ autoAdvance: v })}
        label="Avanza da solo" hint="Dopo una risposta corretta" />
      <Switch checked={q.smart} onChange={(v) => update({ smart: v })}
        label="Ripasso intelligente" hint="Ripropone più spesso gli accordi che sbagli" />
    </div>
  );
}

export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="switch-text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
