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

export interface SelectedHotel {
  id: string;
  name: string;
  location: string;
  city: string;
  pricePerNight: string;
  currency: string;
  rating: string;
  reviewCount: number;
  distanceToBeach?: string | null;
  distanceToLandmark?: string | null;
  amenities: string[];
  imageUrl?: string | null;
  nights: number;
  totalPrice: number;
}

export interface SelectedHotels {
  hotels: SelectedHotel[];
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
  selectedHotels: SelectedHotels | null;
  setSelectedHotels: (hotels: SelectedHotels) => void;
  clearSelectedHotels: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider = ({ children }: BookingProviderProps) => {
  const [searchCriteria, setSearchCriteriaState] = useState<SearchCriteria | null>(null);
  const [selectedDates, setSelectedDatesState] = useState<SelectedDates | null>(null);
  const [selectedFlights, setSelectedFlightsState] = useState<SelectedFlights | null>(null);
  const [selectedHotels, setSelectedHotelsState] = useState<SelectedHotels | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSearchCriteria = (criteria: SearchCriteria) => {
    setSearchCriteriaState(criteria);
    // Clear selected dates, flights, and hotels when search criteria changes
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
    sessionStorage.removeItem("bookingSelectedHotels");
    // Persist search criteria to sessionStorage for page refreshes
    sessionStorage.setItem("bookingSearchCriteria", JSON.stringify(criteria));
  };

  const clearSearchCriteria = () => {
    setSearchCriteriaState(null);
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSearchCriteria");
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
    sessionStorage.removeItem("bookingSelectedHotels");
  };

  const setSelectedDates = (dates: SelectedDates) => {
    setSelectedDatesState(dates);
    // Clear selected flights and hotels when dates change
    setSelectedFlightsState(null);
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedFlights");
    sessionStorage.removeItem("bookingSelectedHotels");
    // Persist selected dates to sessionStorage
    sessionStorage.setItem("bookingSelectedDates", JSON.stringify(dates));
  };

  const clearSelectedDates = () => {
    setSelectedDatesState(null);
    setSelectedFlightsState(null);
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedDates");
    sessionStorage.removeItem("bookingSelectedFlights");
    sessionStorage.removeItem("bookingSelectedHotels");
  };

  const setSelectedFlights = (flights: SelectedFlights) => {
    setSelectedFlightsState(flights);
    // Clear selected hotels when flights change
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedHotels");
    // Persist selected flights to sessionStorage
    sessionStorage.setItem("bookingSelectedFlights", JSON.stringify(flights));
  };

  const clearSelectedFlights = () => {
    setSelectedFlightsState(null);
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedFlights");
    sessionStorage.removeItem("bookingSelectedHotels");
  };

  const setSelectedHotels = (hotels: SelectedHotels) => {
    setSelectedHotelsState(hotels);
    // Persist selected hotels to sessionStorage
    sessionStorage.setItem("bookingSelectedHotels", JSON.stringify(hotels));
  };

  const clearSelectedHotels = () => {
    setSelectedHotelsState(null);
    sessionStorage.removeItem("bookingSelectedHotels");
  };

  // Load saved data from sessionStorage on mount
  useEffect(() => {
    const savedCriteria = sessionStorage.getItem("bookingSearchCriteria");
    const savedDates = sessionStorage.getItem("bookingSelectedDates");
    const savedFlights = sessionStorage.getItem("bookingSelectedFlights");
    const savedHotels = sessionStorage.getItem("bookingSelectedHotels");
    
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

    if (savedHotels) {
      try {
        setSelectedHotelsState(JSON.parse(savedHotels));
      } catch (error) {
        console.warn("Failed to parse saved selected hotels:", error);
        sessionStorage.removeItem("bookingSelectedHotels");
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
        selectedHotels,
        setSelectedHotels,
        clearSelectedHotels,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

// Helper function to validate search criteria
export const validateSearchCriteria = (criteria: Partial<SearchCriteria>): {
  isValid: boolean;
  errors: string[];
} => {
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
};