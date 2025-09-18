import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrency, CURRENCY_NAMES, type Currency } from "@/lib/currency";
import { useBooking, validateSearchCriteria } from "@/lib/booking";
import { MapPin, Plane, Users, Calendar, DollarSign, Search, Shield, Award, Clock, Star, AlertCircle, Loader2 } from "lucide-react";

export default function Home() {
  const { currency, setCurrency } = useCurrency();
  const { setSearchCriteria, searchCriteria, isLoading, setIsLoading } = useBooking();
  const [, setLocation] = useLocation();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Generate month options for the next 12 months starting from current month
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date(); // September 18, 2025
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: monthName
      });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();
  
  // Search form state - initialize from existing search criteria if available
  const [destination, setDestination] = useState(searchCriteria?.destination || "hoi-an-da-nang");
  const [month1, setMonth1] = useState(searchCriteria?.month1 || monthOptions[0]?.value || "2025-10");
  const [month2, setMonth2] = useState(searchCriteria?.month2 || monthOptions[1]?.value || "2025-11");
  const [travelers, setTravelers] = useState(searchCriteria?.travelers?.toString() || "2");

  // Available destinations (expandable)
  const destinations = [
    { value: "hoi-an-da-nang", label: "Hoi An & Da Nang, Vietnam", popular: true },
    { value: "hanoi-halong", label: "Hanoi & Ha Long Bay, Vietnam", popular: false },
    { value: "ho-chi-minh", label: "Ho Chi Minh City, Vietnam", popular: false },
    { value: "phu-quoc", label: "Phu Quoc Island, Vietnam", popular: false },
  ];

  // Auto-sort months if needed and validate on change
  useEffect(() => {
    if (month1 && month2 && month1 > month2) {
      // Auto-sort months if first month is later than second
      setMonth2(month1);
      setMonth1(month2);
    }
    
    // Validate whenever form values change
    const criteria = {
      destination,
      month1,
      month2,
      travelers: parseInt(travelers) || 0,
      currency
    };
    
    const validation = validateSearchCriteria(criteria);
    setValidationErrors(validation.errors);
  }, [destination, month1, month2, travelers, currency]);

  const handleSearch = async () => {
    const criteria = {
      destination,
      month1,
      month2,
      travelers: parseInt(travelers),
      currency
    };
    
    const validation = validateSearchCriteria(criteria);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setValidationErrors([]);
    setIsLoading(true);
    
    try {
      // Store search criteria in context
      setSearchCriteria(criteria);
      
      // Add a small delay for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to best-dates page
      setLocation("/best-dates");
    } catch (error) {
      console.error("Search error:", error);
      setValidationErrors(["An error occurred while processing your search. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthLabel = (monthValue: string) => {
    const option = monthOptions.find(opt => opt.value === monthValue);
    return option?.label || monthValue;
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
            <div className="flex items-center space-x-6">
              <span className="text-sm text-muted-foreground">Professional Travel Agent</span>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                  <SelectTrigger className="w-24" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                data-testid="button-profile"
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section className="hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h1 className="text-5xl font-bold mb-6" data-testid="text-hero-title">
              Find Your Perfect Vietnam Adventure
            </h1>
            <p className="text-xl opacity-90 mb-4" data-testid="text-hero-subtitle">
              Compare prices across multiple months and find the best deals for your dream trip
            </p>
            <p className="text-lg opacity-80" data-testid="text-hero-description">
              Professional travel planning • Best price guarantee • Flexible booking
            </p>
          </div>

          {/* Search Form Card */}
          <Card className="max-w-4xl mx-auto glass-card shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground" data-testid="text-search-title">
                Start Planning Your Journey
              </CardTitle>
              <CardDescription data-testid="text-search-description">
                Select your destination, travel months, and group size to find the best deals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Destination
                </label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="w-full" data-testid="select-destination">
                    <SelectValue placeholder="Choose your destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.value} value={dest.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{dest.label}</span>
                          {dest.popular && (
                            <Badge variant="secondary" className="ml-2">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Flexible Month Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Preferred Month 1
                  </label>
                  <Select value={month1} onValueChange={setMonth1}>
                    <SelectTrigger data-testid="select-month1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Preferred Month 2
                  </label>
                  <Select value={month2} onValueChange={setMonth2}>
                    <SelectTrigger data-testid="select-month2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Traveler Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Number of Travelers
                </label>
                <Select value={travelers} onValueChange={setTravelers}>
                  <SelectTrigger data-testid="select-travelers">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Traveler' : 'Travelers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                disabled={validationErrors.length > 0 || isLoading}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-search"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Finding Best Deals...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-3" />
                    Find Best Deals
                  </>
                )}
              </Button>

              {/* Helper Text */}
              {validationErrors.length === 0 && !isLoading && (
                <p className="text-sm text-muted-foreground text-center">
                  Click to compare prices and find the best travel dates
                </p>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Flexible Dates</p>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Secure Booking</p>
                </div>
                <div className="text-center">
                  <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Best Price</p>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Expert Service</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
              Why Choose Dobhal Holiday Planner?
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-features-subtitle">
              Professional travel planning with unmatched expertise and value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Best Price Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Compare prices across multiple months and booking platforms to ensure you get the best deals available.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Expert Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Professional travel agents with local expertise and years of experience in Southeast Asian destinations.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle>Secure & Flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Licensed travel agency with secure payment processing and flexible booking policies for peace of mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4" data-testid="text-contact-title">
              Ready to Start Your Vietnam Adventure?
            </h2>
            <p className="text-lg opacity-90 mb-6" data-testid="text-contact-subtitle">
              Our professional travel agents are here to help customize your perfect trip
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-white/90 transition-colors font-semibold"
                data-testid="button-call"
              >
                <Plane className="h-4 w-4 mr-2 inline" />
                Call Now: +60-123-456-789
              </button>
              <button 
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors font-semibold"
                data-testid="button-email"
              >
                Email Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Dobhal Holiday Planner</span>
          </div>
          <p className="text-sm opacity-75">Professional Travel Agent • Licensed & Insured • Since 2018</p>
          <div className="flex justify-center space-x-6 mt-4">
            <span className="text-sm">Real-time API Integration</span>
            <span className="text-sm">Skyscanner • Amadeus • Agoda</span>
            <span className="text-sm">Secure Booking Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}