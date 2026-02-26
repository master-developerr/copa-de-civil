import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/context/TournamentContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import FixturesPage from "./pages/FixturesPage";
import StandingsPage from "./pages/StandingsPage";
import MatchPage from "./pages/MatchPage";
import FinalPage from "./pages/FinalPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TournamentProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/team/:id" element={<TeamDetailPage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/match/:id" element={<MatchPage />} />
              <Route path="/final" element={<FinalPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </TournamentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
