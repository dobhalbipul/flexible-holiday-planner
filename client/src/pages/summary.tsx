import { useLocation } from "wouter";
import { useState } from "react";
import { useBooking } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Hotel, CheckCircle, CalendarDays, DollarSign, Edit2, CreditCard } from "lucide-react";

export default function Summary() {
  const [, setLocation] = useLocation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { 
    searchCriteria, 
    selectedDates, 
    selectedFlights, 
    selectedHotels, 
    selectedItinerary,
    clearSearchCriteria 
  } = useBooking();

  const handleBackToItinerary = () => {
    setLocation("/itinerary");
  };

  const handleStartOver = () => {
    clearSearchCriteria();
    setLocation("/");
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currencyMap: Record<string, string> = {
      'MYR': 'MYR',
      'INR': 'INR', 
      'USD': 'USD',
      'SGD': 'SGD',
      'VND': 'VND'
    };
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyMap[currencyCode] || 'USD',
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

  const getCostPerPerson = () => {
    const totalCost = getTotalCost();
    const travelers = searchCriteria?.travelers || 1;
    return totalCost / travelers;
  };

  const handleEditFlights = () => {
    setLocation("/flights");
  };

  const handleEditHotels = () => {
    setLocation("/hotels");
  };

  const handleEditItinerary = () => {
    setLocation("/itinerary");
  };

  const handleProceedToPayment = () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }
    // Navigate to payment page with all booking details preserved in context
    setLocation("/payment");
  };

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
            <Button onClick={handleStartOver} data-testid="button-start-over">
              Start New Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleBackToItinerary}
                className="flex items-center space-x-2"
                data-testid="button-back-to-itinerary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Itinerary</span>
              </Button>
              <Button 
                onClick={handleStartOver}
                data-testid="button-start-over"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-booking-complete-title">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Complete Trip Summary</span>
            </CardTitle>
            <CardDescription data-testid="text-booking-complete-description">
              Your complete {selectedDates.duration}-day trip to {searchCriteria.destination}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Trip Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-xs text-muted-foreground">{selectedDates.duration} days</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Travelers</div>
                    <div className="text-xs text-muted-foreground">{searchCriteria.travelers} guests</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Destination</div>
                    <div className="text-xs text-muted-foreground">{searchCriteria.destination}</div>
                  </div>
                </div>
              </div>

              {/* Flight Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Plane className="h-5 w-5" />
                    <span>Flight Details</span>
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditFlights}
                    className="flex items-center space-x-1"
                    data-testid="button-edit-flights"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Outbound Flight</h4>
                    <div className="space-y-1 text-sm">
                      <div>{selectedFlights.outbound?.airline} {selectedFlights.outbound?.flightNumber}</div>
                      <div>{formatDate(selectedDates.startDate)}</div>
                      <div className="text-muted-foreground">
                        {selectedFlights.outbound?.departureTime} - {selectedFlights.outbound?.arrivalTime}
                      </div>
                      <div className="font-medium text-primary">
                        {formatCurrency(parseFloat(selectedFlights.outbound?.price || "0"), selectedFlights.outbound?.currency || "MYR")}
                      </div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Return Flight</h4>
                    <div className="space-y-1 text-sm">
                      <div>{selectedFlights.return?.airline} {selectedFlights.return?.flightNumber}</div>
                      <div>{formatDate(selectedDates.endDate)}</div>
                      <div className="text-muted-foreground">
                        {selectedFlights.return?.departureTime} - {selectedFlights.return?.arrivalTime}
                      </div>
                      <div className="font-medium text-primary">
                        {formatCurrency(parseFloat(selectedFlights.return?.price || "0"), selectedFlights.return?.currency || "MYR")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotel Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Hotel className="h-5 w-5" />
                    <span>Hotel Accommodations</span>
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditHotels}
                    className="flex items-center space-x-1"
                    data-testid="button-edit-hotels"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedHotels.hotels.map((hotel) => (
                    <div key={hotel.id} className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{hotel.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">{hotel.location}, {hotel.city}</div>
                        <div>⭐ {hotel.rating} ({hotel.reviewCount} reviews)</div>
                        <div>{hotel.nights} nights</div>
                        <div className="font-medium text-primary">
                          {formatCurrency(hotel.totalPrice, hotel.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary Summary */}
              {selectedItinerary && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5" />
                      <span>Daily Itinerary</span>
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditItinerary}
                      className="flex items-center space-x-1"
                      data-testid="button-edit-itinerary"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedItinerary.days.map((day, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          Day {index + 1} - {formatDate(day.date)}
                        </h4>
                        {day.activities.length > 0 ? (
                          <div className="space-y-2">
                            {day.activities.map((activity, actIndex) => (
                              <div key={actIndex} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium">{activity.timeSlot}:</span> {activity.name}
                                  <span className="text-muted-foreground ml-1">({activity.duration})</span>
                                </div>
                                <span className="text-primary font-medium">
                                  {activity.price > 0 ? formatCurrency(activity.price, activity.currency) : 'Free'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No activities planned for this day</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Cost Breakdown */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Cost Breakdown</span>
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  {/* Per Category Costs */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <span>Flights</span>
                        <Badge variant="secondary" className="text-xs">
                          {searchCriteria.travelers} travelers
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium" data-testid="text-flights-cost">
                          {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(selectedFlights.totalPrice / searchCriteria.travelers, selectedFlights.currency)} per person
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        <span>Hotels</span>
                        <Badge variant="secondary" className="text-xs">
                          {selectedDates.duration - 1} nights
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium" data-testid="text-hotels-cost">
                          {formatCurrency(selectedHotels.totalPrice, selectedHotels.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(selectedHotels.totalPrice / searchCriteria.travelers, selectedHotels.currency)} per person
                        </div>
                      </div>
                    </div>
                    
                    {selectedItinerary && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>Activities</span>
                          <Badge variant="secondary" className="text-xs">
                            {selectedItinerary.days.reduce((total, day) => total + day.activities.length, 0)} activities
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" data-testid="text-activities-cost">
                            {formatCurrency(selectedItinerary.totalActivityCost, selectedHotels.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(selectedItinerary.totalActivityCost / searchCriteria.travelers, selectedHotels.currency)} per person
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Total Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Trip Cost</span>
                      <span className="text-primary" data-testid="text-total-cost">
                        {formatCurrency(getTotalCost(), selectedHotels.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Cost per person</span>
                      <span className="font-medium" data-testid="text-cost-per-person">
                        {formatCurrency(getCostPerPerson(), selectedHotels.currency)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      For {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'traveler' : 'travelers'} × {selectedDates.duration} days
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions and Final Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Review & Payment</span>
            </CardTitle>
            <CardDescription>
              Please review your trip details above and accept our terms before proceeding to secure payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  data-testid="checkbox-terms"
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label 
                    htmlFor="terms" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I accept the terms and conditions
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By proceeding, you agree to our{" "}
                    <button className="text-primary hover:underline" type="button">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button className="text-primary hover:underline" type="button">
                      Privacy Policy
                    </button>
                    . All prices are final and bookings are subject to availability.
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleProceedToPayment}
                  disabled={!termsAccepted}
                  data-testid="button-proceed-to-payment"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                  <span className="ml-2 font-normal text-sm">
                    ({formatCurrency(getTotalCost(), selectedHotels.currency)})
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackToItinerary} 
                  data-testid="button-modify-itinerary"
                  size="lg"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modify Trip
                </Button>
              </div>
              
              {/* Security Notice */}
              <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
                🔒 Your payment information is secured with 256-bit SSL encryption. 
                We do not store your payment details.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}