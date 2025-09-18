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

export interface SelectedFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  duration: string;
  stops: string;
  layoverDuration?: string;
  layoverLocation?: string;
  price: string;
  currency: string;
}

export interface SelectedFlights {
  outbound: SelectedFlight | null;
  return: SelectedFlight | null;
  totalPrice: number;
  currency: string;
}

export interface BookingContextType {
  searchCriteria: SearchCriteria | null;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  clearSearchCriteria: () => void;
  selectedDates: SelectedDates | null;
  setSelectedDates: (dates: SelectedDates) => void;
  clearSelectedDates: () => void;
  selectedFlights: SelectedFlights | null;
  setSelectedFlights: (flights: SelectedFlights) => void;
  clearSelectedFlights: () => void;
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
  const [selectedFlights, setSelectedFlightsState] = useState<SelectedFlights | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSearchCriteria = (criteria: SearchCriteria) => {
    setSearchCriteriaState(criteria);
    // Clear selected dates and flights when search criteria changes
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
    // Persist search criteria to sessionStorage for page refreshes
    sessionStorage.setItem("bookingSearchCriteria", JSON.stringify(criteria));
  };

  const clearSearchCriteria = () => {
    setSearchCriteriaState(null);
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    sessionStorage.removeItem("bookingSearchCriteria");
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
  };

  const setSelectedDates = (dates: SelectedDates) => {
    setSelectedDatesState(dates);
    // Clear selected flights when dates change
    setSelectedFlightsState(null);
    sessionStorage.removeItem("bookingSelectedFlights");
    // Persist selected dates to sessionStorage
    sessionStorage.setItem("bookingSelectedDates", JSON.stringify(dates));
  };

  const clearSelectedDates = () => {
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
  };

  const setSelectedFlights = (flights: SelectedFlights) => {
    setSelectedFlightsState(flights);
    // Persist selected flights to sessionStorage
    sessionStorage.setItem("bookingSelectedFlights", JSON.stringify(flights));
  };

  const clearSelectedFlights = () => {
    setSelectedFlightsState(null);
    sessionStorage.removeItem("bookingSelectedFlights");
  };

  // Load saved data from sessionStorage on mount
  useEffect(() => {
    const savedCriteria = sessionStorage.getItem("bookingSearchCriteria");
    const savedDates = sessionStorage.getItem("bookingSelectedDates");
    const savedFlights = sessionStorage.getItem("bookingSelectedFlights");
    
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

    if (savedFlights) {
      try {
        setSelectedFlightsState(JSON.parse(savedFlights));
      } catch (error) {
        console.warn("Failed to parse saved selected flights:", error);
        sessionStorage.removeItem("bookingSelectedFlights");
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
        selectedFlights,
        setSelectedFlights,
        clearSelectedFlights,
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