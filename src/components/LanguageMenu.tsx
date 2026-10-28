import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, useT, type Lang } from '../i18n';

/** Bandiere in SVG: su Windows le emoji delle bandiere vengono mostrate come lettere. */
function Flag({ lang }: { lang: Lang }) {
  if (lang === 'it') {
    return (
      <svg className="flag" viewBox="0 0 3 2" aria-hidden>
        <rect width="1" height="2" fill="#009246" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#ce2b37" />
      </svg>
    );
  }
  return (
    <svg className="flag" viewBox="0 0 60 30" aria-hidden>
      <clipPath id="uk-clip">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-clip)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export function LanguageMenu({ onChange }: { onChange: (lang: Lang) => void }) {
  const { lang, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current?.contains(e.target as Node) || setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lang-menu" ref={ref}>
      <button className="lang-btn" aria-haspopup="listbox" aria-expanded={open} title={t('top.language')} onClick={() => setOpen((o) => !o)}>
        <Flag lang={lang} />
        <span>{lang.toUpperCase()}</span>
        <svg className="chevron" viewBox="0 0 10 6" aria-hidden>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className="lang-list" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.id}>
              <button
                role="option"
                aria-selected={l.id === lang}
                className={l.id === lang ? 'active' : ''}
                onClick={() => {
                  onChange(l.id);
                  setOpen(false);
                }}
              >
                <Flag lang={l.id} />
                {l.label}
                {l.id === lang && <span className="check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
