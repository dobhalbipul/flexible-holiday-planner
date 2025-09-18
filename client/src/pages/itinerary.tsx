import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useBooking } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Calendar, Users, ArrowLeft, Plane, Hotel, CheckCircle, 
  CalendarDays, DollarSign, Clock, Plus, X, Mountain, Coffee, 
  Utensils, Waves
} from "lucide-react";
import type { Activity } from "@shared/schema";
import type { ItineraryDay, ItineraryActivity } from "@/lib/booking";

export default function Itinerary() {
  const [, setLocation] = useLocation();
  const { 
    searchCriteria, 
    selectedDates, 
    selectedFlights, 
    selectedHotels,
    selectedItinerary,
    setSelectedItinerary,
    addActivityToDay,
    removeActivityFromDay
  } = useBooking();

  // Fetch available activities for the destination
  const { data: hoiAnActivities, isLoading: hoiAnLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { city: 'Hoi An' }],
    queryFn: async () => {
      const response = await fetch('/api/activities?city=' + encodeURIComponent('Hoi An'));
      if (!response.ok) {
        throw new Error('Failed to fetch Hoi An activities');
      }
      return response.json();
    },
    enabled: true,
  });

  const { data: daNangActivities, isLoading: daNangLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { city: 'Da Nang' }],
    queryFn: async () => {
      const response = await fetch('/api/activities?city=' + encodeURIComponent('Da Nang'));
      if (!response.ok) {
        throw new Error('Failed to fetch Da Nang activities');
      }
      return response.json();
    },
    enabled: true,
  });

  const allActivities = [
    ...(hoiAnActivities || []),
    ...(daNangActivities || [])
  ];

  const isActivitiesLoading = hoiAnLoading || daNangLoading;

  // Initialize itinerary when dates are available
  useEffect(() => {
    if (selectedDates && !selectedItinerary) {
      const startDate = new Date(selectedDates.startDate);
      const days: ItineraryDay[] = [];
      
      for (let i = 0; i < selectedDates.duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        days.push({
          date: currentDate.toISOString().split('T')[0],
          dayNumber: i + 1,
          activities: []
        });
      }
      
      setSelectedItinerary({
        days,
        totalActivityCost: 0,
        currency: selectedDates.currency
      });
    }
  }, [selectedDates, selectedItinerary, setSelectedItinerary]);

  const handleBackToHotels = () => {
    setLocation("/hotels");
  };

  const handleContinueToSummary = () => {
    setLocation("/summary");
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cultural':
        return <Mountain className="h-4 w-4" />;
      case 'must-visit':
        return <MapPin className="h-4 w-4" />;
      case 'interactive':
        return <Coffee className="h-4 w-4" />;
      case 'nature':
        return <Waves className="h-4 w-4" />;
      case 'adventure':
        return <Mountain className="h-4 w-4" />;
      case 'free':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'must-visit':
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case 'cultural':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case 'interactive':
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case 'nature':
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
      case 'free':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case 'adventure':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTimeSlots = () => ['morning', 'afternoon', 'evening'] as const;

  const addActivityToItinerary = (activity: Activity, dayIndex: number, timeSlot: 'morning' | 'afternoon' | 'evening') => {
    const itineraryActivity: ItineraryActivity = {
      id: `${activity.id}-${Date.now()}`,
      name: activity.name,
      description: activity.description,
      duration: activity.duration,
      price: parseFloat(activity.price),
      currency: activity.currency,
      category: activity.category,
      timeSlot,
      imageUrl: activity.imageUrl || undefined
    };
    
    addActivityToDay(dayIndex, itineraryActivity);
  };

  const getTotalCost = () => {
    const flightCost = selectedFlights?.totalPrice || 0;
    const hotelCost = selectedHotels?.totalPrice || 0;
    const activityCost = selectedItinerary?.totalActivityCost || 0;
    return flightCost + hotelCost + activityCost;
  };

  if (!searchCriteria || !selectedDates || !selectedFlights || !selectedHotels) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Incomplete Booking</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please complete your flight and hotel selections first.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-start-over">
              Start New Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                onClick={handleBackToHotels}
                className="flex items-center space-x-2"
                data-testid="button-back-to-hotels"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Hotels</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2" data-testid="text-itinerary-title">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>Plan Your {selectedDates.duration}-Day Itinerary</span>
            </CardTitle>
            <CardDescription data-testid="text-itinerary-description">
              Customize your daily activities for {searchCriteria.destination}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Trip Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-xs text-muted-foreground">{selectedDates.duration} days</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Travelers</div>
                  <div className="text-xs text-muted-foreground">{searchCriteria.travelers} guests</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Destination</div>
                  <div className="text-xs text-muted-foreground">{searchCriteria.destination}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">Total Cost</div>
                  <div className="text-xs text-muted-foreground font-bold" data-testid="text-current-total">
                    {formatCurrency(getTotalCost(), selectedHotels.currency)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Daily Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Daily Itinerary</span>
            </h3>
            
            {selectedItinerary?.days.map((day, dayIndex) => (
              <Card key={dayIndex} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg">
                    Day {day.dayNumber} - {formatDate(day.date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {getTimeSlots().map((timeSlot) => {
                    const timeSlotActivities = day.activities.filter(activity => activity.timeSlot === timeSlot);
                    
                    return (
                      <div key={timeSlot} className="mb-6 last:mb-0">
                        <div className="flex items-center space-x-2 mb-3">
                          <h4 className="font-medium capitalize text-sm">{timeSlot}</h4>
                          <Separator className="flex-1" />
                        </div>
                        
                        <div 
                          className="space-y-2 min-h-[80px] border-2 border-dashed border-border rounded-lg p-3"
                          data-testid={`time-slot-${timeSlot}-day${dayIndex + 1}`}
                        >
                          {timeSlotActivities.length > 0 ? (
                            timeSlotActivities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                                data-testid={`activity-${activity.id}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {getCategoryIcon(activity.category)}
                                    <span className="font-medium text-sm">{activity.name}</span>
                                    <Badge className={`text-xs ${getCategoryColor(activity.category)}`}>
                                      {activity.category}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{activity.duration}</span>
                                    </span>
                                    <span className="font-medium text-primary">
                                      {activity.price > 0 ? formatCurrency(activity.price, activity.currency) : 'Free'}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeActivityFromDay(dayIndex, activity.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  data-testid={`button-remove-activity-${activity.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No activities planned for {timeSlot}</p>
                              <p className="text-xs">Add activities from the suggestions →</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column - Available Activities */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <h3 className="text-xl font-semibold flex items-center space-x-2 mb-4">
                <Mountain className="h-5 w-5" />
                <span>Available Activities</span>
              </h3>
              
              {isActivitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-full mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {allActivities.map((activity, index) => (
                    <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {activity.imageUrl && (
                        <img 
                          src={activity.imageUrl} 
                          alt={activity.name} 
                          className="w-full h-24 object-cover" 
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              {getCategoryIcon(activity.category)}
                              <h4 className="font-medium text-sm" data-testid={`text-activity-name-${index}`}>
                                {activity.name}
                              </h4>
                            </div>
                            <Badge className={`text-xs ${getCategoryColor(activity.category)}`}>
                              {activity.category}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center space-x-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{activity.duration}</span>
                            </span>
                            <span className="font-medium text-primary">
                              {activity.price === "0.00" ? "Free" : formatCurrency(parseFloat(activity.price), activity.currency)}
                            </span>
                          </div>
                          
                          {/* Add to Day Buttons */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Add to day:</div>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedItinerary?.days.slice(0, 4).map((day, dayIndex) => (
                                <div key={dayIndex} className="space-y-1">
                                  <div className="text-xs text-center font-medium">Day {day.dayNumber}</div>
                                  <div className="grid grid-cols-3 gap-1">
                                    {getTimeSlots().map((timeSlot) => (
                                      <Button
                                        key={timeSlot}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-6 px-1"
                                        onClick={() => addActivityToItinerary(activity, dayIndex, timeSlot)}
                                        data-testid={`button-add-day${dayIndex + 1}-${timeSlot}-${index}`}
                                      >
                                        <Plus className="h-2 w-2 mr-1" />
                                        {timeSlot.slice(0, 1).toUpperCase()}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {selectedItinerary && selectedItinerary.days.length > 4 && (
                              <div className="text-xs text-center text-muted-foreground">
                                + {selectedItinerary.days.length - 4} more days available
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Continue Button */}
              <Card className="mt-6 bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-medium">Ready to Review?</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete trip cost: {formatCurrency(getTotalCost(), selectedHotels.currency)}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleContinueToSummary}
                      className="w-full"
                      size="lg"
                      data-testid="button-continue-to-summary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Continue to Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}