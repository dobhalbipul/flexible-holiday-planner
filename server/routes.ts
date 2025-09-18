import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { bestDatesSearchSchema, flightSearchSchema } from "@shared/schema";

const legacyFlightSearchSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
});

const hotelSearchSchema = z.object({
  city: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
});

const restaurantSearchSchema = z.object({
  city: z.string(),
  cuisine: z.string().optional(),
});

const transportationSearchSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced flight search with dates
  app.get("/api/flights", async (req, res) => {
    try {
      const { destination, startDate, endDate, travelers, currency } = req.query;
      
      const validatedParams = flightSearchSchema.parse({
        destination,
        startDate,
        endDate,
        travelers: parseInt(travelers as string),
        currency: currency || "MYR"
      });
      
      const flights = await storage.searchFlightsByDates(
        validatedParams.destination,
        validatedParams.startDate,
        validatedParams.endDate,
        validatedParams.travelers,
        validatedParams.currency
      );
      
      res.json(flights);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to search flights" });
    }
  });

  // Legacy flight search (keep for backward compatibility)
  app.get("/api/flights/search/:origin/:destination/:departureDate", async (req, res) => {
    try {
      const { origin, destination, departureDate } = req.params;
      const flights = await storage.searchFlights(origin, destination, departureDate);
      res.json(flights);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Hotel search
  app.get("/api/hotels/search/:city/:checkIn/:checkOut", async (req, res) => {
    try {
      const { city, checkIn, checkOut } = req.params;
      const hotels = await storage.searchHotels(city, checkIn, checkOut);
      res.json(hotels);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Restaurant search
  app.get("/api/restaurants/:city/:cuisine", async (req, res) => {
    try {
      const { city, cuisine } = req.params;
      const restaurants = await storage.getRestaurantsByCity(city, cuisine);
      res.json(restaurants);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Activities by city
  app.get("/api/activities/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const activities = await storage.getActivitiesByCity(city);
      res.json(activities);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Transportation options
  app.get("/api/transportation/:from/:to", async (req, res) => {
    try {
      const { from, to } = req.params;
      const transportation = await storage.getTransportationOptions(from, to);
      res.json(transportation);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Best dates search
  app.get("/api/best-dates", async (req, res) => {
    try {
      const { destination, month1, month2, travelers, currency } = req.query;
      
      // Validate query parameters
      const validatedParams = bestDatesSearchSchema.parse({
        destination,
        month1,
        month2,
        travelers: parseInt(travelers as string),
        currency: currency || "MYR"
      });
      
      const bestDates = await storage.getBestDates(
        validatedParams.destination,
        validatedParams.month1,
        validatedParams.month2,
        validatedParams.travelers,
        validatedParams.currency
      );
      
      res.json(bestDates);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to search best dates" });
    }
  });

  // Create itinerary
  app.post("/api/itineraries", async (req, res) => {
    try {
      const itinerary = await storage.createItinerary(req.body);
      res.json(itinerary);
    } catch (error) {
      res.status(400).json({ message: "Invalid itinerary data" });
    }
  });

  // Get itinerary
  app.get("/api/itineraries/:id", async (req, res) => {
    try {
      const itinerary = await storage.getItinerary(req.params.id);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      res.status(400).json({ message: "Invalid itinerary ID" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
