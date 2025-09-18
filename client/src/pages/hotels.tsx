import { useState } from "react";
import { useLocation } from "wouter";
import { useBooking } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Clock, Hotel, CheckCircle } from "lucide-react";

export default function Hotels() {
  const [, setLocation] = useLocation();
  const { searchCriteria, selectedDates, selectedFlights, clearSelectedDates } = useBooking();

  const handleBackToFlights = () => {
    setLocation("/flights");
  };

  const handleStartOver = () => {
    clearSelectedDates();
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

  if (!searchCriteria || !selectedDates || !selectedFlights || !selectedFlights.outbound || !selectedFlights.return) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Hotel className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Hotel Search Available</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please select your flights first.
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
                onClick={handleBackToFlights}
                className="flex items-center space-x-2"
                data-testid="button-back-to-flights"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Flights</span>
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
        {/* Selected Flights Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-selected-flights-title">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Your Selected Flights</span>
            </CardTitle>
            <CardDescription data-testid="text-selected-flights-description">
              Great choice! Now let's find you the perfect hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outbound Flight */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Outbound Flight</span>
                  <Badge variant="outline">
                    {formatDate(selectedDates.startDate)}
                  </Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" data-testid="text-outbound-airline">
                      {selectedFlights.outbound.airline}
                    </span>
                    <span className="text-sm text-muted-foreground" data-testid="text-outbound-flight-number">
                      {selectedFlights.outbound.flightNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span data-testid="text-outbound-route">
                      {selectedFlights.outbound.origin} → {selectedFlights.outbound.destination}
                    </span>
                    <span className="font-semibold text-primary" data-testid="text-outbound-price">
                      {formatCurrency(parseFloat(selectedFlights.outbound.price), selectedFlights.outbound.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span data-testid="text-outbound-times">
                      {selectedFlights.outbound.departureTime} - {selectedFlights.outbound.arrivalTime}
                    </span>
                    <span data-testid="text-outbound-duration">
                      {selectedFlights.outbound.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Return Flight */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-primary transform rotate-180" />
                  <span className="font-semibold">Return Flight</span>
                  <Badge variant="outline">
                    {formatDate(selectedDates.endDate)}
                  </Badge>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" data-testid="text-return-airline">
                      {selectedFlights.return.airline}
                    </span>
                    <span className="text-sm text-muted-foreground" data-testid="text-return-flight-number">
                      {selectedFlights.return.flightNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span data-testid="text-return-route">
                      {selectedFlights.return.origin} → {selectedFlights.return.destination}
                    </span>
                    <span className="font-semibold text-primary" data-testid="text-return-price">
                      {formatCurrency(parseFloat(selectedFlights.return.price), selectedFlights.return.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span data-testid="text-return-times">
                      {selectedFlights.return.departureTime} - {selectedFlights.return.arrivalTime}
                    </span>
                    <span data-testid="text-return-duration">
                      {selectedFlights.return.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Total */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Flight Cost</span>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm" data-testid="text-travelers-count">
                      {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'Traveler' : 'Travelers'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary" data-testid="text-flight-total">
                    {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    All flights included
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Selection Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-hotels-coming-soon-title">
              <Hotel className="h-5 w-5" />
              <span>Hotel Selection</span>
            </CardTitle>
            <CardDescription data-testid="text-hotels-coming-soon-description">
              Hotel search and selection will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Hotel className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Hotel Selection Coming Soon</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                We're working on adding hotel search and selection functionality. 
                Your flight selections have been saved and will be available when you return.
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Check-in: {formatDate(selectedDates.startDate)}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Check-out: {formatDate(selectedDates.endDate)}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedDates.duration - 1} nights</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}