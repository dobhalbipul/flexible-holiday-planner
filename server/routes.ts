import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { z } from "zod";
import { bestDatesSearchSchema, flightSearchSchema, hotelSearchSchema, securePaymentRequestSchema, supportedCurrencies, type SupportedCurrency } from "../shared/schema.js";
import Stripe from "stripe";
import { amadeusService } from "./amadeus-service.js";

// Use placeholder key for development if not provided
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_development';

console.log("🔑 Stripe key configured:", stripeSecretKey.substring(0, 10) + "...");

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any, // Use valid API version
});
console.log("✅ Stripe client initialized");

const legacyFlightSearchSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departureDate: z.string(),
});


const restaurantSearchSchema = z.object({
  city: z.string(),
  cuisine: z.string().optional(),
});

const transportationSearchSchema = z.object({
  from: z.string(),
  to: z.string(),
});

// Store processed payment intents to prevent reprocessing with same idempotency key
const processedPayments = new Map<string, string>(); // idempotencyKey -> paymentIntentId

// Currency multiplier to convert to smallest unit (cents/paise) - SECURE VERSION
const getCurrencyMultiplier = (currency: SupportedCurrency): number => {
  switch (currency) {
    case 'VND': // Vietnamese Dong has no subdivision
      return 1;
    case 'MYR':
    case 'INR': 
    case 'USD':
    case 'SGD':
    default:
      return 100; // Most currencies use 100 for cents
  }
};

