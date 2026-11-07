import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FinancialAccount,
  FinancialTransaction,
  AgencyInvoice,
  CostBudget,
  TransactionType,
} from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Download,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ShieldCheck,
  Scale,
  Percent,
  X,
  FileText,
  PieChart as PieChartIcon,
  Wallet,
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
import { CurrencyConverterBar } from '../common/CurrencyConverterBar';
import { FinanceCostProfitTab } from './FinanceCostProfitTab';
import { FinanceExchangeRatePanel } from './FinanceExchangeRatePanel';

export const FinanceAccountingView: React.FC = () => {
  const {
    clients,
    language,
    showToast,
    isOwner,
    isAdminOrOwner,
    hasPermission,
    formatAmount,
    formatDualAmount,
    currency,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'cost_profit' | 'invoices' | 'ledger' | 'transactions' | 'budgets'>('overview');

  // Chart of Accounts (شجرة الحسابات المحاسبية)
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    try {
      const saved = localStorage.getItem('shal_finance_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'acc-1', code: '1010', nameAr: 'الحساب البنكي الرئيسي (مصرف الراجحي)', nameEn: 'Primary Bank Account', type: 'asset', balance: 342500, currency: 'SAR', description: 'حساب العمليات التشغيلية والإيداعات' },
      { id: 'acc-2', code: '1020', nameAr: 'حساب بنك الإنماء للعملات الأجنبية', nameEn: 'Foreign Currency Account (USD)', type: 'asset', balance: 48900, currency: 'USD', description: 'عقود العملاء الدوليين واشتراكات المنصات' },
      { id: 'acc-3', code: '1030', nameAr: 'الخزينة النقدية (Petty Cash)', nameEn: 'Petty Cash', type: 'asset', balance: 15400, currency: 'SAR', description: 'المصروفات النثرية والطارئة' },
      { id: 'acc-4', code: '1200', nameAr: 'الذمم المدينة للعملاء (Accounts Receivable)', nameEn: 'Accounts Receivable', type: 'asset', balance: 87500, currency: 'SAR', description: 'فواتير قيد التحصيل' },
      { id: 'acc-5', code: '2010', nameAr: 'الذمم الدائنة والموردين (Accounts Payable)', nameEn: 'Accounts Payable', type: 'liability', balance: 32400, currency: 'SAR', description: 'مستحقات منصات الإعلانات والمستقلين' },
      { id: 'acc-6', code: '2020', nameAr: 'مخصص ضريبة القيمة المضافة (15% VAT)', nameEn: 'VAT Payable (15%)', type: 'liability', balance: 21600, currency: 'SAR', description: 'المستحق لهيئة الزكاة والضريبة والجمارك' },
      { id: 'acc-7', code: '3010', nameAr: 'رأس مال الشركاء المؤسسين', nameEn: 'Partners Equity', type: 'equity', balance: 250000, currency: 'SAR', description: 'رأس المال المكتتب' },
      { id: 'acc-8', code: '4010', nameAr: 'إيرادات عقود الريتينر الشهرية', nameEn: 'Monthly Retainers Revenue', type: 'revenue', balance: 198000, currency: 'SAR', description: 'اشتراكات العملاء الدورية' },
      { id: 'acc-9', code: '4020', nameAr: 'إيرادات مشاريع الهوية والبرمجة', nameEn: 'Projects & Branding Revenue', type: 'revenue', balance: 145000, currency: 'SAR', description: 'مشاريع التطوير والتصميم المنفصلة' },
      { id: 'acc-10', code: '4030', nameAr: 'عمولات إدارة الحملات الإعلانية', nameEn: 'Media Buying Management Fees', type: 'revenue', balance: 64000, currency: 'SAR', description: 'نسبة 10-15% من إنفاق الإعلانات المدارة' },
      { id: 'acc-11', code: '5010', nameAr: 'تكاليف المنصات الإعلانية المباشرة (COGS Ads)', nameEn: 'Media Buying Direct Spend', type: 'cogs', balance: 78500, currency: 'SAR', description: 'إنفاق ميتا، جوجل، وتيك توك للعملاء' },
      { id: 'acc-12', code: '5020', nameAr: 'رسوم المستقلين والمصورين (COGS Freelance)', nameEn: 'Freelancers & Production COGS', type: 'cogs', balance: 24000, currency: 'SAR', description: 'صانعو محتوى خارجيون ومصورو فيديو' },
      { id: 'acc-13', code: '5030', nameAr: 'اشتراكات البرمجيات والأدوات وسيرفرات السحاب', nameEn: 'Software, APIs & Cloud Hosting', type: 'cogs', balance: 12800, currency: 'SAR', description: 'Figma, Adobe, OpenAI, Supabase, Vercel' },
      { id: 'acc-14', code: '6010', nameAr: 'رواتب وبدلات طاقم العمل (OpEx Payroll)', nameEn: 'Staff Salaries & Benefits', type: 'opex', balance: 112000, currency: 'SAR', description: 'رواتب موظفي الوكالة الـ 12' },
      { id: 'acc-15', code: '6020', nameAr: 'إيجار المقر والمرافق (OpEx Rent & Utilities)', nameEn: 'Office Rent & Utilities', type: 'opex', balance: 18500, currency: 'SAR', description: 'إيجار المقر والإنترنت والكهرباء' },
    ];
  });

  // Financial Transactions
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('shal_finance_transactions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'tx-101', transactionNumber: 'TX-2026-081', date: '2026-11-01', type: 'revenue', categoryAr: 'عقد ريتينر شهري', categoryEn: 'Monthly Retainer', amount: 35000, currency: 'SAR', accountName: 'مصرف الراجحي', description: 'تحصيل ريتينر نوفمبر - مجموعة المدى للاستثمار', clientId: 'client-1', clientName: 'مجموعة المدى للاستثمار', paymentMethod: 'bank_transfer', status: 'completed', createdBy: 'م. مدحت | الفاوندر' },
      { id: 'tx-102', transactionNumber: 'TX-2026-082', date: '2026-11-02', type: 'revenue', categoryAr: 'دفعة مشروع برمجة وتصميم', categoryEn: 'Project Milestone', amount: 28000, currency: 'SAR', accountName: 'بنك الإنماء USD', description: 'الدفعة الثانية لمشروع تطبيق وصل التقني', clientId: 'client-2', clientName: 'تطبيق وصل التقني', paymentMethod: 'bank_transfer', status: 'completed', createdBy: 'محمود العمليات' },
      { id: 'tx-103', transactionNumber: 'TX-2026-083', date: '2026-11-03', type: 'cogs', categoryAr: 'إنفاق حملات إعلانية ممولة', categoryEn: 'Paid Ad Spend', amount: 18500, currency: 'SAR', accountName: 'مصرف الراجحي', description: 'شحن رصيد إعلانات Meta و Google لموسم الشتاء', clientId: 'client-3', clientName: 'سلسلة مطاعم غصن', paymentMethod: 'credit_card', status: 'completed', createdBy: 'عمر الإعلانات' },
      { id: 'tx-104', transactionNumber: 'TX-2026-084', date: '2026-11-04', type: 'cogs', categoryAr: 'اشتراكات أدوات تصميم وبرمجيات', categoryEn: 'SaaS Tooling', amount: 4600, currency: 'SAR', accountName: 'بنك الإنماء USD', description: 'تجديد اشتراكات Figma Enterprise و Adobe Cloud', paymentMethod: 'credit_card', status: 'completed', createdBy: 'ياسمين التصميم' },
      { id: 'tx-105', transactionNumber: 'TX-2026-085', date: '2026-11-05', type: 'opex', categoryAr: 'رواتب موظفي الوكالة', categoryEn: 'Payroll', amount: 96000, currency: 'SAR', accountName: 'مصرف الراجحي', description: 'مسير رواتب موظفي الوكالة لشهر أكتوبر', paymentMethod: 'bank_transfer', status: 'completed', createdBy: 'م. مدحت | الفاوندر' },
      { id: 'tx-106', transactionNumber: 'TX-2026-086', date: '2026-11-06', type: 'revenue', categoryAr: 'حملة موسمية خاصة', categoryEn: 'Campaign Retainer', amount: 22000, currency: 'SAR', accountName: 'مصرف الراجحي', description: 'دفعة حملة اليوم الوطني لعميل رعاية', paymentMethod: 'bank_transfer', status: 'completed', createdBy: 'سارة التسويق' },
      { id: 'tx-107', transactionNumber: 'TX-2026-087', date: '2026-11-06', type: 'cogs', categoryAr: 'رسوم تصوير فيديو خارجي', categoryEn: 'Video Production', amount: 6500, currency: 'SAR', accountName: 'الخزينة النقدية', description: 'مستحقات طاقم تصوير الريلز الخارجي', paymentMethod: 'cash', status: 'completed', createdBy: 'كريم المحتوى' },
    ];
  });

  // Agency Invoices
  const [invoices, setInvoices] = useState<AgencyInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('shal_finance_invoices');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'inv-001',
        invoiceNumber: 'INV-SHAL-2026-041',
        clientId: 'client-1',
        clientName: 'مجموعة المدى للاستثمار',
        clientEmail: 'finance@almadagroup.sa',
        issueDate: '2026-11-01',
        dueDate: '2026-11-15',
        items: [
          { id: 'itm-1', description: 'باقة إدارة المحتوى والتسويق الرقمي (ريتينر نوفمبر 2026)', quantity: 1, unitPrice: 30434.78, total: 30434.78 },
        ],
        subtotal: 30434.78,
        taxRate: 0.15,
        taxAmount: 4565.22,
        discount: 0,
        totalAmount: 35000,
        currency: 'SAR',
        status: 'paid',
        paidDate: '2026-11-02',
        paymentMethod: 'تحويل مصرفي سريع (سريع)',
        notes: 'شكراً لتعاملكم مع وكالة شال للحلول الرقمية.',
      },
      {
        id: 'inv-002',
        invoiceNumber: 'INV-SHAL-2026-042',
        clientId: 'client-2',
        clientName: 'تطبيق وصل التقني',
        clientEmail: 'billing@wasl-app.com',
        issueDate: '2026-10-25',
        dueDate: '2026-11-10',
        items: [
          { id: 'itm-2', description: 'الدفعة الثانية لمشروع تطوير واجهات التطبيق وتجربة المستخدم (UI/UX Sprint 2)', quantity: 1, unitPrice: 24347.83, total: 24347.83 },
        ],
        subtotal: 24347.83,
        taxRate: 0.15,
        taxAmount: 3652.17,
        discount: 0,
        totalAmount: 28000,
        currency: 'SAR',
        status: 'paid',
        paidDate: '2026-11-03',
        paymentMethod: 'تحويل بنكي دولي',
      },
      {
        id: 'inv-003',
        invoiceNumber: 'INV-SHAL-2026-043',
        clientId: 'client-3',
        clientName: 'سلسلة مطاعم غصن',
        clientEmail: 'accounts@ghosn-rest.com',
        issueDate: '2026-11-05',
        dueDate: '2026-11-20',
        items: [
          { id: 'itm-3', description: 'إدارة وإطلاق حملات الفيديو الترويجية لموسم الشتاء', quantity: 1, unitPrice: 19130.43, total: 19130.43 },
        ],
        subtotal: 19130.43,
        taxRate: 0.15,
        taxAmount: 2869.57,
        discount: 0,
        totalAmount: 22000,
        currency: 'SAR',
        status: 'issued',
      },
      {
        id: 'inv-004',
        invoiceNumber: 'INV-SHAL-2026-044',
        clientId: 'client-4',
        clientName: 'منصة عقار الشرق',
        clientEmail: 'contact@sharq-re.com',
        issueDate: '2026-10-15',
        dueDate: '2026-10-31',
        items: [
          { id: 'itm-4', description: 'عقد تحسين محركات البحث والكلمات المفتاحية (SEO Retainer)', quantity: 1, unitPrice: 13043.48, total: 13043.48 },
        ],
        subtotal: 13043.48,
        taxRate: 0.15,
        taxAmount: 1956.52,
        discount: 0,
        totalAmount: 15000,
        currency: 'SAR',
        status: 'overdue',
      },
    ];
  });

  // Departmental Budgets
  const [budgets] = useState<CostBudget[]>([
    { id: 'bgt-1', departmentCode: 'media_buying', departmentNameAr: 'قسم الإعلانات الممولة (Media Buying)', allocatedBudget: 120000, actualSpend: 78500, currency: 'SAR', month: '2026-11', status: 'on_track' },
    { id: 'bgt-2', departmentCode: 'developer', departmentNameAr: 'قسم تطوير البرمجيات والخوادم', allocatedBudget: 25000, actualSpend: 12800, currency: 'SAR', month: '2026-11', status: 'on_track' },
    { id: 'bgt-3', departmentCode: 'content', departmentNameAr: 'قسم إنتاج المحتوى والموشن', allocatedBudget: 35000, actualSpend: 24000, currency: 'SAR', month: '2026-11', status: 'on_track' },
    { id: 'bgt-4', departmentCode: 'marketing', departmentNameAr: 'قسم التسويق والعلاقات العامة', allocatedBudget: 20000, actualSpend: 18500, currency: 'SAR', month: '2026-11', status: 'warning' },
    { id: 'bgt-5', departmentCode: 'operations', departmentNameAr: 'قسم العمليات والمقر والمرافق', allocatedBudget: 30000, actualSpend: 22000, currency: 'SAR', month: '2026-11', status: 'on_track' },
  ]);

  // Modals state
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('revenue');
  const [txAmount, setTxAmount] = useState<number>(5000);
  const [txDesc, setTxDesc] = useState('');
  const [txCategory, setTxCategory] = useState('عقد ريتينر شهري');
  const [txAccount, setTxAccount] = useState('مصرف الراجحي');
  const [txMethod, setTxMethod] = useState<'bank_transfer' | 'credit_card' | 'cash'>('bank_transfer');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invClientName, setInvClientName] = useState('');
  const [invItemDesc, setInvItemDesc] = useState('');
  const [invAmount, setInvAmount] = useState<number>(10000);
  const [invDueDate, setInvDueDate] = useState('');

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<AgencyInvoice | null>(null);

  // Financial Computations (P&L and Metrics)
  const financialMetrics = useMemo(() => {
    const totalRevenue = transactions
      .filter((t) => t.type === 'revenue' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCogs = transactions
      .filter((t) => t.type === 'cogs' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalOpex = transactions
      .filter((t) => t.type === 'opex' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = grossProfit - totalOpex;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const totalAssets = accounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + (a.currency === 'USD' ? a.balance * 3.75 : a.balance), 0);

    const totalLiabilities = accounts
      .filter((a) => a.type === 'liability')
      .reduce((sum, a) => sum + (a.currency === 'USD' ? a.balance * 3.75 : a.balance), 0);

    // Runway calculation (Total liquid cash / monthly opex)
    const liquidCash = accounts
      .filter((a) => a.id === 'acc-1' || a.id === 'acc-2' || a.id === 'acc-3')
      .reduce((sum, a) => sum + (a.currency === 'USD' ? a.balance * 3.75 : a.balance), 0);
    const runwayMonths = totalOpex > 0 ? (liquidCash / totalOpex).toFixed(1) : '12+';

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMargin: Number(grossMargin.toFixed(1)),
      totalOpex,
      netProfit,
      netMargin: Number(netMargin.toFixed(1)),
      totalAssets,
      totalLiabilities,
      liquidCash,
      runwayMonths,
    };
  }, [transactions, accounts]);

  // Chart Data for Monthly Performance
  const chartData = [
    { month: 'يونيو', revenue: 95000, cogs: 22000, opex: 65000, net: 8000 },
    { month: 'يوليو', revenue: 110000, cogs: 26000, opex: 68000, net: 16000 },
    { month: 'أغسطس', revenue: 125000, cogs: 29000, opex: 72000, net: 24000 },
    { month: 'سبتمبر', revenue: 140000, cogs: 31000, opex: 78000, net: 31000 },
    { month: 'أكتوبر', revenue: 165000, cogs: 36000, opex: 88000, net: 41000 },
    { month: 'نوفمبر (حالي)', revenue: financialMetrics.totalRevenue, cogs: financialMetrics.totalCogs, opex: financialMetrics.totalOpex, net: financialMetrics.netProfit },
  ];

  // Save Handlers
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc.trim()) return;

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `TX-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      type: txType,
      categoryAr: txCategory,
      categoryEn: txCategory,
      amount: Number(txAmount),
      currency: 'SAR',
      accountName: txAccount,
      description: txDesc.trim(),
      paymentMethod: txMethod,
      status: 'completed',
      createdBy: 'الإدارة المالية',
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    try {
      localStorage.setItem('shal_finance_transactions', JSON.stringify(updated));
    } catch {}

    showToast({
      type: 'success',
      title: 'تم تسجيل العملية المالية',
      message: `تم قيد عملية ${txType === 'revenue' ? 'إيراد' : 'مصروف'} بمبلغ ${txAmount.toLocaleString()} ر.س بنجاح.`,
    });
    setIsNewTxModalOpen(false);
    setTxDesc('');
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName.trim() || !invAmount) return;

    const sub = Number(invAmount);
    const tax = sub * 0.15;
    const total = sub + tax;

    const newInv: AgencyInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-SHAL-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: `cl-${Date.now()}`,
      clientName: invClientName.trim(),
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invDueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      items: [
        { id: `itm-${Date.now()}`, description: invItemDesc.trim() || 'خدمات رقمية وتسويقية متكاملة', quantity: 1, unitPrice: sub, total: sub },
      ],
      subtotal: sub,
      taxRate: 0.15,
      taxAmount: tax,
      discount: 0,
      totalAmount: total,
      currency: 'SAR',
      status: 'issued',
      notes: 'تستحق الفاتورة خلال 14 يوماً من تاريخ الإصدار.',
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);
    try {
      localStorage.setItem('shal_finance_invoices', JSON.stringify(updated));
    } catch {}

    showToast({
      type: 'success',
      title: 'تم إصدار الفاتورة الضريبية',
      message: `تم إنشاء الفاتورة رقم ${newInv.invoiceNumber} للعميل ${newInv.clientName}`,
    });
    setIsInvoiceModalOpen(false);
    setInvClientName('');
    setInvItemDesc('');
  };

  // Export CSV
  const handleExportFinancialsCsv = () => {
    const headers = ['Transaction Number', 'Date', 'Type', 'Category', 'Amount (SAR)', 'Account', 'Description', 'Method', 'Status'];
    const rows = transactions.map((t) => [
      t.transactionNumber,
      t.date,
      t.type,
      `"${t.categoryAr}"`,
      t.amount,
      `"${t.accountName}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shal_finance_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'تم تصدير الدفتر المالي',
      message: 'تم تحميل ملف CSV للمعاملات المالية والحسابات بنجاح.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Real-time Dual Currency Converter Bar (SAR / EGP) */}
      <CurrencyConverterBar />

      {/* Top Header & Executive Security Seal */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4C5540] text-white shadow-xs">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'المنظومة المالية والمحاسبية وإدارة التكاليف' : 'Financial Management & Cost Control'}
                </h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-300/40">
                  {language === 'ar' ? 'مخصص للإدارة العليا فقط' : 'Executive Admin Only'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#BDAF9C] mt-0.5">
                {language === 'ar'
                  ? 'متابعة التدفقات النقدية، تكاليف المشاريع (COGS)، المصروفات التشغيلية (OpEx)، وقائمة الدخل والأرباح والخسائر (P&L).'
                  : 'Complete corporate ledger, P&L, direct costs, client retainers, and cash runway.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportFinancialsCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-[#BDAF9C] hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>{language === 'ar' ? 'تصدير التقارير (CSV)' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284C7] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0369a1] shadow-xs transition-all cursor-pointer"
            >
              <Receipt className="h-4 w-4" />
              <span>{language === 'ar' ? 'إصدار فاتورة ضريبية' : 'New Invoice'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'قيد حركة مالية' : 'Record Transaction'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#2D372B] flex flex-wrap gap-1.5">
          {[
            { id: 'overview', labelAr: 'لوحة المؤشرات والسيولة', labelEn: 'Overview & Cash', icon: Wallet },
            { id: 'cost_profit', labelAr: 'إدارة التكاليف والأرباح والرانواي', labelEn: 'Cost & Profit Centers', icon: TrendingUp },
            { id: 'pnl', labelAr: 'قائمة الأرباح والخسائر (P&L)', labelEn: 'Income Statement (P&L)', icon: PieChartIcon },
            { id: 'invoices', labelAr: 'الفواتير والتحصيل', labelEn: 'Invoices & Billing', icon: Receipt },
            { id: 'ledger', labelAr: 'شجرة الحسابات (Chart of Accounts)', labelEn: 'Chart of Accounts', icon: Layers },
            { id: 'transactions', labelAr: 'سجل العمليات ودفتر الأستاذ', labelEn: 'Transactions Ledger', icon: FileSpreadsheet },
            { id: 'budgets', labelAr: 'ميزانيات أقسام الوكالة', labelEn: 'Department Budgets', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4C5540] text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-[#1E251D] text-slate-700 dark:text-[#BDAF9C] hover:bg-slate-100 dark:hover:bg-[#252E24]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{language === 'ar' ? 'إجمالي الإيرادات المحققة' : 'Total Revenue'}</span>
                <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {financialMetrics.totalRevenue.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-bold">ر.س</span>
              </p>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+22.4% مقارنة بالشهر السابق</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{language === 'ar' ? 'تكاليف المشاريع (COGS)' : 'Direct Costs (COGS)'}</span>
                <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                  <CreditCard className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {financialMetrics.totalCogs.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-bold">ر.س</span>
              </p>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                ميزانيات الإعلانات، المستقلين، والسيرفرات
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{language === 'ar' ? 'مجمل الربح (Gross Profit)' : 'Gross Profit'}</span>
                <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                  <Percent className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-[#0284C7]">
                {financialMetrics.grossProfit.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-bold">ر.س</span>
              </p>
              <div className="mt-2 text-[11px] text-emerald-700 font-bold">
                هامش مجمل الربح: {financialMetrics.grossMargin}%
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span>{language === 'ar' ? 'صافي أرباح الوكالة (Net Profit)' : 'Net Profit'}</span>
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <DollarSign className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-200">
                {financialMetrics.netProfit.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-bold">ر.س</span>
              </p>
              <div className="mt-2 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                هامش صافي الربح: {financialMetrics.netMargin}%
              </div>
            </div>
          </div>

          {/* Runway and Cash Position Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2D372B] pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[#4C5540]" />
                  <span>{language === 'ar' ? 'مؤشر السيولة النقدية ومسار التغطية التشغيلية (Cash Runway)' : 'Cash Runway'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#BDAF9C]">
                  {language === 'ar'
                    ? 'إجمالي النقدية المتاحة بالبنوك مقسوماً على المصروفات الشهرية الثابتة.'
                    : 'Liquid reserves vs fixed monthly burn rate.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'السيولة المتاحة' : 'Liquid Cash'}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{financialMetrics.liquidCash.toLocaleString()} ر.س</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-[#2D372B]" />
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'مدة التغطية' : 'Runway'}</span>
                  <span className="text-sm font-black text-emerald-600">{financialMetrics.runwayMonths} {language === 'ar' ? 'أشهر' : 'months'}</span>
                </div>
              </div>
            </div>

            {/* Performance Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E251D',
                      border: '1px solid #4C5540',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#4C5540" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cogs" name="تكاليف المشاريع (COGS)" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="opex" name="المصروفات التشغيلية (OpEx)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="net" name="صافي الربح" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* COST & PROFIT CENTERS TAB */}
      {activeTab === 'cost_profit' && <FinanceCostProfitTab />}

      {/* P&L STATEMENT TAB */}
      {activeTab === 'pnl' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'قائمة الأرباح والخسائر الرسمية (P&L Statement)' : 'Income Statement'}
              </h3>
              <p className="text-xs text-slate-500">
                وكالة شال للحلول الرقمية • الربع المالي الرابع 2026 (القيم بالريال السعودي SAR)
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2D372B] px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{language === 'ar' ? 'طباعة القائمة' : 'Print'}</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Revenues */}
            <div className="rounded-xl border border-slate-100 dark:border-[#2D372B] bg-slate-50/50 dark:bg-[#1E251D] p-3.5">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-200 dark:border-[#2D372B]">
                <span>1. إجمالي الإيرادات التشغيلية (Total Revenues)</span>
                <span className="text-emerald-700 font-mono">+{financialMetrics.totalRevenue.toLocaleString()} ر.س</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-slate-600 dark:text-[#BDAF9C]">
                <div className="flex justify-between">
                  <span>- إيرادات عقود الريتينر الشهرية (Retainers)</span>
                  <span className="font-mono">198,000 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>- إيرادات مشاريع البرمجة والهوية وتطبيقات الويب</span>
                  <span className="font-mono">145,000 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>- عمولات إدارة الحملات الإعلانية الممولة</span>
                  <span className="font-mono">64,000 ر.س</span>
                </div>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="rounded-xl border border-slate-100 dark:border-[#2D372B] bg-slate-50/50 dark:bg-[#1E251D] p-3.5">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-200 dark:border-[#2D372B]">
                <span>2. تكاليف المشروعات المباشرة (Cost of Goods Sold - COGS)</span>
                <span className="text-rose-700 font-mono">-{financialMetrics.totalCogs.toLocaleString()} ر.س</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-slate-600 dark:text-[#BDAF9C]">
                <div className="flex justify-between">
                  <span>- شحن وميزانيات المنصات الإعلانية (ميتا، جوجل، تيك توك)</span>
                  <span className="font-mono">78,500 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>- مستحقات المستقلين ومصوري الفيديو والإنتاج الخارجي</span>
                  <span className="font-mono">24,000 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>- اشتراكات منصات الإنتاج (Figma, Adobe, OpenAI, Vercel)</span>
                  <span className="font-mono">12,800 ر.س</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Callout */}
            <div className="rounded-xl bg-[#4C5540]/10 border border-[#4C5540]/30 p-3.5 flex justify-between items-center text-sm font-bold text-[#4C5540] dark:text-[#A4C08B]">
              <span>مجمل الربح (Gross Profit = الإيرادات - تكاليف COGS)</span>
              <span className="font-mono font-black text-base">{financialMetrics.grossProfit.toLocaleString()} ر.س ({financialMetrics.grossMargin}%)</span>
            </div>

            {/* 3. OpEx */}
            <div className="rounded-xl border border-slate-100 dark:border-[#2D372B] bg-slate-50/50 dark:bg-[#1E251D] p-3.5">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-200 dark:border-[#2D372B]">
                <span>3. المصروفات التشغيلية والإدارية (Operating Expenses - OpEx)</span>
                <span className="text-amber-700 font-mono">-{financialMetrics.totalOpex.toLocaleString()} ر.س</span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-slate-600 dark:text-[#BDAF9C]">
                <div className="flex justify-between">
                  <span>- رواتب وبدلات الموظفين الأساسية</span>
                  <span className="font-mono">96,000 ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>- إيجار المقر والمرافق والاتصالات</span>
                  <span className="font-mono">18,500 ر.س</span>
                </div>
              </div>
            </div>

            {/* Net Income Final */}
            <div className="rounded-2xl bg-emerald-600 text-white p-4 flex justify-between items-center text-base font-extrabold shadow-md">
              <span>صافي أرباح الوكالة (Net Operating Profit)</span>
              <span className="font-mono text-xl">{financialMetrics.netProfit.toLocaleString()} ر.س ({financialMetrics.netMargin}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* CHART OF ACCOUNTS TAB */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'شجرة الحسابات المحاسبية المعتمدة (Chart of Accounts)' : 'Chart of Accounts'}
              </h3>
              <p className="text-xs text-slate-500">
                هيكل محاسبي رباعي التبويب يغطي الأصول، الخصوم، الإيرادات، وتكاليف المشروعات والمصروفات.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-[#1E251D] px-2.5 py-1 rounded-lg">
              {accounts.length} حسابات رئيسية
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-[#1E251D] text-slate-500 border-b border-slate-100 dark:border-[#2D372B]">
                <tr>
                  <th className="py-2.5 px-3 text-start font-bold">كود الحساب</th>
                  <th className="py-2.5 px-3 text-start font-bold">اسم الحساب</th>
                  <th className="py-2.5 px-3 text-start font-bold">النوع المحاسبي</th>
                  <th className="py-2.5 px-3 text-start font-bold">الوصف والاختصاص</th>
                  <th className="py-2.5 px-3 text-end font-bold">الرصيد الدفتري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2D372B]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1E251D]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{acc.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{acc.nameAr}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.type === 'asset'
                            ? 'bg-blue-100 text-blue-800'
                            : acc.type === 'revenue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : acc.type === 'cogs'
                            ? 'bg-rose-100 text-rose-800'
                            : acc.type === 'opex'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {acc.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{acc.description}</td>
                    <td className="py-3 px-3 text-end font-mono font-bold text-slate-900 dark:text-white">
                      {acc.balance.toLocaleString()} {acc.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2D372B] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'سجل العمليات المالية ودفتر القيود' : 'General Ledger Transactions'}
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل ومتابعة كافة المقبوضات والمدفوعات والمصروفات المباشرة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewTxModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'قيد معاملة' : 'New Entry'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-[#1E251D] text-slate-500 border-b border-slate-100 dark:border-[#2D372B]">
                <tr>
                  <th className="py-2.5 px-3 text-start font-bold">رقم القيد</th>
                  <th className="py-2.5 px-3 text-start font-bold">التاريخ</th>
                  <th className="py-2.5 px-3 text-start font-bold">النوع والتصنيف</th>
                  <th className="py-2.5 px-3 text-start font-bold">البيان والشرح</th>
                  <th className="py-2.5 px-3 text-start font-bold">الحساب البنكي</th>
                  <th className="py-2.5 px-3 text-end font-bold">المبلغ (SAR)</th>
                  <th className="py-2.5 px-3 text-center font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2D372B]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1E251D]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{tx.transactionNumber}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{tx.date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'revenue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.type === 'cogs'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.categoryAr}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 max-w-xs truncate">{tx.description}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-[#BDAF9C] text-[11px]">{tx.accountName}</td>
                    <td className={`py-3 px-3 text-end font-mono font-bold ${tx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'revenue' ? '+' : '-'}{tx.amount.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>مكتملة</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#2D372B] pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'مركز الفواتير والمطالبات الضريبية' : 'Billing & Tax Invoices'}
              </h3>
              <p className="text-xs text-slate-500">
                إصدار ومتابعة الفواتير المعتمدة للعملاء متضمنة ضريبة القيمة المضافة 15%.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284C7] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0369a1] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-slate-50/60 dark:bg-[#1E251D] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار'}
                    </span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{inv.clientName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تاريخ الإصدار: {inv.issueDate} • الاستحقاق: {inv.dueDate}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-[#151A14] border border-slate-200/60 dark:border-[#2D372B] space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-[#BDAF9C]">
                      <span>المبلغ الخاضع للضريبة:</span>
                      <span className="font-mono">{inv.subtotal.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span className="font-mono">{inv.taxAmount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-[#2D372B]">
                      <span>الإجمالي النهائي:</span>
                      <span className="font-mono text-sm text-[#4C5540] dark:text-[#A4C08B]">
                        {inv.totalAmount.toLocaleString()} {inv.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-[#2D372B] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inv.paymentMethod || 'طريقة الدفع: تحويل بنكي'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceForPrint(inv)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4C5540] dark:text-[#A4C08B] hover:underline cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>عرض وطباعة الفاتورة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT BUDGETS TAB */}
      {activeTab === 'budgets' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-5 shadow-xs">
          <div className="border-b border-slate-100 dark:border-[#2D372B] pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'ميزانيات أقسام الوكالة وتكاليف التشغيل الشهرية' : 'Department Budgets & Control'}
            </h3>
            <p className="text-xs text-slate-500">
              تحديد ومراقبة ميزانيات الإنفاق لكل قسم لمنع تجاوز السقف المالي.
            </p>
          </div>

          <div className="space-y-3">
            {budgets.map((b) => {
              const pct = Math.min(100, Math.round((b.actualSpend / b.allocatedBudget) * 100));
              return (
                <div key={b.id} className="rounded-xl border border-slate-200/80 dark:border-[#2D372B] bg-slate-50/60 dark:bg-[#1E251D] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{b.departmentNameAr}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">شهر: {b.month}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {b.actualSpend.toLocaleString()} / {b.allocatedBudget.toLocaleString()} {b.currency}
                      </span>
                      <span className={`block text-[10px] font-bold ${pct > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        مستهلك: {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-[#2D372B] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151A14] p-5 shadow-2xl border border-slate-200 dark:border-[#2D372B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D372B]">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'ar' ? 'قيد حركة مالية جديدة' : 'Record Transaction'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'نوع المعاملة' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('revenue');
                      setTxCategory('عقد ريتينر شهري');
                    }}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      txType === 'revenue'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    إيراد (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('cogs');
                      setTxCategory('إنفاق حملات إعلانية ممولة');
                    }}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      txType === 'cogs'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    تكاليف COGS (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('opex');
                      setTxCategory('مصروفات تشغيلية ومرافق');
                    }}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      txType === 'opex'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    تشغيلي OpEx (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'المبلغ بالريال السعودي (SAR)' : 'Amount'}
                </label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'البيان وشرح المعاملة' : 'Description'}
                </label>
                <input
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="مثال: تحصيل دفعة ريتينر نوفمبر من عميل..."
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'الحساب المالي المتأثر' : 'Account'}
                </label>
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="مصرف الراجحي">الحساب البنكي الرئيسي (مصرف الراجحي)</option>
                  <option value="بنك الإنماء USD">حساب العملات الأجنبية (الإنماء USD)</option>
                  <option value="الخزينة النقدية">الخزينة النقدية (Petty Cash)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#2D372B]">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد وقيد المعاملة' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151A14] p-5 shadow-2xl border border-slate-200 dark:border-[#2D372B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D372B]">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'ar' ? 'إصدار فاتورة ضريبية جديدة' : 'Create Tax Invoice'}
              </h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'اسم العميل / الشركة *' : 'Client / Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={invClientName}
                  onChange={(e) => setInvClientName(e.target.value)}
                  placeholder="مثال: شركة الحلول المتقدمة"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'وصف الباقة أو الخدمة' : 'Service Description'}
                </label>
                <input
                  type="text"
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  placeholder="مثال: إدارة الحسابات وحملات الأداء لشهر نوفمبر"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'ar' ? 'المبلغ قبل الضريبة' : 'Subtotal'}
                  </label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 font-mono text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'ar' ? 'الإجمالي مع 15% ضريبة' : 'Total (15% VAT)'}
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-100 dark:bg-[#252E24] p-2.5 font-mono text-xs font-black text-emerald-600">
                    {(invAmount * 1.15).toLocaleString()} ر.س
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#2D372B]">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0284C7] px-4 py-2 text-xs font-bold text-white hover:bg-[#0369a1] cursor-pointer"
                >
                  {language === 'ar' ? 'إصدار الفاتورة' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-[#4C5540]">وكالة شال للحلول الرقمية</h2>
                <p className="text-xs text-slate-500">فاتورة ضريبية معتمدة • Tax Invoice</p>
              </div>
              <div className="text-end">
                <span className="font-mono text-sm font-bold text-slate-800">{selectedInvoiceForPrint.invoiceNumber}</span>
                <p className="text-xs text-slate-400">تاريخ الإصدار: {selectedInvoiceForPrint.issueDate}</p>
              </div>
            </div>

            <div className="py-4 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-500">بيانات العميل:</span>
                <p className="font-bold text-sm">{selectedInvoiceForPrint.clientName}</p>
                <p className="text-slate-600">{selectedInvoiceForPrint.clientEmail || 'الرقم الضريبي متوفر بالعقد'}</p>
              </div>
              <div className="space-y-1 text-end">
                <span className="font-bold text-slate-500">حالة السداد:</span>
                <p className="font-bold text-emerald-600 text-sm">
                  {selectedInvoiceForPrint.status === 'paid' ? 'تم السداد بنجاح (PAID)' : 'بانتظار التحصيل (DUE)'}
                </p>
                <p className="text-slate-400">تاريخ الاستحقاق: {selectedInvoiceForPrint.dueDate}</p>
              </div>
            </div>

            <table className="w-full text-xs mt-3 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-2.5 text-start font-bold">البيان</th>
                  <th className="p-2.5 text-center font-bold">الكمية</th>
                  <th className="p-2.5 text-end font-bold">السعر</th>
                  <th className="p-2.5 text-end font-bold">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoiceForPrint.items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-2.5 font-medium">{it.description}</td>
                    <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                    <td className="p-2.5 text-end font-mono">{it.unitPrice.toLocaleString()} ر.س</td>
                    <td className="p-2.5 text-end font-mono font-bold">{it.total.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">{selectedInvoiceForPrint.subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono">{selectedInvoiceForPrint.taxAmount.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#4C5540] pt-1 border-t border-slate-200">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="font-mono text-base font-black">{selectedInvoiceForPrint.totalAmount.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">ختم الوكالة المعتمد • RLS Protected Record</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#4C5540] px-4 py-2 font-bold text-white hover:bg-[#3B4432] cursor-pointer"
                >
                  طباعة الفاتورة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
