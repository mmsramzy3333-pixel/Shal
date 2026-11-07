import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLiveExchangeRate } from '../../lib/currency';
import {
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Sliders,
  Calculator,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const FinanceExchangeRatePanel: React.FC = () => {
  const {
    currency,
    setDisplayCurrency,
    exchangeRateSarToEgp,
    setExchangeRateSarToEgp,
    isAdminOrOwner,
    showToast,
    language,
    formatAmount,
    formatDualAmount,
  } = useApp();

  const [isOpen, setIsOpen] = useState(true);
  const [manualRate, setManualRate] = useState<string>(String(exchangeRateSarToEgp));
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [apiProviderInfo, setApiProviderInfo] = useState<string>('Local Treasury Benchmark');
  const [lastApiSyncDate, setLastApiSyncDate] = useState<string>(
    new Date().toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })
  );

  // Quick Currency Simulator State
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [calcSource, setCalcSource] = useState<'SAR' | 'EGP'>('SAR');

  // Handle Fetching from Live Forex API
  const handleFetchLiveRate = async () => {
    setIsFetchingApi(true);
    try {
      const result = await fetchLiveExchangeRate();
      if (result && result.rate) {
        setExchangeRateSarToEgp(result.rate);
        setManualRate(String(result.rate));
        setApiProviderInfo(result.provider);
        setLastApiSyncDate(result.date);

        showToast({
          type: 'success',
          title: 'تم جلب سعر الصرف الحي بنجاح',
          message: `السعر من البورصة: 1 ريال سعودي = ${result.rate.toFixed(2)} جنيه مصري (${result.provider}). تم تطبيق السعر على كافة تقارير النظام.`,
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'تعذر الاتصال بـ API العملات',
        message: 'تم الحفاظ على سعر الصرف الحالي المسجل في النظام.',
      });
    } finally {
      setIsFetchingApi(false);
    }
  };

  // Handle Manual Save of Exchange Rate
  const handleSaveManualRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualRate);
    if (!isNaN(val) && val > 0) {
      setExchangeRateSarToEgp(val);
      showToast({
        type: 'success',
        title: 'تم اعتماد سعر الصرف اليومي بنجاح',
        message: `تم تحديث سعر الصرف إلى: 1 SAR = ${val.toFixed(2)} EGP. تم تحديث كافة القوائم المالية، التكاليف، والأرباح تلقائياً.`,
      });
    } else {
      showToast({
        type: 'error',
        title: 'قيمة غير صالحة',
        message: 'يرجى إدخال رقم صحيح موجب لسعر الصرف.',
      });
    }
  };

  // Calculator Result
  const convertedResult =
    calcSource === 'SAR'
      ? calcAmount * exchangeRateSarToEgp
      : exchangeRateSarToEgp > 0
      ? calcAmount / exchangeRateSarToEgp
      : 0;

  return (
    <div className="rounded-2xl border border-[#BDAF9C]/40 bg-white dark:bg-[#181D18] shadow-sm overflow-hidden transition-all">
      {/* Panel Header & Accordion Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] dark:from-[#1E251D] dark:to-[#181D18] cursor-pointer hover:bg-slate-50 transition-colors border-b border-[#BDAF9C]/25"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4C5540] text-white shadow-xs">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#24291F] dark:text-white">
                لوحة التحكم في أسعار الصرف وتحويل العملات (SAR ⇄ EGP)
              </h3>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold font-mono">
                1 SAR = {exchangeRateSarToEgp.toFixed(2)} EGP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#BDAF9C] mt-0.5">
              مفتاح التبديل المالي العالمي، مزامنة الأسعار من البورصة عبر API، والضبط اليدوي المباشر للإدارة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Currency Toggle Pill */}
          <div className="inline-flex rounded-xl p-0.5 bg-[#FAF7F2] dark:bg-[#151A14] border border-[#BDAF9C]/30" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setDisplayCurrency('SAR')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                currency === 'SAR'
                  ? 'bg-[#4C5540] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              الريال (SAR)
            </button>
            <button
              type="button"
              onClick={() => setDisplayCurrency('EGP')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                currency === 'EGP'
                  ? 'bg-[#4C5540] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              الجنيه (EGP)
            </button>
          </div>

          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Configuration Body */}
      {isOpen && (
        <div className="p-5 space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Column 1: Live API Exchange Rate Sync */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>مزامنة السعر المباشر (Forex API)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Active
                  </span>
                </div>

                <div className="mt-3 bg-white dark:bg-[#1E251D] p-3 rounded-lg border border-emerald-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-bold">السعر المعتمد حالياً:</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black font-mono text-[#24291F] dark:text-white">
                      {exchangeRateSarToEgp.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">جنيه مصري / ريال</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>المصدر: {apiProviderInfo}</span>
                    <span className="font-mono text-slate-400">{lastApiSyncDate}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchLiveRate}
                disabled={isFetchingApi}
                className="btn-interactive w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingApi ? 'animate-spin' : ''}`} />
                <span>{isFetchingApi ? 'جاري الاتصال بجداول البورصة...' : 'تحديث سعر الصرف الحي من API'}</span>
              </button>
            </div>

            {/* Column 2: Manual Exchange Rate Configuration (Managers) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FAF7F2]/60 dark:bg-[#1E251D]/60 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-[#4C5540]" />
                    <span>الضبط اليدوي المخصص للإدارة</span>
                  </span>
                  <span className="text-[10px] text-slate-500">خاص بالمدير</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  يمكن للإدارة تحديد سعر صرف تشغيلي ثابت لحسابات العقود والرواتب والميزانيات التقديرية.
                </p>

                <form onSubmit={handleSaveManualRate} className="mt-3 space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="150"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      placeholder="13.20"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151A14] py-2 px-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-[#4C5540] focus:outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                      EGP / SAR
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-interactive w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#4C5540] hover:bg-[#3B4432] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>اعتماد وتطبيق السعر على النظام</span>
                  </button>
                </form>
              </div>

              <span className="text-[10px] text-slate-400 block text-center">
                * التغيير يؤثر فورياً على كافة شاشات الـ CRM، الفواتير، ومسيرات الرواتب.
              </span>
            </div>

            {/* Column 3: Live Currency Simulator & Conversion Tool */}
            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <Calculator className="h-4 w-4 text-indigo-600" />
                    <span>حاسبة التحويل المالي السريع</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">محاكي لحظي</span>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-indigo-200 bg-white dark:bg-[#151A14] p-1.5 text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={calcSource}
                      onChange={(e) => setCalcSource(e.target.value as 'SAR' | 'EGP')}
                      className="rounded-lg border border-indigo-200 bg-white dark:bg-[#151A14] p-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="SAR">ريال (SAR)</option>
                      <option value="EGP">جنيه (EGP)</option>
                    </select>
                  </div>

                  {/* Result Box */}
                  <div className="rounded-lg bg-white dark:bg-[#1E251D] p-3 border border-indigo-100 shadow-2xs text-center">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      القيمة المعادلة بسعر اليوم:
                    </span>
                    <span className="text-lg font-black font-mono text-indigo-700 dark:text-indigo-400 block mt-0.5">
                      {convertedResult.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                      {calcSource === 'SAR' ? 'جنيه مصري (EGP)' : 'ريال سعودي (SAR)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benchmark Reference Chips */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-500">
                <span className="p-1 rounded bg-white dark:bg-[#151A14] text-center border border-slate-100 dark:border-slate-800">
                  10k SAR = {(10000 * exchangeRateSarToEgp).toLocaleString()} EGP
                </span>
                <span className="p-1 rounded bg-white dark:bg-[#151A14] text-center border border-slate-100 dark:border-slate-800">
                  50k SAR = {(50000 * exchangeRateSarToEgp).toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
