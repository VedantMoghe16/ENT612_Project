'use client';

import { useState } from 'react';

interface Props {
  ocrText?: string;
  title?: string | null;
  onSubmit: (mrp: number) => void;
  onCancel: () => void;
}

export function ManualMrpEntry({ title, onSubmit, onCancel }: Props) {
  const [value, setValue] = useState('');
  const v = parseInt(value, 10);
  const valid = !isNaN(v) && v >= 20 && v <= 5000;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-gray-900">MRP Not Detected</h3>
            <p className="text-xs text-gray-500">Please enter it manually</p>
          </div>
        </div>

        {title && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">We could read</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{title}</p>
          </div>
        )}

        <label className="block">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Printed MRP (₹)</span>
          <div className="mt-2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-display font-bold text-gray-400">₹</span>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              placeholder="e.g. 450"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && valid) onSubmit(v); }}
              className="w-full pl-12 pr-4 py-4 text-2xl font-display font-bold border-2 border-gray-200 rounded-2xl focus:border-brand-500 focus:outline-none tabular-nums"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Look for &quot;M.R.P.&quot; or &quot;₹&quot; on the back cover</p>
        </label>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            onClick={onCancel}
            className="btn-tap py-3.5 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => valid && onSubmit(v)}
            disabled={!valid}
            className="btn-tap py-3.5 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Calculate Price
          </button>
        </div>
      </div>
    </div>
  );
}
