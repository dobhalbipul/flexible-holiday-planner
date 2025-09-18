import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Route, Plane, Car, Bus, Clock, DollarSign } from "lucide-react";
import type { Transportation } from "@shared/schema";

export default function Transportation() {
  const { data: airportTransfers, isLoading: airportLoading } = useQuery<Transportation[]>({
    queryKey: ['/api/transportation', 'Airport', 'Hoi An'],
    enabled: true,
  });

  const { data: intercityTransport, isLoading: intercityLoading } = useQuery<Transportation[]>({
    queryKey: ['/api/transportation', 'Hoi An', 'Da Nang'],
    enabled: true,
  });

  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'private car':
        return <Car className="h-5 w-5" />;
      case 'taxi':
        return <Car className="h-5 w-5" />;
      case 'bus':
      case 'local bus':
        return <Bus className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const getRecommendedColor = (index: number) => {
    return index === 0 ? "border-primary" : index === 1 ? "border-secondary" : "border-accent";
  };

  const renderTransportOptions = (
    options: Transportation[] | undefined, 
    loading: boolean, 
    title: string,
    testId: string
  ) => (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid={`text-${testId}-title`}>
        {title === "Airport Transfers" ? <Plane className="text-accent mr-2" /> : <Route className="text-accent mr-2" />}
        {title}
      </h3>
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-muted pl-4">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))
        ) : options && options.length > 0 ? (
          options.map((option, index) => (
            <div 
              key={option.id} 
              className={`border-l-4 ${getRecommendedColor(index)} pl-4`}
              data-testid={`card-transport-${testId}-${index}`}
            >
              <div className="font-medium flex items-center" data-testid={`text-transport-type-${index}`}>
                {getTransportIcon(option.type)}
                <span className="ml-2">{option.type}: {option.from} → {option.to}</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center mt-1" data-testid={`text-transport-details-${index}`}>
                <DollarSign className="h-3 w-3 mr-1" />
                ${option.price} ({option.duration}) • 
                <Clock className="h-3 w-3 ml-2 mr-1" />
                {option.description}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4" data-testid={`text-no-${testId}`}>
            <p className="text-muted-foreground">No transportation options available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="mb-12" data-testid="section-transportation">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-transportation-title">
            <Route className="text-primary mr-3" />
            Transportation & Logistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTransportOptions(
              airportTransfers, 
              airportLoading, 
              "Airport Transfers",
              "airport"
            )}
            
            {renderTransportOptions(
              intercityTransport, 
              intercityLoading, 
              "Hoi An ↔ Da Nang",
              "intercity"
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
