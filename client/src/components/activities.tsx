import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mountain, DollarSign, Clock, Plus } from "lucide-react";
import type { Activity } from "@shared/schema";

export default function Activities() {
  const { data: hoiAnActivities, isLoading: hoiAnLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', 'Hoi An'],
    enabled: true,
  });

  const { data: daNangActivities, isLoading: daNangLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', 'Da Nang'],
    enabled: true,
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'must-visit':
        return "bg-accent/10 text-accent";
      case 'cultural':
        return "bg-primary/10 text-primary";
      case 'interactive':
        return "bg-secondary/10 text-secondary";
      case 'nature':
        return "bg-accent/10 text-accent";
      case 'free':
        return "bg-primary/10 text-primary";
      case 'adventure':
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const renderActivityCard = (activity: Activity, index: number) => (
    <div 
      key={activity.id} 
      className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      data-testid={`card-activity-${index}`}
    >
      <img 
        src={activity.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200"} 
        alt={activity.name} 
        className="w-full h-32 object-cover" 
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold" data-testid={`text-activity-name-${index}`}>
            {activity.name}
          </h4>
          <div className="text-right">
            <div className="text-lg font-bold text-primary flex items-center" data-testid={`text-activity-price-${index}`}>
              {activity.price === "0.00" ? "Free" : (
                <>
                  <DollarSign className="h-4 w-4" />
                  {activity.price}
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">per person</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3 flex items-center" data-testid={`text-activity-duration-${index}`}>
          <Clock className="h-4 w-4 mr-1" />
          {activity.duration}
        </p>
        <p className="text-sm mb-3" data-testid={`text-activity-description-${index}`}>
          {activity.description}
        </p>
        <div className="flex justify-between items-center">
          <Badge 
            className={getCategoryColor(activity.category)}
            data-testid={`badge-activity-category-${index}`}
          >
            {activity.category}
          </Badge>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
            data-testid={`button-add-activity-${index}`}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add to Trip
          </Button>
        </div>
      </div>
    </div>
  );

  const allActivities = [
    ...(hoiAnActivities || []),
    ...(daNangActivities || [])
  ];

  const isLoading = hoiAnLoading || daNangLoading;

  return (
    <section className="mb-12" data-testid="section-activities">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-activities-title">
            <Mountain className="text-primary mr-3" />
            Optional Activities & Attractions
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-32" />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : allActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allActivities.map((activity, index) => renderActivityCard(activity, index))}
            </div>
          ) : (
            <div className="text-center py-8" data-testid="text-no-activities">
              <p className="text-muted-foreground">No activities found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
