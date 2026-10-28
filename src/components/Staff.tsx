import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveConnector, StaveNote, Voice } from 'vexflow';
import { useT } from '../i18n';
import { LETTERS } from '../theory/notes';
import type { VoicedNote } from '../theory/voicing';

const W = 300, H = 250;

const vfAcc = (acc: number) => (acc > 0 ? '#'.repeat(acc) : 'b'.repeat(-acc));

function makeVoice(notes: VoicedNote[], clef: 'treble' | 'bass') {
  const sorted = [...notes].sort((a, b) => a.midi - b.midi);
  const sn = new StaveNote({
    clef,
    duration: 'w',
    keys: sorted.map((n) => `${LETTERS[n.note.letter].toLowerCase()}${vfAcc(n.note.acc)}/${n.octave}`),
  });
  sorted.forEach((n, i) => n.note.acc && sn.addModifier(new Accidental(vfAcc(n.note.acc)), i));
  return new Voice({ num_beats: 4, beat_value: 4 }).addTickables([sn]);
}

/** Grande rigo (chiave di violino + basso) con l'accordo come semibreve. */
export function Staff({ notes }: { notes: VoicedNote[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useT();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(W, H);
    const ctx = renderer.getContext();

    const treble = new Stave(28, 18, W - 40).addClef('treble');
    const bass = new Stave(28, 128, W - 40).addClef('bass');
    treble.setContext(ctx).draw();
    bass.setContext(ctx).draw();
    for (const type of ['brace', 'singleLeft', 'singleRight'] as const) {
      new StaveConnector(treble, bass).setType(type).setContext(ctx).draw();
    }

    const parts: [Voice, Stave][] = [];
    const up = notes.filter((n) => n.midi >= 60);
    const down = notes.filter((n) => n.midi < 60);
    if (up.length) parts.push([makeVoice(up, 'treble'), treble]);
    if (down.length) parts.push([makeVoice(down, 'bass'), bass]);
    if (parts.length) {
      const startX = Math.max(treble.getNoteStartX(), bass.getNoteStartX());
      treble.setNoteStartX(startX);
      bass.setNoteStartX(startX);
      const formatter = new Formatter();
      parts.forEach(([v]) => formatter.joinVoices([v]));
      formatter.format(
        parts.map(([v]) => v),
        treble.getNoteEndX() - startX - 20,
      );
      parts.forEach(([v, stave]) => v.draw(ctx, stave));
    }

    const svg = el.querySelector('svg');
    svg?.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg?.removeAttribute('width');
    svg?.removeAttribute('height');
  }, [notes]);

  return <div className="staff" ref={ref} aria-label={t('aria.staff')} />;
}
