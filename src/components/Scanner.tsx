'use client';

import { useRef, useState } from 'react';
import { useLang } from '@/contexts/LangContext';

interface Props {
  onImageReady: (dataUrl: string) => void;
  loading: boolean;
}

export function Scanner({ onImageReady, loading }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onImageReady(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="px-5 pt-6">
      {/* Hero copy */}
      <div className="mb-5 animate-fade-up">
        <h2 className="font-display text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight">
          {t('scan.head1')}<br />
          <span className="text-brand-600">{t('scan.head2')}</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 font-medium">{t('scan.sub')}</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all
          ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}
          ${preview ? 'border-solid border-transparent' : ''}
          overflow-hidden shadow-soft
        `}
      >
        {preview ? (
          <div className="relative aspect-[3/4] bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Book preview" className="absolute inset-0 w-full h-full object-contain" />
            {loading && (
              <>
                <div className="absolute inset-4 pointer-events-none">
                  <div className="corner tl" />
                  <div className="corner tr" />
                  <div className="corner bl" />
                  <div className="corner br" />
                  <div className="scan-laser" />
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-6">
                  <div className="bg-white/95 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 shadow-card">
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 rounded-full bg-brand-500 animate-pulse-ring" />
                      <div className="absolute inset-1 rounded-full bg-brand-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{t('scan.scanning')}</span>
                  </div>
                </div>
              </>
            )}
            {!loading && (
              <button
                onClick={() => setPreview(null)}
                className="btn-tap absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-card"
                aria-label="Clear image"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 dotted-bg">
            <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9V6a3 3 0 0 1 3-3h3M21 9V6a3 3 0 0 0-3-3h-3M3 15v3a3 3 0 0 0 3 3h3M21 15v3a3 3 0 0 1-3 3h-3" strokeLinecap="round" />
                <rect x="7" y="7" width="10" height="10" rx="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-display font-bold text-gray-900 text-lg">{t('scan.zone.title')}</p>
            <p className="text-xs text-gray-500 mt-1 text-center max-w-[240px]">{t('scan.zone.sub')}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!preview && (
        <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-up">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="btn-tap bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl shadow-pop flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 0 1 2-2h1.5l1.5-2h8l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
              <circle cx="12" cy="13" r="4" strokeLinecap="round" />
            </svg>
            {t('scan.camera')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-tap bg-white border-2 border-gray-200 hover:border-brand-500 text-gray-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5 5 5M12 5v12" />
            </svg>
            {t('scan.upload')}
          </button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileInput} />

      {/* Trust indicators */}
      {!preview && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {([
            { icon: '⚡', label: t('trust.instant'),  sub: t('trust.instant.sub')  },
            { icon: '🎯', label: t('trust.accurate'), sub: t('trust.accurate.sub') },
            { icon: '💰', label: t('trust.fair'),     sub: t('trust.fair.sub')     },
          ] as const).map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-soft">
              <div className="text-xl">{item.icon}</div>
              <p className="text-xs font-bold text-gray-800 mt-1">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
