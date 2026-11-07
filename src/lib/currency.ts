// ==============================================================================
// DUAL CURRENCY CONVERTER & FINANCIAL UTILITIES
// SAR (الريال السعودي) & EGP (الجنيه المصري)
// ==============================================================================

export type SupportedCurrency = 'SAR' | 'EGP';

// Default realistic market exchange rate: 1 SAR = 13.20 EGP (approximate current rate)
export const DEFAULT_SAR_TO_EGP_RATE = 13.20;

export interface CurrencySettings {
  displayCurrency: SupportedCurrency;
  exchangeRateSarToEgp: number; // 1 SAR = X EGP
  lastUpdated: string;
}

const STORAGE_KEY = 'shal_currency_settings';

export const getCurrencySettings = (): CurrencySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.displayCurrency && parsed.exchangeRateSarToEgp) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse currency settings', e);
  }

  return {
    displayCurrency: 'SAR',
    exchangeRateSarToEgp: DEFAULT_SAR_TO_EGP_RATE,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
};

export const saveCurrencySettings = (settings: CurrencySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('shal:currency-changed', { detail: settings }));
  } catch (e) {
    console.error('Failed to save currency settings', e);
  }
};

/**
 * Fetches real-time market exchange rate from financial API with graceful fallback.
 */
export const fetchLiveExchangeRate = async (): Promise<{
  rate: number;
  provider: string;
  date: string;
  success: boolean;
}> => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/SAR');
    if (!res.ok) throw new Error(`API responded with status: ${res.status}`);
    const data = await res.json();
    if (data && data.rates && typeof data.rates.EGP === 'number') {
      const rate = Number(Number(data.rates.EGP).toFixed(2));
      const today = new Date().toISOString().split('T')[0];
      const settings = getCurrencySettings();
      saveCurrencySettings({
        ...settings,
        exchangeRateSarToEgp: rate,
        lastUpdated: today,
      });
      return {
        rate,
        provider: 'Open Exchange Rates (Global Forex API)',
        date: today,
        success: true,
      };
    }
  } catch (err) {
    console.warn('Primary exchange API failed, attempting secondary mirror...', err);
    try {
      const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/SAR');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.rates && typeof data2.rates.EGP === 'number') {
          const rate = Number(Number(data2.rates.EGP).toFixed(2));
          const today = new Date().toISOString().split('T')[0];
          const settings = getCurrencySettings();
          saveCurrencySettings({
            ...settings,
            exchangeRateSarToEgp: rate,
            lastUpdated: today,
          });
          return {
            rate,
            provider: 'ExchangeRate-API Live Engine',
            date: today,
            success: true,
          };
        }
      }
    } catch (e2) {
      console.warn('All live currency APIs unreachable, using reliable cached rate', e2);
    }
  }

  // Graceful fallback to stored or default
  const cached = getCurrencySettings();
  return {
    rate: cached.exchangeRateSarToEgp || DEFAULT_SAR_TO_EGP_RATE,
    provider: 'Local Treasury Benchmark',
    date: cached.lastUpdated || new Date().toISOString().split('T')[0],
    success: false,
  };
};

/**
 * Converts an amount from a source currency to the target currency.
 * Base internal standard in calculations is SAR.
 */
export const convertCurrency = (
  amount: number,
  from: 'SAR' | 'EGP' | 'USD' | string,
  to: SupportedCurrency,
  rateSarToEgp: number = DEFAULT_SAR_TO_EGP_RATE
): number => {
  if (isNaN(amount)) return 0;
  
  // Standardize to SAR first
  let amountInSar = amount;
  if (from === 'EGP') {
    amountInSar = rateSarToEgp > 0 ? amount / rateSarToEgp : amount;
  } else if (from === 'USD') {
    // 1 USD = 3.75 SAR standard pegged rate
    amountInSar = amount * 3.75;
  } else if (from === 'AED') {
    // 1 AED = 1.02 SAR
    amountInSar = amount * 1.02;
  } else {
    // Default assumed SAR
    amountInSar = amount;
  }

  // Convert from SAR to target currency
  if (to === 'SAR') {
    return amountInSar;
  } else if (to === 'EGP') {
    return amountInSar * rateSarToEgp;
  }

  return amountInSar;
};

/**
 * Formats monetary amounts with symbol and clean decimals.
 */
export const formatMoney = (
  amount: number,
  currency: SupportedCurrency = 'SAR',
  decimals: number = 0
): string => {
  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (currency === 'SAR') {
    return `${formattedNumber} ر.س`;
  } else {
    return `${formattedNumber} ج.م`;
  }
};

/**
 * Formats an amount with dual display: main currency + equivalent secondary currency in brackets
 */
export const formatDualMoney = (
  amountInSar: number,
  targetCurrency: SupportedCurrency = 'SAR',
  rateSarToEgp: number = DEFAULT_SAR_TO_EGP_RATE
): { primary: string; secondary: string; full: string } => {
  const primaryAmount = targetCurrency === 'SAR' ? amountInSar : amountInSar * rateSarToEgp;
  const secondaryCurrency: SupportedCurrency = targetCurrency === 'SAR' ? 'EGP' : 'SAR';
  const secondaryAmount = secondaryCurrency === 'EGP' ? amountInSar * rateSarToEgp : amountInSar;

  const primaryStr = formatMoney(primaryAmount, targetCurrency, 0);
  const secondaryStr = formatMoney(secondaryAmount, secondaryCurrency, 0);

  return {
    primary: primaryStr,
    secondary: secondaryStr,
    full: `${primaryStr} (${secondaryStr})`,
  };
};
