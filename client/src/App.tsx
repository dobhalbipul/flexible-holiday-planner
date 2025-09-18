import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "./lib/currency";
import { BookingProvider } from "./lib/booking";
import Home from "@/pages/home";
import BestDates from "@/pages/best-dates";
import Flights from "@/pages/flights";
import Hotels from "@/pages/hotels";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/best-dates" component={BestDates} />
      <Route path="/flights" component={Flights} />
      <Route path="/hotels" component={Hotels} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <BookingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BookingProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
