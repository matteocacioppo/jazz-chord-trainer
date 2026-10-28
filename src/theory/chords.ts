import { INTERVALS, intervalLabel, intervalRole, type IntervalName, type Role } from './intervals';
import { noteName, pitchClass, transpose, type Note } from './notes';

export type CategoryId = 'triadi' | 'settime' | 'none' | 'undicesime' | 'tredicesime' | 'alterati' | 'miste';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'triadi', label: 'Triadi' },
  { id: 'settime', label: 'Settime' },
  { id: 'none', label: 'None' },
  { id: 'undicesime', label: 'Undicesime' },
  { id: 'tredicesime', label: 'Tredicesime' },
  { id: 'alterati', label: 'Dominanti alterati' },
  { id: 'miste', label: 'Tensioni miste' },
];

export interface ToneSpec {
  iv: IntervalName;
  /** Nota omettibile nel voicing (es. la quinta giusta). */
  optional: boolean;
}

export interface ChordType {
  id: string;
  suffix: string;
  name: string;
  category: CategoryId;
  /** In ordine di grado crescente. */
  tones: ToneSpec[];
}

/** La formula usa "?" per le note opzionali, es. "1 3 5? b7 9". */
function def(id: string, suffix: string, name: string, category: CategoryId, formula: string): ChordType {
  const tones = formula.split(' ').map((t) => ({ iv: t.replace('?', '') as IntervalName, optional: t.endsWith('?') }));
  return { id, suffix, name, category, tones };
}

export const CHORD_TYPES: ChordType[] = [
  def('maj', '', 'Maggiore', 'triadi', '1 3 5'),
  def('min', 'm', 'Minore', 'triadi', '1 b3 5'),
  def('dim', '°', 'Diminuita', 'triadi', '1 b3 b5'),
  def('aug', '+', 'Aumentata', 'triadi', '1 3 #5'),
  def('sus4', 'sus4', 'Sospesa di quarta', 'triadi', '1 4 5'),
  def('sus2', 'sus2', 'Sospesa di seconda', 'triadi', '1 2 5'),

  def('maj7', 'maj7', 'Maggiore settima', 'settime', '1 3 5? 7'),
  def('7', '7', 'Settima di dominante', 'settime', '1 3 5? b7'),
  def('m7', 'm7', 'Minore settima', 'settime', '1 b3 5? b7'),
  def('m7b5', 'm7♭5', 'Semidiminuita', 'settime', '1 b3 b5 b7'),
  def('dim7', '°7', 'Diminuita settima', 'settime', '1 b3 b5 bb7'),
  def('mmaj7', 'm(maj7)', 'Minore con settima maggiore', 'settime', '1 b3 5? 7'),
  def('7sus4', '7sus4', 'Dominante sospesa', 'settime', '1 4 5? b7'),
  def('maj7#5', 'maj7♯5', 'Maggiore settima aumentata', 'settime', '1 3 #5 7'),
  def('6', '6', 'Sesta', 'settime', '1 3 5? 6'),
  def('m6', 'm6', 'Minore sesta', 'settime', '1 b3 5? 6'),

  def('maj9', 'maj9', 'Maggiore nona', 'none', '1 3 5? 7 9'),
  def('9', '9', 'Nona di dominante', 'none', '1 3 5? b7 9'),
  def('m9', 'm9', 'Minore nona', 'none', '1 b3 5? b7 9'),
  def('add9', 'add9', 'Maggiore add9', 'none', '1 3 5 9'),
  def('madd9', 'm(add9)', 'Minore add9', 'none', '1 b3 5 9'),
  def('69', '6/9', 'Sei-nove', 'none', '1 3 5? 6 9'),
  def('m69', 'm6/9', 'Minore sei-nove', 'none', '1 b3 5? 6 9'),
  def('9sus4', '9sus4', 'Nona sospesa', 'none', '1 4 5? b7 9'),
  def('mmaj9', 'm(maj9)', 'Minore nona con settima maggiore', 'none', '1 b3 5? 7 9'),
  def('m9b5', 'm9♭5', 'Semidiminuita con nona', 'none', '1 b3 b5 b7 9'),

  def('m11', 'm11', 'Minore undicesima', 'undicesime', '1 b3 5? b7 9? 11'),
  def('11', '11', 'Undicesima (senza terza)', 'undicesime', '1 5? b7 9 11'),
  def('maj7#11', 'maj7♯11', 'Maggiore settima ♯11 (lidio)', 'undicesime', '1 3 5? 7 #11'),
  def('maj9#11', 'maj9♯11', 'Maggiore nona ♯11', 'undicesime', '1 3 5? 7 9 #11'),
  def('7#11', '7♯11', 'Dominante ♯11', 'undicesime', '1 3 5? b7 #11'),
  def('9#11', '9♯11', 'Nona ♯11 (lidio dominante)', 'undicesime', '1 3 5? b7 9 #11'),
  def('m11b5', 'm11♭5', 'Semidiminuita con undicesima', 'undicesime', '1 b3 b5 b7 9? 11'),

  def('13', '13', 'Tredicesima di dominante', 'tredicesime', '1 3 5? b7 9? 13'),
  def('maj13', 'maj13', 'Maggiore tredicesima', 'tredicesime', '1 3 5? 7 9? 13'),
  def('m13', 'm13', 'Minore tredicesima', 'tredicesime', '1 b3 5? b7 9? 11? 13'),
  def('13sus4', '13sus4', 'Tredicesima sospesa', 'tredicesime', '1 4 5? b7 9? 13'),
  def('13#11', '13♯11', 'Tredicesima ♯11', 'tredicesime', '1 3 5? b7 9? #11 13'),
  def('maj13#11', 'maj13♯11', 'Maggiore tredicesima ♯11', 'tredicesime', '1 3 5? 7 9? #11 13'),

  def('7b9', '7♭9', 'Dominante ♭9', 'alterati', '1 3 5? b7 b9'),
  def('7#9', '7♯9', 'Dominante ♯9', 'alterati', '1 3 5? b7 #9'),
  def('7b5', '7♭5', 'Dominante ♭5', 'alterati', '1 3 b5 b7'),
  def('7#5', '7♯5', 'Dominante aumentata', 'alterati', '1 3 #5 b7'),
  def('7b13', '7♭13', 'Dominante ♭13', 'alterati', '1 3 5? b7 b13'),
  def('7b9b13', '7♭9♭13', 'Dominante ♭9 ♭13', 'alterati', '1 3 5? b7 b9 b13'),
  def('7#9b13', '7♯9♭13', 'Dominante ♯9 ♭13', 'alterati', '1 3 b7 #9 b13'),
  def('7b9#9', '7♭9♯9', 'Dominante ♭9 ♯9', 'alterati', '1 3 5? b7 b9 #9'),
  def('7b9#11', '7♭9♯11', 'Dominante ♭9 ♯11', 'alterati', '1 3 5? b7 b9 #11'),
  def('13b9', '13♭9', 'Tredicesima ♭9', 'alterati', '1 3 5? b7 b9 13'),
  def('m7b9', 'm7♭9', 'Minore settima ♭9 (frigio)', 'alterati', '1 b3 5? b7 b9'),
];

