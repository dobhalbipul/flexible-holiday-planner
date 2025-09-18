import { useEffect } from "react";
import { useLocation } from "wouter";
import { useBooking } from "@/lib/booking";
import { useCurrency, CURRENCY_NAMES } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, ArrowLeft, Loader2, DollarSign } from "lucide-react";

export default function BestDates() {
  const [, setLocation] = useLocation();
  const { searchCriteria, clearSearchCriteria, isLoading } = useBooking();
  const { currency } = useCurrency();

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
        ) : (
          <div className="space-y-6">
            {/* Coming Soon - Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Best Travel Dates</span>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Price comparison and date recommendations will be displayed here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Search Results Coming Soon</h3>
                  <p className="text-sm">
                    We'll show you the best dates and prices for your {getDestinationLabel(searchCriteria.destination)} trip
                  </p>
                  <p className="text-sm mt-2">
                    Comparing {getMonthLabel(searchCriteria.month1)} vs {getMonthLabel(searchCriteria.month2)} 
                    for {searchCriteria.travelers} {searchCriteria.travelers === 1 ? 'traveler' : 'travelers'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Your search criteria has been saved. Here's what happens next:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Price Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll analyze flight and hotel prices for both months
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Best Dates Recommendation</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll see the optimal travel dates with potential savings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Custom Itinerary</h4>
                      <p className="text-sm text-muted-foreground">
                        Our travel agents will create a personalized itinerary
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}