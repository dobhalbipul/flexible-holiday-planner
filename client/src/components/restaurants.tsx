import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Star, MapPin, Clock } from "lucide-react";
import type { Restaurant } from "@shared/schema";

export default function Restaurants() {
  const { data: hoiAnRestaurants, isLoading: hoiAnLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants', 'Hoi An', 'Indian'],
    enabled: true,
  });

  const { data: daNangRestaurants, isLoading: daNangLoading } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants', 'Da Nang', 'Indian'],
    enabled: true,
  });

  const renderStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 !== 0;
    
    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-current opacity-50" />}
        {[...Array(5 - Math.ceil(ratingNum))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4" />
        ))}
      </div>
    );
  };

  const renderRestaurantCard = (restaurant: Restaurant, index: number, city: string) => (
    <div 
      key={restaurant.id} 
      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
      data-testid={`card-restaurant-${city.toLowerCase()}-${index}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg" data-testid={`text-restaurant-name-${index}`}>
            {restaurant.name}
          </h4>
          <div className="flex items-center mb-2">
            {renderStars(restaurant.rating)}
            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-restaurant-rating-${index}`}>
              {restaurant.rating}/5
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-primary" data-testid={`text-restaurant-price-${index}`}>
            {restaurant.priceRange}
          </div>
          <div className="text-xs text-muted-foreground">per person</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3 flex items-center" data-testid={`text-restaurant-location-${index}`}>
        <MapPin className="h-4 w-4 mr-1" />
        {restaurant.location}
      </p>
      <p className="text-sm mb-3" data-testid={`text-restaurant-specialties-${index}`}>
        <strong>Specialties:</strong> {restaurant.specialties}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground flex items-center" data-testid={`text-restaurant-hours-${index}`}>
          <Clock className="h-4 w-4 mr-1" />
          Open: {restaurant.openingHours}
        </span>
        <div className="flex space-x-2">
          {restaurant.servingTimes.map((time, timeIndex) => (
            <Badge 
              key={timeIndex}
              variant="secondary" 
              className={time === "Lunch" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}
              data-testid={`badge-serving-time-${index}-${timeIndex}`}
            >
              {time}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRestaurantSection = (
    restaurants: Restaurant[] | undefined,
    loading: boolean,
    city: string,
    testId: string
  ) => (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-accent" data-testid={`text-${testId}-title`}>
        {city}
      </h3>
      <div className="space-y-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : restaurants && restaurants.length > 0 ? (
          restaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index, city))
        ) : (
          <div className="text-center py-8" data-testid={`text-no-${testId}-restaurants`}>
            <p className="text-muted-foreground">No Indian restaurants found in {city}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="mb-12" data-testid="section-restaurants">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-restaurants-title">
            <Utensils className="text-primary mr-3" />
            Indian Restaurant Recommendations
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderRestaurantSection(hoiAnRestaurants, hoiAnLoading, "Hoi An", "hoian")}
            {renderRestaurantSection(daNangRestaurants, daNangLoading, "Da Nang", "danang")}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
