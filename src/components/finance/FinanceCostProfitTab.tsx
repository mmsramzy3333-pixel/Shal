import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CostCenterProfitRecord, CashFlowForecast, AgencyTeam } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit2,
  Trash2,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Download,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const INITIAL_COST_CENTERS: CostCenterProfitRecord[] = [
  {
    id: 'cc-1',
    departmentCode: 'media_buying',
    departmentNameAr: 'قسم الميديا باينج والإعلانات الممولة',
    revenue: 165000,
    cogs: 78500,
    opex: 12000,
    salaries: 24000,
    netProfit: 50500,
    profitMarginPercent: 30.6,
    month: '2026-11',
  },
  {
    id: 'cc-2',
    departmentCode: 'developer',
    departmentNameAr: 'قسم التطوير البرمجي والحلول التقنية',
    revenue: 95000,
    cogs: 12800,
    opex: 8000,
    salaries: 32000,
    netProfit: 42200,
    profitMarginPercent: 44.4,
    month: '2026-11',
  },
  {
    id: 'cc-3',
    departmentCode: 'content',
    departmentNameAr: 'قسم صناعة المحتوى والموشن جرافيك',
    revenue: 78000,
    cogs: 18000,
    opex: 6000,
    salaries: 22000,
    netProfit: 32000,
    profitMarginPercent: 41.0,
    month: '2026-11',
  },
  {
    id: 'cc-4',
    departmentCode: 'uiux',
    departmentNameAr: 'قسم تصميم واجهات وتجربة المستخدم',
    revenue: 62000,
    cogs: 6500,
    opex: 4500,
    salaries: 19000,
    netProfit: 32000,
    profitMarginPercent: 51.6,
    month: '2026-11',
  },
  {
    id: 'cc-5',
    departmentCode: 'seo',
    departmentNameAr: 'قسم تحسين محركات البحث (SEO)',
    revenue: 40000,
    cogs: 4000,
    opex: 3500,
    salaries: 15000,
    netProfit: 17500,
    profitMarginPercent: 43.8,
    month: '2026-11',
  },
];

const INITIAL_CASH_FLOW: CashFlowForecast[] = [
  { id: 'cf-1', month: '2026-11', startingCash: 350000, projectedInflow: 440000, projectedOutflow: 260000, netCashFlow: 180000, projectedEndingCash: 530000, runwayMonths: 14.5 },
  { id: 'cf-2', month: '2026-12', startingCash: 530000, projectedInflow: 480000, projectedOutflow: 290000, netCashFlow: 190000, projectedEndingCash: 720000, runwayMonths: 16.2 },
  { id: 'cf-3', month: '2027-01', startingCash: 720000, projectedInflow: 510000, projectedOutflow: 310000, netCashFlow: 200000, projectedEndingCash: 920000, runwayMonths: 18.0 },
  { id: 'cf-4', month: '2027-02', startingCash: 920000, projectedInflow: 530000, projectedOutflow: 320000, netCashFlow: 210000, projectedEndingCash: 1130000, runwayMonths: 19.8 },
];