export const findType = (id: string) => CHORD_TYPES.find((t) => t.id === id);

/* ---------- Tensioni miste: accordi di settima + 1-3 tensioni casuali ---------- */

const TENSION_ORDER: IntervalName[] = ['b9', '9', '#9', '11', '#11', 'b13', '13'];

/** Per ogni settima, gruppi di tensioni alternative (al massimo una per gruppo). */
const MIX_RECIPES: { base: string; groups: IntervalName[][] }[] = [
  { base: 'maj7', groups: [['9'], ['#11'], ['13']] },
  { base: '7', groups: [['b9', '9', '#9'], ['#11'], ['b13', '13']] },
  { base: 'm7', groups: [['b9', '9'], ['11'], ['13']] },
  { base: 'm7b5', groups: [['9'], ['11'], ['b13']] },
  { base: 'mmaj7', groups: [['9'], ['11'], ['13']] },
  { base: '7sus4', groups: [['b9', '9'], ['b13', '13']] },
];

export function randomMixedType(rand = Math.random): ChordType {
  const recipe = MIX_RECIPES[Math.floor(rand() * MIX_RECIPES.length)];
  const base = findType(recipe.base)!;
  const groups = [...recipe.groups].sort(() => rand() - 0.5);
  const count = 1 + Math.floor(rand() * groups.length);
  const tensions = groups
    .slice(0, count)
    .map((g) => g[Math.floor(rand() * g.length)])
    .sort((a, b) => TENSION_ORDER.indexOf(a) - TENSION_ORDER.indexOf(b));
  const labels = tensions.map(intervalLabel).join(',');
  const suffix = base.suffix.endsWith(')') ? `${base.suffix.slice(0, -1)},${labels})` : `${base.suffix}(${labels})`;
  return {
    id: `mix:${base.id}(${tensions.join(',')})`,
    suffix,
    name: `${base.name} con ${tensions.map(intervalLabel).join(', ')}`,
    category: 'miste',
    tones: [...base.tones, ...tensions.map((iv) => ({ iv, optional: false }))],
  };
}

/* ---------- Accordo concreto ---------- */

export interface Chord {
  root: Note;
  type: ChordType;
}

export interface ChordTone {
  iv: IntervalName;
  optional: boolean;
  note: Note;
  pc: number;
  role: Role;
  label: string;
}

export function chordTones(chord: Chord): ChordTone[] {
  return chord.type.tones.map(({ iv, optional }) => {
    const { steps, semis } = INTERVALS[iv];
    const note = transpose(chord.root, steps, semis);
    return { iv, optional, note, pc: pitchClass(note), role: intervalRole(iv), label: intervalLabel(iv) };
  });
}

export const chordSymbol = (chord: Chord, italian = false) => noteName(chord.root, italian) + chord.type.suffix;
