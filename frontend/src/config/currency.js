/** App-wide default: Pakistani Rupee */
export const CURRENCY_CODE = 'PKR';

export function formatPkr(amount) {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return 'PKR\u00A00.00';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
