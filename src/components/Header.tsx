'use client';

import { useState } from 'react';
import type { AreaType } from '@/lib/pricingEngine';
import { AREA_LABEL } from '@/lib/pricingEngine';

export function Header({
  area,
  onAreaChange,
}: {
  area: AreaType;
  onAreaChange: (a: AreaType) => void;
}) {
  const [open, setOpen] = useState(false);

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
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Instant book resale price</p>
          </div>
        </div>

        {/* Area chip */}
        <button
          onClick={() => setOpen(o => !o)}
          className="btn-tap flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-2 rounded-full border border-brand-100 font-semibold text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          {AREA_LABEL[area]}
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Area dropdown */}
      {open && (
        <div className="max-w-xl mx-auto px-5 pb-3 animate-fade-up">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
            {(['college', 'normal', 'low_demand'] as AreaType[]).map((a, i) => (
              <button
                key={a}
                onClick={() => { onAreaChange(a); setOpen(false); }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between ${
                  i > 0 ? 'border-t border-gray-50' : ''
                } ${area === a ? 'bg-brand-50' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900">{AREA_LABEL[a]}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a === 'college' && 'Near campus, hostels — highest resale'}
                    {a === 'normal' && 'Standard residential / mixed area'}
                    {a === 'low_demand' && 'Rural / scrap-only demand'}
                  </p>
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
