import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Currency, CURRENCY_SYMBOLS } from "./currency"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number, 
  currency: Currency, 
  options: { showSymbol?: boolean; decimals?: number } = {}
): string {
  const { showSymbol = true, decimals = 2 } = options;
  
  const symbol = CURRENCY_SYMBOLS[currency];
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  if (!showSymbol) {
    return formattedAmount;
  }
  
  // For VND, typically show without decimals and symbol after
  if (currency === 'VND') {
    const vndAmount = Math.round(amount).toLocaleString('en-US');
    return `${vndAmount} ${symbol}`;
  }
  
  return `${symbol}${formattedAmount}`;
}
