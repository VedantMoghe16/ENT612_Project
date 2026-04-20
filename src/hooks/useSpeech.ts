'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LANGS, type LangCode } from '@/lib/i18n';

export function useSpeech(lang: LangCode) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const speak = useCallback(async (text: string) => {
    audioRef.current?.pause();
    audioRef.current = null;

    const sarvamCode = LANGS.find(l => l.code === lang)?.sarvamCode ?? 'en-IN';
    setSpeaking(true);
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: sarvamCode }),
      });
      const { audio } = await res.json();
      if (!audio) { setSpeaking(false); return; }

      const el = new Audio(`data:audio/wav;base64,${audio}`);
      audioRef.current = el;
      el.onended = () => setSpeaking(false);
      el.onerror = () => setSpeaking(false);
      await el.play();
    } catch {
      setSpeaking(false);
    }
  }, [lang]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}
