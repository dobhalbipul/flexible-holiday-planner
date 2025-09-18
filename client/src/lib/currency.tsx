import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "MYR" | "INR" | "USD" | "SGD" | "VND";

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency?: Currency) => number;
}

// Exchange rates relative to MYR (Malaysian Ringgit)
const EXCHANGE_RATES: Record<Currency, number> = {
  MYR: 1.0,      // Base currency
  INR: 18.5,     // 1 MYR = 18.5 INR
  USD: 0.21,     // 1 MYR = 0.21 USD
  SGD: 0.29,     // 1 MYR = 0.29 SGD
  VND: 5250,     // 1 MYR = 5250 VND
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>("MYR");

  // Load saved currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("selectedCurrency", newCurrency);
  };

  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency?: Currency): number => {
    const targetCurrency = toCurrency || currency;
    
    // Convert to MYR first (base currency)
    const amountInMYR = amount / EXCHANGE_RATES[fromCurrency];
    
    // Convert from MYR to target currency
    const convertedAmount = amountInMYR * EXCHANGE_RATES[targetCurrency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MYR: "RM",
  INR: "₹",
  USD: "$",
  SGD: "S$",
  VND: "₫",
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  MYR: "Malaysian Ringgit",
  INR: "Indian Rupee", 
  USD: "US Dollar",
  SGD: "Singapore Dollar",
  VND: "Vietnamese Dong",
};