export const FinanceCostProfitTab: React.FC = () => {
  const { formatAmount, formatDualAmount, currency, showToast, isAdminOrOwner } = useApp();

  const [costCenters, setCostCenters] = useState<CostCenterProfitRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shal_cost_centers_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COST_CENTERS;
  });

  const [cashFlows, setCashFlows] = useState<CashFlowForecast[]>(() => {
    try {
      const saved = localStorage.getItem('shal_cash_flow_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CASH_FLOW;
  });

  const [isAddCostCenterOpen, setIsAddCostCenterOpen] = useState(false);
  const [deptCode, setDeptCode] = useState<AgencyTeam>('media_buying');
  const [deptName, setDeptName] = useState('');
  const [revAmount, setRevAmount] = useState<number>(50000);
  const [cogsAmount, setCogsAmount] = useState<number>(15000);
  const [opexAmount, setOpexAmount] = useState<number>(5000);
  const [salariesAmount, setSalariesAmount] = useState<number>(18000);

  const handleAddCostCenter = (e: React.FormEvent) => {
    e.preventDefault();
    const net = revAmount - (cogsAmount + opexAmount + salariesAmount);
    const margin = revAmount > 0 ? Number(((net / revAmount) * 100).toFixed(1)) : 0;

    const newRecord: CostCenterProfitRecord = {
      id: `cc-${Date.now()}`,
      departmentCode: deptCode,
      departmentNameAr: deptName.trim() || `قسم ${deptCode}`,
      revenue: revAmount,
      cogs: cogsAmount,
      opex: opexAmount,
      salaries: salariesAmount,
      netProfit: net,
      profitMarginPercent: margin,
      month: '2026-11',
    };

    const updated = [newRecord, ...costCenters];
    setCostCenters(updated);
    try {
      localStorage.setItem('shal_cost_centers_records', JSON.stringify(updated));
    } catch {}

    showToast({
      type: 'success',
      title: 'تمت إضافة مركز التكلفة والربحية بنجاح',
      message: `تم ربط إيرادات ومصروفات ${newRecord.departmentNameAr} بصافي ربح ${formatAmount(net)}.`,
    });

    setIsAddCostCenterOpen(false);
  };

  const totalCenterRevenue = costCenters.reduce((s, c) => s + c.revenue, 0);
  const totalCenterCosts = costCenters.reduce((s, c) => s + (c.cogs + c.opex + c.salaries), 0);
  const totalCenterProfit = costCenters.reduce((s, c) => s + c.netProfit, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Aggregated Profitability Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">إجمالي إيرادات مراكز التكلفة</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatAmount(totalCenterRevenue)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            {formatDualAmount(totalCenterRevenue).secondary}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">إجمالي التكاليف المباشرة والتشغيلية</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatAmount(totalCenterCosts)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            {formatDualAmount(totalCenterCosts).secondary}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">صافي أرباح الأقسام (Net Margin)</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatAmount(totalCenterProfit)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              هامش {totalCenterRevenue > 0 ? ((totalCenterProfit / totalCenterRevenue) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {formatDualAmount(totalCenterProfit).secondary}
            </span>
          </div>
        </div>
      </div>

      {/* Chart: Revenue vs Cost by Department */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              مقارنة الإيرادات والتكاليف وصافي الربح لكل قسم (Cost & Profit by Dept)
            </h3>
            <p className="text-xs text-slate-500">
              ربط مباشر ومحاكاة لأداء كل مركز تكلفة لدعم التوسع وترشيد النفقات
            </p>
          </div>
          {isAdminOrOwner && (
            <button
              type="button"
              onClick={() => setIsAddCostCenterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4C5540] text-white text-xs font-bold hover:bg-[#3B4432] cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة مركز تكلفة جديد</span>
            </button>
          )}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costCenters.map((c) => ({
                name: c.departmentNameAr.replace('قسم ', ''),
                revenue: c.revenue,
                costs: c.cogs + c.opex + c.salaries,
                profit: c.netProfit,
              }))}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(val: any) => formatAmount(Number(val))}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="الإيرادات" fill="#4C5540" radius={[6, 6, 0, 0]} />
              <Bar dataKey="costs" name="التكاليف والمصروفات" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" name="صافي الربح" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Centers Detailed Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-[#1E251D] border-b border-slate-200 dark:border-[#2D372B] flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
            تفصيل مراكز التكلفة ونسب الهامش الربحي (Cost Center Ledger)
          </h4>
          <span className="text-[11px] text-slate-500 font-bold">
            عرض بالعملة: {currency === 'SAR' ? 'الريال السعودي (SAR)' : 'الجنيه المصري (EGP)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-100/70 dark:bg-[#1A2019] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#2D372B]">
              <tr>
                <th className="p-3 text-start">القسم / مركز التكلفة</th>
                <th className="p-3 text-end">الإيرادات</th>
                <th className="p-3 text-end">تكلفة الخدمات (COGS)</th>
                <th className="p-3 text-end">المصروفات التشغيلية</th>
                <th className="p-3 text-end">الرواتب المخصصة</th>
                <th className="p-3 text-end">صافي الربح</th>
                <th className="p-3 text-center">هامش الربح %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D372B] font-mono">
              {costCenters.map((cc) => (
                <tr key={cc.id} className="hover:bg-slate-50 dark:hover:bg-[#1A2019] transition-colors">
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                    {cc.departmentNameAr}
                  </td>
                  <td className="p-3 text-end font-bold text-slate-800 dark:text-slate-200">
                    {formatAmount(cc.revenue)}
                  </td>
                  <td className="p-3 text-end text-rose-600">
                    {formatAmount(cc.cogs)}
                  </td>
                  <td className="p-3 text-end text-slate-600 dark:text-slate-400">
                    {formatAmount(cc.opex)}
                  </td>
                  <td className="p-3 text-end text-slate-600 dark:text-slate-400">
                    {formatAmount(cc.salaries)}
                  </td>
                  <td className="p-3 text-end font-black text-emerald-600 dark:text-emerald-400">
                    {formatAmount(cc.netProfit)}
                  </td>
                  <td className="p-3 text-center font-sans">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {cc.profitMarginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Flow Forecast (التدفقات النقدية المستقبلية والـ Runway) */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#4C5540]" />
            <span>توقعات التدفقات النقدية المستقبلية وفترة الأمان المالي (Cash Flow & Runway Forecast)</span>
          </h3>
          <p className="text-xs text-slate-500">
            تنبؤ دقيق بالسيولة النقدية المتوقعة للأشهر الأربعة القادمة بناءً على عقود الريتينر والالتزامات الثابتة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {cashFlows.map((cf) => (
            <div
              key={cf.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#2D372B] bg-[#FAF7F2] dark:bg-[#1A2019] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>شهر {cf.month}</span>
                <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]">
                  مدرج
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>التدفق الداخل:</span>
                  <span className="font-mono text-emerald-600 font-bold">{formatAmount(cf.projectedInflow)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>التدفق الخارج:</span>
                  <span className="font-mono text-rose-600 font-bold">{formatAmount(cf.projectedOutflow)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200 dark:border-[#2D372B] text-slate-800 dark:text-slate-100">
                  <span>صافي التدفق:</span>
                  <span className="font-mono text-emerald-700 font-black">+{formatAmount(cf.netCashFlow)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>السيولة التراكمية:</span>
                  <span className="font-mono font-bold">{formatAmount(cf.projectedEndingCash)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#4C5540] font-bold pt-0.5">
                  <span>الرانواي (Runway):</span>
                  <span>{cf.runwayMonths} شهراً</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Cost Center */}
      {isAddCostCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151A14] p-6 shadow-2xl border border-slate-200 dark:border-[#2D372B] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إضافة وتخصيص مركز تكلفة جديد
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCostCenterOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCostCenter} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">القسم المرتبط:</label>
                <select
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-[#FAF7F2] dark:bg-[#1E251D] p-2.5 font-bold"
                >
                  <option value="media_buying">الميديا باينج والإعلانات</option>
                  <option value="developer">التطوير البرمجي</option>
                  <option value="content">المحتوى والموشن</option>
                  <option value="uiux">تجربة المستخدم</option>
                  <option value="seo">تحسين محركات البحث</option>
                  <option value="sales">المبيعات</option>
                  <option value="operations">العمليات والمقر</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مسمى مركز التكلفة بالعربية:</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="مثال: قسم إعلانات سناب شات وتيك توك"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-[#FAF7F2] dark:bg-[#1E251D] p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الإيراد الشهري (SAR):</label>
                  <input
                    type="number"
                    required
                    value={revAmount}
                    onChange={(e) => setRevAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تكلفة الخدمات COGS (SAR):</label>
                  <input
                    type="number"
                    required
                    value={cogsAmount}
                    onChange={(e) => setCogsAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المصروفات التشغيلية OpEx:</label>
                  <input
                    type="number"
                    required
                    value={opexAmount}
                    onChange={(e) => setOpexAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الرواتب المخصصة للقسم:</label>
                  <input
                    type="number"
                    required
                    value={salariesAmount}
                    onChange={(e) => setSalariesAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCostCenterOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4C5540] text-white font-bold hover:bg-[#3B4432]"
                >
                  حفظ مركز التكلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
