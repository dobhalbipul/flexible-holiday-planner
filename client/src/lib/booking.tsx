import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Currency } from "./currency";

export interface SearchCriteria {
  destination: string;
  month1: string;
  month2: string;
  travelers: number;
  currency: Currency;
}

export interface SelectedDates {
  startDate: string;
  endDate: string;
  duration: number;
  pricePerPerson: number;
  totalPrice: number;
  currency: string;
  dateRangeId: string;
}

export interface BookingContextType {
  searchCriteria: SearchCriteria | null;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  clearSearchCriteria: () => void;
  selectedDates: SelectedDates | null;
  setSelectedDates: (dates: SelectedDates) => void;
  clearSelectedDates: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [searchCriteria, setSearchCriteriaState] = useState<SearchCriteria | null>(null);
  const [selectedDates, setSelectedDatesState] = useState<SelectedDates | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSearchCriteria = (criteria: SearchCriteria) => {
    setSearchCriteriaState(criteria);
    // Clear selected dates when search criteria changes
    setSelectedDatesState(null);
    sessionStorage.removeItem("bookingSelectedDates");
    // Persist search criteria to sessionStorage for page refreshes
    sessionStorage.setItem("bookingSearchCriteria", JSON.stringify(criteria));
  };

  const clearSearchCriteria = () => {
    setSearchCriteriaState(null);
    setSelectedDatesState(null);
    sessionStorage.removeItem("bookingSearchCriteria");
    sessionStorage.removeItem("bookingSelectedDates");
  };

  const setSelectedDates = (dates: SelectedDates) => {
    setSelectedDatesState(dates);
    // Persist selected dates to sessionStorage
    sessionStorage.setItem("bookingSelectedDates", JSON.stringify(dates));
  };

  const clearSelectedDates = () => {
    setSelectedDatesState(null);
    sessionStorage.removeItem("bookingSelectedDates");
  };

  // Load saved data from sessionStorage on mount
  useEffect(() => {
    const savedCriteria = sessionStorage.getItem("bookingSearchCriteria");
    const savedDates = sessionStorage.getItem("bookingSelectedDates");
    
    if (savedCriteria) {
      try {
        setSearchCriteriaState(JSON.parse(savedCriteria));
      } catch (error) {
        console.warn("Failed to parse saved search criteria:", error);
        sessionStorage.removeItem("bookingSearchCriteria");
      }
    }

    if (savedDates) {
      try {
        setSelectedDatesState(JSON.parse(savedDates));
      } catch (error) {
        console.warn("Failed to parse saved selected dates:", error);
        sessionStorage.removeItem("bookingSelectedDates");
      }
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        searchCriteria,
        setSearchCriteria,
        clearSearchCriteria,
        selectedDates,
        setSelectedDates,
        clearSelectedDates,
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