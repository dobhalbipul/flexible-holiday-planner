import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, CreditCard, Calendar, Headphones, Shield, DollarSign } from "lucide-react";

interface CostBreakdown {
  flights: number;
  hotels: number;
  transport: number;
  meals: number;
  activities: number;
  insurance: number;
  total: number;
}

const premiumPackage: CostBreakdown = {
  flights: 970,
  hotels: 336,
  transport: 95,
  meals: 360,
  activities: 340,
  insurance: 45,
  total: 2146,
};

const budgetPackage: CostBreakdown = {
  flights: 1024,
  hotels: 280,
  transport: 65,
  meals: 240,
  activities: 180,
  insurance: 35,
  total: 1824,
};

const renderCostItem = (label: string, amount: number, testId: string) => (
  <div className="flex justify-between items-center pb-2 border-b border-border">
    <span className="font-medium">{label}</span>
    <span className="font-semibold" data-testid={testId}>
      ${amount}
    </span>
  </div>
);

const renderPackageCard = (
  title: string,
  subtitle: string,
  costs: CostBreakdown,
  isRecommended: boolean,
  testId: string
) => (
  <div className={`border-2 ${isRecommended ? 'border-primary' : 'border-border'} rounded-lg p-6 relative`}>
    {isRecommended && (
      <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
        Recommended Package
      </div>
    )}
    <h3 className="text-xl font-semibold mb-4 mt-2" data-testid={`text-${testId}-title`}>
      {title}
    </h3>
    
    <div className="space-y-4 mb-6">
      {renderCostItem("Flights (2 pax)", costs.flights, `text-${testId}-flights`)}
      {renderCostItem("Hotels (5 nights)", costs.hotels, `text-${testId}-hotels`)}
      {renderCostItem("Transportation", costs.transport, `text-${testId}-transport`)}
      {renderCostItem("Meals (12 meals)", costs.meals, `text-${testId}-meals`)}
      {renderCostItem("Activities & Tours", costs.activities, `text-${testId}-activities`)}
      {renderCostItem("Travel Insurance", costs.insurance, `text-${testId}-insurance`)}
    </div>
    
    <div className={`${isRecommended ? 'bg-primary/10' : 'bg-secondary/10'} rounded-lg p-4 mb-4`}>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total Cost (2 travelers)</span>
        <span 
          className={`text-2xl font-bold ${isRecommended ? 'text-primary' : 'text-secondary'}`}
          data-testid={`text-${testId}-total`}
        >
          ${costs.total.toLocaleString()}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Average: ${Math.round(costs.total / 2).toLocaleString()} per person
      </div>
    </div>
    
    <div className="text-center">
      <Button 
        className={`w-full font-semibold ${
          isRecommended 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
        }`}
        data-testid={`button-book-${testId}`}
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Book {title}
      </Button>
    </div>
  </div>
);

export default function CostSummary() {
  return (
    <section className="mb-12" data-testid="section-cost-summary">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-cost-summary-title">
            <Calculator className="text-primary mr-3" />
            Trip Cost Summary
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderPackageCard(
              "Premium Experience",
              "Recommended Package",
              premiumPackage,
              true,
              "premium"
            )}
            
            {renderPackageCard(
              "Essential Experience",
              "Budget Option",
              budgetPackage,
              false,
              "budget"
            )}
          </div>
          
          {/* Payment Options */}
          <div className="mt-8 bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-payment-options-title">
              Payment & Booking Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-lg" data-testid="card-payment-secure">
                <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-medium">Secure Payment</div>
                <div className="text-sm text-muted-foreground">All major cards accepted</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg" data-testid="card-payment-flexible">
                <Calendar className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="font-medium">Flexible Booking</div>
                <div className="text-sm text-muted-foreground">Free cancellation 48hrs</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg" data-testid="card-payment-support">
                <Headphones className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="font-medium">24/7 Support</div>
                <div className="text-sm text-muted-foreground">Travel agent assistance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
