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
export const formatReal = formatCurrency('pt-BR', 'BRL');
export const formatSol = formatCurrency('es-PE', 'PEN');
export const formatPesoArgentino = formatCurrency('es-AR', 'ARS');
export const formatPesoMexicano = formatCurrency('es-MX', 'MXN');
export const formatRialSaudi = formatCurrency('ar-SA', 'SAR');

// Monedas sin decimales
export const formatPesoColombiano = formatCurrency('es-CO', 'COP');
export const formatWon = formatCurrency('ko-KR', 'KRW');
export const formatYen = formatCurrency('ja-JP', 'JPY');
