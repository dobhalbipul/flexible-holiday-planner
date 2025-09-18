import { useState, useEffect } from "react";
import FlightSearch from "@/components/flight-search";
import HotelSearch from "@/components/hotel-search";
import ItineraryBuilder from "@/components/itinerary-builder";
import Transportation from "@/components/transportation";
import Restaurants from "@/components/restaurants";
import Activities from "@/components/activities";
import CostSummary from "@/components/cost-summary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency, CURRENCY_NAMES, type Currency } from "@/lib/currency";
import { MapPin, Plane, Users, Calendar, DollarSign } from "lucide-react";

export default function Home() {
  const { currency, setCurrency } = useCurrency();
  
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
  
  // Default to next 2 consecutive months (October 2025, November 2025)
  const [selectedMonth1, setSelectedMonth1] = useState(monthOptions[0]?.value || "2025-10");
  const [selectedMonth2, setSelectedMonth2] = useState(monthOptions[1]?.value || "2025-11");
  
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

      {/* Hero Section */}
      <section className="hero-gradient py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-hero-title">
              Vietnam Discovery Package
            </h1>
            <p className="text-xl opacity-90" data-testid="text-hero-subtitle">
              6 Days, 5 Nights • Penang to Da Nang • 2 Travelers
            </p>
            <div className="flex justify-center items-center mt-6 space-x-8">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm mb-2">Best prices during</p>
                <div className="flex space-x-2">
                  <Select value={selectedMonth1} onValueChange={setSelectedMonth1}>
                    <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white" data-testid="select-month1">
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
                  <span className="text-white self-center">&</span>
                  <Select value={selectedMonth2} onValueChange={setSelectedMonth2}>
                    <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white" data-testid="select-month2">
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
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Hoi An & Da Nang</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">2 Travelers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="flights" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="flights" data-testid="tab-flights">Flights</TabsTrigger>
            <TabsTrigger value="hotels" data-testid="tab-hotels">Hotels</TabsTrigger>
            <TabsTrigger value="itinerary" data-testid="tab-itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">Final Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flights" className="space-y-8">
            <FlightSearch />
          </TabsContent>
          
          <TabsContent value="hotels" className="space-y-8">
            <HotelSearch />
          </TabsContent>
          
          <TabsContent value="itinerary" className="space-y-8">
            <ItineraryBuilder />
            <Transportation />
            <Restaurants />
            <Activities />
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-8">
            <CostSummary />
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <section className="mb-8 mt-12">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4" data-testid="text-contact-title">
              Ready to Book Your Vietnam Adventure?
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
        </section>
      </div>

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
