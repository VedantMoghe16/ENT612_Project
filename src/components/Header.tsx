'use client';

import { useState } from 'react';
import type { AreaType } from '@/lib/pricingEngine';
import { LANGS } from '@/lib/i18n';
import { useLang } from '@/contexts/LangContext';

export function Header({
  area,
  onAreaChange,
}: {
  area: AreaType;
  onAreaChange: (a: AreaType) => void;
}) {
  const [areaOpen, setAreaOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t, translating } = useLang();

  const AREA_KEYS = {
    college:    { label: 'area.college'      as const, desc: 'area.college.desc' as const },
    normal:     { label: 'area.normal'       as const, desc: 'area.normal.desc'  as const },
    low_demand: { label: 'area.low_demand'   as const, desc: 'area.low.desc'     as const },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-pop">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg leading-none text-gray-900 tracking-tight">
              Kitaab<span className="text-brand-600">Value</span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{t('app.tagline')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(o => !o); setAreaOpen(false); }}
              className="btn-tap flex items-center gap-1.5 bg-gray-50 text-gray-700 px-2.5 py-2 rounded-full border border-gray-200 font-semibold text-xs"
              aria-label="Select language"
            >
              {translating ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3M3 12h18" />
                </svg>
              )}
              <span>{LANGS.find(l => l.code === lang)?.native ?? 'En'}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden z-50 animate-fade-up">
                {LANGS.map((l, i) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm
                      ${i > 0 ? 'border-t border-gray-50' : ''}
                      ${lang === l.code ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-gray-50 text-gray-800 font-medium'}
                    `}
                  >
                    {l.native}
                    {lang === l.code && (
                      <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Area chip */}
          <button
            onClick={() => { setAreaOpen(o => !o); setLangOpen(false); }}
            className="btn-tap flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-2 rounded-full border border-brand-100 font-semibold text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {t(AREA_KEYS[area].label)}
            <svg className={`w-3 h-3 transition-transform ${areaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Area dropdown */}
      {areaOpen && (
        <div className="max-w-xl mx-auto px-5 pb-3 animate-fade-up">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
            {(['college', 'normal', 'low_demand'] as AreaType[]).map((a, i) => (
              <button
                key={a}
                onClick={() => { onAreaChange(a); setAreaOpen(false); }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between ${
                  i > 0 ? 'border-t border-gray-50' : ''
                } ${area === a ? 'bg-brand-50' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t(AREA_KEYS[a].label)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(AREA_KEYS[a].desc)}</p>
                </div>
                {area === a && (
                  <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
