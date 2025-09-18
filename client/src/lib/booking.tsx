import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Currency } from "./currency";

export interface SearchCriteria {
  destination: string;
  month1: string;
  month2: string;
  travelers: number;
  currency: Currency;
}

export interface BookingContextType {
  searchCriteria: SearchCriteria | null;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  clearSearchCriteria: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [searchCriteria, setSearchCriteriaState] = useState<SearchCriteria | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSearchCriteria = (criteria: SearchCriteria) => {
    setSearchCriteriaState(criteria);
    // Optionally persist to sessionStorage for page refreshes
    sessionStorage.setItem("bookingSearchCriteria", JSON.stringify(criteria));
  };

  const clearSearchCriteria = () => {
    setSearchCriteriaState(null);
    sessionStorage.removeItem("bookingSearchCriteria");
  };

  // Load criteria from sessionStorage on mount if available
  useEffect(() => {
    const savedCriteria = sessionStorage.getItem("bookingSearchCriteria");
    if (savedCriteria) {
      try {
        setSearchCriteriaState(JSON.parse(savedCriteria));
      } catch (error) {
        console.warn("Failed to parse saved search criteria:", error);
        sessionStorage.removeItem("bookingSearchCriteria");
      }
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        searchCriteria,
        setSearchCriteria,
        clearSearchCriteria,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

// Helper function to validate search criteria
export function validateSearchCriteria(criteria: Partial<SearchCriteria>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!criteria.destination) {
    errors.push("Please select a destination");
  }

  if (!criteria.month1 || !criteria.month2) {
    errors.push("Please select both travel months");
  }

  if (criteria.month1 === criteria.month2) {
    errors.push("Please select two different months for comparison");
  }

  if (criteria.month1 && criteria.month2 && criteria.month1 > criteria.month2) {
    errors.push("First month should be earlier than or equal to second month");
  }

  if (!criteria.travelers || criteria.travelers < 1 || criteria.travelers > 8) {
    errors.push("Please select a valid number of travelers (1-8)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}