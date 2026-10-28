import type { ChordTone } from '../theory/chords';
import { ROLE_LABELS, type Role } from '../theory/intervals';
import { noteName } from '../theory/notes';
import type { VoicedNote } from '../theory/voicing';
import type { KeyMark } from './Keyboard';

export const roleColor = (role: Role) => `var(--role-${role})`;

export function voicingMarks(voicing: VoicedNote[], italian: boolean): Record<number, KeyMark> {
  const marks: Record<number, KeyMark> = {};
  for (const n of voicing) marks[n.midi] = { fill: roleColor(n.role), label: n.label, sub: noteName(n.note, italian) };
  return marks;
}

export function ToneChips({ tones, italian }: { tones: ChordTone[]; italian: boolean }) {
  return (
    <div className="chips">
      {tones.map((t) => (
        <span
          key={t.iv}
          className={`chip${t.optional ? ' optional' : ''}`}
          style={{ '--c': roleColor(t.role) } as React.CSSProperties}
          title={t.optional ? 'Nota opzionale nel voicing' : undefined}
        >
          <b>{t.label}</b>
          <span>{noteName(t.note, italian)}</span>
        </span>
      ))}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend">
      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
        <span key={r}>
          <i style={{ background: roleColor(r) }} />
          {ROLE_LABELS[r]}
        </span>
      ))}
      <span className="muted">Bordo tratteggiato = nota opzionale</span>
    </div>
  );
}
