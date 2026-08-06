import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ItineraryEdit from "./pages/ItineraryEdit";
import ItineraryPreview from "./pages/ItineraryPreview";
import VoucherList from "./pages/VoucherList";
import VoucherEdit from "./pages/VoucherEdit";
import VoucherPreview from "./pages/VoucherPreview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/itinerary/new" component={ItineraryEdit} />
      <Route path="/itinerary/:id/edit" component={ItineraryEdit} />
      <Route path="/itinerary/:id/preview" component={ItineraryPreview} />
      <Route path="/vouchers" component={VoucherList} />
      <Route path="/voucher/new" component={VoucherEdit} />
      <Route path="/voucher/:id/edit" component={VoucherEdit} />
      <Route path="/voucher/:id/preview" component={VoucherPreview} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
