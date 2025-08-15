export const formatCurrency = (locale: string, currency: string) => (amount: number) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatEuro = formatCurrency('es-ES', 'EUR');
export const formatDollar = formatCurrency('en-US', 'USD');
