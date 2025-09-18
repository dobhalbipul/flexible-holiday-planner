import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Route, Plane, Car, Bed, Utensils, Moon, Sun, Calendar, Briefcase, UtensilsCrossed, Umbrella } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  date: string;
  category: string;
  activities: Array<{
    icon: any;
    title: string;
    time: string;
    description: string;
  }>;
}

const itineraryDays: ItineraryDay[] = [
  {
    day: 1,
    title: "Arrival in Da Nang",
    date: "October 25, 2025",
    category: "Arrival Day",
    activities: [
      {
        icon: Plane,
        title: "Flight Arrival - Da Nang Airport",
        time: "15:45",
        description: "Malaysia Airlines MH780"
      },
      {
        icon: Car,
        title: "Airport Transfer to Hoi An",
        time: "16:30",
        description: "Private car (RM 150, 45 minutes)"
      },
      {
        icon: Bed,
        title: "Check-in at Sunflower Village Hotel",
        time: "18:00",
        description: "Hoi An Ancient Town area"
      },
      {
        icon: Utensils,
        title: "Dinner at Ganesh Indian Restaurant",
        time: "19:30",
        description: "Authentic Indian cuisine (RM 105 for 2)"
      }
    ]
  },
  {
    day: 2,
    title: "Hoi An Exploration",
    date: "October 26, 2025",
    category: "Culture & Activities",
    activities: [
      {
        icon: Sun,
        title: "Morning: Ancient Town Walking Tour",
        time: "09:00",
        description: "Japanese Bridge, Assembly Halls (RM 63 entry)"
      },
      {
        icon: Utensils,
        title: "Lunch at Maharaja Indian Restaurant",
        time: "12:30",
        description: "Traditional thali & curry (RM 84 for 2)"
      },
      {
        icon: Umbrella,
        title: "Basket Boat Tour in Coconut Forest",
        time: "14:30",
        description: "Thu Bon River experience (RM 189 for 2, 3 hours)"
      },
      {
        icon: Moon,
        title: "Evening: Lantern Festival & Night Market",
        time: "19:00",
        description: "Traditional Vietnamese dinner & shopping"
      }
    ]
  },
  {
    day: 3,
    title: "Transfer to Da Nang",
    date: "October 27, 2025",
    category: "Beach Day",
    activities: [
      {
        icon: Briefcase,
        title: "Check-out & Transfer to Da Nang",
        time: "10:00",
        description: "Private car transfer (RM 105, 30 minutes)"
      },
      {
        icon: Bed,
        title: "Check-in at My Khe Beach Hotel",
        time: "11:00",
        description: "Beachfront accommodation"
      },
      {
        icon: Umbrella,
        title: "My Khe Beach Relaxation",
        time: "12:00",
        description: "Beach activities, swimming, sunbathing"
      },
      {
        icon: UtensilsCrossed,
        title: "Evening: Beachfront Dinner",
        time: "18:30",
        description: "Fresh seafood & sunset views"
      }
    ]
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Arrival Day":
      return "bg-primary/10 text-primary";
    case "Culture & Activities":
      return "bg-secondary/10 text-secondary";
    case "Beach Day":
      return "bg-accent/10 text-accent";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function ItineraryBuilder() {
  return (
    <section className="mb-12" data-testid="section-itinerary">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center" data-testid="text-itinerary-title">
            <Route className="text-primary mr-3" />
            6-Day Itinerary
          </h2>
          
          <div className="space-y-6">
            {itineraryDays.map((day) => (
              <div 
                key={day.day} 
                className="border border-border rounded-lg p-6 relative"
                data-testid={`card-day-${day.day}`}
              >
                <div className="absolute -left-3 top-6 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {day.day}
                </div>
                <div className="ml-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" data-testid={`text-day-title-${day.day}`}>
                        Day {day.day}: {day.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center" data-testid={`text-day-date-${day.day}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        {day.date}
                      </p>
                    </div>
                    <Badge className={getCategoryColor(day.category)} data-testid={`badge-day-category-${day.day}`}>
                      {day.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {day.activities.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div 
                          key={index} 
                          className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg"
                          data-testid={`activity-${day.day}-${index}`}
                        >
                          <IconComponent className="text-accent mt-1 h-5 w-5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium" data-testid={`text-activity-title-${day.day}-${index}`}>
                              {activity.title}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-activity-description-${day.day}-${index}`}>
                              {activity.time} - {activity.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center py-4">
              <button 
                className="bg-muted text-muted-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-colors"
                data-testid="button-view-more-days"
              >
                <Calendar className="mr-2 h-4 w-4 inline" />
                View Days 4-6
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
