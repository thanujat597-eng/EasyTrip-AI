export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', label: 'INR (₹ - Indian Rupee)' },
  { code: 'USD', symbol: '$', name: 'US Dollar', label: 'USD ($ - US Dollar)' },
  { code: 'EUR', symbol: '€', name: 'Euro', label: 'EUR (€ - Euro)' },
  { code: 'GBP', symbol: '£', name: 'British Pound', label: 'GBP (£ - British Pound)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', label: 'JPY (¥ - Japanese Yen)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', label: 'AED (د.إ - UAE Dirham)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', label: 'SGD (S$ - Singapore Dollar)' },
];

export function getCurrencySymbol(code?: string): string {
  if (!code) return '₹';
  const found = CURRENCY_OPTIONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found ? found.symbol : code;
}

export function getDefaultCurrency(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('easytrip_currency') || localStorage.getItem('travelmate_currency');
    if (saved && CURRENCY_OPTIONS.some((c) => c.code === saved)) {
      return saved;
    }
  }
  return 'INR';
}

export function saveDefaultCurrency(code: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('easytrip_currency', code);
  }
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString()}`;
}
