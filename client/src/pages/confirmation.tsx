import { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plane, 
  Hotel, 
  CalendarDays,
  Download,
  Mail,
  Home,
  CreditCard
} from "lucide-react";

interface BookingConfirmation {
  id: string;
  paymentIntentId: string;
  destination: string;
  travelers: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'failed';
  createdAt: string;
  flightDetails: { total: number };
  hotelDetails: { total: number };
  activityDetails?: { total: number };
}

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get payment intent ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const redirectStatus = urlParams.get('redirect_status');

    if (!paymentIntentId) {
      setError('No payment information found');
      setLoading(false);
      return;
    }

    // Confirm payment with backend
    confirmPayment(paymentIntentId, redirectStatus);
  }, []);

  const confirmPayment = async (paymentIntentId: string, redirectStatus: string | null) => {
    try {
      setLoading(true);
      
      const response = await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId
      });

      const data = await response.json();

      if (data.success && data.booking) {
        setBooking(data.booking);
        toast({
          title: "Payment Confirmed! 🎉",
          description: `Your booking to ${data.booking.destination} has been confirmed!`,
        });
      } else {
        setError(data.message || 'Payment confirmation failed');
        toast({
          title: "Payment Issue",
          description: data.message || "There was an issue confirming your payment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError('Unable to confirm payment. Please contact support.');
      toast({
        title: "Confirmation Error",
        description: "Unable to confirm your payment. Please contact support if you were charged.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownloadItinerary = () => {
    toast({
      title: "Download Started",
      description: "Your itinerary is being prepared for download.",
    });
    // TODO: Implement PDF generation
  };

  const handleEmailItinerary = () => {
    toast({
      title: "Email Sent",
      description: "Your itinerary has been sent to your email address.",
    });
    // TODO: Implement email sending
  };

  const handleBackHome = () => {
    setLocation("/");
  };

  if (loading) {
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
            </div>
          </div>
        </nav>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-2">Confirming Your Payment</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your booking...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
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
            </div>
          </div>
        </nav>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-medium mb-2">Payment Confirmation Issue</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {error || "We couldn't find your payment information."}
              </p>
              <div className="flex space-x-4">
                <Button onClick={handleBackHome} data-testid="button-back-home">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "mailto:support@dobhal.com"}>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const duration = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24));

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
              onClick={handleBackHome}
              className="flex items-center space-x-2"
              data-testid="button-back-home"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <div className="mb-8">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h1 className="text-3xl font-bold mb-2 text-green-800 dark:text-green-200">
                  Booking Confirmed! 🎉
                </h1>
                <p className="text-green-700 dark:text-green-300">
                  Your trip to {booking.destination} has been successfully booked
                </p>
                <Badge variant="secondary" className="mt-2">
                  Booking ID: {booking.id}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Trip Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Destination</span>
                    </div>
                    <p className="text-lg" data-testid="text-destination">{booking.destination}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Travelers</span>
                    </div>
                    <p className="text-lg" data-testid="text-travelers">{booking.travelers} travelers</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Departure</span>
                    </div>
                    <p className="text-lg" data-testid="text-departure-date">{formatDate(booking.startDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Return</span>
                    </div>
                    <p className="text-lg" data-testid="text-return-date">{formatDate(booking.endDate)}</p>
                  </div>
                </div>

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center space-x-1">
                        <Plane className="h-3 w-3" />
                        <span>Flights</span>
                      </span>
                      <span data-testid="text-flights-total">
                        {formatCurrency(booking.flightDetails.total, booking.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center space-x-1">
                        <Hotel className="h-3 w-3" />
                        <span>Hotels ({duration} nights)</span>
                      </span>
                      <span data-testid="text-hotels-total">
                        {formatCurrency(booking.hotelDetails.total, booking.currency)}
                      </span>
                    </div>
                    {booking.activityDetails && booking.activityDetails.total > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center space-x-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Activities</span>
                        </span>
                        <span data-testid="text-activities-total">
                          {formatCurrency(booking.activityDetails.total, booking.currency)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total Paid</span>
                      <span data-testid="text-total-paid">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono text-sm" data-testid="text-payment-id">{booking.paymentIntentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Booking Date:</span>
                  <span data-testid="text-booking-date">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions - Right Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Manage your booking and prepare for your trip
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={handleDownloadItinerary}
                  data-testid="button-download-itinerary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Itinerary
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleEmailItinerary}
                  data-testid="button-email-itinerary"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Itinerary
                </Button>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✅ Confirmation email sent</p>
                  <p>✅ Flight tickets will arrive separately</p>
                  <p>✅ Hotel confirmation included</p>
                  <p>📞 24/7 support available</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "mailto:support@dobhal.com"}
                  data-testid="button-contact-support"
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}