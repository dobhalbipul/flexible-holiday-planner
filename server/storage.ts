import { type User, type InsertUser, type Flight, type InsertFlight, type Hotel, type InsertHotel, type Restaurant, type InsertRestaurant, type Activity, type InsertActivity, type Itinerary, type InsertItinerary, type Transportation, type InsertTransportation, type DateRangeResult, type BestDatesResponse, type FlightSearchResponse, type HotelSearchResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  searchFlights(origin: string, destination: string, departureDate: string): Promise<Flight[]>;
  searchFlightsByDates(destination: string, startDate: string, endDate: string, travelers: number, currency?: string): Promise<FlightSearchResponse>;
  getFlight(id: string): Promise<Flight | undefined>;
  
  searchHotels(city: string, checkIn: string, checkOut: string): Promise<Hotel[]>;
  searchHotelsByDestination(destination: string, checkIn: string, checkOut: string, travelers: number, currency?: string): Promise<HotelSearchResponse>;
  getHotel(id: string): Promise<Hotel | undefined>;
  
  getRestaurantsByCity(city: string, cuisine?: string): Promise<Restaurant[]>;
  
  getActivitiesByCity(city: string): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity | undefined>;
  
  getTransportationOptions(from: string, to: string): Promise<Transportation[]>;
  
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
  getItinerary(id: string): Promise<Itinerary | undefined>;
  
  getBestDates(destination: string, month1: string, month2: string, travelers: number, currency?: string): Promise<BestDatesResponse>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private flights: Map<string, Flight>;
  private hotels: Map<string, Hotel>;
  private restaurants: Map<string, Restaurant>;
  private activities: Map<string, Activity>;
  private transportation: Map<string, Transportation>;
  private itineraries: Map<string, Itinerary>;

  constructor() {
    this.users = new Map();
    this.flights = new Map();
    this.hotels = new Map();
    this.restaurants = new Map();
    this.activities = new Map();
    this.transportation = new Map();
    this.itineraries = new Map();
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample flights
    const sampleFlights: Flight[] = [
      {
        id: randomUUID(),
        airline: "Malaysia Airlines",
        flightNumber: "MH780 + VN1547",
        origin: "PEN",
        destination: "DAD",
        departureTime: "08:30",
        arrivalTime: "15:45",
        departureDate: "2025-10-25",
        arrivalDate: "2025-10-25",
        duration: "7h 15m",
        stops: "1 stop in KUL",
        layoverDuration: "2h 30m",
        layoverLocation: "Kuala Lumpur",
        price: "1045.00",
        currency: "MYR",
      },
      {
        id: randomUUID(),
        airline: "Vietnam Airlines",
        flightNumber: "VN634 + VN1203",
        origin: "PEN",
        destination: "DAD",
        departureTime: "10:15",
        arrivalTime: "18:20",
        departureDate: "2025-10-25",
        arrivalDate: "2025-10-25",
        duration: "8h 05m",
        stops: "1 stop in SGN",
        layoverDuration: "3h 15m",
        layoverLocation: "Ho Chi Minh",
        price: "1105.00",
        currency: "MYR",
      },
      {
        id: randomUUID(),
        airline: "AirAsia",
        flightNumber: "AK6148 + VN1456",
        origin: "PEN",
        destination: "DAD",
        departureTime: "06:45",
        arrivalTime: "16:30",
        departureDate: "2025-10-25",
        arrivalDate: "2025-10-25",
        duration: "9h 45m",
        stops: "1 stop in KUL",
        layoverDuration: "4h 20m",
        layoverLocation: "Kuala Lumpur",
        price: "965.00",
        currency: "MYR",
      },
      {
        id: randomUUID(),
        airline: "Scoot",
        flightNumber: "TR409 + VN1289",
        origin: "PEN",
        destination: "DAD",
        departureTime: "14:20",
        arrivalTime: "22:15",
        departureDate: "2025-10-25",
        arrivalDate: "2025-10-25",
        duration: "7h 55m",
        stops: "1 stop in SIN",
        layoverDuration: "2h 45m",
        layoverLocation: "Singapore",
        price: "1025.00",
        currency: "MYR",
      },
      {
        id: randomUUID(),
        airline: "Jetstar Asia",
        flightNumber: "3K582 + VN1678",
        origin: "PEN",
        destination: "DAD",
        departureTime: "12:30",
        arrivalTime: "21:45",
        departureDate: "2025-10-25",
        arrivalDate: "2025-10-25",
        duration: "9h 15m",
        stops: "1 stop in SIN",
        layoverDuration: "3h 50m",
        layoverLocation: "Singapore",
        price: "1135.00",
        currency: "MYR",
      },
    ];

    // Sample hotels
    const sampleHotels: Hotel[] = [
      {
        id: randomUUID(),
        name: "Thuan Tinh Island Tour Eco Home",
        location: "Ancient Town",
        city: "Hoi An",
        pricePerNight: "120.00",
        currency: "MYR",
        rating: "4.2",
        reviewCount: 156,
        distanceToBeach: "2.8 km to An Bang Beach",
        distanceToLandmark: "1.2 km to Ancient Town",
        amenities: ["Free WiFi", "Air Con", "Pool", "Breakfast"],
        imageUrl: "https://pixabay.com/get/g8c5bb1de2279b6369116f80663f374bf4276868806365b1ae833a9f7291eb3fac22a3ff3938282b60e26f16570634f6e4785fb7b340afd0dbfa04c7f564e1e08_1280.jpg",
      },
      {
        id: randomUUID(),
        name: "Sunflower Village Hotel",
        location: "Ancient Town",
        city: "Hoi An",
        pricePerNight: "150.00",
        currency: "MYR",
        rating: "4.5",
        reviewCount: 203,
        distanceToBeach: "3.2 km to Cua Dai Beach",
        distanceToLandmark: "0.8 km to Ancient Town",
        amenities: ["Free WiFi", "Bike Rental", "Garden View"],
        imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
      {
        id: randomUUID(),
        name: "My Khe Beach Hotel",
        location: "My Khe Beach",
        city: "Da Nang",
        pricePerNight: "180.00",
        currency: "MYR",
        rating: "4.3",
        reviewCount: 287,
        distanceToBeach: "50m to My Khe Beach",
        distanceToLandmark: "8 km to Dragon Bridge",
        amenities: ["Beachfront", "Pool", "Gym", "Spa"],
        imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
      {
        id: randomUUID(),
        name: "Ocean Bay Hotel",
        location: "My Khe Beach",
        city: "Da Nang",
        pricePerNight: "165.00",
        currency: "MYR",
        rating: "4.6",
        reviewCount: 412,
        distanceToBeach: "200m to My Khe Beach",
        distanceToLandmark: "5 km to Han Market",
        amenities: ["Ocean View", "Restaurant", "Rooftop Bar"],
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
    ];

    // Sample restaurants
    const sampleRestaurants: Restaurant[] = [
      {
        id: randomUUID(),
        name: "Ganesh Indian Restaurant",
        cuisine: "Indian",
        city: "Hoi An",
        location: "Ancient Town, 0.5km from hotels",
        rating: "4.5",
        priceRange: "RM 50-75",
        specialties: "North Indian curries, tandoori, fresh naan",
        openingHours: "11:00 - 22:00",
        servingTimes: ["Lunch", "Dinner"],
      },
      {
        id: randomUUID(),
        name: "Maharaja Indian Kitchen",
        cuisine: "Indian",
        city: "Hoi An",
        location: "Riverside area, 0.8km from hotels",
        rating: "4.2",
        priceRange: "RM 42-63",
        specialties: "South Indian dishes, thali sets, vegetarian options",
        openingHours: "10:30 - 21:30",
        servingTimes: ["Lunch", "Dinner"],
      },
      {
        id: randomUUID(),
        name: "Spice Garden Indian Restaurant",
        cuisine: "Indian",
        city: "Da Nang",
        location: "My Khe Beach area, 0.3km from hotel",
        rating: "4.7",
        priceRange: "RM 63-93",
        specialties: "Punjabi cuisine, seafood curries, beach view dining",
        openingHours: "11:30 - 23:00",
        servingTimes: ["Lunch", "Dinner"],
      },
      {
        id: randomUUID(),
        name: "Bombay Palace Da Nang",
        cuisine: "Indian",
        city: "Da Nang",
        location: "Han Market area, 1.2km from hotel",
        rating: "4.6",
        priceRange: "RM 55-80",
        specialties: "Authentic curries, biryani, Indian street food",
        openingHours: "11:00 - 22:30",
        servingTimes: ["Lunch", "Dinner"],
      },
    ];

    // Sample activities
    const sampleActivities: Activity[] = [
      {
        id: randomUUID(),
        name: "Bà Nà Hills Day Trip",
        city: "Da Nang",
        description: "Golden Bridge, French Village, cable car rides, alpine coaster",
        duration: "Full day (8 hours)",
        price: "7200.00",
        currency: "INR",
        category: "Must-Visit",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
      {
        id: randomUUID(),
        name: "Marble Mountains",
        city: "Da Nang",
        description: "Cave exploration, Buddhist temples, panoramic city views",
        duration: "Half day (4 hours)",
        price: "2100.00",
        currency: "INR",
        category: "Cultural",
        imageUrl: "https://pixabay.com/get/g4f7770015c13f9eb7273f7e365d49b0f241b12f5dac1980528df10a9353c890d9cc5ad5c2d3b1801bbb2398c12ebd05eaa780da889943aa12f2776c554d04d86_1280.jpg",
      },
      {
        id: randomUUID(),
        name: "Cooking Class",
        city: "Hoi An",
        description: "Learn to make pho, spring rolls, and local specialties",
        duration: "Half day (3 hours)",
        price: "3800.00",
        currency: "INR",
        category: "Interactive",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
      {
        id: randomUUID(),
        name: "Basket Boat Tour",
        city: "Hoi An",
        description: "Coconut forest, traditional fishing, cultural experience",
        duration: "Half day (3 hours)",
        price: "1850.00",
        currency: "INR",
        category: "Nature",
        imageUrl: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=200",
      },
      {
        id: randomUUID(),
        name: "Dragon Bridge Fire Show",
        city: "Da Nang",
        description: "Spectacular fire and water show every weekend at 9 PM",
        duration: "Evening (1 hour)",
        price: "0.00",
        currency: "USD",
        category: "Free",
        imageUrl: "https://pixabay.com/get/gd29a1c65c9b286440b3057283dd4aa64e51d0eaba8d851b38f895d8f4d07205992f5e3d457ceb46e8e876c90bd04e65c9b7b8261b342e0f56980e2e852bf2d44_1280.jpg",
      },
      {
        id: randomUUID(),
        name: "Beach Activities",
        city: "Da Nang",
        description: "Surfing lessons, jet ski, parasailing, beach volleyball",
        duration: "Flexible timing",
        price: "2100.00",
        currency: "INR",
        category: "Adventure",
        imageUrl: "https://pixabay.com/get/g5dc1efbc5fbad9440011ae550e2548d4921b58544ce927e7523a55d18d107b8edface12caf1c3b67d67b59c19413e2ccc6b82cfda3f1fd846841c14e682fce25_1280.jpg",
      },
    ];

    // Sample transportation
    const sampleTransportation: Transportation[] = [
      {
        id: randomUUID(),
        type: "Private Car",
        from: "Da Nang Airport",
        to: "Hoi An",
        duration: "45 mins",
        price: "150.00",
        currency: "MYR",
        description: "Door-to-door service, hotel pickup",
      },
      {
        id: randomUUID(),
        type: "Taxi",
        from: "Da Nang Airport",
        to: "Hoi An",
        duration: "45 mins",
        price: "105.00",
        currency: "MYR",
        description: "Metered taxi service",
      },
      {
        id: randomUUID(),
        type: "Bus",
        from: "Da Nang Airport",
        to: "Hoi An",
        duration: "1 hour",
        price: "34.00",
        currency: "MYR",
        description: "Public bus service",
      },
      {
        id: randomUUID(),
        type: "Private Transfer",
        from: "Hoi An",
        to: "Da Nang",
        duration: "30 mins",
        price: "105.00",
        currency: "MYR",
        description: "Door-to-door service, hotel pickup",
      },
      {
        id: randomUUID(),
        type: "Local Bus",
        from: "Hoi An",
        to: "Da Nang",
        duration: "45 mins",
        price: "13.00",
        currency: "MYR",
        description: "Hourly service, central pickup points",
      },
      {
        id: randomUUID(),
        type: "Private Car",
        from: "Da Nang",
        to: "Airport",
        duration: "25 mins",
        price: "63.00",
        currency: "MYR",
        description: "Hotel pickup to airport",
      },
    ];

    // Populate maps
    sampleFlights.forEach(flight => this.flights.set(flight.id, flight));
    sampleHotels.forEach(hotel => this.hotels.set(hotel.id, hotel));
    sampleRestaurants.forEach(restaurant => this.restaurants.set(restaurant.id, restaurant));
    sampleActivities.forEach(activity => this.activities.set(activity.id, activity));
    sampleTransportation.forEach(transport => this.transportation.set(transport.id, transport));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async searchFlights(origin: string, destination: string, departureDate: string): Promise<Flight[]> {
    return Array.from(this.flights.values())
      .filter(flight => 
        flight.origin === origin && 
        flight.destination === destination &&
        flight.departureDate === departureDate
      )
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  async searchFlightsByDates(destination: string, startDate: string, endDate: string, travelers: number, currency = "MYR"): Promise<FlightSearchResponse> {
    // Map destination to airport codes
    const destinationMap = {
      "hoi-an-da-nang": "DAD",
      "hanoi-halong": "HAN", 
      "ho-chi-minh": "SGN",
      "phu-quoc": "PQC",
    };
    
    const destinationCode = destinationMap[destination as keyof typeof destinationMap] || "DAD";
    const origin = "PEN"; // Penang

    // Generate outbound flights for start date
    const outboundFlights = this.generateFlightsForDate(origin, destinationCode, startDate, currency);
    
    // Generate return flights for end date (reverse origin/destination)
    const returnFlights = this.generateFlightsForDate(destinationCode, origin, endDate, currency);

    return {
      outboundFlights,
      returnFlights,
      searchCriteria: {
        destination,
        startDate,
        endDate,
        travelers,
        currency,
      },
    };
  }

  private generateFlightsForDate(origin: string, destination: string, date: string, currency: string): Flight[] {
    // Base flight templates
    const flightTemplates = [
      {
        airline: "Malaysia Airlines",
        flightNumber: `MH780 + VN1547`,
        departureTime: "08:30",
        arrivalTime: "15:45",
        duration: "7h 15m",
        stops: "1 stop in KUL",
        layoverDuration: "2h 30m",
        layoverLocation: "Kuala Lumpur",
        basePrice: 1045,
      },
      {
        airline: "Vietnam Airlines", 
        flightNumber: `VN634 + VN1203`,
        departureTime: "10:15",
        arrivalTime: "18:20",
        duration: "8h 05m",
        stops: "1 stop in SGN",
        layoverDuration: "3h 15m",
        layoverLocation: "Ho Chi Minh",
        basePrice: 1105,
      },
      {
        airline: "AirAsia",
        flightNumber: `AK6148 + VN1456`,
        departureTime: "06:45", 
        arrivalTime: "16:30",
        duration: "9h 45m",
        stops: "1 stop in KUL",
        layoverDuration: "4h 20m",
        layoverLocation: "Kuala Lumpur",
        basePrice: 965,
      },
      {
        airline: "Scoot",
        flightNumber: `TR409 + VN1289`,
        departureTime: "14:20",
        arrivalTime: "22:15",
        duration: "7h 55m",
        stops: "1 stop in SIN",
        layoverDuration: "2h 45m",
        layoverLocation: "Singapore",
        basePrice: 1025,
      },
      {
        airline: "Jetstar Asia",
        flightNumber: `3K582 + VN1678`,
        departureTime: "12:30",
        arrivalTime: "21:45",
        duration: "9h 15m",
        stops: "1 stop in SIN",
        layoverDuration: "3h 50m",
        layoverLocation: "Singapore",
        basePrice: 1135,
      },
    ];

    return flightTemplates.map((template, index) => {
      // Add some price variation
      const priceVariation = 0.9 + (Math.random() * 0.2); // 90-110% of base price
      const basePriceMYR = template.basePrice * priceVariation;
      
      // Convert to target currency
      const finalPrice = currency === "MYR" ? basePriceMYR : 
        this.convertCurrency(basePriceMYR, "MYR", currency);

      return {
        id: randomUUID(),
        airline: template.airline,
        flightNumber: template.flightNumber,
        origin,
        destination,
        departureTime: template.departureTime,
        arrivalTime: template.arrivalTime,
        departureDate: date,
        arrivalDate: date,
        duration: template.duration,
        stops: template.stops,
        layoverDuration: template.layoverDuration,
        layoverLocation: template.layoverLocation,
        price: Math.round(finalPrice).toString(),
        currency,
      };
    }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  async getFlight(id: string): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async searchHotels(city: string, checkIn: string, checkOut: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values())
      .filter(hotel => hotel.city === city)
      .sort((a, b) => parseFloat(a.pricePerNight) - parseFloat(b.pricePerNight));
  }

  async searchHotelsByDestination(destination: string, checkIn: string, checkOut: string, travelers: number, currency = "MYR"): Promise<HotelSearchResponse> {
    // Map destinations to their associated cities
    const destinationToCitiesMap: Record<string, string[]> = {
      "Vietnam": ["Hoi An", "Da Nang"],
      "Hoi An": ["Hoi An"],
      "Da Nang": ["Da Nang"],
      // Add more destination mappings as needed
    };

    const targetCities = destinationToCitiesMap[destination] || [destination];
    
    const hotels = Array.from(this.hotels.values())
      .filter(hotel => targetCities.includes(hotel.city))
      .map(hotel => {
        // Apply currency conversion if needed (for now, assume all prices are in MYR)
        // In a real app, you'd apply actual currency conversion here
        return {
          ...hotel,
          currency: currency,
        };
      })
      .sort((a, b) => parseFloat(a.pricePerNight) - parseFloat(b.pricePerNight));

    return {
      hotels,
      searchCriteria: {
        destination,
        checkIn,
        checkOut,
        travelers,
        currency,
      },
    };
  }

  async getHotel(id: string): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async getRestaurantsByCity(city: string, cuisine?: string): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values())
      .filter(restaurant => 
        restaurant.city === city && 
        (!cuisine || restaurant.cuisine === cuisine)
      );
  }

  async getActivitiesByCity(city: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.city === city);
  }

  async getActivity(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getTransportationOptions(from: string, to: string): Promise<Transportation[]> {
    return Array.from(this.transportation.values())
      .filter(transport => 
        transport.from.includes(from) && transport.to.includes(to)
      )
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  async createItinerary(insertItinerary: InsertItinerary): Promise<Itinerary> {
    const id = randomUUID();
    const itinerary: Itinerary = { 
      ...insertItinerary, 
      description: insertItinerary.description || null,
      currency: insertItinerary.currency || "USD",
      totalCost: insertItinerary.totalCost || null,
      selectedFlightId: insertItinerary.selectedFlightId || null,
      selectedHotelIds: insertItinerary.selectedHotelIds || null,
      selectedActivityIds: insertItinerary.selectedActivityIds || null,
      id,
      createdAt: new Date()
    };
    this.itineraries.set(id, itinerary);
    return itinerary;
  }

  async getItinerary(id: string): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  // Exchange rates relative to MYR (Malaysian Ringgit) - same as frontend
  private static readonly EXCHANGE_RATES: Record<string, number> = {
    MYR: 1.0,      // Base currency
    INR: 18.5,     // 1 MYR = 18.5 INR
    USD: 0.21,     // 1 MYR = 0.21 USD
    SGD: 0.29,     // 1 MYR = 0.29 SGD
    VND: 5250,     // 1 MYR = 5250 VND
  };

  private convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // Convert to MYR first (base currency)
    const amountInMYR = amount / MemStorage.EXCHANGE_RATES[fromCurrency];
    
    // Convert from MYR to target currency
    const convertedAmount = amountInMYR * MemStorage.EXCHANGE_RATES[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  async getBestDates(destination: string, month1: string, month2: string, travelers: number, currency = "MYR"): Promise<BestDatesResponse> {
    // Generate destination-specific data based on input
    const destinationMap = {
      "hoi-an-da-nang": { cities: ["Hoi An", "Da Nang"], origin: "PEN", dest: "DAD" },
      "hanoi-halong": { cities: ["Hanoi"], origin: "PEN", dest: "HAN" },
      "ho-chi-minh": { cities: ["Ho Chi Minh City"], origin: "PEN", dest: "SGN" },
      "phu-quoc": { cities: ["Phu Quoc"], origin: "PEN", dest: "PQC" },
    };

    const destInfo = destinationMap[destination as keyof typeof destinationMap] || destinationMap["hoi-an-da-nang"];
    
    // Parse the month inputs (format: "2025-10")
    const parseMonth = (monthStr: string) => {
      const [year, month] = monthStr.split('-');
      return { year: parseInt(year), month: parseInt(month) };
    };

    const month1Info = parseMonth(month1);
    const month2Info = parseMonth(month2);
    
    // Generate date ranges for both months (6-day trips, 5 nights)
    const dateRanges: DateRangeResult[] = [];
    const tripDuration = 6;
    const nights = 5;

    // Helper function to generate dates in a month
    const generateDatesForMonth = (year: number, month: number) => {
      const datesInMonth: Date[] = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Generate possible start dates (avoid last few days of month)
      for (let day = 1; day <= Math.min(daysInMonth - tripDuration, 25); day++) {
        datesInMonth.push(new Date(year, month - 1, day));
      }
      return datesInMonth;
    };

    const month1Dates = generateDatesForMonth(month1Info.year, month1Info.month);
    const month2Dates = generateDatesForMonth(month2Info.year, month2Info.month);

    // Get base flight and hotel prices
    const baseFlightPrice = 1045; // MYR - from sample data
    const baseHotelPrice = 150; // MYR per night - from sample data

    // Combine all possible dates from both months
    const allDates = [...month1Dates, ...month2Dates];
    
    allDates.forEach((startDate, index) => {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + tripDuration - 1);
      
      // Calculate seasonal pricing variations
      const month = startDate.getMonth() + 1;
      const isHighSeason = month >= 11 || month <= 3; // Nov-Mar is high season for Vietnam
      const isWeekend = startDate.getDay() === 0 || startDate.getDay() === 6;
      
      // Apply seasonal multipliers
      let flightMultiplier = isHighSeason ? 1.15 : 0.95;
      let hotelMultiplier = isHighSeason ? 1.2 : 0.9;
      
      // Weekend surcharge
      if (isWeekend) {
        flightMultiplier += 0.05;
        hotelMultiplier += 0.1;
      }
      
      // Random variation to simulate real pricing
      const randomVariation = 0.85 + (Math.random() * 0.3); // 85% to 115%
      flightMultiplier *= randomVariation;
      hotelMultiplier *= (0.9 + Math.random() * 0.2); // 90% to 110%

      // Calculate prices in MYR first
      const flightPriceMYR = Math.round(baseFlightPrice * flightMultiplier);
      const hotelPricePerNightMYR = Math.round(baseHotelPrice * hotelMultiplier);
      const hotelTotalPriceMYR = hotelPricePerNightMYR * nights;
      
      // Convert to target currency
      const flightPrice = currency === "MYR" ? flightPriceMYR : 
        Math.round(this.convertCurrency(flightPriceMYR, "MYR", currency));
      const hotelTotalPrice = currency === "MYR" ? hotelTotalPriceMYR : 
        Math.round(this.convertCurrency(hotelTotalPriceMYR, "MYR", currency));
      
      const pricePerPerson = flightPrice + hotelTotalPrice;
      const totalPrice = pricePerPerson * travelers;

      dateRanges.push({
        id: `range-${index}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: tripDuration,
        pricePerPerson,
        totalPrice,
        currency: currency,
        flightPrice,
        hotelPrice: hotelTotalPrice,
        savings: 0, // Will calculate after getting average
        isRecommended: false, // Will determine after sorting
        isDealOfTheDay: false, // Will determine after sorting
      });
    });

    // Calculate average price for savings calculation
    const averagePrice = Math.round(
      dateRanges.reduce((sum, range) => sum + range.pricePerPerson, 0) / dateRanges.length
    );

    // Update savings percentage and sort by price
    dateRanges.forEach(range => {
      const savings = Math.round(((averagePrice - range.pricePerPerson) / averagePrice) * 100);
      range.savings = Math.max(0, savings); // Only show positive savings
    });

    // Sort by price (cheapest first) and take top 8 results
    const sortedRanges = dateRanges
      .sort((a, b) => a.pricePerPerson - b.pricePerPerson)
      .slice(0, 8);

    // Mark best deals
    if (sortedRanges.length > 0) {
      sortedRanges[0].isDealOfTheDay = true;
      if (sortedRanges.length > 2) {
        sortedRanges[0].isRecommended = true;
        sortedRanges[1].isRecommended = true;
      }
    }

    return {
      results: sortedRanges,
      searchCriteria: {
        destination,
        month1,
        month2,
        travelers,
        currency: currency,
      },
      averagePrice,
      currency: currency,
    };
  }
}

export const storage = new MemStorage();
