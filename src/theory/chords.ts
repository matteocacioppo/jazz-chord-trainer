import type { Localized } from '../i18n';
import { INTERVALS, intervalLabel, intervalRole, type IntervalName, type Role } from './intervals';
import { noteName, pitchClass, transpose, type Note } from './notes';

export type CategoryId = 'triadi' | 'settime' | 'none' | 'undicesime' | 'tredicesime' | 'alterati' | 'miste';

export const CATEGORIES: { id: CategoryId; label: Localized }[] = [
  { id: 'triadi', label: { en: 'Triads', it: 'Triadi' } },
  { id: 'settime', label: { en: 'Sevenths', it: 'Settime' } },
  { id: 'none', label: { en: 'Ninths', it: 'None' } },
  { id: 'undicesime', label: { en: 'Elevenths', it: 'Undicesime' } },
  { id: 'tredicesime', label: { en: 'Thirteenths', it: 'Tredicesime' } },
  { id: 'alterati', label: { en: 'Altered dominants', it: 'Dominanti alterati' } },
  { id: 'miste', label: { en: 'Mixed tensions', it: 'Tensioni miste' } },
];

export interface ToneSpec {
  iv: IntervalName;
  /** Nota omettibile nel voicing (es. la quinta giusta). */
  optional: boolean;
}

export interface ChordType {
  id: string;
  suffix: string;
  name: Localized;
  category: CategoryId;
  /** In ordine di grado crescente. */
  tones: ToneSpec[];
}

/** La formula usa "?" per le note opzionali, es. "1 3 5? b7 9". */
function def(id: string, suffix: string, en: string, it: string, category: CategoryId, formula: string): ChordType {
  const tones = formula.split(' ').map((t) => ({ iv: t.replace('?', '') as IntervalName, optional: t.endsWith('?') }));
  return { id, suffix, name: { en, it }, category, tones };
}

