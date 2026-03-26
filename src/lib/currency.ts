/**
 * Currency Utility (PRD 14)
 * Supports multi-country expansion by providing dynamic formatting.
 */

const CURRENCY_MAP: Record<string, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  GBP: { symbol: "£", locale: "en-GB" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
};

export function formatCurrency(
  amount: number | string,
  currencyCode: string = "INR"
) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "—";

  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function getCurrencySymbol(currencyCode: string = "INR") {
  return CURRENCY_MAP[currencyCode]?.symbol || "₹";
}
