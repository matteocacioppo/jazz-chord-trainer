import { useEffect, useState } from 'react';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Unisce i valori salvati ai default, così le nuove impostazioni aggiunte in futuro hanno sempre un valore. */
function merge<T>(defaults: T, saved: unknown): T {
  if (!isObject(defaults) || !isObject(saved)) return (saved ?? defaults) as T;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(saved)) out[k] = k in defaults ? merge((defaults as Record<string, unknown>)[k], v) : v;
  return out as T;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return merge(initial, JSON.parse(raw));
    } catch {
      /* storage non disponibile o dati corrotti: si riparte dai default */
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignora: la sessione funziona comunque */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
