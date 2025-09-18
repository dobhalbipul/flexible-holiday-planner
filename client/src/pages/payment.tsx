import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { useBooking } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Hotel, CalendarDays, DollarSign, CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Generate idempotency key to prevent duplicate payments
const generateIdempotencyKey = () => {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const PaymentForm = ({ totalAmount, currency }: { totalAmount: number; currency: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed! Redirecting to confirmation...",
        });
        // Navigate to confirmation page (to be built in next task)
        setLocation('/confirmation');
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'VND' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Details</span>
        </CardTitle>
        <CardDescription>
          Enter your payment information to complete your booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment total */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-primary" data-testid="text-payment-total">
                {formatCurrency(totalAmount, currency)}
              </span>
            </div>
          </div>

          {/* Stripe Payment Element */}
          <div className="border border-border rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!stripe || !elements || isProcessing}
            data-testid="button-complete-payment"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Payment - {formatCurrency(totalAmount, currency)}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CheckCircle className="h-3 w-3" />
              <span>Secured by Stripe</span>
            </div>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Payment() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { 
    searchCriteria, 
    selectedDates, 
    selectedFlights, 
    selectedHotels, 
    selectedItinerary 
  } = useBooking();

  const handleBackToSummary = () => {
    setLocation("/summary");
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'VND' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTotalCost = () => {
    const flightCost = selectedFlights?.totalPrice || 0;
    const hotelCost = selectedHotels?.totalPrice || 0;
    const activityCost = selectedItinerary?.totalActivityCost || 0;
    return flightCost + hotelCost + activityCost;
  };

  const getPaymentCurrency = () => {
    return selectedFlights?.currency || selectedHotels?.currency || searchCriteria?.currency || "USD";
  };

  // Create SECURE PaymentIntent when component loads - NO client amounts!
  useEffect(() => {
    if (!searchCriteria || !selectedDates || !selectedFlights || !selectedHotels) {
      setLocation("/summary");
      return;
    }

    // SECURITY FIX: Use secure API that calculates amounts server-side
    const idempotencyKey = generateIdempotencyKey();
    
    // SECURITY: Send ONLY booking details - server calculates amounts securely
    apiRequest("POST", "/api/create-payment-intent", { 
      bookingDetails: {
        destination: searchCriteria.destination,
        travelers: searchCriteria.travelers,
        dates: {
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate,
          duration: selectedDates.duration
        },
        flights: {
          outbound: selectedFlights.outbound ? {
            id: selectedFlights.outbound.id,
            price: selectedFlights.outbound.price,
            currency: selectedFlights.outbound.currency
          } : {
            id: 'outbound-flight',
            price: selectedFlights.totalPrice / 2,
            currency: selectedFlights.currency
          },
          return: selectedFlights.return ? {
            id: selectedFlights.return.id,
            price: selectedFlights.return.price,
            currency: selectedFlights.return.currency
          } : undefined,
          totalPrice: selectedFlights.totalPrice,
          currency: selectedFlights.currency
        },
        hotels: {
          selectedHotels: Array.isArray(selectedHotels.hotels) ? selectedHotels.hotels.map((hotel: any) => ({
            id: hotel.id,
            pricePerNight: hotel.pricePerNight,
            nights: hotel.nights || selectedDates.duration,
            totalPrice: hotel.totalPrice || (hotel.pricePerNight * selectedDates.duration),
            currency: hotel.currency
          })) : [{
            id: 'selected-hotel',
            pricePerNight: selectedHotels.totalPrice / selectedDates.duration,
            nights: selectedDates.duration,
            totalPrice: selectedHotels.totalPrice,
            currency: selectedHotels.currency
          }],
          totalPrice: selectedHotels.totalPrice,
          currency: selectedHotels.currency
        },
        itinerary: selectedItinerary ? {
          selectedActivities: Array.isArray((selectedItinerary as any).activities) ? (selectedItinerary as any).activities.map((activity: any) => ({
            id: activity.id,
            price: activity.price,
            currency: activity.currency
          })) : [],
          totalActivityCost: selectedItinerary.totalActivityCost,
          currency: selectedItinerary.currency
        } : undefined
      },
      idempotencyKey: idempotencyKey
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Payment initialization failed');
        }
        const data = await response.json();
        setClientSecret(data.clientSecret);
        
        // Log server-calculated amount for transparency (but never trust client calculation)
        if (data.calculatedAmount) {
          console.log('Server calculated secure amount:', data.calculatedAmount, data.currency);
        }
      })
      .catch((error) => {
        console.error("Error creating secure payment intent:", error);
        setPaymentError(error.message || "Failed to initialize secure payment. Please try again.");
      });
  }, [searchCriteria, selectedDates, selectedFlights, selectedHotels, selectedItinerary, setLocation]);

  // Redirect if booking data is incomplete
  if (!searchCriteria || !selectedDates || !selectedFlights || !selectedHotels) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Incomplete Booking</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please complete your itinerary planning first.
            </p>
            <Button onClick={() => setLocation("/summary")} data-testid="button-back-to-summary">
              Back to Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if payment initialization failed
  if (paymentError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-medium mb-2">Payment Error</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {paymentError}
            </p>
            <Button onClick={handleBackToSummary} data-testid="button-back-to-summary">
              Back to Summary
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while initializing payment
  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation Header */}
        <nav className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-foreground">Dobhal Holiday Planner</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleBackToSummary}
                className="flex items-center space-x-2"
                data-testid="button-back-to-summary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Summary</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Initializing Payment</h3>
              <p className="text-sm text-muted-foreground">
                Setting up secure payment processing...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalCost();
  const currency = getPaymentCurrency();

  // Main payment page content
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">Dobhal Holiday Planner</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleBackToSummary}
              className="flex items-center space-x-2"
              data-testid="button-back-to-summary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Summary</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
          <p className="text-muted-foreground">
            Final step - secure payment for your {selectedDates.duration}-day trip to {searchCriteria.destination}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Overview */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{searchCriteria.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <div>{formatDate(selectedDates.startDate)}</div>
                      <div className="text-muted-foreground">to {formatDate(selectedDates.endDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">{searchCriteria.travelers} travelers</span>
                  </div>
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center space-x-1">
                        <Plane className="h-3 w-3" />
                        <span>Flights</span>
                      </span>
                      <span data-testid="text-flights-cost-breakdown">
                        {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center space-x-1">
                        <Hotel className="h-3 w-3" />
                        <span>Hotels</span>
                      </span>
                      <span data-testid="text-hotels-cost-breakdown">
                        {formatCurrency(selectedHotels.totalPrice, selectedHotels.currency)}
                      </span>
                    </div>
                    {selectedItinerary && selectedItinerary.totalActivityCost > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Activities</span>
                        </span>
                        <span data-testid="text-activities-cost-breakdown">
                          {formatCurrency(selectedItinerary.totalActivityCost, selectedItinerary.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span data-testid="text-total-cost-breakdown">
                      {formatCurrency(totalAmount, currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form - Right Column */}
          <div className="lg:col-span-2">
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                  }
                }
              }}
            >
              <PaymentForm totalAmount={totalAmount} currency={currency} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}