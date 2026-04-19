'use client';

import { useState } from 'react';

interface Props {
  detectedMrp: number | null;
  title?: string | null;
  onConfirm: (mrp: number) => void;
  onCancel: () => void;
}

export function ConfirmMrp({ detectedMrp, title, onConfirm, onCancel }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(detectedMrp ? String(detectedMrp) : '');

  const parsed = parseInt(value, 10);
  const valid = !isNaN(parsed) && parsed >= 20 && parsed <= 5000;

  function handleConfirm() {
    if (detectedMrp && !editing) {
      onConfirm(detectedMrp);
    } else if (valid) {
      onConfirm(parsed);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-fade-up">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-gray-900">Confirm MRP</h3>
            <p className="text-xs text-gray-500">OCR found a price &mdash; please verify it is correct</p>
          </div>
        </div>

        {title && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Book</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{title}</p>
          </div>
        )}

        {!editing ? (
          /* Show detected price */
          <div className="bg-brand-50 border-2 border-brand-200 rounded-2xl p-5 mb-4 text-center">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Detected MRP</p>
            <p className="font-display text-5xl font-black text-brand-700 tabular-nums">
              ₹{detectedMrp}
            </p>
            <p className="text-xs text-brand-600 mt-2">
              Found on back cover &mdash; tap below if this looks wrong
            </p>
          </div>
        ) : (
          /* Edit mode */
          <div className="mb-4">
            <label className="block">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Enter correct MRP (₹)</span>
              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  placeholder={detectedMrp ? String(detectedMrp) : 'e.g. 450'}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && valid) handleConfirm(); }}
                  className="w-full pl-12 pr-4 py-4 text-2xl font-display font-bold border-2 border-gray-200 rounded-2xl focus:border-brand-500 focus:outline-none tabular-nums"
                />
              </div>
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="btn-tap py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Wrong — Edit
              </button>
              <button
                onClick={handleConfirm}
                className="btn-tap py-3.5 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700"
              >
                Yes, Calculate
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="btn-tap py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!valid}
                className="btn-tap py-3.5 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
            </>
          )}
        </div>

        <button
          onClick={onCancel}
          className="btn-tap w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
        >
          Scan a different book
        </button>
      </div>
    </div>
  );
}
