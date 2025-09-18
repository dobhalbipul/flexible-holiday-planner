import { useLocation } from "wouter";
import { useBooking } from "@/lib/booking";
import { useCurrency, CURRENCY_NAMES } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, ArrowLeft, Plane, Clock } from "lucide-react";

export default function Flights() {
  const [, setLocation] = useLocation();
  const { searchCriteria, selectedDates, clearSelectedDates } = useBooking();
  const { currency } = useCurrency();

  const handleBackToBestDates = () => {
    setLocation("/best-dates");
  };

  const handleStartOver = () => {
    clearSelectedDates();
    setLocation("/");
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
              Review your travel dates and pricing before selecting flights
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
                <label className="text-sm font-medium text-muted-foreground">Total Price</label>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary" data-testid="text-total-price">
                    {formatCurrency(selectedDates.totalPrice, selectedDates.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Message */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plane className="h-24 w-24 mx-auto mb-6 text-primary opacity-60" />
            <h2 className="text-2xl font-bold mb-4" data-testid="text-coming-soon-title">
              Flight Selection Coming Soon
            </h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md" data-testid="text-coming-soon-description">
              We're working on building the flight selection interface. 
              For now, you can go back to select different dates or start a new search.
            </p>
            <div className="flex space-x-4">
              <Button 
                onClick={handleBackToBestDates}
                data-testid="button-back-to-dates-main"
              >
                Choose Different Dates
              </Button>
              <Button 
                variant="outline"
                onClick={handleStartOver}
                data-testid="button-new-search"
              >
                Start New Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}