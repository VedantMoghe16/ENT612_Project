'use client';

import { useEffect, useState } from 'react';
import type { PriceBreakdown, Condition, Verdict } from '@/lib/pricingEngine';
import { CONDITION_LABEL, AREA_LABEL, type AreaType } from '@/lib/pricingEngine';

interface OcrMeta {
  title?: string | null;
  author?: string | null;
  publisher?: string | null;
  subject?: string | null;
  editionYear?: number | null;
  mrpSource?: string;
  mrpLabel?: string;
  category?: string;
  isOutdated?: boolean;
}

interface Props {
  price: PriceBreakdown;
  ocr: OcrMeta;
  area: AreaType;
  condition: Condition;
  onConditionChange: (c: Condition) => void;
  onScanAgain: () => void;
}

const VERDICT_STYLES: Record<Verdict, {
  bg: string; border: string; text: string; chip: string; emoji: string; gradient: string;
}> = {
  SELL: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    chip: 'bg-emerald-500',
    emoji: '✅',
    gradient: 'from-emerald-500 to-emerald-700',
  },
  MAYBE: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    chip: 'bg-amber-500',
    emoji: '⚠️',
    gradient: 'from-amber-500 to-orange-600',
  },
  SCRAP: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    chip: 'bg-red-500',
    emoji: '🔴',
    gradient: 'from-red-500 to-rose-700',
  },
};

// Animated number counter
function useCountUp(target: number, duration = 600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const pct = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setN(Math.round(target * eased));
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export function ResultCard({
  price, ocr, area, condition, onConditionChange, onScanAgain,
}: Props) {
  const style = VERDICT_STYLES[price.verdict];
  const animatedPrice = useCountUp(price.finalPrice);

  return (
    <div className="px-5 pt-5 pb-24 animate-fade-up">
      {/* Hero Verdict Card */}
      <div className={`relative rounded-3xl overflow-hidden shadow-card border ${style.border}`}>
        {/* gradient top strip */}
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />

        <div className={`${style.bg} p-6`}>
          {/* verdict chip */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.chip} text-white text-xs font-extrabold tracking-wider uppercase shadow-pop`}>
              <span>{style.emoji}</span>
              <span>{price.verdictLabel}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">MRP</p>
              <p className={`text-sm font-bold ${style.text}`}>₹{price.mrp}</p>
            </div>
          </div>

          {/* price */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pay Seller</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`font-display text-6xl font-black ${style.text} tabular-nums`}>
                ₹{animatedPrice}
              </span>
            </div>
            <p className={`text-sm font-medium ${style.text} mt-1`}>
              {price.verdictReason}
            </p>
            {/* MRP source pill */}
            {ocr.mrpLabel && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/60 rounded-full px-2.5 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ocr.mrpSource === 'cover'    ? 'bg-emerald-500' :
                  ocr.mrpSource === 'database' ? 'bg-emerald-500' :
                  ocr.mrpSource === 'serper'   ? 'bg-blue-500' :
                  ocr.mrpSource === 'google_books' ? 'bg-blue-500' :
                  'bg-amber-500'
                }`} />
                <span className="text-[10px] font-semibold text-gray-600">
                  MRP: {ocr.mrpLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Info */}
      {(ocr.title || ocr.publisher || ocr.author) && (
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Book Identified</p>
          {ocr.title && (
            <p className="font-display font-bold text-gray-900 text-base mt-1 leading-tight">
              {ocr.title}
            </p>
          )}
          {ocr.author && (
            <p className="text-xs text-gray-500 mt-0.5">{ocr.author}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ocr.publisher && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">
                {ocr.publisher}
              </span>
            )}
            {ocr.subject && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {ocr.subject}
              </span>
            )}
            {ocr.editionYear && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">
                {ocr.editionYear}
              </span>
            )}
            {ocr.category && ocr.category !== 'unknown' && (
              <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-semibold capitalize">
                {ocr.category}
              </span>
            )}
            {ocr.isOutdated && (
              <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-semibold">
                Old edition
              </span>
            )}
          </div>
        </div>
      )}

      {/* Condition selector */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Book Condition</p>
        <div className="grid grid-cols-3 gap-2">
          {(['like_new', 'good', 'bad'] as Condition[]).map((c) => (
            <button
              key={c}
              onClick={() => onConditionChange(c)}
              className={`btn-tap py-2.5 rounded-xl font-bold text-xs transition-all ${
                condition === c
                  ? 'bg-brand-600 text-white shadow-pop'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {CONDITION_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown — invoice style */}
      <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Price Breakdown</p>
        <div className="space-y-2.5">
          <BreakdownRow label="Printed MRP" value={`₹${price.mrp}`} />
          <BreakdownRow label="Base (30% of MRP)" value={`₹${price.basePrice}`} />
          <BreakdownRow label={AREA_LABEL[area]} value={`× ${price.areaMultiplier}`} />
          <BreakdownRow label={CONDITION_LABEL[condition]} value={`× ${price.conditionMultiplier}`} />
          {price.categoryMultiplier !== 1 && (
            <BreakdownRow label="Category" value={`× ${price.categoryMultiplier}`} />
          )}
          {price.editionMultiplier !== 1 && (
            <BreakdownRow label="Old edition" value={`× ${price.editionMultiplier}`} />
          )}
          <div className="pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between">
            <p className="font-bold text-gray-900">Final Price</p>
            <p className={`font-display font-black text-xl ${style.text}`}>₹{price.finalPrice}</p>
          </div>
        </div>
      </div>

      {/* Floating scan-again button */}
      <div className="fixed bottom-5 left-0 right-0 px-5 z-30">
        <div className="max-w-xl mx-auto">
          <button
            onClick={onScanAgain}
            className="btn-tap w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-pop flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 0 1 2-2h1.5l1.5-2h8l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
              <circle cx="12" cy="13" r="4" strokeLinecap="round" />
            </svg>
            Scan Next Book
          </button>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900 tabular-nums">{value}</span>
    </div>
  );
}
