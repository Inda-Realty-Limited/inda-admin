/**
 * Formats a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted price string with Naira symbol
 */
export function formatPrice(
  amount: number | string | null | undefined,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showDecimals = false, compact = false } = options;

  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || amount === "") {
    return showSymbol ? "₦0" : "0";
  }

  // Convert to number if string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle NaN or invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? "₦0" : "0";
  }

  let formattedAmount: string;

  if (compact && numAmount >= 1000000) {
    // Format in millions (M) or billions (B)
    if (numAmount >= 1000000000) {
      formattedAmount = (numAmount / 1000000000).toFixed(1) + "B";
    } else {
      formattedAmount = (numAmount / 1000000).toFixed(1) + "M";
    }
  } else if (compact && numAmount >= 1000) {
    // Format in thousands (K)
    formattedAmount = (numAmount / 1000).toFixed(1) + "K";
  } else {
    // Regular formatting with commas
    const formatter = new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    formattedAmount = formatter.format(numAmount);
  }

  return showSymbol ? `₦${formattedAmount}` : formattedAmount;
}

/**
 * Formats a price range (min - max) in Naira
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @param options - Formatting options
 * @returns Formatted price range string
 */
export function formatPriceRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  options: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  } = {}
): string {
  const minFormatted = formatPrice(min, options);
  const maxFormatted = formatPrice(max, { ...options, showSymbol: false });

  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Quick formatting shortcuts
 */
export const priceUtils = {
  // Standard format: ₦1,000,000
  standard: (amount: number | string | null | undefined) =>
    formatPrice(amount, { showSymbol: true, showDecimals: false }),

  // With decimals: ₦1,000,000.00
  withDecimals: (amount: number | string | null | undefined) =>
    formatPrice(amount, { showSymbol: true, showDecimals: true }),

  // Compact format: ₦1.0M
  compact: (amount: number | string | null | undefined) =>
    formatPrice(amount, { showSymbol: true, compact: true }),

  // No symbol: 1,000,000
  noSymbol: (amount: number | string | null | undefined) =>
    formatPrice(amount, { showSymbol: false, showDecimals: false }),
};
