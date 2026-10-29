import { useEffect, useRef, useState } from 'react';
import { Keyboard, type KeyMark } from '../components/Keyboard';
import { ReadingScore } from '../components/ReadingScore';
import { useT, type I18nKey } from '../i18n';
import type { MidiState } from '../midi/useMidi';
import { generateExercise, type ClefMode, type Hands, type Level } from '../reading/exercise';
import { COUNT_IN, currentBeat, startMetronome, stopMetronome } from '../reading/metronome';
import { newSession, playFree, playTimed, tick, type Session } from '../reading/session';
import type { ReadingSettings, Settings } from '../settings';
import { midiName, noteName } from '../theory/notes';
import { Switch } from './Quiz';

interface Props {
  settings: Settings;
  setSettings: (fn: (s: Settings) => Settings) => void;
  midi: MidiState;
  onPlayNote: (midi: number) => void;
}

const CLEFS: { id: ClefMode; label: I18nKey }[] = [
  { id: 'treble', label: 'reading.treble' },
  { id: 'bass', label: 'reading.bass' },
  { id: 'both', label: 'reading.both' },
];
const LEVELS: { id: Level; label: I18nKey; hint: I18nKey }[] = [
  { id: 1, label: 'reading.easy', hint: 'reading.levelHint1' },
  { id: 2, label: 'reading.medium', hint: 'reading.levelHint2' },
  { id: 3, label: 'reading.hard', hint: 'reading.levelHint3' },
];

