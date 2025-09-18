import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBooking } from "@/lib/booking";
import { useCurrency, CURRENCY_NAMES } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Users, ArrowLeft, Loader2, DollarSign, Clock, TrendingDown, Star } from "lucide-react";
import type { BestDatesResponse, DateRangeResult } from "@shared/schema";

export default function BestDates() {
  const [, setLocation] = useLocation();
  const { searchCriteria, clearSearchCriteria, setSelectedDates } = useBooking();
  const { currency } = useCurrency();

  // Fetch best dates using TanStack Query
  const { 
    data: bestDatesData, 
    isLoading, 
    error 
  } = useQuery<BestDatesResponse>({
    queryKey: ['best-dates', searchCriteria?.destination, searchCriteria?.month1, searchCriteria?.month2, searchCriteria?.travelers, searchCriteria?.currency],
    enabled: !!searchCriteria,
    queryFn: async () => {
      if (!searchCriteria) throw new Error('No search criteria');
      
      const params = new URLSearchParams({
        destination: searchCriteria.destination,
        month1: searchCriteria.month1,
        month2: searchCriteria.month2,
        travelers: searchCriteria.travelers.toString(),
        currency: searchCriteria.currency,
      });
      
      const response = await fetch(`/api/best-dates?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch best dates');
      }
      return response.json();
    }
  });

  // Redirect to home if no search criteria
  useEffect(() => {
    if (!searchCriteria) {
      setLocation("/");
    }
  }, [searchCriteria, setLocation]);

  if (!searchCriteria) {
    return null; // Will redirect to home
  }

  const destinations = [
    { value: "hoi-an-da-nang", label: "Hoi An & Da Nang, Vietnam" },
    { value: "hanoi-halong", label: "Hanoi & Ha Long Bay, Vietnam" },
    { value: "ho-chi-minh", label: "Ho Chi Minh City, Vietnam" },
    { value: "phu-quoc", label: "Phu Quoc Island, Vietnam" },
  ];

  const getDestinationLabel = (value: string) => {
    return destinations.find(dest => dest.value === value)?.label || value;
  };

  const getMonthLabel = (monthValue: string) => {
    const [year, month] = monthValue.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleBackToSearch = () => {
    clearSearchCriteria();
    setLocation("/");
  };

  const handleModifySearch = () => {
    // Keep the criteria but go back to modify
    setLocation("/");
  };

  const handleSelectDates = (dateRange: DateRangeResult) => {
    // Update the BookingContext with selected dates
    setSelectedDates({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      duration: dateRange.duration,
      pricePerPerson: dateRange.pricePerPerson,
      totalPrice: dateRange.totalPrice,
      currency: dateRange.currency,
      dateRangeId: dateRange.id,
    });
    
    // Navigate to next step (flight selection will be implemented later)
    // For now, just show a confirmation or navigate to a placeholder
    setLocation("/flights");
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

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
                onClick={handleBackToSearch}
                className="flex items-center space-x-2"
                data-testid="button-back-to-search"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>New Search</span>
              </Button>
              <Button 
                onClick={handleModifySearch}
                data-testid="button-modify-search"
              >
                Modify Search
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-search-summary-title">
              <Calendar className="h-5 w-5" />
              <span>Your Search Criteria</span>
            </CardTitle>
            <CardDescription data-testid="text-search-summary-description">
              Finding the best deals for your trip preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Destination</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium" data-testid="text-destination-selected">
                    {getDestinationLabel(searchCriteria.destination)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Travel Months</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium" data-testid="text-month1-selected">
                      {getMonthLabel(searchCriteria.month1)}
                    </span>
                    <span className="font-medium" data-testid="text-month2-selected">
                      {getMonthLabel(searchCriteria.month2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Travelers</label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium" data-testid="text-travelers-selected">
                    {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium" data-testid="text-currency-selected">
                    {searchCriteria.currency} - {CURRENCY_NAMES[searchCriteria.currency]}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State / Results Area */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-loading-title">
                Finding Best Deals
              </h3>
              <p className="text-muted-foreground text-center" data-testid="text-loading-description">
                Comparing prices across multiple dates and booking platforms...
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-destructive mb-4">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-destructive">
                Failed to Load Best Dates
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                We encountered an issue while searching for the best travel dates. Please try again.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : bestDatesData ? (
          <div className="space-y-6">
            {/* Best Travel Dates Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Best Travel Dates</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {bestDatesData.results.length} Options Found
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Showing the best value dates for your {getDestinationLabel(searchCriteria.destination)} trip. 
                  Average price: {formatCurrency(bestDatesData.averagePrice, bestDatesData.currency)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {bestDatesData.results.map((dateRange, index) => (
                    <Card 
                      key={dateRange.id} 
                      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        dateRange.isDealOfTheDay ? 'ring-2 ring-orange-500 shadow-lg' : ''
                      } ${
                        dateRange.isRecommended ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSelectDates(dateRange)}
                      data-testid={`card-date-range-${index}`}
                    >
                      <CardContent className="p-4">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {dateRange.isDealOfTheDay && (
                            <Badge variant="destructive" className="text-xs font-medium">
                              <Star className="h-3 w-3 mr-1" />
                              Deal of the Day
                            </Badge>
                          )}
                          {dateRange.isRecommended && (
                            <Badge variant="default" className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              Recommended
                            </Badge>
                          )}
                          {dateRange.savings > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {dateRange.savings}% off
                            </Badge>
                          )}
                        </div>

                        {/* Date Range */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              {formatDate(dateRange.startDate)}
                            </div>
                            <div className="text-xs text-muted-foreground px-2">
                              →
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                              {formatDate(dateRange.endDate)}
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm text-muted-foreground">
                              {dateRange.duration} days / {dateRange.duration - 1} nights
                            </span>
                          </div>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-2 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground" data-testid={`text-price-per-person-${index}`}>
                              {formatCurrency(dateRange.pricePerPerson, dateRange.currency)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              per person
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-muted-foreground" data-testid={`text-total-price-${index}`}>
                              {formatCurrency(dateRange.totalPrice, dateRange.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              total for {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'traveler' : 'travelers'}
                            </div>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-xs text-muted-foreground space-y-1 mb-4 border-t pt-2">
                          <div className="flex justify-between">
                            <span>Flight:</span>
                            <span>{formatCurrency(dateRange.flightPrice, dateRange.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hotel (5 nights):</span>
                            <span>{formatCurrency(dateRange.hotelPrice, dateRange.currency)}</span>
                          </div>
                        </div>

                        {/* Select Button */}
                        <Button 
                          className="w-full" 
                          size="sm"
                          data-testid={`button-select-dates-${index}`}
                        >
                          Select These Dates
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips and Information */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Travel Tips</CardTitle>
                <CardDescription>
                  Maximize your savings and travel experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">💰 Best Deals</h4>
                    <p className="text-muted-foreground">
                      Prices shown include flights from Penang and 5 nights accommodation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">🌤️ Weather Info</h4>
                    <p className="text-muted-foreground">
                      Nov-Mar is peak season with cooler weather. Apr-Oct offers great value with warm weather
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">✈️ Next Steps</h4>
                    <p className="text-muted-foreground">
                      Select your preferred dates to choose specific flights and hotels
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">💳 Payment</h4>
                    <p className="text-muted-foreground">
                      All prices in {searchCriteria.currency}. No booking fees. Pay only when you confirm your trip
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Results Found</h3>
              <p className="text-sm text-muted-foreground text-center">
                We couldn't find any available dates for your search criteria.
                Try adjusting your travel months or destination.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}