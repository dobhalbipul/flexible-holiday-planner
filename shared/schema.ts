import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const flights = pgTable("flights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airline: text("airline").notNull(),
  flightNumber: text("flight_number").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureDate: text("departure_date").notNull(),
  arrivalDate: text("arrival_date").notNull(),
  duration: text("duration").notNull(),
  stops: text("stops").notNull(),
  layoverDuration: text("layover_duration"),
  layoverLocation: text("layover_location"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MYR"),
});

export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MYR"),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  reviewCount: integer("review_count").notNull(),
  distanceToBeach: text("distance_to_beach"),
  distanceToLandmark: text("distance_to_landmark"),
  amenities: text("amenities").array().notNull(),
  imageUrl: text("image_url"),
});

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  city: text("city").notNull(),
  location: text("location").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  priceRange: text("price_range").notNull(),
  specialties: text("specialties").notNull(),
  openingHours: text("opening_hours").notNull(),
  servingTimes: text("serving_times").array().notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  city: text("city").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

export const itineraries = pgTable("itineraries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  destination: text("destination").notNull(),
  duration: integer("duration").notNull(),
  travelers: integer("travelers").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("MYR"),
  days: jsonb("days").notNull(),
  selectedFlightId: varchar("selected_flight_id"),
  selectedHotelIds: text("selected_hotel_ids").array(),
  selectedActivityIds: text("selected_activity_ids").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transportation = pgTable("transportation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  duration: text("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  description: text("description"),
});

export const bestDateRanges = pgTable("best_date_ranges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  tripLength: integer("trip_length").notNull(),
  currency: text("currency").notNull().default("MYR"),
  pricePerPerson: decimal("price_per_person", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  createdAt: true,
});

export const insertTransportationSchema = createInsertSchema(transportation).omit({
  id: true,
});

export const insertBestDateRangeSchema = createInsertSchema(bestDateRanges).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Flight = typeof flights.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Itinerary = typeof itineraries.$inferSelect;
export type Transportation = typeof transportation.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type InsertTransportation = z.infer<typeof insertTransportationSchema>;
export type BestDateRange = typeof bestDateRanges.$inferSelect;
export type InsertBestDateRange = z.infer<typeof insertBestDateRangeSchema>;

// Best dates search request schema
export const bestDatesSearchSchema = z.object({
  destination: z.string(),
  month1: z.string(),
  month2: z.string(),
  travelers: z.number().min(1).max(8),
  currency: z.enum(["MYR", "INR", "USD", "SGD", "VND"]).optional().default("MYR"),
});

export type BestDatesSearchRequest = z.infer<typeof bestDatesSearchSchema>;

// Flight search request schema
export const flightSearchSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().min(1).max(8),
  currency: z.enum(["MYR", "INR", "USD", "SGD", "VND"]).optional().default("MYR"),
});

export type FlightSearchRequest = z.infer<typeof flightSearchSchema>;

// Hotel search request schema
export const hotelSearchSchema = z.object({
  destination: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  travelers: z.number().min(1).max(8),
  currency: z.enum(["MYR", "INR", "USD", "SGD", "VND"]).optional().default("MYR"),
});

export type HotelSearchRequest = z.infer<typeof hotelSearchSchema>;

// Hotel search response
export interface HotelSearchResponse {
  hotels: Hotel[];
  searchCriteria: {
    destination: string;
    checkIn: string;
    checkOut: string;
    travelers: number;
    currency: string;
  };
}

// Flight search response
export interface FlightSearchResponse {
  outboundFlights: Flight[];
  returnFlights: Flight[];
  searchCriteria: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    currency: string;
  };
}

// Date range result for API response
export interface DateRangeResult {
  id: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  pricePerPerson: number;
  totalPrice: number;
  currency: string;
  flightPrice: number;
  hotelPrice: number;
  savings: number; // percentage savings vs average
  isRecommended: boolean;
  isDealOfTheDay: boolean;
}

// Best dates API response
export interface BestDatesResponse {
  results: DateRangeResult[];
  searchCriteria: {
    destination: string;
    month1: string;
    month2: string;
    travelers: number;
    currency: string;
  };
  averagePrice: number;
  currency: string;
}

// Supported currencies for payment processing
export const supportedCurrencies = ["MYR", "INR", "USD", "SGD", "VND"] as const;
export type SupportedCurrency = typeof supportedCurrencies[number];

// Secure payment request schema - NO client-supplied amounts!
export const securePaymentRequestSchema = z.object({
  // Server will calculate these from booking data - never trust client amounts
  bookingDetails: z.object({
    destination: z.string().min(1),
    travelers: z.number().min(1).max(8),
    dates: z.object({
      startDate: z.string(),
      endDate: z.string(),
      duration: z.number().min(1)
    }),
    flights: z.object({
      outbound: z.object({
        id: z.string(),
        price: z.number().positive(),
        currency: z.enum(supportedCurrencies)
      }),
      return: z.object({
        id: z.string(),
        price: z.number().positive(), 
        currency: z.enum(supportedCurrencies)
      }).optional(),
      totalPrice: z.number().positive(),
      currency: z.enum(supportedCurrencies)
    }),
    hotels: z.object({
      selectedHotels: z.array(z.object({
        id: z.string(),
        pricePerNight: z.number().positive(),
        nights: z.number().positive(),
        totalPrice: z.number().positive(),
        currency: z.enum(supportedCurrencies)
      })),
      totalPrice: z.number().positive(),
      currency: z.enum(supportedCurrencies)
    }),
    itinerary: z.object({
      selectedActivities: z.array(z.object({
        id: z.string(),
        price: z.number().positive(),
        currency: z.enum(supportedCurrencies)
      })),
      totalActivityCost: z.number().min(0),
      currency: z.enum(supportedCurrencies)
    }).optional()
  }),
  // Idempotency key to prevent duplicate payments
  idempotencyKey: z.string().min(1)
});

export type SecurePaymentRequest = z.infer<typeof securePaymentRequestSchema>;

// Booking confirmation schema for post-payment persistence
export const bookingConfirmationSchema = z.object({
  id: z.string(),
  paymentIntentId: z.string(),
  destination: z.string(),
  travelers: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  totalAmount: z.number(),
  currency: z.enum(supportedCurrencies),
  flightDetails: z.any(),
  hotelDetails: z.any(),
  activityDetails: z.any().optional(),
  status: z.enum(["confirmed", "pending", "failed"]),
  createdAt: z.string()
});

export type BookingConfirmation = z.infer<typeof bookingConfirmationSchema>;