export function Reading({ settings, setSettings, midi, onPlayNote }: Props) {
  const r = settings.reading;
  const { italian } = settings;
  const { t } = useT();
  const hands: Hands = r.clef === 'both' ? r.hands : 1;
  const make = () => newSession(generateExercise({ clef: r.clef, hands, level: r.level }));

  const [session, setSession] = useState<Session>(make);
  const [running, setRunning] = useState(false);
  const [countIn, setCountIn] = useState(0);
  const [hint, setHint] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);

  const update = (patch: Partial<ReadingSettings>) => setSettings((s) => ({ ...s, reading: { ...s.reading, ...patch } }));

  const stop = () => {
    stopMetronome();
    setRunning(false);
    setCountIn(0);
  };
  const newExercise = () => {
    stop();
    setSession(make());
    setHint(false);
  };
  const retry = () => {
    stop();
    setSession((s) => newSession(s.steps));
    setHint(false);
  };
  const start = async () => {
    setSession((s) => newSession(s.steps));
    setHint(false);
    await startMetronome(r.bpm);
    setRunning(true);
  };

  // Nuovo esercizio quando cambia il tipo; si riparte da capo se cambia la modalità di tempo.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    newExercise();
  }, [r.clef, hands, r.level]);
  useEffect(() => {
    if (!first.current) retry();
  }, [r.tempo, r.bpm]);
  useEffect(() => stopMetronome, []);

  const handleNote = (m: number) => {
    const now = performance.now();
    if (!r.tempo) setSession((s) => playFree(s, m, now, r.anyOctave));
    else if (running) {
      const beat = currentBeat(r.bpm);
      setSession((s) => playTimed(s, m, beat, now, r.anyOctave));
    }
  };

  // Le note nuove sono quelle comparse tra i tasti premuti dall'ultimo aggiornamento.
  const prevActive = useRef<number[]>([]);
  useEffect(() => {
    const added = midi.active.filter((n) => !prevActive.current.includes(n));
    prevActive.current = midi.active;
    added.forEach(handleNote);
  }, [midi.active]);

  // Orologio della modalità a tempo.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = () => {
      const beat = currentBeat(r.bpm);
      setCountIn(beat < 0 ? Math.min(COUNT_IN, Math.ceil(-beat)) : 0);
      setSession((s) => tick(s, beat, performance.now()));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, r.bpm]);

  useEffect(() => {
    if (session.finishedAt !== null && running) stop();
  }, [session.finishedAt]);

  useEffect(() => {
    if (!session.lastWrong) return;
    setFlash(session.lastWrong.midi);
    const id = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(id);
  }, [session.lastWrong]);

  useEffect(() => setHint(false), [session.cur]);

  const finished = session.finishedAt !== null;
  const expected = finished ? [] : session.steps[session.cur].notes;

  const marks: Record<number, KeyMark> = {};
  if (hint) for (const n of expected) marks[n.midi] = { fill: 'var(--select)', label: noteName(n.note, italian) };
  for (const m of midi.active) marks[m] = { ...marks[m], fill: 'var(--played)' };
  if (flash !== null) marks[flash] = { fill: 'var(--bad)', label: '✗' };

  const counts = { ok: 0, fixed: 0, missed: 0 };
  for (const st of session.state) if (st.status !== 'pending') counts[st.status]++;
  const total = session.steps.length;
  const midiReady = midi.status === 'ready' && midi.inputs.length > 0;

  let status: string;
  if (finished) status = t('reading.done');
  else if (flash !== null) status = t('reading.wrongNote', { note: midiName(flash, italian) });
  else if (r.tempo && !running) status = t('reading.statusTempoIdle');
  else if (r.tempo && countIn > 0) status = t('reading.statusCountIn', { n: countIn });
  else if (r.tempo) status = t('reading.statusPlaying');
  else status = t(hands === 2 ? 'reading.statusFreeTwo' : 'reading.statusFree');

  return (
    <div className="reading">
      <section className="main-col">
        <div className="card reading-card">
          <div className="paper-card score-paper">
            <ReadingScore
              steps={session.steps}
              state={session.state}
              cur={session.cur}
              clef={r.clef}
              showCursor={!finished && (!r.tempo || running)}
              showNames={r.showNames}
              italian={italian}
            />
          </div>

          <div className={`status${finished ? ' ok' : flash !== null ? ' bad' : countIn > 0 ? ' count' : ' muted'}`}>{status}</div>

          {finished && (
            <div className="session results">
              <div className="stat">
                <span>{Math.round((counts.ok / total) * 100)}%</span>
                <small>{t('reading.resAccuracy')}</small>
              </div>
              <div className="stat">
                <span className="c-ok">{counts.ok}</span>
                <small>{t('reading.resOk')}</small>
              </div>
              <div className="stat">
                <span className="c-fixed">{counts.fixed}</span>
                <small>{t('reading.resFixed')}</small>
              </div>
              {r.tempo ? (
                <div className="stat">
                  <span className="c-missed">{counts.missed}</span>
                  <small>{t('reading.resMissed')}</small>
                </div>
              ) : (
                <div className="stat">
                  <span>{(((session.finishedAt ?? 0) - (session.startedAt ?? 0)) / 1000).toFixed(1)} s</span>
                  <small>{t('reading.resTime')}</small>
                </div>
              )}
            </div>
          )}

          <div className="actions center">
            {r.tempo && !finished && (
              running ? (
                <button className="btn bad" onClick={stop}>{t('reading.stop')}</button>
              ) : (
                <button className="btn primary" onClick={start}>{t('reading.start')}</button>
              )
            )}
            {finished && <button className="btn primary" onClick={newExercise}>{t('reading.newExercise')}</button>}
            {finished && <button className="btn" onClick={r.tempo ? start : retry}>{t('reading.retry')}</button>}
            {!finished && (
              <button className="btn" onClick={() => setHint((h) => !h)} disabled={r.tempo && !running}>
                {t('reading.hint')}
              </button>
            )}
            {!finished && <button className="btn ghost" onClick={newExercise}>{t('reading.newExercise')}</button>}
          </div>

          <div className="legend center">
            <span><i style={{ background: '#6d4aff' }} />{t('reading.legendCurrent')}</span>
            <span><i style={{ background: '#0f9d63' }} />{t('reading.legendOk')}</span>
            <span><i style={{ background: '#d98200' }} />{t('reading.legendFixed')}</span>
            {r.tempo && <span><i style={{ background: '#d92650' }} />{t('reading.legendMissed')}</span>}
          </div>
        </div>

        <div className="card">
          <Keyboard
            marks={marks}
            onKeyDown={(m) => {
              onPlayNote(m);
              handleNote(m);
            }}
          />
          <p className="muted small center">{t(midiReady ? 'reading.keyboardMidi' : 'reading.keyboardNoMidi')}</p>
        </div>
      </section>

      <aside className="side-col">
        <div className="card settings">
          <h3>{t('reading.settings')}</h3>

          <label className="field-label">{t('reading.clef')}</label>
          <div className="segmented">
            {CLEFS.map((c) => (
              <button key={c.id} className={r.clef === c.id ? 'active' : ''} onClick={() => update({ clef: c.id })}>
                {t(c.label)}
              </button>
            ))}
          </div>

          <label className="field-label">{t('reading.hands')}</label>
          <div className="segmented">
            {([1, 2] as Hands[]).map((h) => (
              <button
                key={h}
                className={hands === h ? 'active' : ''}
                disabled={r.clef !== 'both'}
                title={r.clef !== 'both' ? t('reading.twoHandsHint') : undefined}
                onClick={() => update({ hands: h })}
              >
                {t(h === 1 ? 'reading.oneHand' : 'reading.twoHands')}
              </button>
            ))}
          </div>
          {r.clef !== 'both' && <small className="muted">{t('reading.twoHandsHint')}</small>}

          <label className="field-label">{t('reading.level')}</label>
          <div className="segmented">
            {LEVELS.map((l) => (
              <button key={l.id} className={r.level === l.id ? 'active' : ''} onClick={() => update({ level: l.id })}>
                {t(l.label)}
              </button>
            ))}
          </div>
          <small className="muted">{t(LEVELS[r.level - 1].hint)}</small>

          <label className="field-label">{t('reading.timing')}</label>
          <div className="segmented">
            <button className={!r.tempo ? 'active' : ''} onClick={() => update({ tempo: false })}>{t('reading.free')}</button>
            <button className={r.tempo ? 'active' : ''} onClick={() => update({ tempo: true })}>{t('reading.withTempo')}</button>
          </div>
          {r.tempo && (
            <label className="range">
              <span>{t('reading.bpm', { n: r.bpm })}</span>
              <input type="range" min={40} max={160} step={5} value={r.bpm} disabled={running}
                onChange={(e) => update({ bpm: Number(e.target.value) })} />
            </label>
          )}

          <Switch checked={r.showNames} onChange={(v) => update({ showNames: v })}
            label={t('reading.showNames')} hint={t('reading.showNamesHint')} />
          <Switch checked={r.anyOctave} onChange={(v) => update({ anyOctave: v })}
            label={t('reading.anyOctave')} hint={t('reading.anyOctaveHint')} />
        </div>
      </aside>
    </div>
  );
}