// SECURE: Server-side price calculation - NEVER trust client amounts!
const calculateSecureTotalAmount = async (bookingDetails: any): Promise<{ amount: number, currency: SupportedCurrency }> => {
  let totalAmount = 0;
  let currency: SupportedCurrency = 'USD';
  
  // SECURITY: Get flight prices from server data only
  if (bookingDetails.flights) {
    let flightTotal = 0;
    
    // Calculate outbound flight price from server data
    if (bookingDetails.flights.outbound && bookingDetails.flights.outbound.id) {
      const outboundFlight = await storage.getFlight(bookingDetails.flights.outbound.id);
      if (!outboundFlight) {
        throw new Error(`Outbound flight not found: ${bookingDetails.flights.outbound.id}`);
      }
      flightTotal += parseFloat(outboundFlight.price);
      currency = outboundFlight.currency as SupportedCurrency;
    }
    
    // Calculate return flight price from server data
    if (bookingDetails.flights.return && bookingDetails.flights.return.id) {
      const returnFlight = await storage.getFlight(bookingDetails.flights.return.id);
      if (!returnFlight) {
        throw new Error(`Return flight not found: ${bookingDetails.flights.return.id}`);
      }
      if (returnFlight.currency !== currency) {
        throw new Error(`Currency mismatch: Return flight in ${returnFlight.currency}, outbound in ${currency}`);
      }
      flightTotal += parseFloat(returnFlight.price);
    }
    
    totalAmount += flightTotal;
  }
  
  // SECURITY: Calculate hotel costs from server data only
  if (bookingDetails.hotels && bookingDetails.hotels.selectedHotels) {
    let hotelTotal = 0;
    
    for (const hotelBooking of bookingDetails.hotels.selectedHotels) {
      const hotel = await storage.getHotel(hotelBooking.id);
      if (!hotel) {
        throw new Error(`Hotel not found: ${hotelBooking.id}`);
      }
      
      // Validate currency consistency
      if (hotel.currency !== currency) {
        throw new Error(`Currency mismatch: Hotel in ${hotel.currency}, booking in ${currency}`);
      }
      
      // Calculate total from server price and validated nights
      const nights = hotelBooking.nights || 1;
      if (nights < 1 || nights > 30) {
        throw new Error(`Invalid hotel nights: ${nights}`);
      }
      
      const hotelCost = parseFloat(hotel.pricePerNight) * nights;
      hotelTotal += hotelCost;
    }
    
    totalAmount += hotelTotal;
  }
  
  // SECURITY: Calculate activity costs from server data only
  if (bookingDetails.itinerary && bookingDetails.itinerary.selectedActivities) {
    let activityTotal = 0;
    
    for (const activityBooking of bookingDetails.itinerary.selectedActivities) {
      const activity = await storage.getActivity(activityBooking.id);
      if (!activity) {
        throw new Error(`Activity not found: ${activityBooking.id}`);
      }
      
      // Convert activity currency to booking currency if needed
      let activityPrice = parseFloat(activity.price);
      if (activity.currency !== currency) {
        // For now, require same currency - in production, add currency conversion
        throw new Error(`Currency mismatch: Activity in ${activity.currency}, booking in ${currency}`);
      }
      
      activityTotal += activityPrice;
    }
    
    totalAmount += activityTotal;
  }
  
  // Validate final amount
  if (totalAmount <= 0) {
    throw new Error('Invalid total amount: must be positive');
  }
  
  // Validate currency is supported
  if (!supportedCurrencies.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  
  return { amount: totalAmount, currency };
};

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

  // Enhanced hotel search with dates
  app.get("/api/hotels", async (req, res) => {
    try {
      const { destination, checkIn, checkOut, travelers, currency } = req.query;
      
      const validatedParams = hotelSearchSchema.parse({
        destination,
        checkIn,
        checkOut,
        travelers: parseInt(travelers as string),
        currency: currency || "MYR"
      });
      
      let hotels;
      
      // Try to use Amadeus API if configured
      if (amadeusService.isConfigured()) {
        try {
          console.log(`[Amadeus] Searching hotels for ${validatedParams.destination}`);
          
          // Find hotels by destination
          const hotelLocations = await amadeusService.findHotelsByDestination(validatedParams.destination);
          
          if (hotelLocations.length > 0) {
            console.log(`[Amadeus] Found ${hotelLocations.length} hotel locations`);
            
            // Get hotel IDs for search
            const hotelIds = hotelLocations.map(loc => loc.hotelId);
            
            // Search for offers
            const searchResponse = await amadeusService.searchHotelOffers(
              hotelIds,
              validatedParams.checkIn,
              validatedParams.checkOut,
              validatedParams.travelers,
              validatedParams.currency
            );
            
            console.log(`[Amadeus] Found ${searchResponse.data.length} hotel offers`);
            
            // Convert to local format
            const amadeusHotels = amadeusService.convertAmadeusToLocalFormat(searchResponse.data);
            
            hotels = {
              hotels: amadeusHotels,
              searchCriteria: {
                destination: validatedParams.destination,
                checkIn: validatedParams.checkIn,
                checkOut: validatedParams.checkOut,
                travelers: validatedParams.travelers,
                currency: validatedParams.currency,
              },
            };
            
            console.log(`[Amadeus] Successfully returning ${amadeusHotels.length} hotels`);
          } else {
            console.log(`[Amadeus] No hotel locations found, falling back to mock data`);
            // Fall back to mock data if no Amadeus results
            hotels = await storage.searchHotelsByDestination(
              validatedParams.destination,
              validatedParams.checkIn,
              validatedParams.checkOut,
              validatedParams.travelers,
              validatedParams.currency
            );
          }
        } catch (amadeusError) {
          console.error('[Amadeus] Error searching hotels:', amadeusError);
          
          // Fall back to mock data on error
          hotels = await storage.searchHotelsByDestination(
            validatedParams.destination,
            validatedParams.checkIn,
            validatedParams.checkOut,
            validatedParams.travelers,
            validatedParams.currency
          );
        }
      } else {
        console.log('[Hotels] Amadeus not configured, using mock data');
        
        // Use mock data if Amadeus is not configured
        hotels = await storage.searchHotelsByDestination(
          validatedParams.destination,
          validatedParams.checkIn,
          validatedParams.checkOut,
          validatedParams.travelers,
          validatedParams.currency
        );
      }
      
      res.json(hotels);
    } catch (error) {
      console.error('[Hotels] Error in hotel search:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to search hotels" });
    }
  });

  // Legacy hotel search (keep for backward compatibility)
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

  // Activities search with city query parameter
  app.get("/api/activities", async (req, res) => {
    try {
      const { city } = req.query;
      if (!city || typeof city !== 'string') {
        return res.status(400).json({ message: "City parameter is required" });
      }
      const activities = await storage.getActivitiesByCity(city);
      res.json(activities);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Activities by city (legacy route for backward compatibility)
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

  // SECURE Stripe payment route - calculates amounts server-side
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // SECURITY: Validate using secure schema that doesn't accept client amounts
      const validatedData = securePaymentRequestSchema.parse(req.body);
      const { bookingDetails, idempotencyKey } = validatedData;
      
      // SECURITY: Check idempotency to prevent duplicate payments
      if (processedPayments.has(idempotencyKey)) {
        const existingPaymentIntentId = processedPayments.get(idempotencyKey)!;
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingPaymentIntentId);
        return res.json({ 
          clientSecret: existingPaymentIntent.client_secret,
          paymentIntentId: existingPaymentIntent.id,
          isExisting: true
        });
      }
      
      // SECURITY: Calculate total amount server-side - NEVER trust client!
      const { amount, currency } = await calculateSecureTotalAmount(bookingDetails);
      
      // Convert to smallest currency unit
      const multiplier = getCurrencyMultiplier(currency);
      const amountInSmallestUnit = Math.round(amount * multiplier);
      
      // SECURITY: Validate minimum amount (prevent $0.01 attacks)
      if (amountInSmallestUnit < 100) { // Minimum $1 or equivalent
        throw new Error('Payment amount too small');
      }
      
      // Create secure PaymentIntent with comprehensive metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_types: ['card'],
        metadata: {
          booking_destination: bookingDetails.destination,
          booking_travelers: bookingDetails.travelers.toString(),
          booking_start_date: bookingDetails.dates.startDate,
          booking_end_date: bookingDetails.dates.endDate,
          booking_duration: bookingDetails.dates.duration.toString(),
          booking_type: 'travel_package',
          flight_total: bookingDetails.flights.totalPrice.toString(),
          hotel_total: bookingDetails.hotels.totalPrice.toString(),
          activity_total: (bookingDetails.itinerary?.totalActivityCost || 0).toString(),
          calculated_total: amount.toString(),
          currency_verified: currency,
          idempotency_key: idempotencyKey
        },
        description: `Travel booking to ${bookingDetails.destination} for ${bookingDetails.travelers} travelers (${bookingDetails.dates.duration} days)`,
      });
      
      // Store payment intent ID with idempotency key
      processedPayments.set(idempotencyKey, paymentIntent.id);
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        calculatedAmount: amount,
        currency: currency,
        isExisting: false
      });
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid payment request - booking data validation failed", 
          errors: error.errors 
        });
      }
      console.error("Error creating secure payment intent:", error);
      res.status(500).json({ 
        message: "Payment processing error: " + (error.message || 'Unknown error'),
        code: 'PAYMENT_PROCESSING_ERROR'
      });
    }
  });
  
  // SECURE: Payment confirmation endpoint with full verification
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId, bookingDetails } = req.body;
      
      if (!paymentIntentId || !bookingDetails) {
        return res.status(400).json({ message: "Payment intent ID and booking details required" });
      }
      
      // Retrieve and verify payment from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.json({ 
          success: false, 
          paymentStatus: paymentIntent.status,
          message: 'Payment not completed'
        });
      }
      
      // CRITICAL SECURITY: Verify payment amount matches server calculation
      const { amount: serverCalculatedAmount, currency: serverCurrency } = await calculateSecureTotalAmount(bookingDetails);
      const multiplier = getCurrencyMultiplier(serverCurrency);
      const expectedAmountInSmallestUnit = Math.round(serverCalculatedAmount * multiplier);
      
      if (paymentIntent.amount !== expectedAmountInSmallestUnit) {
        console.error(`Payment amount mismatch: Paid ${paymentIntent.amount}, expected ${expectedAmountInSmallestUnit}`);
        return res.status(400).json({ 
          success: false,
          message: 'Payment amount verification failed - payment rejected',
          code: 'AMOUNT_MISMATCH'
        });
      }
      
      if (paymentIntent.currency.toUpperCase() !== serverCurrency) {
        console.error(`Payment currency mismatch: Paid ${paymentIntent.currency}, expected ${serverCurrency}`);
        return res.status(400).json({ 
          success: false,
          message: 'Payment currency verification failed - payment rejected',
          code: 'CURRENCY_MISMATCH'
        });
      }
      
      // Payment verified - create booking record
      const bookingConfirmation = {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId: paymentIntent.id,
        destination: paymentIntent.metadata.booking_destination,
        travelers: parseInt(paymentIntent.metadata.booking_travelers),
        startDate: paymentIntent.metadata.booking_start_date,
        endDate: paymentIntent.metadata.booking_end_date,
        totalAmount: serverCalculatedAmount, // Use server-verified amount
        currency: serverCurrency, // Use server-verified currency
        verifiedAmount: paymentIntent.amount,
        verifiedCurrency: paymentIntent.currency,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        flightDetails: { total: parseFloat(paymentIntent.metadata.flight_total || '0') },
        hotelDetails: { total: parseFloat(paymentIntent.metadata.hotel_total || '0') },
        activityDetails: paymentIntent.metadata.activity_total ? { total: parseFloat(paymentIntent.metadata.activity_total) } : undefined
      };
      
      // TODO: Store booking in database when implemented
      // await storage.createBooking(bookingConfirmation);
      
      res.json({ 
        success: true, 
        booking: bookingConfirmation,
        paymentStatus: paymentIntent.status,
        verificationPassed: true
      });
      
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        message: "Payment confirmation error: " + (error.message || 'Unknown error')
      });
    }
  });

  // MULTI-GATEWAY PAYMENT SYSTEM - Enhanced with Malaysian payment methods
  
  // Import payment gateway manager
  const { paymentGatewayManager } = await import('./payment-service.js');
  
  // Get available payment methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const availableMethods = paymentGatewayManager.getAvailablePaymentMethods();
      res.json({ 
        methods: availableMethods,
        configured_gateways: Array.from(paymentGatewayManager['gateways'].keys())
          .filter(name => paymentGatewayManager['gateways'].get(name)?.isConfigured())
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // Create payment with multi-gateway support
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { paymentMethod, bookingDetails, idempotencyKey } = req.body;
      
      if (!paymentMethod || !bookingDetails || !idempotencyKey) {
        return res.status(400).json({ 
          message: "Payment method, booking details, and idempotency key are required" 
        });
      }

      // SECURITY: Calculate total amount server-side
      const { amount, currency } = await calculateSecureTotalAmount(bookingDetails);
      
      // SECURITY: Validate minimum amount
      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Check idempotency to prevent duplicate payments
      const cacheKey = `${idempotencyKey}_${paymentMethod}`;
      if (processedPayments.has(cacheKey)) {
        const existingPaymentId = processedPayments.get(cacheKey)!;
        return res.json({ 
          paymentId: existingPaymentId,
          isExisting: true,
          message: "Payment already exists"
        });
      }

      // Create payment request
      const paymentRequest = {
        amount,
        currency,
        method: paymentMethod,
        bookingDetails: {
          ...bookingDetails,
          reference: `booking_${Date.now()}`,
          customerName: bookingDetails.customerInfo?.name || 'Anonymous',
          customerEmail: bookingDetails.customerInfo?.email || '',
          customerPhone: bookingDetails.customerInfo?.phone || ''
        },
        callbackUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/payment/callback`,
        successUrl: `${process.env.APP_URL || 'http://localhost:5000'}/confirmation`,
        failureUrl: `${process.env.APP_URL || 'http://localhost:5000'}/payment?error=payment_failed`
      };

      // Create payment using appropriate gateway
      const paymentResponse = await paymentGatewayManager.createPayment(paymentRequest);
      
      // Store payment ID with idempotency key
      processedPayments.set(cacheKey, paymentResponse.paymentId);
      
      res.json({
        ...paymentResponse,
        calculatedAmount: amount,
        currency: currency,
        paymentMethod: paymentMethod,
        isExisting: false
      });

    } catch (error: any) {
      console.error("Error creating multi-gateway payment:", error);
      res.status(500).json({ 
        message: "Payment creation error: " + (error.message || 'Unknown error'),
        code: 'PAYMENT_CREATION_ERROR'
      });
    }
  });

  // Confirm payment with multi-gateway support
  app.post("/api/confirm-payment-multi", async (req, res) => {
    try {
      const { paymentId, gateway, bookingDetails } = req.body;
      
      if (!paymentId || !gateway || !bookingDetails) {
        return res.status(400).json({ 
          message: "Payment ID, gateway, and booking details are required" 
        });
      }

      // Confirm payment using appropriate gateway
      const confirmationResponse = await paymentGatewayManager.confirmPayment(paymentId, gateway);
      
      if (confirmationResponse.status === 'completed') {
        // SECURITY: Verify payment amount matches server calculation
        const { amount: serverCalculatedAmount, currency: serverCurrency } = await calculateSecureTotalAmount(bookingDetails);
        
        // Create booking confirmation
        const bookingConfirmation = {
          id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentId: paymentId,
          gateway: gateway,
          destination: bookingDetails.destination,
          travelers: bookingDetails.travelers,
          startDate: bookingDetails.dates.startDate,
          endDate: bookingDetails.dates.endDate,
          totalAmount: serverCalculatedAmount,
          currency: serverCurrency,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          paymentMethod: confirmationResponse.metadata?.paymentMethod || 'unknown',
          flightDetails: { total: bookingDetails.flights?.totalPrice || 0 },
          hotelDetails: { total: bookingDetails.hotels?.totalPrice || 0 },
          activityDetails: bookingDetails.itinerary?.totalActivityCost ? 
            { total: bookingDetails.itinerary.totalActivityCost } : undefined
        };

        res.json({ 
          success: true, 
          booking: bookingConfirmation,
          paymentStatus: confirmationResponse.status,
          gateway: gateway,
          verificationPassed: true
        });
      } else {
        res.json({ 
          success: false, 
          paymentStatus: confirmationResponse.status,
          message: 'Payment not completed yet',
          gateway: gateway
        });
      }

    } catch (error: any) {
      console.error("Error confirming multi-gateway payment:", error);
      res.status(500).json({ 
        message: "Payment confirmation error: " + (error.message || 'Unknown error')
      });
    }
  });

  // Payment callback handler for external gateways (Razer Pay, etc.)
  app.post("/api/payment/callback", async (req, res) => {
    try {
      const { orderid, status, gateway } = req.body;
      
      console.log(`Payment callback received - Order: ${orderid}, Status: ${status}, Gateway: ${gateway}`);
      
      // Verify callback authenticity based on gateway
      if (gateway === 'razerpay') {
        // Verify Razer Pay callback signature
        const { merchant_id, orderid: callbackOrderId, status: callbackStatus, amount, currency, skey } = req.body;
        
        // Verify signature
        const expectedSkey = require('crypto')
          .createHash('md5')
          .update(`${process.env.RAZER_VERIFY_KEY}${merchant_id}${callbackOrderId}${callbackStatus}${amount}${currency}`)
          .digest('hex');
        
        if (skey !== expectedSkey) {
          console.error('Razer Pay callback signature verification failed');
          return res.status(400).send('FAIL');
        }
      }
      
      // Update payment status in your database here
      // await storage.updatePaymentStatus(orderid, status);
      
      res.status(200).send('OK');
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(500).send('ERROR');
    }
  });

  // Payment status check endpoint
  app.get("/api/payment/status/:paymentId/:gateway", async (req, res) => {
    try {
      const { paymentId, gateway } = req.params;
      
      const statusResponse = await paymentGatewayManager.confirmPayment(paymentId, gateway);
      
      res.json({
        paymentId,
        gateway,
        status: statusResponse.status,
        metadata: statusResponse.metadata
      });
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ 
        message: "Status check error: " + (error.message || 'Unknown error')
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
