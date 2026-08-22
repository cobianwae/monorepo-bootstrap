export interface FormatCurrencyOptions {
  /**
   * Whether to format with compact notation (e.g. $1.02M, $932k).
   * @default true
   */
  compact?: boolean;
  /**
   * Currency symbol prefix.
   * @default '$'
   */
  symbol?: string;
  /**
   * Maximum decimal places for compact M notation.
   * @default 2
   */
  maximumFractionDigits?: number;
}

/**
 * Formats a monetary number consistently across scenarios and dashboards.
 * Defaults to compact format (e.g. $1.02M, $932k, $750).
 */
export function formatCurrency(
  value: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    compact = true,
    symbol = '$',
    maximumFractionDigits = 2,
  } = options;

  if (isNaN(value)) {
    return `${symbol}0`;
  }

  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const prefix = isNegative ? `-${symbol}` : symbol;

  if (!compact) {
    return `${prefix}${absValue.toLocaleString('en-US', {
      maximumFractionDigits,
    })}`;
  }

  // Compact rules
  if (absValue >= 1_000_000) {
    const inMillions = absValue / 1_000_000;
    // Format up to maximumFractionDigits, strip trailing zeroes after decimal
    const formatted = parseFloat(inMillions.toFixed(maximumFractionDigits));
    return `${prefix}${formatted}M`;
  }

  if (absValue >= 1_000) {
    const inThousands = Math.round(absValue / 1_000);
    return `${prefix}${inThousands}k`;
  }

  return `${prefix}${absValue.toLocaleString('en-US')}`;
}
