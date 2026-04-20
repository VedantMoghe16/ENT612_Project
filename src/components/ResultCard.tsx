'use client';

import { useEffect, useState } from 'react';
import type { PriceBreakdown, Condition, Verdict } from '@/lib/pricingEngine';
import type { AreaType } from '@/lib/pricingEngine';
import { useLang } from '@/contexts/LangContext';
import { useSpeech } from '@/hooks/useSpeech';

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
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    chip: 'bg-emerald-500', emoji: '✅', gradient: 'from-emerald-500 to-emerald-700',
  },
  MAYBE: {
    bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700',
    chip: 'bg-amber-500', emoji: '⚠️', gradient: 'from-amber-500 to-orange-600',
  },
  SCRAP: {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    chip: 'bg-red-500', emoji: '🔴', gradient: 'from-red-500 to-rose-700',
  },
};

const COND_KEYS: Record<Condition, 'cond.like_new' | 'cond.good' | 'cond.bad'> = {
  like_new: 'cond.like_new',
  good:     'cond.good',
  bad:      'cond.bad',
};
const AREA_KEYS: Record<AreaType, 'area.college' | 'area.normal' | 'area.low_demand'> = {
  college:    'area.college',
  normal:     'area.normal',
  low_demand: 'area.low_demand',
};

function useCountUp(target: number, duration = 600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (time: number) => {
      const pct = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      setN(Math.round(target * eased));
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

// Only truly dynamic (per-scan) fields need translation via API
interface DynText {
  verdictLabel: string;
  verdictReason: string;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  mrpLabel: string;
}

function dynFromProps(price: PriceBreakdown, ocr: OcrMeta): DynText {
  return {
    verdictLabel: price.verdictLabel,
    verdictReason: price.verdictReason,
    title:         ocr.title      ?? '',
    author:        ocr.author     ?? '',
    publisher:     ocr.publisher  ?? '',
    subject:       ocr.subject    ?? '',
    mrpLabel:      ocr.mrpLabel   ?? '',
  };
}

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
  return numToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
}

function buildSpeechScript(verdict: Verdict, price: number): string {
  const p = numToWords(price) + ' rupees';
  switch (verdict) {
    case 'SELL':  return `Good book! Ask the buyer ${p}.`;
    case 'MAYBE': return `Average book. Ask the buyer ${p}.`;
    case 'SCRAP': return `Low value book. Ask scrap rate only. Maximum ${p}.`;
  }
}

export function ResultCard({
  price, ocr, area, condition, onConditionChange, onScanAgain,
}: Props) {
  const style = VERDICT_STYLES[price.verdict];
  const animatedPrice = useCountUp(price.finalPrice);
  const { lang, t, translateBatch } = useLang();
  const { speak, stop, speaking } = useSpeech(lang);

  const [dyn, setDyn] = useState<DynText>(() => dynFromProps(price, ocr));

  // Auto-speak when a new scan result appears
  useEffect(() => {
    const script = buildSpeechScript(price.verdict, price.finalPrice);
    speak(script);
    return () => stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price.finalPrice]);

  useEffect(() => {
    const base = dynFromProps(price, ocr);
    if (lang === 'en') { setDyn(base); return; }

    const strings = [
      base.verdictLabel,
      base.verdictReason,
      base.title,
      base.author,
      base.publisher,
      base.subject,
      base.mrpLabel,
    ];

    translateBatch(strings).then((tr) => {
      setDyn({
        verdictLabel:  tr[0] || base.verdictLabel,
        verdictReason: tr[1] || base.verdictReason,
        title:         tr[2] || base.title,
        author:        tr[3] || base.author,
        publisher:     tr[4] || base.publisher,
        subject:       tr[5] || base.subject,
        mrpLabel:      tr[6] || base.mrpLabel,
      });
    }).catch(() => setDyn(base));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, price.finalPrice, price.verdictLabel, ocr.title, ocr.author]);

  return (
    <div className="px-5 pt-5 pb-24 animate-fade-up">
      {/* Hero Verdict Card */}
      <div className={`relative rounded-3xl overflow-hidden shadow-card border ${style.border}`}>
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />
        <div className={`${style.bg} p-6`}>
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.chip} text-white text-xs font-extrabold tracking-wider uppercase shadow-pop`}>
              <span>{style.emoji}</span>
              <span>{dyn.verdictLabel}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{t('res.mrp')}</p>
              <p className={`text-sm font-bold ${style.text}`}>₹{price.mrp}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{t('res.paySeller')}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`font-display text-6xl font-black ${style.text} tabular-nums`}>
                ₹{animatedPrice}
              </span>
              {/* Speak button — big and obvious for dealers who can't read */}
              <button
                onClick={() => speaking ? stop() : speak(buildSpeechScript(price.verdict, price.finalPrice))}
                className={`btn-tap w-14 h-14 rounded-2xl flex items-center justify-center shadow-pop flex-shrink-0 transition-all ${
                  speaking
                    ? 'bg-white/80 border-2 border-current animate-pulse'
                    : 'bg-white/60 hover:bg-white/80 border border-white/40'
                } ${style.text}`}
                aria-label={speaking ? 'Stop' : 'Speak price'}
              >
                {speaking ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
            </div>
            <p className={`text-sm font-medium ${style.text} mt-1`}>{dyn.verdictReason}</p>
            {ocr.mrpLabel && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/60 rounded-full px-2.5 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ocr.mrpSource === 'cover'        ? 'bg-emerald-500' :
                  ocr.mrpSource === 'database'     ? 'bg-emerald-500' :
                  ocr.mrpSource === 'serper'       ? 'bg-blue-500' :
                  ocr.mrpSource === 'google_books' ? 'bg-blue-500' :
                  'bg-amber-500'
                }`} />
                <span className="text-[10px] font-semibold text-gray-600">MRP: {dyn.mrpLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Info */}
      {(ocr.title || ocr.publisher || ocr.author) && (
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('res.identified')}</p>
          {ocr.title && (
            <p className="font-display font-bold text-gray-900 text-base mt-1 leading-tight">{dyn.title}</p>
          )}
          {ocr.author && (
            <p className="text-xs text-gray-500 mt-0.5">{dyn.author}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ocr.publisher && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-semibold">
                {dyn.publisher}
              </span>
            )}
            {ocr.subject && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {dyn.subject}
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
                {t('res.oldEdition')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Condition selector — uses t() directly, updates instantly with context */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{t('res.condition')}</p>
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
              {t(COND_KEYS[c])}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">{t('res.breakdown')}</p>
        <div className="space-y-2.5">
          <BreakdownRow label={t('res.bd.mrp')}  value={`₹${price.mrp}`} />
          <BreakdownRow label={t('res.bd.base')} value={`₹${price.basePrice}`} />
          <BreakdownRow label={t(AREA_KEYS[area])}           value={`× ${price.areaMultiplier}`} />
          <BreakdownRow label={t(COND_KEYS[condition])}      value={`× ${price.conditionMultiplier}`} />
          {price.categoryMultiplier !== 1 && (
            <BreakdownRow label={t('res.category')} value={`× ${price.categoryMultiplier}`} />
          )}
          {price.editionMultiplier !== 1 && (
            <BreakdownRow label={t('res.oldEdition')} value={`× ${price.editionMultiplier}`} />
          )}
          <div className="pt-2.5 border-t border-dashed border-gray-200 flex items-center justify-between">
            <p className="font-bold text-gray-900">{t('res.bd.final')}</p>
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
            {t('res.scanAgain')}
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
