import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, ArrowRightLeft, TrendingUp, Edit2, Check, RefreshCw } from 'lucide-react';

export const CurrencyConverterBar: React.FC = () => {
  const {
    currency,
    setDisplayCurrency,
    exchangeRateSarToEgp,
    setExchangeRateSarToEgp,
    isAdminOrOwner,
    showToast,
  } = useApp();

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(String(exchangeRateSarToEgp));

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      setExchangeRateSarToEgp(val);
      setIsEditingRate(false);
      showToast({
        type: 'success',
        title: 'تم تحديث سعر الصرف اليومي بنجاح',
        message: `تم ضبط سعر الصرف إلى: 1 ريال سعودي (SAR) = ${val.toFixed(2)} جنيه مصري (EGP). تم تحديث كافة الحسابات تلقائياً.`,
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-[#BDAF9C]/35 bg-white/95 shadow-2xs backdrop-blur-md">
      {/* Currency Switcher Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5 text-[#4C5540]" />
          <span>العملة المعتمدة للعرض:</span>
        </span>

        <div className="inline-flex rounded-xl p-0.5 bg-[#FAF7F2] border border-[#BDAF9C]/30">
          <button
            type="button"
            onClick={() => setDisplayCurrency('SAR')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currency === 'SAR'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الريال السعودي (SAR)
          </button>

          <button
            type="button"
            onClick={() => setDisplayCurrency('EGP')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              currency === 'EGP'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الجنيه المصري (EGP)
          </button>
        </div>
      </div>

      {/* Exchange Rate Badge & Fast Updater */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-bold hidden sm:inline">سعر الصرف اليوم:</span>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          <span>1 SAR =</span>
          {isEditingRate ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                min="1"
                max="100"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-16 rounded bg-white px-1.5 py-0.5 text-xs font-bold text-slate-900 border border-emerald-400 focus:outline-none"
                autoFocus
              />
              <span className="text-[10px]">EGP</span>
              <button
                type="button"
                onClick={handleSaveRate}
                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                title="حفظ سعر الصرف"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black">{exchangeRateSarToEgp.toFixed(2)}</span>
              <span className="text-[10px]">EGP</span>
              {isAdminOrOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setTempRate(String(exchangeRateSarToEgp));
                    setIsEditingRate(true);
                  }}
                  className="p-0.5 text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors"
                  title="تعديل سعر الصرف اليومي"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
