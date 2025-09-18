import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bed, Star, MapPin, Wifi, Car, Coffee, Waves } from "lucide-react";
import type { Hotel } from "@shared/schema";

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'free wifi':
      return <Wifi className="h-3 w-3" />;
    case 'pool':
      return <Waves className="h-3 w-3" />;
    case 'breakfast':
      return <Coffee className="h-3 w-3" />;
    case 'bike rental':
      return <Car className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function HotelSearch() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: hoiAnHotels, isLoading: hoiAnLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels/search', 'Hoi An', '2025-10-25', '2025-10-27'],
    enabled: true,
  });

  const { data: daNangHotels, isLoading: daNangLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels/search', 'Da Nang', '2025-10-27', '2025-10-30'],
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

  const renderHotelCard = (hotel: Hotel, nights: number, index: number) => (
    <div 
      key={hotel.id} 
      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      data-testid={`card-hotel-${hotel.city.toLowerCase().replace(' ', '-')}-${index}`}
    >
      <img 
        src={hotel.imageUrl || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200"} 
        alt={`${hotel.name} view`} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-lg" data-testid={`text-hotel-name-${index}`}>
            {hotel.name}
          </h4>
          <div className="text-right">
            <div className="text-lg font-bold text-primary" data-testid={`text-hotel-price-${index}`}>
              {hotel.currency} {hotel.pricePerNight}/night
            </div>
            <div className="text-xs text-muted-foreground">+ taxes</div>
          </div>
        </div>
        <div className="flex items-center mb-2">
          {renderStars(hotel.rating)}
          <span className="text-sm text-muted-foreground ml-2" data-testid={`text-hotel-rating-${index}`}>
            {hotel.rating} ({hotel.reviewCount} reviews)
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3 flex items-center" data-testid={`text-hotel-location-${index}`}>
          <MapPin className="h-4 w-4 mr-1" />
          {hotel.distanceToLandmark} • {hotel.distanceToBeach}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {hotel.amenities.map((amenity, amenityIndex) => (
            <Badge 
              key={amenityIndex} 
              variant="secondary" 
              className="bg-primary/10 text-primary text-xs"
              data-testid={`badge-amenity-${index}-${amenityIndex}`}
            >
              {getAmenityIcon(amenity)}
              <span className="ml-1">{amenity}</span>
            </Badge>
          ))}
        </div>
        <Button 
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          data-testid={`button-book-hotel-${index}`}
        >
          Book Now - {nights} nights
        </Button>
      </div>
    </div>
  );

  return (
    <section className="mb-12" data-testid="section-hotel-search">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-hotel-title">
            <Bed className="text-primary mr-3" />
            Accommodation Options
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hoi An Hotels */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-accent" data-testid="text-hoian-hotels-title">
                Hoi An (2 nights)
              </h3>
              <div className="space-y-4">
                {hoiAnLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="border border-border rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : hoiAnHotels && hoiAnHotels.length > 0 ? (
                  hoiAnHotels.map((hotel, index) => renderHotelCard(hotel, 2, index))
                ) : (
                  <div className="text-center py-8" data-testid="text-no-hoian-hotels">
                    <p className="text-muted-foreground">No hotels found in Hoi An</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Da Nang Hotels */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-accent" data-testid="text-danang-hotels-title">
                Da Nang (3 nights)
              </h3>
              <div className="space-y-4">
                {daNangLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="border border-border rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : daNangHotels && daNangHotels.length > 0 ? (
                  daNangHotels.map((hotel, index) => renderHotelCard(hotel, 3, index))
                ) : (
                  <div className="text-center py-8" data-testid="text-no-danang-hotels">
                    <p className="text-muted-foreground">No hotels found in Da Nang</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
