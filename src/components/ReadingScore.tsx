import { useEffect, useRef } from 'react';
import {
  Accidental,
  Annotation,
  BarlineType,
  Formatter,
  Renderer,
  Stave,
  StaveConnector,
  StaveNote,
  Voice,
} from 'vexflow';
import { useT } from '../i18n';
import { BEATS_PER_MEASURE, type Clef, type ClefMode, type Step } from '../reading/exercise';
import type { StepState, StepStatus } from '../reading/session';
import { LETTERS, noteName } from '../theory/notes';

const MEASURE_W = 220, FIRST_EXTRA = 80, X0 = 10;

const STATUS_COLOR: Partial<Record<StepStatus, string>> = { ok: '#0f9d63', fixed: '#d98200', missed: '#d92650' };
const CURSOR_COLOR = '#6d4aff';

const vfAcc = (acc: number) => (acc > 0 ? '#'.repeat(acc) : acc < 0 ? 'b'.repeat(-acc) : 'n');

interface Props {
  steps: Step[];
  state: StepState[];
  cur: number;
  clef: ClefMode;
  showCursor: boolean;
  showNames: boolean;
  italian: boolean;
}

/** Esercizio di lettura: 4 battute, colorate in base all'esito di ogni battito. */
export function ReadingScore({ steps, state, cur, clef, showCursor, showNames, italian }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useT();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const grand = clef === 'both';
    const clefs: Clef[] = clef === 'both' ? ['treble', 'bass'] : [clef];
    const measures = steps.length / BEATS_PER_MEASURE;
    const W = 2 * X0 + FIRST_EXTRA + MEASURE_W * measures;
    const H = grand ? 300 : 180;
    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(W, H);
    const ctx = renderer.getContext();

    for (let m = 0; m < measures; m++) {
      const x = m === 0 ? X0 : X0 + FIRST_EXTRA + m * MEASURE_W;
      const w = MEASURE_W + (m === 0 ? FIRST_EXTRA : 0);
      const staves = clefs.map((c, k) => {
        const stave = new Stave(x, 30 + k * 130, w);
        if (m === 0) stave.addClef(c).addTimeSignature('4/4');
        if (m === measures - 1) stave.setEndBarType(BarlineType.END);
        return stave.setContext(ctx).draw();
      });
      if (grand) {
        const [top, bottom] = staves;
        if (m === 0) {
          new StaveConnector(top, bottom).setType('brace').setContext(ctx).draw();
          new StaveConnector(top, bottom).setType('singleLeft').setContext(ctx).draw();
        }
        new StaveConnector(top, bottom).setType(m === measures - 1 ? 'boldDoubleRight' : 'singleRight').setContext(ctx).draw();
      }

      const voices = clefs.map((c) => {
        // Le alterazioni valgono fino alla fine della battuta, per ogni rigo.
        const shown = new Map<string, number>();
        const notes = steps.slice(m * BEATS_PER_MEASURE, (m + 1) * BEATS_PER_MEASURE).map((step, k) => {
          const i = m * BEATS_PER_MEASURE + k;
          const n = step.notes.find((x) => x.clef === c);
          if (!n) return new StaveNote({ clef: c, keys: [c === 'treble' ? 'b/4' : 'd/3'], duration: 'qr' });
          const sn = new StaveNote({
            clef: c,
            keys: [`${LETTERS[n.note.letter].toLowerCase()}${n.note.acc ? vfAcc(n.note.acc) : ''}/${n.octave}`],
            duration: 'q',
          });
          const pos = `${n.note.letter}/${n.octave}`;
          if (n.note.acc !== (shown.get(pos) ?? 0)) {
            sn.addModifier(new Accidental(vfAcc(n.note.acc)), 0);
            shown.set(pos, n.note.acc);
          }
          if (showNames) {
            sn.addModifier(new Annotation(noteName(n.note, italian)).setVerticalJustification(Annotation.VerticalJustify.BOTTOM), 0);
          }
          const color = STATUS_COLOR[state[i].status] ?? (showCursor && i === cur ? CURSOR_COLOR : undefined);
          if (color) sn.setStyle({ fillStyle: color, strokeStyle: color });
          return sn;
        });
        return new Voice({ num_beats: 4, beat_value: 4 }).addTickables(notes);
      });

      const startX = Math.max(...staves.map((s) => s.getNoteStartX()));
      staves.forEach((s) => s.setNoteStartX(startX));
      // Il rigo sulle note serve a getAbsoluteX() per il cursore (Voice.setStave non lo propaga).
      voices.forEach((v, i) => v.getTickables().forEach((n) => n.setStave(staves[i])));
      const formatter = new Formatter();
      voices.forEach((v) => formatter.joinVoices([v]));
      formatter.format(voices, staves[0].getNoteEndX() - startX - 10);

      // Cursore: banda dietro il battito corrente, disegnata prima delle note.
      const k = cur - m * BEATS_PER_MEASURE;
      if (showCursor && k >= 0 && k < BEATS_PER_MEASURE) {
        const nx = voices[0].getTickables()[k].getAbsoluteX();
        const top = staves[0].getYForLine(0) - 22;
        const bottom = staves[staves.length - 1].getYForLine(4) + 22;
        ctx.save();
        ctx.setFillStyle('rgba(109, 74, 255, 0.12)');
        ctx.fillRect(nx - 9, top, 30, bottom - top);
        ctx.restore();
      }
      voices.forEach((v, i) => v.draw(ctx, staves[i]));
    }

    // Come in Staff: via le dimensioni fisse di VexFlow, l'SVG scala col viewBox.
    el.style.removeProperty('width');
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.removeProperty('width');
      svg.style.removeProperty('height');
    }
  }, [steps, state, cur, clef, showCursor, showNames, italian]);

  return <div className="reading-score" ref={ref} aria-label={t('aria.staff')} />;
}
