'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Scanner } from '@/components/Scanner';
import { ResultCard } from '@/components/ResultCard';
import { ManualMrpEntry } from '@/components/ManualMrpEntry';
import { useLang } from '@/contexts/LangContext';
import {
  calculatePrice,
  type AreaType, type Condition, type Category, type PriceBreakdown,
} from '@/lib/pricingEngine';

type ScanState = 'idle' | 'loading' | 'result' | 'manual-mrp';

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

interface ScanData {
  price: PriceBreakdown;
  ocr: OcrMeta;
}

export default function Home() {
  const { t } = useLang();
  const [state, setState] = useState<ScanState>('idle');
  const [area, setArea] = useState<AreaType>('normal');
  const [condition, setCondition] = useState<Condition>('good');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [ocrFallback, setOcrFallback] = useState<{ title?: string | null; text?: string; detectedMrp?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load saved settings
  useEffect(() => {
    try {
      const a = localStorage.getItem('kv_area') as AreaType | null;
      const c = localStorage.getItem('kv_condition') as Condition | null;
      if (a && ['college', 'normal', 'low_demand'].includes(a)) setArea(a);
      if (c && ['like_new', 'good', 'bad'].includes(c)) setCondition(c);
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem('kv_area', area); } catch {} }, [area]);
  useEffect(() => { try { localStorage.setItem('kv_condition', condition); } catch {} }, [condition]);

  /** Recalculate price locally from stored OCR data — no API call needed. */
  function recalcLocal(data: ScanData, newArea: AreaType, newCondition: Condition): ScanData {
    const newPrice = calculatePrice({
      mrp: data.price.mrp,
      area: newArea,
      condition: newCondition,
      category: (data.ocr.category as Category) ?? 'unknown',
      isOutdated: data.ocr.isOutdated ?? false,
    });
    return { ...data, price: newPrice };
  }

  const callScanApi = useCallback(async (payload: {
    image?: string;
    manualMrp?: number;
  }) => {
    setErrorMsg(null);
    setState('loading');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, area, condition }),
      });
      const data = await res.json();

      if (data.success && data.price) {
        setScanData({ price: data.price, ocr: data.ocr ?? {} });
        setState('result');
        return;
      }

      if (data.requiresManualMrp) {
        setOcrFallback({ title: data.ocr?.title ?? null, text: data.ocr?.text ?? '' });
        setState('manual-mrp');
        return;
      }

      setErrorMsg(data.message ?? t('err.generic'));
      setState('idle');
    } catch (err: any) {
      setErrorMsg(err?.message ?? t('err.network'));
      setState('idle');
    }
  }, [area, condition]);

  const handleImageReady = useCallback((dataUrl: string) => {
    setCurrentImage(dataUrl);
    callScanApi({ image: dataUrl });
  }, [callScanApi]);

  const handleManualMrp = useCallback((mrp: number) => {
    callScanApi({ manualMrp: mrp });
  }, [callScanApi]);

  const handleConditionChange = useCallback((c: Condition) => {
    setCondition(c);
    if (scanData) {
      setScanData(d => d ? recalcLocal(d, area, c) : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanData, area]);

  const handleAreaChange = useCallback((a: AreaType) => {
    setArea(a);
    if (scanData && state === 'result') {
      setScanData(d => d ? recalcLocal(d, a, condition) : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanData, condition, state]);

  const handleScanAgain = useCallback(() => {
    setCurrentImage(null);
    setScanData(null);
    setOcrFallback(null);
    setErrorMsg(null);
    setState('idle');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto bg-white min-h-screen shadow-card">
        <Header area={area} onAreaChange={handleAreaChange} />

        {/* Error toast */}
        {errorMsg && state === 'idle' && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2 animate-fade-up">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {(state === 'idle' || state === 'loading') && (
          <Scanner onImageReady={handleImageReady} loading={state === 'loading'} />
        )}

        {state === 'result' && scanData && (
          <ResultCard
            price={scanData.price}
            ocr={scanData.ocr}
            area={area}
            condition={condition}
            onConditionChange={handleConditionChange}
            onScanAgain={handleScanAgain}
          />
        )}

        {state === 'manual-mrp' && (
          <ManualMrpEntry
            title={ocrFallback?.title ?? null}
            ocrText={ocrFallback?.text}
            onSubmit={handleManualMrp}
            onCancel={handleScanAgain}
          />
        )}

        {state !== 'result' && (
          <div className="px-5 py-8 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              {t('footer')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
