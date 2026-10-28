import { useT, type Lang } from '../i18n';
import { CATEGORIES, findType } from '../theory/chords';
import { EMPTY_STATS, type StatEntry, type Stats } from '../settings';

const categoryLabel = (id: string, lang: Lang) => CATEGORIES.find((c) => c.id === id)?.label[lang] ?? id;
const entryName = (id: string, e: StatEntry, lang: Lang) =>
  findType(id)?.name[lang] ?? (typeof e.name === 'string' ? e.name : e.name[lang]);

export function StatsPage({ stats, setStats }: { stats: Stats; setStats: (s: Stats) => void }) {
  const { lang, t } = useT();
  const rows = Object.entries(stats.types)
    .map(([id, e]) => ({ id, ...e, acc: e.correct / e.attempts }))
    .sort((a, b) => a.acc - b.acc || b.attempts - a.attempts);
  const total = rows.reduce((n, r) => n + r.attempts, 0);
  const correct = rows.reduce((n, r) => n + r.correct, 0);
  const totalMs = rows.reduce((n, r) => n + r.totalMs, 0);

  return (
    <div className="stats-page">
      <div className="card session wide">
        <div className="stat"><span>{total}</span><small>{t('stats.tried')}</small></div>
        <div className="stat"><span>{total ? Math.round((correct / total) * 100) : 0}%</span><small>{t('stats.firstTry')}</small></div>
        <div className="stat"><span>{correct ? (totalMs / correct / 1000).toFixed(1) : '–'} s</span><small>{t('stats.avgTime')}</small></div>
        <div className="stat"><span>{stats.bestStreak}</span><small>{t('stats.bestStreak')}</small></div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>{t('stats.byType')} <span className="muted">{t('stats.hardestFirst')}</span></h3>
          <button
            className="btn ghost"
            disabled={!total}
            onClick={() => confirm(t('stats.resetConfirm')) && setStats(EMPTY_STATS)}
          >
            {t('stats.reset')}
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="muted">{t('stats.empty')}</p>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th>{t('stats.colChord')}</th>
                <th>{t('stats.colCategory')}</th>
                <th>{t('stats.colAttempts')}</th>
                <th>{t('stats.colAccuracy')}</th>
                <th>{t('stats.colAvgTime')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b className="mono">{r.label}</b> <span className="muted small">{entryName(r.id, r, lang)}</span>
                  </td>
                  <td className="muted">{categoryLabel(r.category, lang)}</td>
                  <td>{r.attempts}</td>
                  <td>
                    <div className="bar">
                      <i style={{ width: `${r.acc * 100}%`, background: r.acc >= 0.8 ? 'var(--ok)' : r.acc >= 0.5 ? 'var(--role-root)' : 'var(--bad)' }} />
                      <span>{Math.round(r.acc * 100)}%</span>
                    </div>
                  </td>
                  <td>{r.correct ? `${(r.totalMs / r.correct / 1000).toFixed(1)} s` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
