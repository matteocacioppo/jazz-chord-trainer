import { useMemo, useState } from 'react';
import { playChord } from '../audio/piano';
import { ChordSubtitle, Legend, ToneChips, voicingMarks } from '../components/ChordParts';
import { Keyboard, type KeyMark } from '../components/Keyboard';
import { Staff } from '../components/Staff';
import { useT } from '../i18n';
import { recognize } from '../theory/check';
import { CATEGORIES, CHORD_TYPES, chordSymbol, chordTones, findType, type CategoryId } from '../theory/chords';
import { midiName, mod, noteKey, noteName, parseNote, ROOTS } from '../theory/notes';
import { voiceChord } from '../theory/voicing';
import type { Settings } from '../settings';

interface Props {
  settings: Settings;
  midiActive: number[];
  onPlayNote: (midi: number) => void;
}

const EXPLORE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'miste');

export function Explore({ settings, midiActive, onPlayNote }: Props) {
  const { italian, voicing: style } = settings;
  const { lang, t } = useT();
  const [rootKey, setRootKey] = useState('C');
  const [typeId, setTypeId] = useState('maj7');
  const [category, setCategory] = useState<CategoryId>('settime');

  const chord = useMemo(() => ({ root: parseNote(rootKey), type: findType(typeId)! }), [rootKey, typeId]);
  const tones = useMemo(() => chordTones(chord), [chord]);
  const voicing = useMemo(() => voiceChord(chord, style), [chord, style]);
  const recognized = useMemo(() => recognize(midiActive), [midiActive]);

  const marks: Record<number, KeyMark> = voicingMarks(voicing, italian);
  const chordPcs = new Set(tones.map((t) => t.pc));
  for (const m of midiActive) {
    marks[m] = { ...marks[m], dot: chordPcs.has(mod(m, 12)) ? 'var(--ok)' : 'var(--bad)' };
  }

  return (
    <div className="explore">
      <aside className="card picker">
        <h3>{t('explore.root')}</h3>
        <div className="root-grid">
          {ROOTS.map((r) => (
            <button key={noteKey(r)} className={`pill${noteKey(r) === rootKey ? ' active' : ''}`} onClick={() => setRootKey(noteKey(r))}>
              {noteName(r, italian)}
            </button>
          ))}
        </div>

        <h3>{t('explore.type')}</h3>
        <div className="tabs small">
          {EXPLORE_CATEGORIES.map((c) => (
            <button key={c.id} className={c.id === category ? 'active' : ''} onClick={() => setCategory(c.id)}>
              {c.label[lang]}
            </button>
          ))}
        </div>
        <div className="type-grid">
          {CHORD_TYPES.filter((type) => type.category === category).map((type) => (
            <button key={type.id} className={`type-btn${type.id === typeId ? ' active' : ''}`} onClick={() => setTypeId(type.id)}>
              <b>{noteName(chord.root, italian) + type.suffix}</b>
              <span>{type.name[lang]}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="main-col">
        <div className="card hero">
          <div className="hero-head">
            <div>
              <div className="symbol">{chordSymbol(chord, italian)}</div>
              <ChordSubtitle name={chord.type.name[lang]} solfege={lang === 'it' && !italian ? chordSymbol(chord, true) : undefined} />
            </div>
            <div className="actions">
              <button className="btn primary" onClick={() => playChord(voicing.map((n) => n.midi))}>
                {t('explore.playChord')}
              </button>
              <button className="btn" onClick={() => playChord(voicing.map((n) => n.midi), 'arp')}>
                {t('explore.arpeggio')}
              </button>
            </div>
          </div>
          <ToneChips tones={tones} italian={italian} />
          <Keyboard marks={marks} onKeyDown={onPlayNote} />
          <Legend />
        </div>

        <div className="row">
          <div className="card paper-card">
            <Staff notes={voicing} />
          </div>
          <div className="card midi-card">
            <h3>{t('explore.playing')}</h3>
            {midiActive.length === 0 ? (
              <p className="muted">{t('explore.playHint')}</p>
            ) : (
              <>
                <p className="played-notes">{midiActive.map((m) => midiName(m, italian)).join('  ')}</p>
                {recognized.length === 0 ? (
                  <p className="muted">{t('explore.noMatch')}</p>
                ) : (
                  <div className="recognized">
                    {recognized.map((r, i) => (
                      <button
                        key={r.symbol + r.rootless}
                        className={`pill${i === 0 ? ' active' : ''}`}
                        title={t('explore.openChord')}
                        onClick={() => {
                          setRootKey(noteKey(r.chord.root));
                          setTypeId(r.chord.type.id);
                          setCategory(r.chord.type.category);
                        }}
                      >
                        {chordSymbol(r.chord, italian)}
                        {r.rootless && <small> rootless</small>}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
