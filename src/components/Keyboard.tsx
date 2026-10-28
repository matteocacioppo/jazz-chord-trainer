import { useT } from '../i18n';

export interface KeyMark {
  fill?: string;
  dot?: string;
  label?: string;
  sub?: string;
}

interface Props {
  from?: number;
  to?: number;
  marks?: Record<number, KeyMark>;
  onKeyDown?: (midi: number) => void;
}

const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12);
const WW = 24, WH = 132, BW = 15, BH = 84;

export function Keyboard({ from = 36, to = 96, marks = {}, onKeyDown }: Props) {
  const { t } = useT();
  const whites: { m: number; x: number }[] = [];
  const blacks: { m: number; x: number }[] = [];
  let wi = 0;
  for (let m = from; m <= to; m++) {
    if (isBlack(m)) blacks.push({ m, x: wi * WW - BW / 2 });
    else whites.push({ m, x: wi++ * WW });
  }
  const width = wi * WW;

  const key = (m: number, x: number, black: boolean) => {
    const mark = marks[m];
    const w = black ? BW : WW;
    const h = black ? BH : WH;
    const cx = x + w / 2;
    const octaveLabel = !black && m % 12 === 0 && !mark?.label ? `C${m / 12 - 1}` : undefined;
    return (
      <g
        key={m}
        className={`key ${black ? 'black' : 'white'}${mark?.fill ? ' marked' : ''}${onKeyDown ? ' clickable' : ''}`}
        onPointerDown={onKeyDown ? () => onKeyDown(m) : undefined}
      >
        <rect x={x + 0.5} y={0} width={w - 1} height={h} rx={black ? 2.5 : 4} style={mark?.fill ? { fill: mark.fill } : undefined} />
        {mark?.dot && <circle cx={cx} cy={h - (black ? 34 : 50)} r={black ? 4 : 5} style={{ fill: mark.dot }} className="key-dot" />}
        {mark?.label && (
          <text x={cx} y={h - (black ? 16 : 26)} className="key-label">
            {mark.label}
          </text>
        )}
        {(mark?.sub || octaveLabel) && (
          <text x={cx} y={h - (black ? 6 : 10)} className={`key-sub${octaveLabel ? ' octave' : ''}`}>
            {mark?.sub ?? octaveLabel}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="keyboard-wrap">
      <svg className="keyboard" viewBox={`0 0 ${width} ${WH + 1}`} role="img" aria-label={t('aria.keyboard')}>
        {whites.map((k) => key(k.m, k.x, false))}
        {blacks.map((k) => key(k.m, k.x, true))}
      </svg>
    </div>
  );
}
