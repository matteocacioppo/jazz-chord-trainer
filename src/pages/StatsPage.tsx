import { CATEGORIES } from '../theory/chords';
import { EMPTY_STATS, type Stats } from '../settings';

const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function StatsPage({ stats, setStats }: { stats: Stats; setStats: (s: Stats) => void }) {
  const rows = Object.entries(stats.types)
    .map(([id, e]) => ({ id, ...e, acc: e.correct / e.attempts }))
    .sort((a, b) => a.acc - b.acc || b.attempts - a.attempts);
  const total = rows.reduce((n, r) => n + r.attempts, 0);
  const correct = rows.reduce((n, r) => n + r.correct, 0);
  const totalMs = rows.reduce((n, r) => n + r.totalMs, 0);

  return (
    <div className="stats-page">
      <div className="card session wide">
        <div className="stat"><span>{total}</span><small>accordi provati</small></div>
        <div className="stat"><span>{total ? Math.round((correct / total) * 100) : 0}%</span><small>al primo colpo</small></div>
        <div className="stat"><span>{correct ? (totalMs / correct / 1000).toFixed(1) : '–'} s</span><small>tempo medio</small></div>
        <div className="stat"><span>{stats.bestStreak}</span><small>serie record</small></div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Per tipo di accordo <span className="muted">· i più difficili in alto</span></h3>
          <button
            className="btn ghost"
            disabled={!total}
            onClick={() => confirm('Azzerare tutte le statistiche?') && setStats(EMPTY_STATS)}
          >
            Azzera
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="muted">Ancora nessun dato: fai qualche giro nel Quiz.</p>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th>Accordo</th>
                <th>Categoria</th>
                <th>Tentativi</th>
                <th>Precisione</th>
                <th>Tempo medio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b className="mono">{r.label}</b> <span className="muted small">{r.name}</span>
                  </td>
                  <td className="muted">{categoryLabel(r.category)}</td>
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
