import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBooking, SelectedHotel, SelectedHotels } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Star, Wifi, Car, Coffee, Utensils, Waves, CheckCircle, Plus, Hotel as HotelIcon, MapPin as LocationIcon } from "lucide-react";
import { HotelSearchResponse, Hotel } from "@shared/schema";

export default function Hotels() {
  const [, setLocation] = useLocation();
  const { searchCriteria, selectedDates, selectedFlights, selectedHotels, setSelectedHotels, clearSelectedDates } = useBooking();
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>(
    selectedHotels?.hotels.map(h => h.id) || []
  );

  // Fetch hotels data
  const { data: hotelData, isLoading: isLoadingHotels, error: hotelError } = useQuery<HotelSearchResponse>({
    queryKey: [
      "/api/hotels",
      searchCriteria?.destination,
      selectedDates?.startDate,
      selectedDates?.endDate,
      searchCriteria?.travelers,
      searchCriteria?.currency,
    ],
    enabled: !!(searchCriteria && selectedDates && selectedFlights),
    queryFn: async () => {
      const params = new URLSearchParams({
        destination: searchCriteria!.destination,
        checkIn: selectedDates!.startDate,
        checkOut: selectedDates!.endDate,
        travelers: searchCriteria!.travelers.toString(),
        currency: searchCriteria!.currency,
      });
      const response = await fetch(`/api/hotels?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }
      return response.json();
    },
  });

  const handleBackToFlights = () => {
    setLocation("/flights");
  };

  const handleStartOver = () => {
    clearSelectedDates();
    setLocation("/");
  };

  const handleContinueToItinerary = () => {
    setLocation("/itinerary");
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

  const calculateNights = () => {
    if (!selectedDates) return 0;
    const checkIn = new Date(selectedDates.startDate);
    const checkOut = new Date(selectedDates.endDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleHotelSelection = (hotel: Hotel, isSelected: boolean) => {
    const nights = calculateNights();
    const totalPrice = nights * parseFloat(hotel.pricePerNight);
    
    if (isSelected) {
      // Add hotel to selection
      setSelectedHotelIds(prev => [...prev, hotel.id]);
    } else {
      // Remove hotel from selection
      setSelectedHotelIds(prev => prev.filter(id => id !== hotel.id));
    }
  };

  // Calculate selected hotels total
  const selectedHotelsData = useMemo(() => {
    if (!hotelData || selectedHotelIds.length === 0) {
      return null;
    }

    const nights = calculateNights();
    const hotels: SelectedHotel[] = hotelData.hotels
      .filter(hotel => selectedHotelIds.includes(hotel.id))
      .map(hotel => ({
        ...hotel,
        nights,
        totalPrice: nights * parseFloat(hotel.pricePerNight),
      }));

    const totalPrice = hotels.reduce((sum, hotel) => sum + hotel.totalPrice, 0);

    return {
      hotels,
      totalPrice,
      currency: searchCriteria?.currency || "MYR",
    };
  }, [hotelData, selectedHotelIds, searchCriteria?.currency]);

  // Update context when selections change
  const handleUpdateBookingContext = () => {
    if (selectedHotelsData) {
      setSelectedHotels(selectedHotelsData);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
      case 'wifi':
        return <Wifi className="h-3 w-3" />;
      case 'pool':
        return <Waves className="h-3 w-3" />;
      case 'breakfast':
        return <Coffee className="h-3 w-3" />;
      case 'restaurant':
        return <Utensils className="h-3 w-3" />;
      case 'parking':
      case 'free parking':
        return <Car className="h-3 w-3" />;
      default:
        return <Plus className="h-3 w-3" />;
    }
  };

  const renderStarRating = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          ({rating})
        </span>
      </div>
    );
  };

  if (!searchCriteria || !selectedDates || !selectedFlights || !selectedFlights.outbound || !selectedFlights.return) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HotelIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
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
        {/* Search Criteria Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-search-criteria-title">
              <HotelIcon className="h-5 w-5" />
              <span>Hotel Search for {searchCriteria.destination}</span>
            </CardTitle>
            <CardDescription data-testid="text-search-criteria-description">
              Find the perfect accommodation for your stay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Check-in: {formatDate(selectedDates.startDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Check-out: {formatDate(selectedDates.endDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'Guest' : 'Guests'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{calculateNights()} nights</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotels List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-available-hotels-title">
                  Available Hotels
                </CardTitle>
                <CardDescription data-testid="text-available-hotels-description">
                  Select hotels for your stay. You can choose multiple hotels for different parts of your trip.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHotels ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-border rounded-lg p-4">
                        <Skeleton className="h-48 w-full mb-4" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : hotelError ? (
                  <div className="text-center py-12">
                    <HotelIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Failed to Load Hotels</h3>
                    <p className="text-sm text-muted-foreground">
                      There was an error loading available hotels. Please try again.
                    </p>
                  </div>
                ) : !hotelData?.hotels || hotelData.hotels.length === 0 ? (
                  <div className="text-center py-12">
                    <HotelIcon className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Hotels Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Sorry, there are no hotels available for your selected dates and destination.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {hotelData.hotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className={`border border-border rounded-lg p-6 transition-all cursor-pointer hover:shadow-md ${
                          selectedHotelIds.includes(hotel.id) ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleHotelSelection(hotel, !selectedHotelIds.includes(hotel.id))}
                        data-testid={`card-hotel-${hotel.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Checkbox
                              checked={selectedHotelIds.includes(hotel.id)}
                              onCheckedChange={(checked) => handleHotelSelection(hotel, !!checked)}
                              data-testid={`checkbox-hotel-${hotel.id}`}
                            />
                            
                            {/* Hotel Image */}
                            <div className="flex-shrink-0">
                              {hotel.imageUrl ? (
                                <img 
                                  src={hotel.imageUrl} 
                                  alt={hotel.name}
                                  className="w-32 h-24 object-cover rounded-md"
                                  data-testid={`img-hotel-${hotel.id}`}
                                />
                              ) : (
                                <div className="w-32 h-24 bg-muted rounded-md flex items-center justify-center">
                                  <HotelIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Hotel Details */}
                            <div className="flex-1 space-y-2">
                              <div className="space-y-1">
                                <h3 className="text-lg font-semibold" data-testid={`text-hotel-name-${hotel.id}`}>
                                  {hotel.name}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <LocationIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground" data-testid={`text-hotel-location-${hotel.id}`}>
                                    {hotel.location}, {hotel.city}
                                  </span>
                                </div>
                                {renderStarRating(hotel.rating)}
                                <div className="text-xs text-muted-foreground">
                                  {hotel.reviewCount} reviews
                                </div>
                              </div>
                              
                              {/* Distance Information */}
                              <div className="space-y-1">
                                {hotel.distanceToLandmark && (
                                  <div className="text-xs text-muted-foreground">
                                    📍 {hotel.distanceToLandmark}
                                  </div>
                                )}
                                {hotel.distanceToBeach && (
                                  <div className="text-xs text-muted-foreground">
                                    🏖️ {hotel.distanceToBeach}
                                  </div>
                                )}
                              </div>
                              
                              {/* Amenities */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {hotel.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {getAmenityIcon(amenity)}
                                    <span className="ml-1">{amenity}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Pricing */}
                          <div className="text-right space-y-1 ml-4">
                            <div className="text-2xl font-bold text-primary" data-testid={`text-hotel-price-${hotel.id}`}>
                              {formatCurrency(parseFloat(hotel.pricePerNight), hotel.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">per night</div>
                            <div className="text-sm font-medium">
                              Total: {formatCurrency(calculateNights() * parseFloat(hotel.pricePerNight), hotel.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateNights()} nights
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Selected Hotels Summary */}
            {selectedHotelsData && selectedHotelsData.hotels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" data-testid="text-selected-hotels-title">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Selected Hotels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedHotelsData.hotels.map((hotel) => (
                      <div key={hotel.id} className="border border-border rounded-lg p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium" data-testid={`text-selected-hotel-name-${hotel.id}`}>
                            {hotel.name}
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {hotel.location}, {hotel.city}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{hotel.nights} nights</span>
                            <span className="font-medium">
                              {formatCurrency(hotel.totalPrice, hotel.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Hotel Total</span>
                        <span className="text-lg font-bold text-primary" data-testid="text-hotels-total">
                          {formatCurrency(selectedHotelsData.totalPrice, selectedHotelsData.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-trip-summary-title">Trip Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Flights */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span>Flights</span>
                    </div>
                    <span className="font-medium" data-testid="text-trip-flights-total">
                      {formatCurrency(selectedFlights.totalPrice, selectedFlights.currency)}
                    </span>
                  </div>
                  
                  {/* Hotels */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <HotelIcon className="h-4 w-4 text-primary" />
                      <span>Hotels</span>
                    </div>
                    <span className="font-medium" data-testid="text-trip-hotels-total">
                      {selectedHotelsData ? 
                        formatCurrency(selectedHotelsData.totalPrice, selectedHotelsData.currency) : 
                        "Not selected"
                      }
                    </span>
                  </div>
                  
                  {selectedHotelsData && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Trip Cost</span>
                        <span className="text-xl font-bold text-primary" data-testid="text-trip-total">
                          {formatCurrency(
                            selectedFlights.totalPrice + selectedHotelsData.totalPrice, 
                            selectedHotelsData.currency
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Continue Button */}
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    disabled={!selectedHotelsData || selectedHotelsData.hotels.length === 0}
                    onClick={() => {
                      handleUpdateBookingContext();
                      handleContinueToItinerary();
                    }}
                    data-testid="button-continue-to-itinerary"
                  >
                    Continue to Itinerary
                  </Button>
                  {(!selectedHotelsData || selectedHotelsData.hotels.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please select at least one hotel to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}