import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plane, Search, Clock, MapPin } from "lucide-react";
import type { Flight } from "@shared/schema";

export default function FlightSearch() {
  const [searchParams, setSearchParams] = useState({
    origin: "PEN",
    destination: "DAD",
    departureDate: "2025-10-25",
    passengers: "2"
  });

  const [hasSearched, setHasSearched] = useState(false);

  const { data: flights, isLoading, error } = useQuery<Flight[]>({
    queryKey: ['/api/flights/search', searchParams.origin, searchParams.destination, searchParams.departureDate],
    enabled: hasSearched,
  });

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <section className="mb-12" data-testid="section-flight-search">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-flight-title">
            <Plane className="text-primary mr-3" />
            Flight Options
          </h2>
          
          {/* Flight Search Form */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="origin" className="block text-sm font-medium text-muted-foreground mb-2">
                  From
                </Label>
                <div className="relative">
                  <Input
                    id="origin"
                    type="text"
                    value="Penang (PEN)"
                    className="pr-10"
                    readOnly
                    data-testid="input-origin"
                  />
                  <Plane className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <Label htmlFor="destination" className="block text-sm font-medium text-muted-foreground mb-2">
                  To
                </Label>
                <div className="relative">
                  <Input
                    id="destination"
                    type="text"
                    value="Da Nang (DAD)"
                    className="pr-10"
                    readOnly
                    data-testid="input-destination"
                  />
                  <Plane className="absolute right-3 top-3 h-4 w-4 text-muted-foreground rotate-90" />
                </div>
              </div>
              <div>
                <Label htmlFor="departure" className="block text-sm font-medium text-muted-foreground mb-2">
                  Departure
                </Label>
                <Input
                  id="departure"
                  type="date"
                  value={searchParams.departureDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                  data-testid="input-departure"
                />
              </div>
              <div>
                <Label htmlFor="return" className="block text-sm font-medium text-muted-foreground mb-2">
                  Return
                </Label>
                <Input
                  id="return"
                  type="date"
                  value="2025-10-30"
                  data-testid="input-return"
                />
              </div>
              <div>
                <Label htmlFor="passengers" className="block text-sm font-medium text-muted-foreground mb-2">
                  Passengers
                </Label>
                <Select value={searchParams.passengers} onValueChange={(value) => setSearchParams(prev => ({ ...prev, passengers: value }))}>
                  <SelectTrigger data-testid="select-passengers">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={handleSearch}
              data-testid="button-search-flights"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Flights
            </Button>
          </div>

          {/* Flight Results */}
          {hasSearched && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground" data-testid="text-flight-results-title">
                Top 5 Flight Options (Real-time from Skyscanner & Amadeus API)
              </h3>
              
              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-border rounded-lg p-6">
                      <Skeleton className="h-4 w-48 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="border border-destructive rounded-lg p-6 text-center" data-testid="text-flight-error">
                  <p className="text-destructive">Failed to load flights. Please try again.</p>
                </div>
              )}

              {flights && flights.length === 0 && (
                <div className="border border-border rounded-lg p-6 text-center" data-testid="text-no-flights">
                  <p className="text-muted-foreground">No flights found for the selected criteria.</p>
                </div>
              )}

              {flights && flights.map((flight, index) => (
                <div 
                  key={flight.id} 
                  className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                  data-testid={`card-flight-${index}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <Plane className="text-accent h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold" data-testid={`text-flight-airline-${index}`}>
                          {flight.airline}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-flight-number-${index}`}>
                          {flight.flightNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary" data-testid={`text-flight-price-${index}`}>
                        {flight.currency} {flight.price}
                      </div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div className="font-semibold" data-testid={`text-flight-departure-${index}`}>
                        {flight.departureTime} {flight.origin}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.departureDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Arrival</div>
                      <div className="font-semibold" data-testid={`text-flight-arrival-${index}`}>
                        {flight.arrivalTime} {flight.destination}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.arrivalDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold flex items-center" data-testid={`text-flight-duration-${index}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        {flight.duration}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.stops}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Layover</div>
                      <div className="font-semibold" data-testid={`text-flight-layover-${index}`}>
                        {flight.layoverDuration}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.layoverLocation}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    data-testid={`button-select-flight-${index}`}
                  >
                    Select Flight
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
