import { useLocation } from "wouter";
import { useBooking } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Hotel, CheckCircle, CalendarDays, DollarSign } from "lucide-react";

export default function Summary() {
  const [, setLocation] = useLocation();
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
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Plane className="h-5 w-5" />
                  <span>Flight Details</span>
                </h3>
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
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Hotel className="h-5 w-5" />
                  <span>Hotel Accommodations</span>
                </h3>
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
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>Daily Itinerary</span>
                  </h3>
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

              {/* Total Cost Breakdown */}
              <div className="border-t border-border pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Flights</span>
                    <span data-testid="text-flights-cost">
                      {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Hotels</span>
                    <span data-testid="text-hotels-cost">
                      {formatCurrency(selectedHotels.totalPrice, selectedHotels.currency)}
                    </span>
                  </div>
                  {selectedItinerary && (
                    <div className="flex justify-between items-center">
                      <span>Activities</span>
                      <span data-testid="text-activities-cost">
                        {formatCurrency(selectedItinerary.totalActivityCost, selectedHotels.currency)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Trip Cost</span>
                    <span className="text-primary" data-testid="text-total-cost">
                      {formatCurrency(getTotalCost(), selectedHotels.currency)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    For {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'traveler' : 'travelers'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Book!</CardTitle>
            <CardDescription>
              Your complete trip summary is ready. In a full application, this would proceed to payment processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" size="lg" data-testid="button-proceed-to-booking">
                <DollarSign className="h-4 w-4 mr-2" />
                Proceed to Booking
              </Button>
              <Button variant="outline" onClick={handleBackToItinerary} data-testid="button-modify-itinerary">
                Modify Itinerary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}