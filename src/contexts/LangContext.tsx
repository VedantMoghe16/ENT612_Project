'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LANGS, STATIC_STRINGS, type LangCode, type TranslationKey, type Translations } from '@/lib/i18n';

interface LangCtx {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: TranslationKey) => string;
  translateBatch: (strings: string[]) => Promise<string[]>;
  translating: boolean;
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => STATIC_STRINGS[k],
  translateBatch: async (s) => s,
  translating: false,
});

// Bump version when STATIC_STRINGS keys change — busts old caches
const CACHE_KEY = (code: LangCode) => `kv_tr_v2_${code}`;

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');
  const [tr, setTr] = useState<Translations>(STATIC_STRINGS as Translations);
  const [translating, setTranslating] = useState(false);

  const loadTranslations = useCallback(async (code: LangCode) => {
    if (code === 'en') {
      setTr(STATIC_STRINGS as Translations);
      return;
    }
    // Check cache first (sync restore — no loading state needed)
    try {
      const cached = localStorage.getItem(CACHE_KEY(code));
      if (cached) {
        setTr(JSON.parse(cached));
        return;
      }
    } catch {}

    // First-time fetch for this language
    setTranslating(true);
    try {
      const langDef = LANGS.find(l => l.code === code)!;
      const keys = Object.keys(STATIC_STRINGS) as TranslationKey[];
      const strings = keys.map(k => STATIC_STRINGS[k]);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strings, targetLang: langDef.sarvamCode }),
      });
      const { translated } = await res.json();
      const result = Object.fromEntries(
        keys.map((k, i) => [k, translated[i] ?? STATIC_STRINGS[k]])
      ) as Translations;
      setTr(result);
      try { localStorage.setItem(CACHE_KEY(code), JSON.stringify(result)); } catch {}
    } catch {}
    finally { setTranslating(false); }
  }, []);

  // Restore saved language on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kv_lang') as LangCode | null;
      if (saved && LANGS.find(l => l.code === saved)) {
        setLangState(saved);
        loadTranslations(saved);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem('kv_lang', code); } catch {}
    loadTranslations(code);
  }, [loadTranslations]);

  const t = useCallback((key: TranslationKey) => tr[key] ?? STATIC_STRINGS[key], [tr]);

  const translateBatch = useCallback(async (strings: string[]): Promise<string[]> => {
    if (lang === 'en') return strings;
    const langDef = LANGS.find(l => l.code === lang)!;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strings, targetLang: langDef.sarvamCode }),
      });
      const { translated } = await res.json();
      return translated ?? strings;
    } catch {
      return strings;
    }
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t, translateBatch, translating }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
