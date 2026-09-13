/**
 * Format currency to Colombian Pesos style: $1.000.000,50 COP
 */
export function formatCOP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0,00 COP';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Round to 2 decimal places cleanly
  const fixed = absAmount.toFixed(2);
  const parts = fixed.split('.');
  
  // Format integer part with thousands dot
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];

  return `${isNegative ? '-' : ''}$${integerPart},${decimalPart} COP`;
}

/**
 * Format numbers with custom decimals using dots for thousands and commas for decimals
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00';
  }

  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const fixed = absVal.toFixed(decimals);
  const parts = fixed.split('.');
  
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];

  return `${isNegative ? '-' : ''}${integerPart}${decimals > 0 ? ',' + decimalPart : ''}`;
}

/**
 * Format percentage rates: e.g. 12,50%
 */
export function formatPercent(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,0000%';
  }
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Helper to get period count in a year for periodic rates
 */
export function getPeriodsInYear(periodicity: string): number {
  switch (periodicity) {
    case 'diaria':
      return 360; // Standard commercial year 360 days
    case 'mensual':
      return 12;
    case 'trimestral':
      return 4;
    case 'semestral':
      return 2;
    case 'anual':
      return 1;
    default:
      return 12;
  }
}

/**
 * Periodicity label in Spanish
 */
export function getPeriodicityLabel(periodicity: string): string {
  switch (periodicity) {
    case 'diaria':
      return 'Diaria (360 días)';
    case 'mensual':
      return 'Mensual (12 periodos/año)';
    case 'trimestral':
      return 'Trimestral (4 periodos/año)';
    case 'semestral':
      return 'Semestral (2 periodos/año)';
    case 'anual':
      return 'Anual (1 periodo/año)';
    default:
      return periodicity;
  }
}
