import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProcurementSearch from "./pages/ProcurementSearch.tsx";
import SupplierIntelligence from "./pages/SupplierIntelligence.tsx";
import SubstitutionEngine from "./pages/SubstitutionEngine.tsx";
import DecisionSupport from "./pages/DecisionSupport.tsx";
import Analytics from "./pages/Analytics.tsx";
import Settings from "./pages/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<ProcurementSearch />} />
            <Route path="suppliers" element={<SupplierIntelligence />} />
            <Route path="substitution" element={<SubstitutionEngine />} />
            <Route path="decisions" element={<DecisionSupport />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
