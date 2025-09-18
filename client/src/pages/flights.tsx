import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBooking, type SelectedFlight } from "@/lib/booking";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Clock, ArrowRight, Loader2 } from "lucide-react";
import type { FlightSearchResponse, Flight } from "@shared/schema";

export default function Flights() {
  const [, setLocation] = useLocation();
  const { searchCriteria, selectedDates, selectedFlights, setSelectedFlights, clearSelectedDates } = useBooking();
  const { currency } = useCurrency();
  const [selectedOutbound, setSelectedOutbound] = useState<string>("");
  const [selectedReturn, setSelectedReturn] = useState<string>("");

  // Fetch flights using TanStack Query
  const { 
    data: flightData, 
    isLoading, 
    error 
  } = useQuery<FlightSearchResponse>({
    queryKey: ['flights', searchCriteria?.destination, selectedDates?.startDate, selectedDates?.endDate, searchCriteria?.travelers, searchCriteria?.currency],
    enabled: !!(searchCriteria && selectedDates),
    queryFn: async () => {
      if (!searchCriteria || !selectedDates) throw new Error('No search criteria or dates');
      
      const params = new URLSearchParams({
        destination: searchCriteria.destination,
        startDate: selectedDates.startDate,
        endDate: selectedDates.endDate,
        travelers: searchCriteria.travelers.toString(),
        currency: searchCriteria.currency,
      });
      
      const response = await fetch(`/api/flights?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      return response.json();
    }
  });

  const handleBackToBestDates = () => {
    setLocation("/best-dates");
  };

  const handleStartOver = () => {
    clearSelectedDates();
    setLocation("/");
  };

  const handleOutboundSelect = (flightId: string) => {
    setSelectedOutbound(flightId);
    updateSelectedFlights(flightId, selectedReturn);
  };

  const handleReturnSelect = (flightId: string) => {
    setSelectedReturn(flightId);
    updateSelectedFlights(selectedOutbound, flightId);
  };

  const updateSelectedFlights = (outboundId: string, returnId: string) => {
    if (!flightData || !searchCriteria) return;

    const outboundFlight = flightData.outboundFlights.find(f => f.id === outboundId);
    const returnFlight = flightData.returnFlights.find(f => f.id === returnId);

    if (outboundFlight && returnFlight) {
      const totalPrice = (parseFloat(outboundFlight.price) + parseFloat(returnFlight.price)) * searchCriteria.travelers;
      
      setSelectedFlights({
        outbound: outboundFlight as SelectedFlight,
        return: returnFlight as SelectedFlight,
        totalPrice,
        currency: searchCriteria.currency,
      });
    }
  };

  const handleContinueToHotels = () => {
    if (selectedFlights?.outbound && selectedFlights?.return) {
      setLocation("/hotels");
    }
  };

  if (!searchCriteria || !selectedDates) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Flight Search Available</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please start by searching for dates first.
            </p>
            <Button onClick={handleStartOver} data-testid="button-start-over">
              Start New Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const FlightCard = ({ flight, isSelected, onSelect, type }: { 
    flight: Flight; 
    isSelected: boolean; 
    onSelect: (id: string) => void;
    type: 'outbound' | 'return';
  }) => (
    <Card className={`cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <RadioGroup value={isSelected ? flight.id : ""} onValueChange={onSelect}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={flight.id} 
                  id={flight.id} 
                  data-testid={`radio-${type}-flight-${flight.id}`}
                />
                <Label htmlFor={flight.id} className="sr-only">Select this flight</Label>
              </div>
            </RadioGroup>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-lg">{flight.airline}</span>
                  <Badge variant="outline">{flight.flightNumber}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(parseFloat(flight.price), flight.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">per person</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold">{formatTime(flight.departureTime)}</div>
                    <div className="text-sm text-muted-foreground">{flight.origin}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="border-t border-dashed border-muted-foreground w-8"></div>
                    <Plane className="h-4 w-4" />
                    <div className="border-t border-dashed border-muted-foreground w-8"></div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-semibold">{formatTime(flight.arrivalTime)}</div>
                    <div className="text-sm text-muted-foreground">{flight.destination}</div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <div>{flight.duration}</div>
                  <div>{flight.stops}</div>
                  {flight.layoverDuration && (
                    <div>Layover: {flight.layoverDuration}</div>
                  )}
                </div>
              </div>
              
              {flight.layoverLocation && (
                <div className="text-sm text-muted-foreground">
                  Via {flight.layoverLocation}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                onClick={handleBackToBestDates}
                className="flex items-center space-x-2"
                data-testid="button-back-to-dates"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dates</span>
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
        {/* Selected Dates Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-selected-dates-title">
              <Calendar className="h-5 w-5" />
              <span>Your Selected Dates</span>
            </CardTitle>
            <CardDescription data-testid="text-selected-dates-description">
              Choose your outbound and return flights for these dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Travel Dates</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium" data-testid="text-start-date">
                      {formatDate(selectedDates.startDate)}
                    </span>
                    <span className="font-medium" data-testid="text-end-date">
                      {formatDate(selectedDates.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium" data-testid="text-duration">
                    {selectedDates.duration} days / {selectedDates.duration - 1} nights
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Travelers</label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium" data-testid="text-travelers">
                    {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Base Trip Cost</label>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary" data-testid="text-base-price">
                    {formatCurrency(selectedDates.totalPrice, selectedDates.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Plane className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Unable to Load Flights</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                There was an error loading flight options. Please try again.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : flightData ? (
          <>
            {/* Outbound Flights */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="text-outbound-title">
                  <Plane className="h-5 w-5" />
                  <span>Outbound Flights - {formatDate(selectedDates.startDate)}</span>
                </CardTitle>
                <CardDescription data-testid="text-outbound-description">
                  Choose your departure flight from Penang to {flightData.searchCriteria.destination}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {flightData.outboundFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedOutbound === flight.id}
                    onSelect={handleOutboundSelect}
                    type="outbound"
                  />
                ))}
              </CardContent>
            </Card>

            {/* Return Flights */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" data-testid="text-return-title">
                  <Plane className="h-5 w-5 transform rotate-180" />
                  <span>Return Flights - {formatDate(selectedDates.endDate)}</span>
                </CardTitle>
                <CardDescription data-testid="text-return-description">
                  Choose your return flight to Penang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {flightData.returnFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedReturn === flight.id}
                    onSelect={handleReturnSelect}
                    type="return"
                  />
                ))}
              </CardContent>
            </Card>

            {/* Flight Summary and Continue */}
            {selectedFlights?.outbound && selectedFlights?.return && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle data-testid="text-flight-summary-title">Flight Summary</CardTitle>
                  <CardDescription data-testid="text-flight-summary-description">
                    Review your selected flights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4" />
                        <span>Outbound</span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Flight:</span>
                          <span>{selectedFlights.outbound.airline} {selectedFlights.outbound.flightNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Departure:</span>
                          <span>{formatTime(selectedFlights.outbound.departureTime)} from {selectedFlights.outbound.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrival:</span>
                          <span>{formatTime(selectedFlights.outbound.arrivalTime)} at {selectedFlights.outbound.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span>{formatCurrency(parseFloat(selectedFlights.outbound.price), selectedFlights.outbound.currency)} per person</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return</span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Flight:</span>
                          <span>{selectedFlights.return.airline} {selectedFlights.return.flightNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Departure:</span>
                          <span>{formatTime(selectedFlights.return.departureTime)} from {selectedFlights.return.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrival:</span>
                          <span>{formatTime(selectedFlights.return.arrivalTime)} at {selectedFlights.return.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span>{formatCurrency(parseFloat(selectedFlights.return.price), selectedFlights.return.currency)} per person</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total Flight Cost:</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-total-flight-cost">
                        {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-6">
                      <span>For {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'traveler' : 'travelers'}</span>
                      <span>
                        {formatCurrency((parseFloat(selectedFlights.outbound.price) + parseFloat(selectedFlights.return.price)), selectedFlights.currency)} per person
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleContinueToHotels} 
                      className="w-full" 
                      size="lg"
                      data-testid="button-continue-to-hotels"
                    >
                      Continue to Hotels
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}