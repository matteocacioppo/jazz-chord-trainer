import type { Localized } from '../i18n';

export type IntervalName =
  | '1' | 'b9' | '9' | '#9' | '2' | 'b3' | '3' | '4' | '11' | '#11'
  | 'b5' | '5' | '#5' | 'b13' | '6' | '13' | 'bb7' | 'b7' | '7';

/** steps = gradi diatonici sopra la fondamentale, semis = semitoni. */
export const INTERVALS: Record<IntervalName, { steps: number; semis: number }> = {
  '1': { steps: 0, semis: 0 },
  b9: { steps: 1, semis: 1 },
  '9': { steps: 1, semis: 2 },
  '#9': { steps: 1, semis: 3 },
  '2': { steps: 1, semis: 2 },
  b3: { steps: 2, semis: 3 },
  '3': { steps: 2, semis: 4 },
  '4': { steps: 3, semis: 5 },
  '11': { steps: 3, semis: 5 },
  '#11': { steps: 3, semis: 6 },
  b5: { steps: 4, semis: 6 },
  '5': { steps: 4, semis: 7 },
  '#5': { steps: 4, semis: 8 },
  b13: { steps: 5, semis: 8 },
  '6': { steps: 5, semis: 9 },
  '13': { steps: 5, semis: 9 },
  bb7: { steps: 6, semis: 9 },
  b7: { steps: 6, semis: 10 },
  '7': { steps: 6, semis: 11 },
};

/** Ruolo didattico: fondamentale, note guida (3ª e 7ª, incluse sus e 6), quinta, tensioni. */
export type Role = 'root' | 'guide' | 'fifth' | 'tension';

export function intervalRole(iv: IntervalName): Role {
  switch (iv) {
    case '1':
      return 'root';
    case 'b3': case '3': case '4': case '2':
    case 'bb7': case 'b7': case '7': case '6':
      return 'guide';
    case 'b5': case '5': case '#5':
      return 'fifth';
    default:
      return 'tension';
  }
}

export const intervalLabel = (iv: IntervalName) => iv.replace(/b/g, '♭').replace(/#/g, '♯');

export const ROLE_LABELS: Record<Role, Localized> = {
  root: { en: 'Root', it: 'Fondamentale' },
  guide: { en: 'Guide tones (3rd / 7th)', it: 'Note guida (3ª / 7ª)' },
  fifth: { en: 'Fifth', it: 'Quinta' },
  tension: { en: 'Tensions', it: 'Tensioni' },
};
