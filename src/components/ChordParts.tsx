import { useT } from '../i18n';
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
  const { t } = useT();
  return (
    <div className="chips">
      {tones.map((tone) => (
        <span
          key={tone.iv}
          className={`chip${tone.optional ? ' optional' : ''}`}
          style={{ '--c': roleColor(tone.role) } as React.CSSProperties}
          title={tone.optional ? t('chip.optional') : undefined}
        >
          <b>{tone.label}</b>
          <span>{noteName(tone.note, italian)}</span>
        </span>
      ))}
    </div>
  );
}

export function Legend() {
  const { lang, t } = useT();
  return (
    <div className="legend">
      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
        <span key={r}>
          <i style={{ background: roleColor(r) }} />
          {ROLE_LABELS[r][lang]}
        </span>
      ))}
      <span className="muted">{t('legend.optional')}</span>
    </div>
  );
}

/** Sottotitolo: nome dell'accordo e, nell'interfaccia italiana, la sigla in Do Re Mi. */
export function ChordSubtitle({ name, solfege }: { name: string; solfege?: string }) {
  return (
    <div className="subtitle">
      {name}
      {solfege && <span className="muted"> · {solfege}</span>}
    </div>
  );
}