export const CHORD_TYPES: ChordType[] = [
  def('maj', '', 'Major', 'Maggiore', 'triadi', '1 3 5'),
  def('min', 'm', 'Minor', 'Minore', 'triadi', '1 b3 5'),
  def('dim', '°', 'Diminished', 'Diminuita', 'triadi', '1 b3 b5'),
  def('aug', '+', 'Augmented', 'Aumentata', 'triadi', '1 3 #5'),
  def('sus4', 'sus4', 'Suspended 4th', 'Sospesa di quarta', 'triadi', '1 4 5'),
  def('sus2', 'sus2', 'Suspended 2nd', 'Sospesa di seconda', 'triadi', '1 2 5'),

  def('maj7', 'maj7', 'Major seventh', 'Maggiore settima', 'settime', '1 3 5? 7'),
  def('7', '7', 'Dominant seventh', 'Settima di dominante', 'settime', '1 3 5? b7'),
  def('m7', 'm7', 'Minor seventh', 'Minore settima', 'settime', '1 b3 5? b7'),
  def('m7b5', 'm7♭5', 'Half-diminished', 'Semidiminuita', 'settime', '1 b3 b5 b7'),
  def('dim7', '°7', 'Diminished seventh', 'Diminuita settima', 'settime', '1 b3 b5 bb7'),
  def('mmaj7', 'm(maj7)', 'Minor-major seventh', 'Minore con settima maggiore', 'settime', '1 b3 5? 7'),
  def('7sus4', '7sus4', 'Dominant suspended', 'Dominante sospesa', 'settime', '1 4 5? b7'),
  def('maj7#5', 'maj7♯5', 'Augmented major seventh', 'Maggiore settima aumentata', 'settime', '1 3 #5 7'),
  def('6', '6', 'Sixth', 'Sesta', 'settime', '1 3 5? 6'),
  def('m6', 'm6', 'Minor sixth', 'Minore sesta', 'settime', '1 b3 5? 6'),

  def('maj9', 'maj9', 'Major ninth', 'Maggiore nona', 'none', '1 3 5? 7 9'),
  def('9', '9', 'Dominant ninth', 'Nona di dominante', 'none', '1 3 5? b7 9'),
  def('m9', 'm9', 'Minor ninth', 'Minore nona', 'none', '1 b3 5? b7 9'),
  def('add9', 'add9', 'Major add9', 'Maggiore add9', 'none', '1 3 5 9'),
  def('madd9', 'm(add9)', 'Minor add9', 'Minore add9', 'none', '1 b3 5 9'),
  def('69', '6/9', 'Six-nine', 'Sei-nove', 'none', '1 3 5? 6 9'),
  def('m69', 'm6/9', 'Minor six-nine', 'Minore sei-nove', 'none', '1 b3 5? 6 9'),
  def('9sus4', '9sus4', 'Suspended ninth', 'Nona sospesa', 'none', '1 4 5? b7 9'),
  def('mmaj9', 'm(maj9)', 'Minor-major ninth', 'Minore nona con settima maggiore', 'none', '1 b3 5? 7 9'),
  def('m9b5', 'm9♭5', 'Half-diminished ninth', 'Semidiminuita con nona', 'none', '1 b3 b5 b7 9'),

  def('m11', 'm11', 'Minor eleventh', 'Minore undicesima', 'undicesime', '1 b3 5? b7 9? 11'),
  def('11', '11', 'Eleventh (no third)', 'Undicesima (senza terza)', 'undicesime', '1 5? b7 9 11'),
  def('maj7#11', 'maj7♯11', 'Major seventh ♯11 (Lydian)', 'Maggiore settima ♯11 (lidio)', 'undicesime', '1 3 5? 7 #11'),
  def('maj9#11', 'maj9♯11', 'Major ninth ♯11', 'Maggiore nona ♯11', 'undicesime', '1 3 5? 7 9 #11'),
  def('7#11', '7♯11', 'Dominant ♯11', 'Dominante ♯11', 'undicesime', '1 3 5? b7 #11'),
  def('9#11', '9♯11', 'Ninth ♯11 (Lydian dominant)', 'Nona ♯11 (lidio dominante)', 'undicesime', '1 3 5? b7 9 #11'),
  def('m11b5', 'm11♭5', 'Half-diminished eleventh', 'Semidiminuita con undicesima', 'undicesime', '1 b3 b5 b7 9? 11'),

  def('13', '13', 'Dominant thirteenth', 'Tredicesima di dominante', 'tredicesime', '1 3 5? b7 9? 13'),
  def('maj13', 'maj13', 'Major thirteenth', 'Maggiore tredicesima', 'tredicesime', '1 3 5? 7 9? 13'),
  def('m13', 'm13', 'Minor thirteenth', 'Minore tredicesima', 'tredicesime', '1 b3 5? b7 9? 11? 13'),
  def('13sus4', '13sus4', 'Suspended thirteenth', 'Tredicesima sospesa', 'tredicesime', '1 4 5? b7 9? 13'),
  def('13#11', '13♯11', 'Thirteenth ♯11', 'Tredicesima ♯11', 'tredicesime', '1 3 5? b7 9? #11 13'),
  def('maj13#11', 'maj13♯11', 'Major thirteenth ♯11', 'Maggiore tredicesima ♯11', 'tredicesime', '1 3 5? 7 9? #11 13'),

  def('7b9', '7♭9', 'Dominant ♭9', 'Dominante ♭9', 'alterati', '1 3 5? b7 b9'),
  def('7#9', '7♯9', 'Dominant ♯9', 'Dominante ♯9', 'alterati', '1 3 5? b7 #9'),
  def('7b5', '7♭5', 'Dominant ♭5', 'Dominante ♭5', 'alterati', '1 3 b5 b7'),
  def('7#5', '7♯5', 'Augmented dominant', 'Dominante aumentata', 'alterati', '1 3 #5 b7'),
  def('7b13', '7♭13', 'Dominant ♭13', 'Dominante ♭13', 'alterati', '1 3 5? b7 b13'),
  def('7b9b13', '7♭9♭13', 'Dominant ♭9 ♭13', 'Dominante ♭9 ♭13', 'alterati', '1 3 5? b7 b9 b13'),
  def('7#9b13', '7♯9♭13', 'Dominant ♯9 ♭13', 'Dominante ♯9 ♭13', 'alterati', '1 3 b7 #9 b13'),
  def('7b9#9', '7♭9♯9', 'Dominant ♭9 ♯9', 'Dominante ♭9 ♯9', 'alterati', '1 3 5? b7 b9 #9'),
  def('7b9#11', '7♭9♯11', 'Dominant ♭9 ♯11', 'Dominante ♭9 ♯11', 'alterati', '1 3 5? b7 b9 #11'),
  def('13b9', '13♭9', 'Thirteenth ♭9', 'Tredicesima ♭9', 'alterati', '1 3 5? b7 b9 13'),
  def('m7b9', 'm7♭9', 'Minor seventh ♭9 (Phrygian)', 'Minore settima ♭9 (frigio)', 'alterati', '1 b3 5? b7 b9'),
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
  const listed = tensions.map(intervalLabel).join(', ');
  const suffix = base.suffix.endsWith(')') ? `${base.suffix.slice(0, -1)},${labels})` : `${base.suffix}(${labels})`;
  return {
    id: `mix:${base.id}(${tensions.join(',')})`,
    suffix,
    name: { en: `${base.name.en} with ${listed}`, it: `${base.name.it} con ${listed}` },
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
